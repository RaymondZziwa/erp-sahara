import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { HUMAN_RESOURCE_ENDPOINTS } from "../../../api/hrEndpoints";
import { Dropdown } from "primereact/dropdown";

import { Attendence } from "../../../redux/slices/types/hr/Attendence";
import useEmployees from "../../../hooks/hr/useEmployees"; // Assuming a custom hook for fetching employees

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Attendence;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<Attendence>>({
    attendance_date: "",
    check_in_time: "",
    check_out_time: "",
    employee_id: undefined,
    status: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();
  const { data: employees } = useEmployees(); // Fetch employees for the dropdown

  const statusOptions = [
    { label: "Present", value: "Present" },
    { label: "Absent", value: "Absent" },
    { label: "Late", value: "Late" },
    { label: "Half Day", value: "Half Day" },
    { label: "Leave", value: "Leave" },
  ];

  useEffect(() => {
    if (item) {
      setFormState({
        ...item,
      });
    } else {
      setFormState({
        attendance_date: "",
        check_in_time: "",
        check_out_time: "",
        employee_id: undefined,
        status: "",
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
    // Basic validation
    if (
      !formState.attendance_date ||
      !formState.check_in_time ||
      !formState.check_out_time ||
      !formState.employee_id
    ) {
      setIsSubmitting(false);
      return; // Handle validation error here
    }

    const data = { ...formState };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? HUMAN_RESOURCE_ENDPOINTS.ATTENDENCIES.UPDATE(item.id.toString())
      : HUMAN_RESOURCE_ENDPOINTS.ATTENDENCIES.ADD;

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
        disabled={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="attendance-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Attendance" : "Add Attendance"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="attendance-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        <div className="p-field">
          <label htmlFor="attendance_date">Attendance Date</label>
          <InputText
            id="attendance_date"
            name="attendance_date"
            type="date"
            value={formState.attendance_date}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="check_in_time">Check In Time</label>
          <InputText
            id="check_in_time"
            name="check_in_time"
            type="time"
            value={formState.check_in_time}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="check_out_time">Check Out Time</label>
          <InputText
            id="check_out_time"
            name="check_out_time"
            type="time"
            value={formState.check_out_time}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="employee_id">Employee</label>
          <Dropdown
            filter
            id="employee_id"
            name="employee_id"
            value={formState.employee_id}
            options={employees.map((employee) => ({
              value: employee.id,
              label: employee.first_name + " " + employee.last_name,
            }))} // Assuming employees data is structured appropriately
            onChange={handleDropdownChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="status">Status</label>
          <Dropdown
            id="status"
            name="status"
            value={formState.status}
            options={statusOptions}
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
