import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { HUMAN_RESOURCE_ENDPOINTS } from "../../../api/hrEndpoints";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";

import { PayRollPeriod } from "../../../redux/slices/types/hr/salary/PayRollPeriod";
import { Nullable } from "primereact/ts-helpers";
import { toast } from "react-toastify";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: PayRollPeriod;
  onSave: () => void;
}

const payFrequencyOptions = [
  { label: "Monthly", value: "Monthly" },
  { label: "Weekly", value: "Weekly" },
  { label: "Bi-Weekly", value: "Bi-Weekly" },
  { label: "Hourly", value: "Hourly" },
];

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<PayRollPeriod>>({
    period_name: "",
    start_date: null,
    end_date: null,
    payroll_date: null,
    pay_frequency: "Monthly", // Monthly, Weekly, Bi-Weekly, Hourly
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        ...item,
      });
    } else {
      setFormState({
        period_name: "",
        start_date: null,
        end_date: null,
        payroll_date: null,
        pay_frequency: "Monthly",
      });
    }
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDateChange = (name: string, value: Nullable<Date>) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDropdownChange = (e: any) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Ensure that the dates are in "YYYY-MM-DD" format
    const formattedData = {
      ...formState,
      start_date: formState.start_date
        ? new Date(formState.start_date).toISOString().split("T")[0]
        : "",
      end_date: formState.end_date
        ? new Date(formState.end_date).toISOString().split("T")[0]
        : "",
      payroll_date: formState.payroll_date
        ? new Date(formState.payroll_date).toISOString().split("T")[0]
        : "",
    };

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? HUMAN_RESOURCE_ENDPOINTS.PAYROLL_PERIODS.UPDATE(item.id.toString())
      : HUMAN_RESOURCE_ENDPOINTS.PAYROLL_PERIODS.ADD;
    if (formState.start_date == "" || formState.end_date == "") {
      setIsSubmitting(false);
      return toast.warn("Start date and end date required");
    }
    await createRequest(
      endpoint,
      token.access_token,
      formattedData,
      onSave,
      method
    );
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
        disabled={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="payroll-period-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Payroll Period" : "Add Payroll Period"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="payroll-period-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        <div className="p-field">
          <label htmlFor="period_name">Payroll Period Name</label>
          <InputText
            id="period_name"
            name="period_name"
            value={formState.period_name}
            onChange={handleInputChange}
            placeholder="Enter period name (e.g., January 2024)"
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="start_date">Start Date</label>
          <Calendar
            id="start_date"
            name="start_date"
            placeholder="Choose start date"
            value={
              formState.start_date
                ? new Date(formState.start_date || new Date())
                : null
            }
            onChange={(e) => handleDateChange("start_date", e.value)}
            dateFormat="yy-mm-dd"
            showIcon
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="end_date">End Date</label>
          <Calendar
            placeholder="Choose end_date"
            id="end_date"
            name="end_date"
            value={
              formState.end_date
                ? new Date(formState.end_date || new Date())
                : null
            }
            onChange={(e) => handleDateChange("end_date", e.value)}
            dateFormat="yy-mm-dd"
            showIcon
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="payroll_date">Payroll Date</label>
          <Calendar
            placeholder="Choose payroll date"
            id="payroll_date"
            name="payroll_date"
            value={
              formState.payroll_date
                ? new Date(formState.payroll_date || new Date())
                : null
            }
            onChange={(e) => handleDateChange("payroll_date", e.value)}
            dateFormat="yy-mm-dd"
            showIcon
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="pay_frequency">Pay Frequency</label>
          <Dropdown
            placeholder="Select frequency"
            id="pay_frequency"
            name="pay_frequency"
            value={formState.pay_frequency}
            options={payFrequencyOptions}
            onChange={handleDropdownChange}
            required
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
