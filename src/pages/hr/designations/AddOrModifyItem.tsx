import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";

import { HUMAN_RESOURCE_ENDPOINTS } from "../../../api/hrEndpoints";
import { InputTextarea } from "primereact/inputtextarea";
import { Designation } from "../../../redux/slices/types/hr/Designation";
import useDepartments from "../../../hooks/hr/useDepartments";
import { Dropdown } from "primereact/dropdown";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Designation;
  onSave: () => void;
}

const AddOrModifyTruck: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<Designation>>({
    designation_name: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();
  const { data: departments } = useDepartments();

  useEffect(() => {
    if (item) {
      setFormState({
        ...item,
      });
    } else {
      setFormState({});
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

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Basic validation
    if (!formState.designation_name || !formState.description) {
      setIsSubmitting(false);
      return; // Handle validation error here
    }
    const data = { ...formState };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? HUMAN_RESOURCE_ENDPOINTS.DESIGNATIONS.UPDATE(item.id.toString())
      : HUMAN_RESOURCE_ENDPOINTS.DESIGNATIONS.ADD;
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
        form="truck-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Designation" : "Add Designation"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="truck-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        <div className="p-field">
          <label htmlFor="designation_name">Name</label>
          <InputText
            id="designation_name"
            name="designation_name"
            value={formState.designation_name}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="description">Description</label>
          <InputTextarea
            id="description"
            name="description"
            value={formState.description}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="department_id">Department</label>
          <Dropdown
            filter
            id="department_id"
            name="department_id"
            optionLabel="name"
            optionValue="id"
            value={formState.department_id}
            options={departments}
            onChange={(e) =>
              setFormState({ ...formState, department_id: e.value })
            }
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyTruck;
