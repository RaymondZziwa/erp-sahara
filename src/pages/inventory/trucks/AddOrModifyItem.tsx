import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { INVENTORY_ENDPOINTS } from "../../../api/inventoryEndpoints";
import { Truck } from "../../../redux/slices/types/mossApp/Trucks";
import { RadioButton } from "primereact/radiobutton";

interface AddOrModifyTruckProps {
  visible: boolean;
  onClose: () => void;
  item?: Truck;
  onSave: () => void;
}

const AddOrModifyTruck: React.FC<AddOrModifyTruckProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<Truck>>({
    license_plate: "",
    model: "",
    capacity: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        license_plate: item.license_plate || "",
        model: item.model || "",
        capacity: item.capacity || "",
      });
    } else {
      setFormState({
        license_plate: "",
        model: "",
        capacity: "",
        status: "available",
      });
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
    if (!formState.license_plate || !formState.model) {
      return; // Handle validation error here
    }
    const data = { ...formState };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? INVENTORY_ENDPOINTS.TRUCKS.UPDATE(item.id.toString())
      : INVENTORY_ENDPOINTS.TRUCKS.ADD;
    await createRequest(endpoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
    setFormState({});
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
        form="truck-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Truck" : "Add Truck"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="truck-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        <div className="p-field">
          <label htmlFor="license_plate">License Plate</label>
          <InputText
            id="license_plate"
            name="license_plate"
            value={formState.license_plate}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="model">Model</label>
          <InputText
            id="model"
            name="model"
            value={formState.model}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="capacity">Capacity</label>
          <InputText
            id="capacity"
            name="capacity"
            value={formState.capacity}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        {["available", "not-available"].map((status) => {
          return (
            <div key={status} className="flex align-items-center">
              <RadioButton
                inputId={status}
                name="status"
                value={status}
                onChange={(e) =>
                  setFormState({ ...formState, status: e.value })
                }
                checked={status == formState.status}
              />
              <label htmlFor={status} className="ml-2 capitalize">
                {status}
              </label>
            </div>
          );
        })}
      </form>
    </Dialog>
  );
};

export default AddOrModifyTruck;
