import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { API_ENDPOINTS } from "../../../api/apiEndpoints";
import { Service } from "../../../redux/slices/types/procurement/ProcurementTypes";


interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Service;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<Service>>({
    name: "",
    amount: 0,
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        name: item.name || "",
        amount: item.amount || 0,
        description: item.description || "",
      });
    } else {
      setFormState({ name: "", amount: 0, description: "" });
    }
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: name === "amount" ? Number(value) : value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (
      !formState.name ||
      formState.amount === undefined ||
      formState.amount < 0
    ) {
      setIsSubmitting(false);
      return;
    }

    const payload = {
      name: formState.name,
      amount: formState.amount,
      description: formState.description || null,
    };

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? API_ENDPOINTS.SERVICES.MODIFY(item.id)
      : API_ENDPOINTS.SERVICES.ADD;

    await createRequest(endpoint, token.access_token, payload, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose();
  };

  const footer = (
    <div className="flex gap-2 justify-end">
      <Button
        size="small"
        disabled={isSubmitting}
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500"
      />
      <Button
        size="small"
        disabled={isSubmitting}
        loading={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="procurement-type-form"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Service" : "Add Service"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="procurement-type-form" onSubmit={handleSave}>
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="name">
              Name<span className="text-red-700">*</span>
            </label>
            <InputText
              id="name"
              name="name"
              value={formState.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="amount">
              Amount<span className="text-red-700">*</span>
            </label>
            <InputText
              id="amount"
              name="amount"
              type="number"
              value={formState.amount?.toString() || ""}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="description">Description</label>
            <InputText
              id="description"
              name="description"
              value={formState.description || ""}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
