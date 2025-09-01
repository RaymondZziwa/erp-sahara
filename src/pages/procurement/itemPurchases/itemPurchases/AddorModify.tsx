import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { toast } from "react-toastify";
import axios from "axios";
import useItems from "../../../../hooks/inventory/useItems";
import useSuppliers from "../../../../hooks/inventory/useSuppliers";
import useWarehouses from "../../../../hooks/inventory/useWarehouses";
import useAuth from "../../../../hooks/useAuth";
import { baseURL } from "../../../../utils/api";
import useUnitsOfMeasurement from "../../../../hooks/inventory/useUnitsOfMeasurement";
import useItemPurchases from "../../../../hooks/procurement/itemPurchases/useItemPurchases";


interface AddOrModifyItemPurchaseProps {
  visible: boolean;
  onClose: () => void;
  itemPurchase?: Partial<ItemPurchasePayload>;
  onSave: () => void;
}

interface ItemPurchasePayload {
  supplier_id: string;
  item_id: string;
  delivery_date: string;
  quantity: number;
  uom_id: string;
  warehouse_id: string;
  notes: string;
}

const AddOrModifyItemPurchase: React.FC<AddOrModifyItemPurchaseProps> = ({
  visible,
  onClose,
  itemPurchase,
  onSave,
}) => {
  const { token } = useAuth();

  const { data: suppliers, loading: loadingSuppliers } = useSuppliers();
  const { data: items, loading: loadingItems } = useItems();
  const { data: warehouses, loading: loadingWarehouses } = useWarehouses();
  const { data: uoms, loading: loadingUOMs } = useUnitsOfMeasurement();
  const {refresh} = useItemPurchases()

  const initialState: ItemPurchasePayload = {
    supplier_id: "",
    item_id: "",
    delivery_date: new Date().toISOString().split("T")[0],
    quantity: 0,
    uom_id: "",
    warehouse_id: "",
    notes: "",
  };

  const [formState, setFormState] = useState<ItemPurchasePayload>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (itemPurchase) {
      setFormState({
        supplier_id: itemPurchase.supplier_id || "",
        item_id: itemPurchase.item_id || "",
        delivery_date: new Date(itemPurchase.delivery_date).toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
        quantity: itemPurchase.quantity || 0,
        uom_id: itemPurchase.uom_id || "",
        warehouse_id: itemPurchase.warehouse_id || "",
        notes: itemPurchase.notes || "",
      });
    } else {
      setFormState(initialState);
    }
  }, [itemPurchase]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseFloat(value) : value,
    }));
  };

  const handleDropdownChange = (e: DropdownChangeEvent, field: keyof ItemPurchasePayload) => {
    setFormState((prev) => ({
      ...prev,
      [field]: e.value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const method = itemPurchase ? "PUT" : "POST";
      const endpoint = itemPurchase
        ? `/purchases/itemdelivery/${itemPurchase.id}/update`
        : "/purchases/itemdelivery/create";

      await axios({
        url: baseURL + endpoint,
        method,
        data: formState,
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success(itemPurchase ? "Item purchase modified successfully!" : "Item purchase saved successfully!");
      onSave();
      onClose();
      refresh();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save item purchase");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      header={itemPurchase ? "Edit Item Purchase" : "Add Item Purchase"}
      visible={visible}
      onHide={onClose}
      modal
      style={{ width: "450px" }}
      footer={
        <div className="flex justify-end space-x-2">
          <Button
            label="Cancel"
            icon="pi pi-times"
            onClick={onClose}
            className="p-button-text !bg-red-500"
            disabled={isSubmitting}
          />
          <Button
            label={itemPurchase ? "Update" : "Save"}
            icon="pi pi-check"
            onClick={() => document.getElementById("item-purchase-form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </div>
      }
    >
      <form id="item-purchase-form" onSubmit={handleSave} className="p-fluid grid grid-cols-1 gap-4">
        <div className="p-field">
          <label htmlFor="supplier_id">Supplier</label>
          <Dropdown
            id="supplier_id"
            value={formState.supplier_id}
            options={suppliers?.map((s) => ({ label: s.name, value: s.id })) || []}
            onChange={(e) => handleDropdownChange(e, "supplier_id")}
            placeholder="Select Supplier"
            disabled={loadingSuppliers}
            filter
            required
          />
        </div>

        <div className="p-field">
          <label htmlFor="item_id">Item</label>
          <Dropdown
            id="item_id"
            value={formState.item_id}
            options={items?.map((i) => ({ label: i.name, value: i.id })) || []}
            onChange={(e) => handleDropdownChange(e, "item_id")}
            placeholder="Select Item"
            disabled={loadingItems}
            filter
            required
          />
        </div>

        <div className="p-field">
          <label htmlFor="delivery_date">Delivery Date</label>
          <InputText
            id="delivery_date"
            name="delivery_date"
            type="date"
            value={formState.delivery_date}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="p-field">
          <label htmlFor="quantity">Quantity</label>
          <InputText
            id="quantity"
            name="quantity"
            type="number"
            step="0.01"
            value={formState.quantity}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="p-field">
          <label htmlFor="uom_id">Unit of Measurement</label>
          <Dropdown
            id="uom_id"
            value={formState.uom_id}
            options={uoms?.map((u) => ({ label: u.name, value: u.id })) || []}
            onChange={(e) => handleDropdownChange(e, "uom_id")}
            placeholder="Select UOM"
            disabled={loadingUOMs}
            filter
            required
          />
        </div>

        <div className="p-field">
          <label htmlFor="warehouse_id">Receiving Warehouse</label>
          <Dropdown
            id="warehouse_id"
            value={formState.warehouse_id}
            options={warehouses?.map((w) => ({ label: w.name, value: w.id })) || []}
            onChange={(e) => handleDropdownChange(e, "warehouse_id")}
            placeholder="Select Warehouse"
            disabled={loadingWarehouses}
            filter
            required
          />
        </div>

        <div className="p-field">
          <label htmlFor="notes">Notes</label>
          <InputTextarea
            id="notes"
            name="notes"
            value={formState.notes}
            onChange={handleInputChange}
            rows={3}
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItemPurchase;
