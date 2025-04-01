import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";

import useAuth from "../../../hooks/useAuth";
import { INVENTORY_ENDPOINTS } from "../../../api/inventoryEndpoints";
import useItems from "../../../hooks/inventory/useItems";
import { Inventory } from "../../../redux/slices/types/inventory/Inventory";
import { createRequest } from "../../../utils/api";
import useWarehouses from "../../../hooks/inventory/useWarehouses";
import useSuppliers from "../../../hooks/inventory/useSuppliers";
import useInventoryRecords from "../../../hooks/inventory/useInventoryRecords";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Partial<Inventory>;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const initialItem: Partial<Inventory> = {
    item_id: undefined,
    ref_id: undefined,
    quantity: undefined,
    warehouse_id: undefined,
    type: "",
    received_date: "",
    organisation_id: undefined,
    updated_at: "",
    created_at: "",
    id: undefined,
  };

  interface NewInventory extends Partial<Inventory> {}
  const [formState, setFormState] = useState<NewInventory>(initialItem);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refresh } = useInventoryRecords();

  const { token } = useAuth();
  const { data: items } = useItems(); // Fetching items for dropdown
  const { data: warehouses } = useWarehouses();
  const { data: suppliers } = useSuppliers();

  const sources = [
    { label: "Donations", value: "donations" },
    { label: "Return", value: "return" },
    { label: "Purchase", value: "purchase" },
  ];

  useEffect(() => {
    if (item) {
      setFormState({
        ...item,
      });
    } else {
      setFormState(initialItem);
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDropdownChange = (e: DropdownChangeEvent) => {
    const { name } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: e.value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (!formState.item_id || !formState.quantity) {
      setIsSubmitting(false);
      console.log("missin");

      return; // Handle validation error here
    }

    try {
      const method = item?.id ? "PUT" : "POST";
      const endpoint = item?.id
        ? INVENTORY_ENDPOINTS.INVENTORIES.UPDATE(item.id.toString())
        : INVENTORY_ENDPOINTS.INVENTORIES.ADD;

      const data = item?.id ? { ...item, ...formState } : formState;
      await createRequest(
        endpoint,
        token.access_token,
        { ...data, total_price: 0 },
        onSave,
        method
      );
      refresh()
      setIsSubmitting(false);

      onSave();
      onClose(); // Close the modal after saving
    } catch (error) {
      console.error("Error saving item", error);
      // Handle error here
    } finally {
      setIsSubmitting(false);
    }
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
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="item-form"
        size="small"
        loading={isSubmitting}
        disabled={isSubmitting}
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Stock" : "Add Stock"}
      visible={visible}
      style={{ width: "800px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="item-form"
        onSubmit={handleSave}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4"
      >
        <div className="p-field">
          <label className="font-semibold" htmlFor="item_id">
            Item
          </label>
          <Dropdown
            required
            name="item_id"
            value={formState.item_id}
            onChange={handleDropdownChange}
            options={items}
            optionLabel="name"
            optionValue="id"
            placeholder="Select item"
            filter
            className="w-full md:w-14rem"
          />
        </div>
        <div className="p-field">
          <label className="font-semibold" htmlFor="item_id">
            Source
          </label>
          <Dropdown
            required
            name="type"
            value={formState.type}
            onChange={handleDropdownChange}
            options={sources}
            optionLabel="label"
            optionValue="value"
            placeholder="Select source"
            filter
            className="w-full md:w-14rem"
          />
        </div>
        <div className="p-field">
          <label className="font-semibold" htmlFor="quantity">
            Quantity
          </label>
          <InputText
            id="quantity"
            name="quantity"
            type="number"
            value={formState.quantity?.toString() || ""}
            onChange={handleInputChange}
            required
            className="w-full"
            min="1"
          />
        </div>

        <div className="p-field">
          <label className="font-semibold" htmlFor="ref_id">
            Reference (Optional)
          </label>
          <InputText
            id="ref_id"
            name="ref_id"
            value={formState.ref_id?.toString() || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label className="font-semibold" htmlFor="warehouse_id">
            Store
          </label>
          <Dropdown
            required
            name="warehouse_id"
            value={formState.warehouse_id}
            onChange={handleDropdownChange}
            options={warehouses}
            optionLabel="name"
            optionValue="id"
            placeholder="Select item"
            filter
            className="w-full md:w-14rem"
          />
        </div>
        <div className="p-field">
          <label className="font-semibold" htmlFor="supplier_id">
            Supplier (Optional)
          </label>
          <Dropdown
            name="supplier_id"
            value={formState.supplier_id}
            onChange={handleDropdownChange}
            options={[
              { label: "Select Supplier", value: null },
              ...suppliers.map((supplier) => ({
                label: supplier.supplier_name,
                value: supplier.id,
              })),
            ]}
            placeholder="Select supplier"
            filter
            className="w-full md:w-14rem"
            aria-describedby="supplier-help"
          />
        </div>
        <div className="p-field">
          <label className="font-semibold" htmlFor="received_date">
            Received Date
          </label>
          <InputText
            id="received_date"
            name="received_date"
            type="date"
            value={
              formState.received_date || new Date().toISOString().slice(0, 9)
            }
            onChange={handleInputChange}
            className="w-full"
            required
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
