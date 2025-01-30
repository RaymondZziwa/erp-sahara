import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { HUMAN_RESOURCE_ENDPOINTS } from "../../../api/hrEndpoints";
import { LeaveType } from "../../../redux/slices/types/hr/Leave";

interface AddOrModifyLeaveProps {
  visible: boolean;
  onClose: () => void;
  item?: LeaveType;
  onSave: () => void;
}

const AddOrModifyLeave: React.FC<AddOrModifyLeaveProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<LeaveType>>({
    leave_name: "",
    description: "",
    max_days: undefined,
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
        leave_name: "",
        description: "",
        max_days: undefined,
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

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (!formState.leave_name || !formState.max_days) {
      setIsSubmitting(false);
      return; // Handle validation error here
    }

    const data = { ...formState };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? HUMAN_RESOURCE_ENDPOINTS.LEAVE_TYPES.UPDATE(item.id.toString())
      : HUMAN_RESOURCE_ENDPOINTS.LEAVE_TYPES.ADD;

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
        form="leave-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Leave Type" : "Add Leave Type"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="leave-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        <div className="p-field">
          <label htmlFor="leave_name">Leave Name</label>
          <InputText
            id="leave_name"
            name="leave_name"
            value={formState.leave_name}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="description">Description</label>
          <InputText
            id="description"
            name="description"
            value={formState.description}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="max_days">Max Days</label>
          <InputText
            id="max_days"
            name="max_days"
            type="number"
            value={formState.max_days?.toString()}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyLeave;
