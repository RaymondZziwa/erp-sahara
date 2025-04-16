import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { INVENTORY_ENDPOINTS } from "../../../api/inventoryEndpoints";
import { Warehouse } from "../../../redux/slices/types/inventory/Warehouse";
import { Dropdown } from "primereact/dropdown";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Warehouse;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<Warehouse>>({
    warehouse_type: 0,
    name: "",
    location: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
   //const { data } = useWarehouseTypes();
   const data = [
     { label: "Only Store", value: "only_store" },
     { label: "Sales Store", value: "sales_store" },
   ];

  const { token } = useAuth();
  useEffect(() => {
    if (item) {
      setFormState({
        name: item.name || "",
        location: item.location,
        warehouse_type: 0,
      });
    } else {
      setFormState({ warehouse_type: 0, name: "", location: "" });
    }
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

    const handleDropdownChange = (e: { value: number }) => {
      setFormState((prevState) => ({
        ...prevState,
        warehouse_type: e.value,
      }));
    };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Basic validation
    if (!formState.name || !formState.location) {
      return; // You can handle validation error here
    }
    const data: Partial<Warehouse> = {
      warehouse_type: formState.warehouse_type,
      name: formState.name,
      location: formState?.location,
      id: formState?.id,
    };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? INVENTORY_ENDPOINTS.WARE_HOUSES.UPDATE(item.id.toString())
      : INVENTORY_ENDPOINTS.WARE_HOUSES.ADD;
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
      header={item?.id ? "Edit Warehouse" : "Add Warehouse"}
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
            <label htmlFor="warehouse_type">
              Warehouse Type<span className="text-red-500">*</span>
            </label>
            <Dropdown
              id="warehouse_type"
              name="warehouse_type"
              value={formState.warehouse_type}
              options={data.map((storeType) => ({
                value: storeType.value,
                label: storeType.label,
              }))}
              onChange={handleDropdownChange}
              className="w-full"
              required
            />
          </div>
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

          <div className="p-field">
            <label htmlFor="location">
              Address<span className="text-red-500">*</span>
            </label>
            <InputText
              id="location"
              name="location"
              value={formState.location}
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
