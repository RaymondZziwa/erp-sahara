import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Category } from "../../../redux/slices/types/procurement/categories";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Category;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<{
    name: string;
    description: string;
  }>({
    name: "",
    description: "",
  });

  const { token } = useAuth();
  useEffect(() => {
    if (item) {
      setFormState({
        name: item.name || "",
        description: item.description || "",
      });
    } else {
      setFormState({ name: "", description: "" });
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
    // Basic validation
    if (!formState.name) {
      return; // You can handle validation error here
    }
    const data = { name: formState.name, description: formState.description };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? `/procurement/item_categories/${item.id}/update`
      : "/procurement/item_categories/create";
    await createRequest(endpoint, token.access_token, data, onSave, method);

    onSave();
    onClose(); // Close the modal after saving
  };

  const footer = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text"
      />
      <Button
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="item-form"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Item" : "Add Category"}
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
            <label htmlFor="description">Description</label>
            <InputText
              id="description"
              name="description"
              value={formState.description}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
