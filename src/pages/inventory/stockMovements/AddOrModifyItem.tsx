import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { INVENTORY_ENDPOINTS } from "../../../api/inventoryEndpoints";
import useItems from "../../../hooks/inventory/useItems";
import useWarehouses from "../../../hooks/inventory/useWarehouses";
import { StockMovement } from "../../../redux/slices/types/inventory/StockMovement";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: StockMovement;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<StockMovement>>({
    item_id: null,
    quantity: "",
    type: "",
    movement_date: "",
    from_warehouse_id: null,
    to_warehouse_id: null,
    picked_by: "",
    remarks: "",
  });

  const { data: items } = useItems();
  const { data: warehouses } = useWarehouses();
  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        ...formState,
        ...item,
        item_id: item.id.toString(),
      });
    } else {
      setFormState({
        item_id: null,
        quantity: "",
        type: "",
        movement_date: "",
        from_warehouse_id: null,
        to_warehouse_id: null,
        remarks: "",
      });
    }
  }, [item]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = { ...formState };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? INVENTORY_ENDPOINTS.STOCK_MOVEMENTS.UPDATE(item.id.toString())
      : INVENTORY_ENDPOINTS.STOCK_MOVEMENTS.ADD;

    await createRequest(endpoint, token.access_token, data, onSave, method);
    onSave();
    onClose();
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
      header={item?.id ? "Edit Movement" : "Stock Transfer"}
      visible={visible}
      style={{ width: "800px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="item-form" onSubmit={handleSave}>
        <div className="p-fluid">
        <div className="flex flex-row justify-between gap-2 mb-2">
          <div className="p-field w-1/2">
            <label htmlFor="from_warehouse_id">From Store</label>
            <Dropdown
              id="from_warehouse_id"
              name="from_warehouse_id"
              filter
              value={formState.from_warehouse_id}
              options={warehouses.map((wh) => ({
                label: wh.name,
                value: wh.id,
              }))}
              onChange={handleInputChange}
              placeholder="Select a Store"
            />
          </div>
          <div className="p-field w-1/2">
            <label htmlFor="to_warehouse_id">To Store</label>
            <Dropdown
              id="to_warehouse_id"
              name="to_warehouse_id"
              filter
              value={formState.to_warehouse_id}
              options={warehouses.map((wh) => ({
                label: wh.name,
                value: wh.id,
              }))}
              onChange={handleInputChange}
              placeholder="Select a Store"
            />
          </div>
          </div>
          <div className="flex flex-row justify-between gap-2 mb-2">
          <div className="p-field w-1/2">
            <label htmlFor="item_id">Item</label>
            <Dropdown
              id="item_id"
              name="item_id"
              filter
              value={formState.item_id}
              options={items.map((item: any) => ({
                label: item.name,
                value: item.id,
              }))}
              onChange={handleInputChange}
              placeholder="Select an Item"
              required
            />
          </div>
          <div className="p-field w-1/2">
            <label htmlFor="type">Type</label>
            <Dropdown
              filter
              id="type"
              name="type"
              value={formState.type}
              options={[
                "transfer"
              ].map((type) => ({ label: type, value: type }))}
              onChange={handleInputChange}
              placeholder="Select a source"
              required
            />
          </div>
          </div>
          <div className="flex flex-row justify-between gap-2 mb-2">
          <div className="p-field w-1/2">
            <label htmlFor="quantity">Quantity</label>
            <InputText
              id="quantity"
              name="quantity"
              type='number'
              value={formState.quantity}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="p-field w-1/2">
            <label htmlFor="movement_date">Movement Date</label>
            <InputText
              id="movement_date"
              name="movement_date"
              type="date"
              value={formState.movement_date || new Date().toISOString().split("T")[0]}
              max={new Date().toISOString().split("T")[0]}
              onChange={handleInputChange}
              required
            />
          </div>
          </div>
          <div className="p-field mb-2">
            <label htmlFor="picked_by">Taken By</label>
            <InputText
              id="picked_by"
              name="picked_by"
              value={formState.picked_by}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="remarks">Remarks</label>
            <InputTextarea
              id="remarks"
              name="remarks"
              value={formState.remarks}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
