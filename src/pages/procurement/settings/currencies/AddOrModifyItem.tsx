import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { createRequest } from "../../../../utils/api";
import useAuth from "../../../../hooks/useAuth";
import { Currency } from "../../../../redux/slices/types/procurement/Currency";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Currency;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<Currency>>({
    name: "",
    code: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();
  useEffect(() => {
    if (item) {
      setFormState({
        name: item.name || "",
        code: item.code || "",
      });
    } else {
      setFormState({ name: "", code: "" });
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
    setIsSubmitting(true);
    e.preventDefault();
    // Basic validation
    if (!formState.name) {
      return; // You can handle validation error here
    }
    const data = { name: formState.name, code: formState.code };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? `/erp/accounts/currencies/${item.id}/update`
      : "/erp/accounts/currencies/create";
    await createRequest(endpoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose(); // Close the modal after saving
  };

  const footer = (
    <div className="flex gap-2 justify-end ">
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
        form="item-form"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Currency" : "Add Currency"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="item-form" onSubmit={handleSave}>
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="name">Name</label>
            <InputText
              id="name"
              name="name"
              value={formState.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="description">Code</label>
            <InputText
              id="code"
              name="code"
              value={formState.code}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
