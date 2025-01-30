import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { createRequest } from "../../../../utils/api";
import useAuth from "../../../../hooks/useAuth";

import { UnitOfMeasurement } from "../../../../redux/slices/types/procurement/units";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { INVENTORY_ENDPOINTS } from "../../../../api/inventoryEndpoints";
const unitTypes = [
  "Weight",
  "Volume",
  "Length",
  "Area",
  "Temperature",
  "Currency",
  "Time",
  "Energy",
  "Speed",
  "Force",
  "Density",
  "Pressure",
  "Watts",
];
interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: UnitOfMeasurement;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<UnitOfMeasurement>>({
    name: "",
    type: "",
    abbreviation: "",
  });

  const { token } = useAuth();
  useEffect(() => {
    if (item) {
      setFormState({
        name: item.name || "",
        type: item.type || "",
        abbreviation: item.abbreviation || "",
      });
    } else {
      setFormState({ name: "", type: "", abbreviation: "" });
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
    const data = { name: formState.name, type: formState.type };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? INVENTORY_ENDPOINTS.UOM.UPDATE(item.id.toString())
      : INVENTORY_ENDPOINTS.UOM.ADD;
    await createRequest(endpoint, token.access_token, data, onSave, method);

    onSave();
    onClose(); // Close the modal after saving
  };

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500"
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
      header={item?.id ? "Edit UOM" : "Add UOM"}
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
            <label htmlFor="item_category_id">Unit Type</label>
            <div className="card flex justify-content-center">
              <Dropdown
                required
                value={formState.type}
                onChange={(e: DropdownChangeEvent) => {
                  setFormState({ ...formState, type: e.value });
                }}
                options={unitTypes.map((type) => ({
                  label: type,
                  value: type,
                }))}
                placeholder="Select a Unit Type"
                filter
                className="w-full md:w-14rem"
              />
            </div>
          </div>
          <div className="p-field">
            <label htmlFor="abbreviation">Abbreviation</label>
            <InputText
              id="abbreviation"
              name="abbreviation"
              value={formState.abbreviation}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
