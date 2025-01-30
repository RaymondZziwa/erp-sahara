import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";
import { INVENTORY_ENDPOINTS } from "../../../api/inventoryEndpoints";
import { baseURL } from "../../../utils/api";
import { ItemAttributeValue } from "../../../redux/slices/types/inventory/Attribute";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: ItemAttributeValue;
  onSave: () => void;
  attributeId: string;
}

const AddOrModifyAttributeValue: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
  attributeId,
}) => {
  const [formState, setFormState] = useState<Partial<ItemAttributeValue>>({
    value: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        value: item.value,
      });
    } else {
      setFormState({ value: "" });
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

    if (!formState.value) {
      setIsSubmitting(false);
      return; // Handle validation error here
    }

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? INVENTORY_ENDPOINTS.ITEM_ATTRIBUTE_VALUES.UPDATE(
          attributeId,
          item.id.toString()
        )
      : INVENTORY_ENDPOINTS.ITEM_ATTRIBUTE_VALUES.ADD(attributeId);

    try {
      await axios({
        method,
        url: baseURL + endpoint,
        data: formState,
        headers: {
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
      header={item?.id ? "Edit Attribute Value" : "Add Attribute Value"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="item-form" onSubmit={handleSave}>
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="value">Value</label>
            <InputText
              id="value"
              name="value"
              value={formState.value}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyAttributeValue;
