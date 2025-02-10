import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { INVENTORY_ENDPOINTS } from "../../api/inventoryEndpoints";
import useAuth from "../../hooks/useAuth";
import { Truck } from "../../redux/slices/types/mossApp/Trucks";
import { createRequest } from "../../utils/api";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";

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
      header={item?.id ? "Edit Asset" : "Add Asset"}
      visible={visible}
      style={{ width: "800px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="asset-form"
        onSubmit={handleSave}
      >
        <div className="p-fluid grid grid-cols-2 gap-4">
        <div className="p-field">
          <label htmlFor="license_plate">Asset Name</label>
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
          <label htmlFor="license_plate">Identity Number</label>
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
          <label   htmlFor="item_id">
                    Supplier
                  </label>
                  <Dropdown
                    required
                    name="item_id"
                    // value={formState.item_id}
                    // onChange={handleDropdownChange}
                    // options={items}
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Select item"
                    filter
                    className="w-full md:w-14rem"
                  />
        </div>
         <div className="p-field">
                  <label   htmlFor="received_date">
                    Purchase Date
                  </label>
                  <InputText
                    id="received_date"
                    name="received_date"
                    type="date"
                    // value={
                    //   formState.received_date || new Date().toISOString().slice(0, 9)
                    // }
                    onChange={handleInputChange}
                    className="w-full"
                    required   
                  />
                </div>
          <div className="p-field">
            <label htmlFor="model">Purchase Cost</label>
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
          <label   htmlFor="item_id">
                  Asset Type (Appreciated / Depreciating)
                  </label>
                  <Dropdown
                    required
                    name="item_id"
                    // value={formState.item_id}
                    // onChange={handleDropdownChange}
                    // options={items}
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Select item"
                    filter
                    className="w-full md:w-14rem"
                  />
        </div>
        <div className="p-field">
                  <label   htmlFor="received_date">
                    Date Put To Use
                  </label>
                  <InputText
                    id="received_date"
                    name="received_date"
                    type="date"
                    // value={
                    //   formState.received_date || new Date().toISOString().slice(0, 9)
                    // }
                    onChange={handleInputChange}
                    className="w-full"
                    required   
                  />
                </div>
        <div className="p-field">
          <label htmlFor="model">Salvage Value</label>
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
          <label htmlFor="model">Expected Age</label>
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
          <label   htmlFor="item_id">
                  Asset Account
                  </label>
                  <Dropdown
                    required
                    name="item_id"
                    // value={formState.item_id}
                    // onChange={handleDropdownChange}
                    // options={items}
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Select item"
                    filter
                    className="w-full md:w-14rem"
                  />
        </div>
        <div className="p-field">
          <label   htmlFor="item_id">
                  Income Account
                  </label>
                  <Dropdown
                    required
                    name="item_id"
                    // value={formState.item_id}
                    // onChange={handleDropdownChange}
                    // options={items}
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Select item"
                    filter
                    className="w-full md:w-14rem"
                  />
        </div>
        <div className="p-field">
          <label htmlFor="capacity">Loation Of Use</label>
          <InputText
            id="capacity"
            name="capacity"
            value={formState.capacity}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label   htmlFor="item_id">
                  Asset Expense Account
                  </label>
                  <Dropdown
                    required
                    name="item_id"
                    // value={formState.item_id}
                    // onChange={handleDropdownChange}
                    // options={items}
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Select item"
                    filter
                    className="w-full md:w-14rem"
                  />
        </div>
        <div className="p-field">
          <label   htmlFor="item_id">
                  Select Branch
                  </label>
                  <Dropdown
                    required
                    name="item_id"
                    // value={formState.item_id}
                    // onChange={handleDropdownChange}
                    // options={items}
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Select item"
                    filter
                    className="w-full md:w-14rem"
                  />
        </div>
        </div>
        <div className="p-fluid grid grid-cols-1 mt-4">
        <div className="p-field">
          <label htmlFor="remarks">Description</label>
            <InputTextarea
              id="remarks"
              name="remarks"
              
              //value={formState.remarks}
              //onChange={handleInputChange}
          />
        </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyTruck;
