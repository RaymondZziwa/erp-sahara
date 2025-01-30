import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";
import { INVENTORY_ENDPOINTS } from "../../../api/inventoryEndpoints";
import { baseURL } from "../../../utils/api";
import { ItemAttribue } from "../../../redux/slices/types/inventory/Attribute";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: ItemAttribue;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<ItemAttribue>>({
    name: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        name: item.name || "",
      });
    } else {
      setFormState({ name: "" });
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

    if (!formState.name) {
      setIsSubmitting(false);
      return; // Handle validation error here
    }

    const formData = new FormData();
    formData.append("name", formState.name);

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? INVENTORY_ENDPOINTS.ITEM_ATTRIBUTES.UPDATE(item.id.toString())
      : INVENTORY_ENDPOINTS.ITEM_ATTRIBUTES.ADD;

    try {
      await axios({
        method,
        url: baseURL + endpoint,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token.access_token}`,
        },
      });
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving item", error);
      // Handle error here
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-1">
      <Button
        severity="danger"
        disabled={isSubmitting}
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text mr-2 !bg-red-500"
      />
      <Button
        disabled={isSubmitting}
        loading={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="item-form"
        severity="info"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Attribute" : "Add Attribute"}
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
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
