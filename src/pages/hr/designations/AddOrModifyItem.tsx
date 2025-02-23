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
import { toast, ToastContainer } from "react-toastify";

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
    if (!formState.designation_name || !formState.department_id) {
      setIsSubmitting(false);
      toast.warn('Fill in all the mandatory fields');
      return;
    }
  
    try {
      const data = { ...formState };
      const method = item?.id ? "PUT" : "POST";
      const endpoint = item?.id
        ? HUMAN_RESOURCE_ENDPOINTS.DESIGNATIONS.UPDATE(item.id.toString())
        : HUMAN_RESOURCE_ENDPOINTS.DESIGNATIONS.ADD;
      await createRequest(endpoint, token.access_token, data, onSave, method);
  
      // Reset form state
      setFormState({
        designation_name: "",
        description: "",
        department_id: 0, // Reset to default value
        // Add other fields here if needed
      });
  
      // Call onSave and onClose
      onSave();
      onClose(); // Close the modal after saving
    } catch (error) {
      console.error("Error saving designation:", error);
      toast.error("An error occurred while saving designation.");
    } finally {
      setIsSubmitting(false);
    }
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
    <>
      <ToastContainer />
    <Dialog
      header={item?.id ? "Edit Designation" : "Add Designation"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
       <p className="mb-6">
          Fields marked with a red asterik (<span className="text-red-500">*</span>) are mandatory.
       </p>
      <form
        id="truck-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        <div className="p-field">
          <label htmlFor="designation_name">Name<span className="text-red-500">*</span></label>
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
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="department_id">Department<span className="text-red-500">*</span></label>
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
  </>
  );
};

export default AddOrModifyTruck;
