import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { INVENTORY_ENDPOINTS } from "../../../api/inventoryEndpoints";
import { Warehouse } from "../../../redux/slices/types/inventory/Warehouse";

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
    name: "",
    latitude: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();
  useEffect(() => {
    if (item) {
      setFormState({
        name: item.name || "",
        latitude: item.latitude,
        longtitude: item.longtitude,
        location: item.location,
      });
    } else {
      setFormState({ name: "", latitude: "", location: "", longtitude: "" });
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
    const data: Partial<Warehouse> = {
      name: formState.name,
      latitude: formState.latitude,
      location: formState?.location,
      longtitude: formState?.longtitude,
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
            <label htmlFor="description">Latitude</label>
            <InputText
              id="latitude"
              name="latitude"
              value={formState.latitude}
              onChange={handleInputChange}
            />
          </div>
          <div className="p-field">
            <label htmlFor="longitude">Longitude</label>
            <InputText
              id="longitude"
              name="longtitude"
              value={formState.longtitude}
              onChange={handleInputChange}
            />
          </div>
          <div className="p-field">
            <label htmlFor="location">Location</label>
            <InputText
              id="location"
              name="location"
              value={formState.location}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
