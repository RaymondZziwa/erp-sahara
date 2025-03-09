import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";

import { Department } from "../../../redux/slices/types/hr/Departments";
import { HUMAN_RESOURCE_ENDPOINTS } from "../../../api/hrEndpoints";
import { InputTextarea } from "primereact/inputtextarea";
import { toast, ToastContainer } from "react-toastify";

interface AddOrModifyTruckProps {
  visible: boolean;
  onClose: () => void;
  item?: Department;
  onSave: () => void;
}

const AddOrModifyTruck: React.FC<AddOrModifyTruckProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<Department>>({
    name: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();

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
      if (!formState.name) {
        setIsSubmitting(false);
        toast.warn('Fill in all the mandatory fields')
        return;
      }
    
      try {
        const data = { ...formState };
        const method = item?.id ? "PUT" : "POST";
        const endpoint = item?.id
          ? HUMAN_RESOURCE_ENDPOINTS.DEPARTMENTS.UPDATE(item.id.toString())
          : HUMAN_RESOURCE_ENDPOINTS.DEPARTMENTS.ADD;
        await createRequest(endpoint, token.access_token, data, onSave, method);
    
        // Reset form state
        setFormState({
          name: "",
          description: "",
        });
    
        // Call onSave and onClose
        onSave();
        onClose(); // Close the modal after saving
      } catch (error) {
        console.error("Error saving department:", error);
        toast.error("An error occurred while saving department.");
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
      header={item?.id ? "Edit Department" : "Add Department"}
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
          <label htmlFor="name">Name<span className="text-red-500">*</span></label>
          <InputText
            id="name"
            name="name"
            value={formState.name}
            onChange={handleInputChange}
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
      </form>
    </Dialog>
    </>
  );
};

export default AddOrModifyTruck;
