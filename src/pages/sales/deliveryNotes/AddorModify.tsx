import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";

import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";

import { DeliveryNote, DeliveryItem } from "../../../redux/slices/types/sales/deliveryNotes";
import { SALES_ENDPOINTS } from "../../../api/salesEndpoints";
import useEmployees from "../../../hooks/hr/useEmployees";
import useTrucks from "../../../hooks/inventory/useTrucks";
import useCustomerOrders from "../../../hooks/sales/useCustomerOrders";
import useUnitsOfMeasurement from "../../../hooks/inventory/useUnitsOfMeasurement";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: DeliveryNote;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const { token } = useAuth();
  const { data: orders = [] } = useCustomerOrders();
  const { data: trucks = [] } = useTrucks();
  const { data: units = [] } = useUnitsOfMeasurement();
  const { data: employees = [] } = useEmployees();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formState, setFormState] = useState<Partial<DeliveryNote>>({
    delivery_type: "Product",
    delivery_date: new Date().toISOString().split("T")[0],
    delivery_method: "Truck",
    items: [],
  });

  useEffect(() => {
    if (item) {
      setFormState(item);
    } else {
      setFormState({
        delivery_type: "Product",
        delivery_date: new Date().toISOString().split("T")[0],
        delivery_method: "Truck",
        items: [],
      });
    }
  }, [item]);

  const handleOrderChange = (orderId: string) => {
    const selectedOrder = orders.find((o) => o.id === orderId);
    const orderItems = selectedOrder?.items || [];

    const mappedItems: DeliveryItem[] = orderItems.map((orderItem) => ({
      sale_order_item_id: orderItem.id,
      quantity_delivered: orderItem.quantity || 1,
      uom_id: orderItem.uom_id,
      condition: "Good",
      notes: "",
      item_name: orderItem.name
    }));

    setFormState((prev) => ({
      ...prev,
      sale_order_id: orderId,
      items: mappedItems,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (name: keyof DeliveryNote, value: string) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: keyof DeliveryItem, value: any) => {
    const updatedItems = [...(formState.items || [])];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormState((prev) => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setFormState((prev) => ({
      ...prev,
      items: [
        ...(prev.items || []),
        {
          sale_order_item_id: "",
          quantity_delivered: 1,
          uom_id: "",
          condition: "Good",
          notes: "",
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    const updatedItems = [...(formState.items || [])];
    updatedItems.splice(index, 1);
    setFormState((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = { ...formState };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? SALES_ENDPOINTS.DELIVERY_NOTES.UPDATE(item.id)
      : SALES_ENDPOINTS.DELIVERY_NOTES.ADD;

    await createRequest(endpoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
    onClose();
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button label="Cancel" icon="pi pi-times" onClick={onClose} className="p-button-text bg-red-500" />
      <Button
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        loading={isSubmitting}
        type="submit"
        form="delivery-form"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Delivery Note" : "Add Delivery Note"}
      visible={visible}
      style={{ width: "60vw" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="delivery-form" onSubmit={handleSubmit} className="p-fluid space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Customer Order</label>
            <Dropdown
              value={formState.sale_order_id}
              options={orders.map((o) => ({
                label: `${o.customer.first_name} ${o.customer.last_name}`,
                value: o.id,
              }))}
              onChange={(e) => handleOrderChange(e.value)}
              placeholder="Select customer order"
            />
          </div>
          <div>
            <label>Delivery Type *</label>
            <Dropdown
              value={formState.delivery_type}
              options={["Service", "Product", "Mixed"]}
              onChange={(e) => handleDropdownChange("delivery_type", e.value)}
              placeholder="Select a type"
            />
          </div>

          <div>
            <label>Delivery Method *</label>
            <Dropdown
              value={formState.delivery_method}
              options={[
                "Truck",
                "Courier",
                "Motorbike",
                "Company Vehicle",
                "Pickup by Customer",
                "On-Site",
                "Remote",
                "Workshop",
              ]}
              onChange={(e) => handleDropdownChange("delivery_method", e.value)}
            />
          </div>

          <div>
            <label>Delivery Date *</label>
            <InputText
              name="delivery_date"
              value={formState.delivery_date || ""}
              onChange={handleChange}
              type="date"
            />
          </div>

          <div>
            <label>Carrier</label>
            <Dropdown
              value={formState.carrier_id}
              options={trucks.map((t) => ({ label: t.license_plate, value: t.id }))}
              onChange={(e) => handleDropdownChange("carrier_id", e.value)}
              placeholder="Select carrier"
            />
          </div>

          <div>
            <label>Delivered By</label>
            <Dropdown
              value={formState.delivered_by}
              options={employees.map((emp) => ({
                label: `${emp.first_name} ${emp.last_name}`,
                value: emp.id,
              }))}
              onChange={(e) => handleDropdownChange("delivered_by", e.value)}
              placeholder="Select employee"
            />
          </div>

          <div>
            <label>Received By</label>
            <InputText
              name="received_by"
              value={formState.received_by || ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Tracking Number</label>
            <InputText
              name="tracking_number"
              value={formState.tracking_number || ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Service Performed At</label>
            <InputText
              name="service_performed_at"
              type="date"
              value={formState.service_performed_at || ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Service Technician</label>
            <InputText
              name="service_technician"
              value={formState.service_technician || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label>Notes</label>
          <InputTextarea
            name="notes"
            value={formState.notes || ""}
            onChange={handleChange}
          />
        </div>

        <hr />
        <h4>Items</h4>
        {(formState.items || []).map((item, idx) => (
          <div key={idx} className="grid grid-cols-5 gap-2 items-end">
            <InputText
              placeholder="Sale Order Item ID"
              value={item.item_name}
              onChange={(e) => handleItemChange(idx, "sale_order_item_id", e.target.value)}
              readOnly
            />
            <InputText
              placeholder="Quantity Delivered"
              type="number"
              value={item.quantity_delivered}
              onChange={(e) =>
                handleItemChange(idx, "quantity_delivered", parseInt(e.target.value) || 0)
              }
              min={1}
            />
            <Dropdown
              value={item.uom_id}
              options={units.map((u) => ({ label: u.name, value: u.id }))}
              onChange={(e) => handleItemChange(idx, "uom_id", e.value)}
              placeholder="Select UOM"
            />
            <Dropdown
              value={item.condition}
              options={["Good", "Damaged"]}
              onChange={(e) => handleItemChange(idx, "condition", e.value)}
              placeholder="Condition"
            />
            <Button
              icon="pi pi-trash"
              className="p-button-danger"
              onClick={() => removeItem(idx)}
              type="button"
            />
          </div>
        ))}
        <Button label="Add Item" icon="pi pi-plus" type="button" onClick={addItem} />
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
