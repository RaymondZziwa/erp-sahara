import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";

import { createRequest } from "../../../../utils/api";
import useAuth from "../../../../hooks/useAuth";
import { HUMAN_RESOURCE_ENDPOINTS } from "../../../../api/hrEndpoints";

import useEmployees from "../../../../hooks/hr/useEmployees";
import { Deduction } from "../../../../redux/slices/types/hr/salary/Deduction";
import useDeductionTypes from "../../../../hooks/hr/salary/useDeductionTypes";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Deduction;
  onSave: () => void;
}

const frequencyOptions = [
  { label: "One-Time", value: "One-Time" },
  { label: "Monthly", value: "Monthly" },
  { label: "Yearly", value: "Yearly" },
];

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<Deduction>>({
    amount: "",
    start_date: "",
    end_date: "",
    frequency: "One-Time",
    employee_id: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  const { token } = useAuth();
  const { data: employees } = useEmployees();
  const { data: deductionTypes } = useDeductionTypes();

  useEffect(() => {
    if (item) {
      setFormState({ ...item });
    } else {
      setFormState({
        amount: "",
        start_date: "",
        end_date: "",
        frequency: "One-Time",
        employee: 0,
      });
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDropdownChange = (name: string, value: any) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDateChange = (name: string, value: Date) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: value.toISOString().slice(0, 10),
    }));

    if (name === "start_date" && formState.end_date) {
      validateDates(value, new Date(formState.end_date));
    } else if (name === "end_date" && formState.start_date) {
      validateDates(new Date(formState.start_date), value);
    }
  };

  const validateDates = (startDate: Date, endDate: Date) => {
    if (endDate < startDate) {
      setDateError("End date must be after the start date.");
    } else {
      setDateError(null);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (
      !formState.amount ||
      !formState.employee_id ||
      !formState.deduction_type_id ||
      dateError
    ) {
      console.log(formState)
      setIsSubmitting(false);
      return;
    }

    const data = { ...formState };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? HUMAN_RESOURCE_ENDPOINTS.DEDUCTIONS.UPDATE(item.id.toString())
      : HUMAN_RESOURCE_ENDPOINTS.DEDUCTIONS.ADD;

    await createRequest(endpoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose(); // Close the modal after saving
  };

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500 hover:bg-red-400"
        size="small"
        disabled={isSubmitting}
      />
      <Button
        loading={isSubmitting}
        disabled={isSubmitting || !!dateError}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="deduction-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Deduction" : "Add Deduction"}
      visible={visible}
      style={{ width: "500px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="deduction-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        <div className="p-field">
          <label htmlFor="employee">Employee</label>
          <Dropdown
            id="employee"
            name="employee_id"
            value={formState.employee_id || null}
            options={employees?.map((employee) => ({
              label: `${employee.first_name} ${employee.last_name}`,
              value: employee.id,
            }))}
            onChange={(e) => handleDropdownChange("employee_id", e.value)}
            required
            className="w-full"
            placeholder="Select an Employee"
            filter
          />
        </div>
        <div className="p-field">
          <label htmlFor="deduction_type_id">Deduction Type</label>
          <Dropdown
            id="deduction_type_id"
            name="deduction_type_id"
            value={formState.deduction_type_id || null}
            options={deductionTypes?.map((type) => ({
              label: type.name,
              value: type.id,
            }))}
            onChange={(e) => handleDropdownChange("deduction_type_id", e.value)}
            required
            className="w-full"
            placeholder="Select a deduction type"
          />
        </div>
        <div className="p-field">
          <label htmlFor="amount">Amount</label>
          <InputText
            id="amount"
            name="amount"
            value={formState.amount || ""}
            onChange={handleInputChange}
            required
            type="number"
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="start_date">Start Date</label>
          <Calendar
            id="start_date"
            value={formState.start_date ? new Date(formState.start_date) : null}
            onChange={(e) => handleDateChange("start_date", e.value!)}
            dateFormat="yy-mm-dd"
            showIcon
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="end_date">End Date</label>
          <Calendar
            id="end_date"
            value={formState.end_date ? new Date(formState.end_date) : null}
            onChange={(e) => handleDateChange("end_date", e.value!)}
            dateFormat="yy-mm-dd"
            showIcon
            required
            className="w-full"
          />
          {dateError && <small className="p-error">{dateError}</small>}
        </div>
        <div className="p-field">
          <label htmlFor="frequency">Frequency</label>
          <Dropdown
            id="frequency"
            name="frequency"
            value={formState.frequency}
            options={frequencyOptions}
            onChange={(e) => handleDropdownChange("frequency", e.value)}
            required
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
