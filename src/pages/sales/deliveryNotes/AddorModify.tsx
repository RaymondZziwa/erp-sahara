import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { DeliveryNote, DeliveryItem } from "../../../redux/slices/types/sales/deliveryNotes";
import { SALES_ENDPOINTS } from "../../../api/salesEndpoints";
import useEmployees from "../../../hooks/hr/useEmployees";
import useTrucks from "../../../hooks/inventory/useTrucks";
import useCustomerOrders from "../../../hooks/sales/useCustomerOrders";
import useUnitsOfMeasurement from "../../../hooks/inventory/useUnitsOfMeasurement";
import useWarehouses from "../../../hooks/inventory/useWarehouses";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: DeliveryNote;
  onSave: () => void;
}

interface DeliveryLine {
  order_line_id: string;
  item_id?: string;
  uom_id: string;
  quantity_delivered: number;
  quantity_returned: number;
  condition: "Good" | "Damaged";
  notes: string;
}

interface DeliveryPayload {
  order_id: string;
  delivery_date: string;
  delivery_method: "Truck" | "Courier" | "Motorbike" | "Company Vehicle" | "Pickup by Customer" | "On-Site" | "Remote" | "Workshop";
  tracking_number?: string;
  carrier_id?: string;
  warehouse_id?: string;
  delivery_address_id?: string;
  created_by: string;
  shipped_by?: string;
  delivered_by?: string;
  status: "draft" | "ready_for_pickup" | "shipped" | "in_transit" | "delivered" | "returned" | "confirmed" | "disputed" | "failed" | "canceled";
  lines: DeliveryLine[];
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const { token, user } = useAuth();
  const { data: orders = [] } = useCustomerOrders();
  const { data: trucks = [] } = useTrucks();
  const { data: units = [] } = useUnitsOfMeasurement();
  const { data: employees = [] } = useEmployees();
  const { data: warehouses = [] } = useWarehouses();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formState, setFormState] = useState<DeliveryPayload>({
    order_id: "",
    delivery_date: new Date().toISOString().split("T")[0],
    delivery_method: "Truck",
    tracking_number: "",
    carrier_id: undefined,
    warehouse_id: undefined,
    delivery_address_id: undefined,
    created_by: user?.id || "",
    shipped_by: undefined,
    delivered_by: undefined,
    status: "draft",
    lines: [],
  });

  useEffect(() => {
    if (item) {
      // Map existing item to new payload structure
      setFormState({
        order_id: item.sale_order_id || "",
        delivery_date: item.delivery_date || new Date().toISOString().split("T")[0],
        delivery_method: item.delivery_method as any || "Truck",
        tracking_number: item.tracking_number || "",
        carrier_id: item.carrier_id || undefined,
        warehouse_id: item.warehouse_id || undefined,
        delivery_address_id: item.delivery_address_id || undefined,
        created_by: user?.id || "",
        shipped_by: item.shipped_by || undefined,
        delivered_by: item.delivered_by || undefined,
        status: item.status as any || "draft",
        lines: item.items?.map(item => ({
          order_line_id: item.sale_order_item_id || "",
          item_id: item.item_id || "",
          uom_id: item.uom_id || "",
          quantity_delivered: item.quantity_delivered || 0,
          quantity_returned: item.quantity_returned || 0,
          condition: item.condition as "Good" | "Damaged" || "Good",
          notes: item.notes || ""
        })) || []
      });
    } else {
      setFormState({
        order_id: "",
        delivery_date: new Date().toISOString().split("T")[0],
        delivery_method: "Truck",
        tracking_number: "",
        carrier_id: undefined,
        warehouse_id: undefined,
        delivery_address_id: undefined,
        created_by: user?.id || "",
        shipped_by: undefined,
        delivered_by: undefined,
        status: "draft",
        lines: [],
      });
    }
  }, [item, user]);

  const handleOrderChange = (orderId: string) => {
    const selectedOrder = orders.find((o) => o.id === orderId);
    
    console.log('Selected Order:', selectedOrder); // Debug log
    console.log('Order Lines:', selectedOrder?.order_lines); // Debug log

    // Use order_lines instead of customer_order_items
    const orderLines = selectedOrder?.order_lines || [];

    const mappedLines: DeliveryLine[] = orderLines.map((orderLine) => ({
      order_line_id: orderLine.id, // Use the order line ID
      item_id: orderLine.item_id || "",
      uom_id: orderLine.uom_id || "",
      quantity_delivered: parseFloat(orderLine.qty_ordered) || 0, // Use qty_ordered as default delivered
      quantity_returned: 0, // Start with 0 returned
      condition: "Good", // Default condition
      notes: "" // Empty notes by default
    }));

    console.log('Mapped Delivery Lines:', mappedLines); // Debug log

    setFormState((prev) => ({
      ...prev,
      order_id: orderId,
      lines: mappedLines,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (name: keyof DeliveryPayload, value: any) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleLineChange = (index: number, field: keyof DeliveryLine, value: any) => {
    const updatedLines = [...formState.lines];
    updatedLines[index] = { ...updatedLines[index], [field]: value };
    setFormState((prev) => ({ ...prev, lines: updatedLines }));
  };

  const addLine = () => {
    setFormState((prev) => ({
      ...prev,
      lines: [
        ...prev.lines,
        {
          order_line_id: "",
          item_id: "",
          uom_id: "",
          quantity_delivered: 0,
          quantity_returned: 0,
          condition: "Good",
          notes: ""
        },
      ],
    }));
  };

  const removeLine = (index: number) => {
    const updatedLines = formState.lines.filter((_, i) => i !== index);
    setFormState((prev) => ({ ...prev, lines: updatedLines }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? SALES_ENDPOINTS.DELIVERY_NOTES.UPDATE(item.id)
      : SALES_ENDPOINTS.DELIVERY_NOTES.ADD;

    await createRequest(endpoint, token.access_token, formState, onSave, method);
    setIsSubmitting(false);
    onClose();
  };

  const deliveryMethods = [
    "Truck", "Courier", "Motorbike", "Company Vehicle", 
    "Pickup by Customer", "On-Site", "Remote", "Workshop"
  ];

  const statusOptions = [
    "draft", "ready_for_pickup", "shipped", "in_transit", 
    "delivered", "returned", "confirmed", "disputed", "failed", "canceled"
  ];

  const conditionOptions = ["Good", "Damaged"];

  const footer = (
    <div className="flex justify-end gap-2">
      <Button 
        label="Cancel" 
        icon="pi pi-times" 
        onClick={onClose} 
        className="p-button-text !bg-red-500" 
        disabled={isSubmitting}
      />
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
      style={{ width: "80vw" }}
      footer={footer}
      onHide={onClose}
      modal
    >
      <form id="delivery-form" onSubmit={handleSubmit} className="p-fluid space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Order Selection */}
          <div className="field">
            <label htmlFor="order_id">Customer Order *</label>
            <Dropdown
              id="order_id"
              value={formState.order_id}
              options={orders.map((order) => ({
                label: `Order #${order.so_number} - ${order.customer?.organization_name || `${order.customer?.first_name} ${order.customer?.last_name}`}`,
                value: order.id,
              }))}
              onChange={(e) => handleOrderChange(e.value)}
              placeholder="Select customer order"
              className="w-full"
              required
            />
          </div>

          {/* Delivery Date */}
          <div className="field">
            <label htmlFor="delivery_date">Delivery Date *</label>
            <Calendar
              id="delivery_date"
              value={new Date(formState.delivery_date)}
              onChange={(e) => handleDropdownChange("delivery_date", e.value?.toISOString().split('T')[0])}
              dateFormat="yy-mm-dd"
              className="w-full"
              required
            />
          </div>

          {/* Delivery Method */}
          <div className="field">
            <label htmlFor="delivery_method">Delivery Method *</label>
            <Dropdown
              id="delivery_method"
              value={formState.delivery_method}
              options={deliveryMethods.map(method => ({ label: method, value: method }))}
              onChange={(e) => handleDropdownChange("delivery_method", e.value)}
              placeholder="Select method"
              className="w-full"
              required
            />
          </div>

          {/* Status */}
          <div className="field">
            <label htmlFor="status">Status *</label>
            <Dropdown
              id="status"
              value={formState.status}
              options={statusOptions.map(status => ({ label: status, value: status }))}
              onChange={(e) => handleDropdownChange("status", e.value)}
              placeholder="Select status"
              className="w-full"
              required
            />
          </div>

          {/* Tracking Number */}
          <div className="field">
            <label htmlFor="tracking_number">Tracking Number</label>
            <InputText
              id="tracking_number"
              name="tracking_number"
              value={formState.tracking_number}
              onChange={handleChange}
              placeholder="TRK-20251004-001"
              className="w-full"
            />
          </div>

          {/* Carrier */}
          <div className="field">
            <label htmlFor="carrier_id">Carrier</label>
            <Dropdown
              id="carrier_id"
              value={formState.carrier_id}
              options={trucks.map(truck => ({ label: `${truck.license_plate} - ${truck.model}`, value: truck.id }))}
              onChange={(e) => handleDropdownChange("carrier_id", e.value)}
              placeholder="Select carrier"
              className="w-full"
            />
          </div>

          {/* Warehouse */}
          <div className="field">
            <label htmlFor="warehouse_id">Warehouse</label>
            <Dropdown
              id="warehouse_id"
              value={formState.warehouse_id}
              options={warehouses.map(warehouse => ({ label: `${warehouse.name} - ${warehouse.location}`, value: warehouse.id }))}
              onChange={(e) => handleDropdownChange("warehouse_id", e.value)}
              placeholder="Select warehouse"
              className="w-full"
            />
          </div>

          {/* Shipped By */}
          <div className="field">
            <label htmlFor="shipped_by">Shipped By</label>
            <Dropdown
              id="shipped_by"
              value={formState.shipped_by}
              options={employees.map(emp => ({ label: `${emp.first_name} ${emp.last_name}`, value: emp.id }))}
              onChange={(e) => handleDropdownChange("shipped_by", e.value)}
              placeholder="Select employee"
              className="w-full"
            />
          </div>

          {/* Delivered By */}
          <div className="field">
            <label htmlFor="delivered_by">Delivered By</label>
            <Dropdown
              id="delivered_by"
              value={formState.delivered_by}
              options={employees.map(emp => ({ label: `${emp.first_name} ${emp.last_name}`, value: emp.id }))}
              onChange={(e) => handleDropdownChange("delivered_by", e.value)}
              placeholder="Select employee"
              className="w-full"
            />
          </div>
        </div>

        {/* Delivery Lines Section */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">
              Delivery Lines {formState.lines.length > 0 && `(${formState.lines.length})`}
            </h4>
            <Button 
              label="Add Line" 
              icon="pi pi-plus" 
              type="button" 
              onClick={addLine}
              className="p-button-outlined p-button-sm"
            />
          </div>

          {formState.lines.length === 0 ? (
            <div className="text-center py-4 border-2 border-dashed rounded-lg">
              <i className="pi pi-inbox text-3xl text-gray-400 mb-2"></i>
              <p className="text-gray-500">No delivery lines added</p>
              <p className="text-gray-400 text-sm">Select an order to auto-populate lines or add manually</p>
            </div>
          ) : (
            <div className="space-y-3">
              {formState.lines.map((line, index) => (
                <div key={index} className="grid grid-cols-7 gap-3 p-3 border rounded-lg bg-gray-50">
                  <div className="field">
                    <label className="text-sm font-medium">Order Line ID</label>
                    <InputText
                      value={line.order_line_id}
                      onChange={(e) => handleLineChange(index, "order_line_id", e.target.value)}
                      placeholder="Order Line ID"
                      className="w-full text-sm"
                      required
                      disabled // Disable since it comes from order
                    />
                  </div>
                  
                  <div className="field">
                    <label className="text-sm font-medium">Item ID</label>
                    <InputText
                      value={line.item_id}
                      onChange={(e) => handleLineChange(index, "item_id", e.target.value)}
                      placeholder="Item ID"
                      className="w-full text-sm"
                      disabled // Disable since it comes from order
                    />
                  </div>

                  <div className="field">
                    <label className="text-sm font-medium">UOM</label>
                    <Dropdown
                      value={line.uom_id}
                      options={units.map(unit => ({ label: unit.name, value: unit.id }))}
                      onChange={(e) => handleLineChange(index, "uom_id", e.value)}
                      placeholder="Select UOM"
                      className="w-full text-sm"
                      required
                      disabled={!!line.uom_id} // Disable if pre-filled from order
                    />
                  </div>

                  <div className="field">
                    <label className="text-sm font-medium">Qty Delivered</label>
                    <InputText
                      type="number"
                      value={line.quantity_delivered}
                      onChange={(e) => handleLineChange(index, "quantity_delivered", parseFloat(e.target.value) || 0)}
                      min={0}
                      step="0.01"
                      className="w-full text-sm"
                      required
                    />
                  </div>

                  <div className="field">
                    <label className="text-sm font-medium">Qty Returned</label>
                    <InputText
                      type="number"
                      value={line.quantity_returned}
                      onChange={(e) => handleLineChange(index, "quantity_returned", parseFloat(e.target.value) || 0)}
                      min={0}
                      step="0.01"
                      className="w-full text-sm"
                    />
                  </div>

                  <div className="field">
                    <label className="text-sm font-medium">Condition</label>
                    <Dropdown
                      value={line.condition}
                      options={conditionOptions.map(cond => ({ label: cond, value: cond }))}
                      onChange={(e) => handleLineChange(index, "condition", e.value)}
                      placeholder="Condition"
                      className="w-full text-sm"
                      required
                    />
                  </div>

                  <div className="field flex items-end">
                    <Button
                      icon="pi pi-trash"
                      className="p-button-danger p-button-text"
                      onClick={() => removeLine(index)}
                      type="button"
                      tooltip="Remove line"
                      disabled={!!line.order_line_id} // Disable delete for order lines
                    />
                  </div>

                  <div className="col-span-7">
                    <label className="text-sm font-medium">Notes</label>
                    <InputTextarea
                      value={line.notes}
                      onChange={(e) => handleLineChange(index, "notes", e.target.value)}
                      placeholder="Additional notes..."
                      rows={1}
                      className="w-full text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;