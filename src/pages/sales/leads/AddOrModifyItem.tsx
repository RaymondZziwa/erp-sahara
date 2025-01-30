import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { RadioButton } from "primereact/radiobutton";

import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";

import { Lead } from "../../../redux/slices/types/sales/Leads";
import { SALES_ENDPOINTS } from "../../../api/salesEndpoints";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Lead;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<Lead>>({
    status: "new", // Default status
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        ...item,
      });
    } else {
      setFormState({ status: "new" }); // Reset formState when adding a new item
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
    if (!formState.email || !formState.phone) {
      setIsSubmitting(false);
      return; // Handle validation error here
    }

    const data = { ...formState };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? SALES_ENDPOINTS.LEADS.UPDATE(item.id.toString())
      : SALES_ENDPOINTS.LEADS.ADD;
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
        form="lead-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Lead" : "Add Lead"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="lead-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        <div className="p-field">
          <label htmlFor="name">Name</label>
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
          <label>Status</label>
          {["new", "contacted", "qualified", "converted"].map((status) => (
            <div key={status} className="flex align-items-center">
              <RadioButton
                inputId={status}
                name="status"
                value={status}
                onChange={(e) =>
                  setFormState({ ...formState, status: e.value })
                }
                checked={formState.status === status}
              />
              <label htmlFor={status} className="ml-2 capitalize">
                {status}
              </label>
            </div>
          ))}
        </div>

        <div className="p-field">
          <label htmlFor="email">Email</label>
          <InputText
            id="email"
            name="email"
            value={formState.email || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="phone">Phone</label>
          <InputText
            id="phone"
            name="phone"
            value={formState.phone || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="notes">Notes</label>
          <InputText
            id="notes"
            name="notes"
            value={formState.notes || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
