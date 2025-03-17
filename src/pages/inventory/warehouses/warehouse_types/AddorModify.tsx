import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { INVENTORY_ENDPOINTS } from "../../../../api/inventoryEndpoints";
import useAuth from "../../../../hooks/useAuth";
import { WarehouseType } from "../../../../redux/slices/types/inventory/Warehouse";
import { createRequest } from "../../../../utils/api";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: WarehouseType;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<WarehouseType>>({
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
    // Basic validation
    if (!formState.name) {
      return; // You can handle validation error here
    }
    const data: Partial<WarehouseType> = {
      name: formState.name,
      id: formState?.id,
    };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? INVENTORY_ENDPOINTS.WARE_HOUSES.UPDATE(item.id.toString())
      : INVENTORY_ENDPOINTS.WAREHOUSE_TYPES.ADD;
    await createRequest(endpoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose(); // Close the modal after saving
  };

  const footer = (
    <div className="flex justify-end gap-1">
      <Button
        disabled={isSubmitting}
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500"
      />
      <Button
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
      header={item?.id ? "Edit Warehouse Type" : "Add Warehouse Type"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <p className="mb-6">
        Fields marked with a red asterik (
        <span className="text-red-500">*</span>) are mandatory.
      </p>
      <form id="item-form" onSubmit={handleSave}>
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="name">
              Name<span className="text-red-500">*</span>
            </label>
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
