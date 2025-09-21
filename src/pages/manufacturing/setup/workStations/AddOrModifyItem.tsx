import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { toast } from "react-toastify";
import { MANUFACTURING_ENDPOINTS } from "../../../../api/manufacturingEndpoints";
import useAuth from "../../../../hooks/useAuth";
import { WorkCenter } from "../../../../redux/slices/types/manufacturing/WorkCenter";
import { createRequest } from "../../../../utils/api";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: WorkCenter;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<WorkCenter>>({
    name: "",
    location: "",
    process_type: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        ...item,
      });
    } else {
      setFormState({}); // Reset formState when adding a new item
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
        if (!formState.name ||
          !formState.location ||
          !formState.process_type
        ) {
          setIsSubmitting(false);
          toast.warn('Fill in all the mandatory fields');
          return;
        }
      
        try {
          const data = {
            ...formState
          };

          const method = item?.id ? "PUT" : "POST";
          const endpoint = item?.id
            ? MANUFACTURING_ENDPOINTS.WORK_CENTERS.UPDATE(item.id.toString())
            : MANUFACTURING_ENDPOINTS.WORK_CENTERS.ADD;
          await createRequest(endpoint, token.access_token, data, onSave, method);
          // Reset form state
          setFormState({
            name: "",
            location: "",
            process_type: ""
          });
      
          // Call onSave and onClose
          onSave();
          onClose(); // Close the modal after saving
        } catch (error) {
          console.error("Error saving work center:", error);
          toast.error("An error occurred while saving work center.");
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
        form="lead-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Work Station" : "Add Work Station"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
       <p className="mb-6">
          Fields marked with a red asterik (<span className="text-red-500">*</span>) are mandatory.
       </p>
      <form
        id="lead-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        <div className="p-field">
          <label htmlFor="name">Name<span className="text-red-500">*</span></label>
          <InputText
            id="name"
            name="name"
            value={formState.name || ""}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="location">Location<span className="text-red-500">*</span></label>
          <InputText
            id="location"
            name="location"
            value={formState.location || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="process_type">Process type<span className="text-red-500">*</span></label>
          <InputText
            id="process_type"
            name="process_type"
            value={formState.process_type || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
