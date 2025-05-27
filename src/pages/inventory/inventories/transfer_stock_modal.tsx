
import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";

import useAuth from "../../../hooks/useAuth";
import { INVENTORY_ENDPOINTS } from "../../../api/inventoryEndpoints";
import useItems from "../../../hooks/inventory/useItems";
import { Inventory } from "../../../redux/slices/types/inventory/Inventory";
import { baseURL, createRequest } from "../../../utils/api";
import axios from "axios";
import useWarehouses from "../../../hooks/inventory/useWarehouses";
import {toast} from 'react-toastify'
interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Partial<Inventory>;
  onSave: () => void;
}

const TransferStock: React.FC<AddOrModifyItemProps> = ({
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
    to_warehouse_id: undefined,
    type:"",
    received_date: "",
    organisation_id: undefined,
    updated_at: "",
    created_at: "",
    id: undefined,
  };

  interface NewInventory extends Partial<Inventory> {}
  const [formState, setFormState] = useState<NewInventory>(initialItem);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stockOutForm, setStockOutForm] = useState({
    item_id: "",
    quantity: 0,
    type: "",
    movement_date: "",
    warehouse_id: "",
    to_warehouse_id: 0,
    movement_reason:"",
    picked_by:"",
    remarks:""
  })
  const {data: warehousesd} = useWarehouses()

  const { token } = useAuth();
  const { data: items } = useItems();

  const warehouses = warehousesd?.map(warehouse => ({
    label: warehouse.name, 
    value: warehouse.id, 
  })) || [];
  

  const sources = [
    {label: "Manufacturing", value: 'manufacturing'},
    {label: "Written-off", value: 'written-off'},
    {label: "milling", value: 'milling'},
    {label: "Transfer", value: 'transfer'},
  ]

  useEffect(() => {
    if (item) {
      setFormState({
        ...item,
      });
    } else {
      setFormState(initialItem);
    }
  }, [item]);

  const handleStockOutInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setStockOutForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleStockOutDropdownChange = (e: DropdownChangeEvent) => {
    const { name } = e.target;
    setStockOutForm((prevState) => ({
      ...prevState,
      [name]: e.value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);


    try {
      const method = item?.id ? "PUT" : "POST";
      const endpoint = item?.id
        ? INVENTORY_ENDPOINTS.INVENTORIES.UPDATE(item.id.toString())
        : INVENTORY_ENDPOINTS.INVENTORIES.ADD
        //INVENTORY_ENDPOINTS.INVENTORIES.STOCK_OUT
    
      const data = item?.id ? { ...item, ...formState } : formState;
      await createRequest(
        endpoint,
        token.access_token,
        { ...data, total_price: 0 },
        onSave,
        method
      );
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
  
  const stockOut = async () => {
    try {
      const response = await axios.post(
        `${baseURL}${INVENTORY_ENDPOINTS.STOCK_MOVEMENTS.ADD}`,
        { ...stockOutForm },
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
            "Content-Type": "application/json", 
          },
        }
      );

      toast.success(response.data.message)
      onSave()
      onClose()
    } catch (error) {
      console.error("Error saving item", error);
    } finally {
      setIsSubmitting(false);
    }
  }

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
        onClick={stockOut}
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Stock" : "Take Out Stock"}
      visible={visible}
      style={{ width: "800px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="item-form" onSubmit={handleSave}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2">
          <div className="p-field">
            <label className="font-semibold" htmlFor="item_id">
              Store<span className="text-red-600">*</span>
            </label>
            <Dropdown
              required
              name="warehouse_id"
              value={stockOutForm.warehouse_id}
              onChange={handleStockOutDropdownChange}
              options={warehouses}
              optionLabel="label"
              optionValue="value"
              placeholder="Select warehouse"
              filter
              className="w-full md:w-14rem"
            />
          </div>
          <div className="p-field">
            <label className="font-semibold" htmlFor="item_id">
              Type<span className="text-red-600">*</span>
            </label>
            <Dropdown
              required
              name="type"
              value={stockOutForm.type}
              onChange={handleStockOutDropdownChange}
              options={sources}
              optionLabel="label"
              optionValue="value"
              placeholder="Select type"
              filter
              className="w-full md:w-14rem"
            />
          </div>
          {stockOutForm.type === "transfer" && (
            <div className="p-field">
              <label className="font-semibold" htmlFor="item_id">
                To Store<span className="text-red-600">*</span>
              </label>
              <Dropdown
                required
                name="to_warehouse_id"
                value={stockOutForm.to_warehouse_id}
                onChange={handleStockOutDropdownChange}
                options={warehouses}
                optionLabel="label"
                optionValue="value"
                placeholder="Select store"
                filter
                className="w-full md:w-14rem"
              />
            </div>
          )}
          <div className="p-field">
            <label className="font-semibold" htmlFor="item_id">
              Item<span className="text-red-600">*</span>
            </label>
            <Dropdown
              required
              name="item_id"
              value={stockOutForm.item_id}
              onChange={handleStockOutDropdownChange}
              options={items}
              optionLabel="name"
              optionValue="id"
              placeholder="Select item"
              filter
              className="w-full md:w-14rem"
            />
          </div>
          <div className="p-field">
            <label className="font-semibold" htmlFor="quantity">
              Quantity<span className="text-red-600">*</span>
            </label>
            <InputText
              id="quantity"
              name="quantity"
              type="number"
              value={stockOutForm.quantity?.toString() || ""}
              onChange={handleStockOutInputChange}
              required
              className="w-full"
              min="1"
            />
          </div>
          <div className="p-field">
            <label className="font-semibold" htmlFor="received_date">
              Movement Date<span className="text-red-600">*</span>
            </label>
            <InputText
              id="movement_date"
              name="movement_date"
              type="date"
              value={
                stockOutForm.movement_date ||
                new Date().toISOString().slice(0, 9)
              }
              onChange={handleStockOutInputChange}
              className="w-full"
              required
            />
          </div>
          <div className="p-field">
            <label className="font-semibold" htmlFor="received_date">
              Picked By<span className="text-red-600">*</span>
            </label>
            <InputText
              id="received_date"
              name="picked_by"
              type="text"
              value={stockOutForm.picked_by}
              onChange={handleStockOutInputChange}
              className="w-full"
              required
            />
          </div>
        </div>
        <div className="p-field w-full">
          <label className="font-semibold" htmlFor="movement_reason">
            Remarks<span className="text-red-600">*</span>
          </label>
          <InputText
            id="movement_reason"
            name="movement_reason"
            type="text"
            value={stockOutForm.movement_reason || ""}
            onChange={handleStockOutInputChange}
            className="w-full h-[100px]"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default TransferStock;
