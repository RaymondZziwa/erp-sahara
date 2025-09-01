import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import useItems from "../../../hooks/inventory/useItems";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import useCurrencies from "../../../hooks/procurement/useCurrencies";
import { Quotation } from "../../../redux/slices/types/sales/Quotation";
import { SALES_ENDPOINTS } from "../../../api/salesEndpoints";
import useLeads from "../../../hooks/sales/useLeads";
import useCustomers from "../../../hooks/sales/useCustomers";
import useServices from "../../../hooks/procurement/useServices";
import useUnitsOfMeasurement from "../../../hooks/inventory/useUnitsOfMeasurement";
import useWarehouses from "../../../hooks/inventory/useWarehouses";
import useOpportunities from "../../../hooks/sales/useOpportunities";

interface QuotationItemPayload {
  item_id?: string;
  item_type: "item" | "service" | "custom";
  name?: string;
  description?: string;
  quantity: number;
  uom?: string;
  unit_price: number;
  currency_id?: string;
  tax_rate?: number;
  item_sku?: string;
  warehouse_location?: string;
  sort_order?: number;
}

interface QuotationPayload {
  q_type: "item" | "service" | "custom";
  customer_id: string;
  opportunity_id?: string;
  issue_date: string;
  expiry_date: string;
  notes?: string;
  status?: "draft" | "sent" | "accepted" | "rejected" | "expired";
  items: QuotationItemPayload[];
}

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Partial<Quotation>;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({ visible, onClose, item, onSave }) => {
  const [formState, setFormState] = useState<QuotationPayload>({
    q_type: "item",
    customer_id: "",
    opportunity_id: undefined,
    issue_date: "",
    expiry_date: "",
    notes: "",
    status: "draft",
    items: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: customers } = useCustomers();
  const { data: opportunities } = useOpportunities();
  const { token } = useAuth();
  const { data: currencies } = useCurrencies();
  const { data: services } = useServices();
  const { data: items } = useItems();
  const { data: uoms } = useUnitsOfMeasurement();
  const { data: warehouses } = useWarehouses();

  useEffect(() => {
    if (item) {
      setFormState({
        q_type: "item",
        customer_id: item.customer_id?.toString() ?? "",
        opportunity_id: item.opportunity_id?.toString() ?? undefined,
        issue_date: item.issue_date ?? "",
        expiry_date: item.expiry_date ?? "",
        notes: item.notes ?? "",
        status: item.status as QuotationPayload["status"] ?? "draft",
        items: item.quotation_items?.map((qi, idx) => ({
          item_id: qi.item_id,
          item_type: "item",
          name: qi.name,
          description: qi.description,
          quantity: qi.quantity,
          uom: qi.uom,
          unit_price: qi.unit_price,
          currency_id: qi.currency_id,
          tax_rate: qi.tax_rate,
          item_sku: qi.item_sku,
          warehouse_location: qi.warehouse_location,
          sort_order: idx + 1,
        })) ?? [],
      });
    } else {
      // Reset form when adding new
      setFormState({
        q_type: "item",
        customer_id: "",
        opportunity_id: undefined,
        issue_date: "",
        expiry_date: "",
        notes: "",
        status: "draft",
        items: [],
      });
    }
  }, [item]);

  const handleChange = (field: keyof QuotationPayload, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof QuotationItemPayload, value: any) => {
    const updatedItems = [...formState.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // When item is selected, auto-fill its details
    if (field === "item_id" && updatedItems[index].item_type === "item") {
      const selectedItem = items.find(item => item.id === value);
      if (selectedItem) {
        updatedItems[index] = {
          ...updatedItems[index],
          name: selectedItem.name,
          description: selectedItem.description,
          unit_price: selectedItem.selling_price || 0,
          item_sku: selectedItem.sku,
          uom: selectedItem.uom,
        };
      }
    }
    
    // When service is selected, auto-fill its details
    if (field === "item_id" && updatedItems[index].item_type === "service") {
      const selectedService = services.find(service => service.id === value);
      if (selectedService) {
        updatedItems[index] = {
          ...updatedItems[index],
          name: selectedService.name,
          description: selectedService.description,
          unit_price: selectedService.price || 0,
        };
      }
    }
    
    setFormState((prev) => ({ ...prev, items: updatedItems }));
  };

  const addNewItem = () => {
    setFormState((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item_type: prev.q_type,
          name: "",
          description: "",
          quantity: 1,
          unit_price: 0,
          tax_rate: 0,
          item_sku: "",
          warehouse_location: "",
          sort_order: prev.items.length + 1,
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    const updatedItems = formState.items.filter((_, i) => i !== index);
    setFormState((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await createRequest(
      item ? SALES_ENDPOINTS.QUOTES.UPDATE(item.id!) : SALES_ENDPOINTS.QUOTES.ADD,
      token.access_token,
      formState,
      onSave,
      item ? "PUT" : "POST"
    );
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog
      header={item ? "Edit Quotation" : "Add Quotation"}
      visible={visible}
      style={{ width: "700px" }}
      onHide={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button label="Cancel" className="p-button-text bg-red-500" onClick={onClose} />
          <Button label="Submit" loading={isSubmitting} type="submit" form="quotation-form" />
        </div>
      }
    >
      <form id="quotation-form" onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        {/* Quotation Type */}
        <div className="p-field">
          <label htmlFor="q_type" className="text-sm block mb-1">Quotation Type</label>
          <Dropdown
            id="q_type"
            value={formState.q_type}
            onChange={(e) => handleChange("q_type", e.value)}
            options={[
              { label: "Item", value: "item" },
              { label: "Service", value: "service" },
              { label: "Custom", value: "custom" },
            ]}
            placeholder="Select type"
            className="w-full p-inputtext-sm"
          />
        </div>

        {/* Status */}
        <div className="p-field">
          <label htmlFor="status" className="text-sm block mb-1">Status</label>
          <Dropdown
            id="status"
            value={formState.status}
            onChange={(e) => handleChange("status", e.value)}
            options={[
              { label: "Draft", value: "draft" },
              { label: "Sent", value: "sent" },
              { label: "Accepted", value: "accepted" },
              { label: "Rejected", value: "rejected" },
              { label: "Expired", value: "expired" },
            ]}
            placeholder="Select status"
            className="w-full p-inputtext-sm"
          />
        </div>

        {/* Customer */}
        <div className="p-field">
          <label className="text-sm block mb-1">Customer</label>
          <Dropdown
            value={formState.customer_id}
            options={customers?.map((c) => ({
              label: c.organization_name?.trim()
                ? c.organization_name
                : `${c.first_name} ${c.last_name}`,
              value: c.id,
            })) ?? []}
            onChange={(e) => handleChange("customer_id", e.value)}
            placeholder="Select Customer"
            className="w-full p-inputtext-sm"
            required
          />
        </div>

        {/* Opportunity */}
        <div className="p-field">
          <label className="text-sm block mb-1">Opportunity (Optional)</label>
          <Dropdown
            value={formState.opportunity_id}
            options={opportunities?.map((l) => ({ label: l.title ?? l.id, value: l.id })) ?? []}
            onChange={(e) => handleChange("opportunity_id", e.value)}
            placeholder="Select Opportunity"
            className="w-full p-inputtext-sm"
          />
        </div>

        {/* Dates */}
        <div className="p-field">
          <label className="text-sm block mb-1">Issue Date</label>
          <InputText
            type="date"
            value={formState.issue_date}
            onChange={(e) => handleChange("issue_date", e.target.value)}
            className="w-full p-inputtext-sm"
            required
          />
        </div>
        <div className="p-field">
          <label className="text-sm block mb-1">Expiry Date</label>
          <InputText
            type="date"
            value={formState.expiry_date}
            onChange={(e) => handleChange("expiry_date", e.target.value)}
            className="w-full p-inputtext-sm"
            required
          />
        </div>

        {/* Notes */}
        <div className="p-field col-span-2">
          <label className="text-sm block mb-1">Notes</label>
          <InputTextarea
            value={formState.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Notes"
            rows={2}
            className="w-full p-inputtext-sm"
          />
        </div>

        {/* Items Section */}
        <div className="col-span-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">Items</h3>
            <Button 
              label="Add Item" 
              icon="pi pi-plus" 
              onClick={addNewItem} 
              type="button" 
              className="p-button-sm"
            />
          </div>
          
          {formState.items.map((it, idx) => (
            <div key={idx} className="border p-3 mb-3 rounded-md relative">
              <Button 
                icon="pi pi-times" 
                className="p-button-rounded p-button-text p-button-danger absolute top-1 right-1" 
                onClick={() => removeItem(idx)}
                tooltip="Remove item"
                tooltipOptions={{ position: 'top' }}
              />
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="text-sm block mb-1">Item Type</label>
                  <div className="flex gap-4 text-sm">
                    {["item", "service", "custom"].map((type) => (
                      <label key={type} className="flex items-center gap-1">
                        <input
                          type="radio"
                          name={`item_type_${idx}`}
                          checked={it.item_type === type}
                          onChange={() => handleItemChange(idx, "item_type", type)}
                        />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  {it.item_type === "item" && (
                    <>
                      <label className="text-sm block mb-1">Select Item</label>
                      <Dropdown
                        value={it.item_id}
                        options={items?.map((item) => ({ 
                          label: item.name ?? item.id, 
                          value: item.id 
                        })) ?? []}
                        onChange={(e) => handleItemChange(idx, "item_id", e.value)}
                        placeholder="Select Item"
                        className="w-full p-inputtext-sm"
                        required
                      />
                    </>
                  )}
                  {it.item_type === "service" && (
                    <>
                      <label className="text-sm block mb-1">Select Service</label>
                      <Dropdown
                        value={it.item_id}
                        options={services?.map((srv) => ({ 
                          label: srv.name ?? srv.id, 
                          value: srv.id 
                        })) ?? []}
                        onChange={(e) => handleItemChange(idx, "item_id", e.value)}
                        placeholder="Select Service"
                        className="w-full p-inputtext-sm"
                        required
                      />
                    </>
                  )}
                  {it.item_type === "custom" && (
                    <>
                      <label className="text-sm block mb-1">Custom Item Name</label>
                      <InputText
                        value={it.name}
                        onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                        className="w-full p-inputtext-sm"
                        required
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-2">
                <div>
                  <label className="text-sm block mb-1">Description</label>
                  <InputText
                    value={it.description}
                    onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                    className="w-full p-inputtext-sm"
                  />
                </div>
                <div>
                  <label className="text-sm block mb-1">Quantity</label>
                  <InputText
                    value={it.quantity}
                    type="number"
                    min="1"
                    onChange={(e) => handleItemChange(idx, "quantity", parseFloat(e.target.value))}
                    className="w-full p-inputtext-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm block mb-1">Unit Price</label>
                  <InputText
                    value={it.unit_price}
                    type="number"
                    min="0"
                    step="0.01"
                    onChange={(e) => handleItemChange(idx, "unit_price", parseFloat(e.target.value))}
                    className="w-full p-inputtext-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm block mb-1">SKU</label>
                  <InputText
                    value={it.item_sku}
                    onChange={(e) => handleItemChange(idx, "item_sku", e.target.value)}
                    className="w-full p-inputtext-sm"
                    disabled={it.item_type === "item"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-sm block mb-1">UOM (Unit of Measure)</label>
                  <Dropdown
                    value={it.uom}
                    options={uoms?.map(uom => ({ label: uom.name, value: uom.code })) ?? []}
                    onChange={(e) => handleItemChange(idx, "uom", e.value)}
                    placeholder="Select UOM"
                    className="w-full p-inputtext-sm"
                    disabled={it.item_type === "item"}
                  />
                </div>
                <div>
                  <label className="text-sm block mb-1">Currency</label>
                  <Dropdown
                    value={it.currency_id}
                    options={currencies?.map(c => ({ 
                      label: `${c.code}`, 
                      value: c.id 
                    })) ?? []}
                    onChange={(e) => handleItemChange(idx, "currency_id", e.value)}
                    placeholder="Select Currency"
                    className="w-full p-inputtext-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm block mb-1">Tax Rate (%)</label>
                  <InputText
                    value={it.tax_rate || 0}
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    onChange={(e) => handleItemChange(idx, "tax_rate", parseFloat(e.target.value))}
                    className="w-full p-inputtext-sm"
                  />
                </div>
                <div>
                  <label className="text-sm block mb-1">Warehouse</label>
                  <Dropdown
                    value={it.warehouse_location}
                    options={warehouses?.map(wh => ({ 
                      label: `${wh.name} (${wh.location})`, 
                      value: wh.location 
                    })) ?? []}
                    onChange={(e) => handleItemChange(idx, "warehouse_location", e.value)}
                    placeholder="Select Warehouse"
                    className="w-full p-inputtext-sm"
                    disabled={it.item_type !== "item"}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;