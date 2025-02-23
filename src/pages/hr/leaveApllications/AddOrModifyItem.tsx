import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";

import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { HUMAN_RESOURCE_ENDPOINTS } from "../../../api/hrEndpoints";
import useEmployees from "../../../hooks/hr/useEmployees";

import { LeaveApplication } from "../../../redux/slices/types/hr/LeaveApplication";
import useLeaveTypes from "../../../hooks/hr/useLeaveTypess";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: LeaveApplication;
  onSave: () => void;
}

const AddOrMOdifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<LeaveApplication>>({
    employee_id: undefined,
    leave_type_id: undefined,
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();
  const { data: employees } = useEmployees();
  const { data: leaveTypes } = useLeaveTypes(); // Fetching leave types

  useEffect(() => {
    if (item) {
      setFormState({
        ...item,
      });
    } else {
      setFormState({
        employee_id: undefined,
        leave_type_id: undefined,
        start_date: "",
        end_date: "",
        reason: "",
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

  const handleDropdownChange = (e: DropdownChangeEvent) => {
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
      !formState.employee_id ||
      !formState.leave_type_id ||
      !formState.start_date ||
      !formState.reason
    ) {
      setIsSubmitting(false);
      return; // Handle validation error here
    }

    const data = { ...formState };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? HUMAN_RESOURCE_ENDPOINTS.LEAVE_APPLICATIONS.UPDATE(item.id.toString())
      : HUMAN_RESOURCE_ENDPOINTS.LEAVE_APPLICATIONS.ADD;

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
        form="leave-application-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Leave Application" : "Add Leave Application"}
      visible={visible}
      style={{ width: "450px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="leave-application-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        <div className="p-field">
          <label htmlFor="employee_id">Employee</label>
          <Dropdown
            filter
            id="employee_id"
            name="employee_id"
            value={formState.employee_id}
            options={employees.map((emloyee) => ({
              label: emloyee.first_name + " " + emloyee.last_name,
              value: emloyee.id,
            }))}
            onChange={handleDropdownChange}
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="leave_type_id">Leave Type</label>
          <Dropdown
            id="leave_type_id"
            name="leave_type_id"
            optionLabel="leave_name"
            optionValue="id"
            value={formState.leave_type_id}
            options={leaveTypes}
            onChange={(e) =>
              setFormState({ ...formState, leave_type_id: e.value })
            }
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="start_date">Start Date</label>
          <InputText
            id="start_date"
            name="start_date"
            type="date"
            value={formState.start_date}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="end_date">End Date</label>
          <InputText
            id="end_date"
            name="end_date"
            type="date"
            value={formState.end_date}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="reason">Reason</label>
          <InputTextarea
            id="reason"
            name="reason"
            value={formState.reason}
            onChange={handleInputChange}
            className="w-full"
            rows={4}
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrMOdifyItem;
