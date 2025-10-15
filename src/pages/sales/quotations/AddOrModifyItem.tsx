import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Steps } from "primereact/steps";
import { Card } from "primereact/card";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import useItems from "../../../hooks/inventory/useItems";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import useCurrencies from "../../../hooks/procurement/useCurrencies";
import { Quotation } from "../../../redux/slices/types/sales/Quotation";
import { SALES_ENDPOINTS } from "../../../api/salesEndpoints";
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
  customer_id: string;
  opportunity_id?: string;
  issue_date: string;
  expiry_date: string;
  notes?: string;
  status?: "draft" | "sent" | "accepted" | "rejected" | "expired";
  lines: QuotationItemPayload[];
}

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Partial<Quotation>;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({ visible, onClose, item, onSave }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formState, setFormState] = useState<QuotationPayload>({
    customer_id: "",
    opportunity_id: undefined,
    issue_date: "",
    expiry_date: "",
    notes: "",
    status: "draft",
    lines: [],
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

  const steps = [
    { label: "Basic Info" },
    { label: "Quotation Items" },
    { label: "Review & Submit" }
  ];

  useEffect(() => {
    if (item) {
      setFormState({
        customer_id: item.customer_id?.toString() ?? "",
        opportunity_id: item.opportunity_id?.toString() ?? undefined,
        issue_date: item.issue_date ?? "",
        expiry_date: item.expiry_date ?? "",
        notes: item.notes ?? "",
        status: item.status as QuotationPayload["status"] ?? "draft",
        lines: item.quotation_items?.map((qi, idx) => ({
          item_id: qi.item_id,
          item_type: "item", // Default to item, adjust based on your data
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
      setFormState({
        customer_id: "",
        opportunity_id: undefined,
        issue_date: "",
        expiry_date: "",
        notes: "",
        status: "draft",
        lines: [],
      });
    }
  }, [item]);

  const handleChange = (field: keyof QuotationPayload, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleLineChange = (index: number, field: keyof QuotationItemPayload, value: any) => {
    const updatedLines = [...formState.lines];
    updatedLines[index] = { ...updatedLines[index], [field]: value };
    
    // Auto-fill item details when item is selected
    if (field === "item_id" && updatedLines[index].item_type === "item") {
      const selectedItem = items?.find(item => item.id === value);
      if (selectedItem) {
        updatedLines[index] = {
          ...updatedLines[index],
          name: selectedItem.name,
          description: selectedItem.description,
          unit_price: selectedItem.selling_price || 0,
          item_sku: selectedItem.sku,
          uom: selectedItem.uom,
        };
      }
    }
    
    // Auto-fill service details when service is selected
    if (field === "item_id" && updatedLines[index].item_type === "service") {
      const selectedService = services?.find(service => service.id === value);
      if (selectedService) {
        updatedLines[index] = {
          ...updatedLines[index],
          name: selectedService.name,
          description: selectedService.description,
          unit_price: selectedService.price || 0,
        };
      }
    }
    
    setFormState((prev) => ({ ...prev, lines: updatedLines }));
  };

  const addNewLine = () => {
    setFormState((prev) => ({
      ...prev,
      lines: [
        ...prev.lines,
        {
          item_type: "item",
          name: "",
          description: "",
          quantity: 1,
          unit_price: 0,
          tax_rate: 0,
          sort_order: prev.lines.length + 1,
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

  const nextStep = () => setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setActiveStep(prev => Math.max(prev - 1, 0));

  const renderBasicInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Customer *</label>
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
            className="w-full"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Opportunity</label>
          <Dropdown
            value={formState.opportunity_id}
            options={opportunities?.map((l) => ({ label: l.title ?? l.id, value: l.id })) ?? []}
            onChange={(e) => handleChange("opportunity_id", e.value)}
            placeholder="Select Opportunity"
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Issue Date *</label>
          <Calendar
            value={formState.issue_date ? new Date(formState.issue_date) : null}
            onChange={(e) => handleChange("issue_date", e.value?.toISOString().split('T')[0])}
            dateFormat="yy-mm-dd"
            className="w-full"
            showIcon
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Expiry Date *</label>
          <Calendar
            value={formState.expiry_date ? new Date(formState.expiry_date) : null}
            onChange={(e) => handleChange("expiry_date", e.value?.toISOString().split('T')[0])}
            dateFormat="yy-mm-dd"
            className="w-full"
            showIcon
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Notes</label>
        <InputTextarea
          value={formState.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Additional notes for this quotation..."
          rows={3}
          className="w-full"
        />
      </div>
    </div>
  );

  const renderQuotationItems = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Quotation Items</h3>
        <Button 
          label="Add Item" 
          icon="pi pi-plus" 
          onClick={addNewLine}
          className="p-button-sm p-button-outlined"
        />
      </div>

      {formState.lines.length === 0 ? (
        <Card className="text-center py-6 border-dashed">
          <i className="pi pi-inbox text-2xl text-gray-400 mb-2"></i>
          <p className="text-gray-500">No items added yet</p>
          <Button 
            label="Add First Item" 
            icon="pi pi-plus" 
            onClick={addNewLine}
            className="p-button-text mt-2"
          />
        </Card>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {formState.lines.length === 0 ? (
      <Card className="text-center py-8 border-dashed">
        <i className="pi pi-inbox text-3xl text-gray-400 mb-3"></i>
        <p className="text-gray-500 text-lg mb-2">No items added yet</p>
        <p className="text-gray-400 text-sm mb-4">Add items, services, or custom entries to your quotation</p>
        <Button 
          label="Add First Item" 
          icon="pi pi-plus" 
          onClick={addNewLine}
          className="p-button-outlined"
        />
      </Card>
    ) : (
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {formState.lines.map((line, idx) => (
          <Card key={idx} className="relative border-l-4 border-l-teal-500 shadow-sm">
            {/* Remove Button */}
            <Button 
              icon="pi pi-times" 
              className="p-button-rounded p-button-text p-button-danger absolute top-3 right-3 z-10" 
              onClick={() => removeLine(idx)}
              tooltip="Remove item"
              tooltipOptions={{ position: 'top' }}
            />
            
            <div className="space-y-4 pr-8">
              {/* Item Type Selection */}
              <div className="flex gap-6 p-3 bg-gray-50 rounded-lg">
                {["item", "service", "custom"].map((type) => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-100 transition-colors">
                    <input
                      type="radio"
                      name={`item_type_${idx}`}
                      checked={line.item_type === type}
                      onChange={() => handleLineChange(idx, "item_type", type)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                  </label>
                ))}
              </div>

              {/* Item Selection Row */}
              <div className="grid grid-cols-1 gap-4">
                {line.item_type === "item" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Select Item *</label>
                    <Dropdown
                      value={line.item_id}
                      options={items?.map((item) => ({ 
                        label: item.name ?? item.id, 
                        value: item.id 
                      })) ?? []}
                      onChange={(e) => handleLineChange(idx, "item_id", e.value)}
                      placeholder="Choose an item..."
                      className="w-full"
                      required
                    />
                  </div>
                )}
                
                {line.item_type === "service" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Select Service *</label>
                    <Dropdown
                      value={line.item_id}
                      options={services?.map((srv) => ({ 
                        label: srv.name ?? srv.id, 
                        value: srv.id 
                      })) ?? []}
                      onChange={(e) => handleLineChange(idx, "item_id", e.value)}
                      placeholder="Choose a service..."
                      className="w-full"
                      required
                    />
                  </div>
                )}
                
                {line.item_type === "custom" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Item Name *</label>
                    <InputText
                      value={line.name}
                      onChange={(e) => handleLineChange(idx, "name", e.target.value)}
                      className="w-full"
                      placeholder="Enter custom item name..."
                      required
                    />
                  </div>
                )}
              </div>

              {/* Pricing & Quantity Section */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-teal-50 rounded-lg">
                {/* Quantity */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Quantity *</label>
                  <InputNumber
                    value={line.quantity}
                    onValueChange={(e) => handleLineChange(idx, "quantity", e.value || 1)}
                    min={1}
                    className="w-full"
                    showButtons
                    mode="decimal"
                  />
                </div>

                {/* Unit Price */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Unit Price *</label>
                  <InputNumber
                    value={line.unit_price}
                    onValueChange={(e) => handleLineChange(idx, "unit_price", e.value || 0)}
                    min={0}
                    className="w-full"
                  />
                </div>

              </div>
              <div className="grid grid-cols-2 gap-4 p-4 bg-teal-50 rounded-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Currency *</label>
                  <Dropdown
                    value={line.currency_id}
                    options={currencies?.map(c => ({ 
                      label: c.code, 
                      value: c.id 
                    })) ?? []}
                    onChange={(e) => handleLineChange(idx, "currency_id", e.value)}
                    placeholder="Currency"
                    className="w-full"
                    required
                  />
                </div>

                {/* Tax Rate */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tax Rate %</label>
                  <InputNumber
                    value={line.tax_rate || 0}
                    onValueChange={(e) => handleLineChange(idx, "tax_rate", e.value || 0)}
                    min={0}
                    max={100}
                    suffix="%"
                    className="w-full"
                    mode="decimal"
                  />
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Unit of Measure</label>
                  <Dropdown
                    value={line.uom}
                    options={uoms?.map(uom => ({ 
                      label: uom.name, 
                      value: uom.id  // This sends the UUID string directly to the payload
                    })) ?? []}
                    onChange={(e) => handleLineChange(idx, "uom", e.value)}
                    placeholder="Select UOM"
                    className="w-full"
                    disabled={line.item_type === "item"}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Warehouse</label>
                  <Dropdown
                    value={line.warehouse_location}
                    options={warehouses?.map(wh => ({ 
                      label: `${wh.name}`, 
                      value: wh.location 
                    })) ?? []}
                    onChange={(e) => handleLineChange(idx, "warehouse_location", e.value)}
                    placeholder="Select warehouse"
                    className="w-full"
                    disabled={line.item_type !== "item"}
                  />
                </div>
              </div>

              {/* Line Total Display */}
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Line Total: </span>
                    <span className="text-lg font-bold text-green-700 ml-2">
                      {(line.quantity * line.unit_price).toFixed(2)}
                    </span>
                  </div>
                  {line.tax_rate && line.tax_rate > 0 && (
                    <span className="text-sm text-gray-600">
                      Tax: {(line.quantity * line.unit_price * (line.tax_rate / 100)).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )}

    {/* Grand Total */}
    {formState.lines.length > 0 && (
      <Card className="bg-gray-50 border-0">
        <div className="flex justify-between items-center text-lg">
          <span className="font-semibold text-gray-700">Grand Total:</span>
          <span className="font-bold text-teal-700 text-xl">
            {formState.lines.reduce((total, line) => 
              total + (line.quantity * line.unit_price), 0
            ).toFixed(2)}
          </span>
        </div>
      </Card>
    )}
        </div>
      )}
    </div>
  );

  const renderReview = () => (
    <div className="space-y-4">
      <Card>
        <h3 className="text-lg font-semibold mb-4">Quotation Summary</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Customer</label>
            <p className="font-medium">
              {customers?.find(c => c.id === formState.customer_id)?.organization_name || 
               customers?.find(c => c.id === formState.customer_id)?.first_name + ' ' + 
               customers?.find(c => c.id === formState.customer_id)?.last_name}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Opportunity</label>
            <p className="font-medium">
              {formState.opportunity_id ? 
                opportunities?.find(o => o.id === formState.opportunity_id)?.title : 
                'None'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Issue Date</label>
            <p className="font-medium">{formState.issue_date}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Expiry Date</label>
            <p className="font-medium">{formState.expiry_date}</p>
          </div>
        </div>

        {formState.notes && (
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-500">Notes</label>
            <p className="font-medium">{formState.notes}</p>
          </div>
        )}

        <div className="mt-6">
          <label className="text-sm font-medium text-gray-500">Items ({formState.lines.length})</label>
          <div className="space-y-2 mt-2">
            {formState.lines.map((line, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <p className="font-medium">{line.name}</p>
                  <p className="text-sm text-gray-500">
                    {line.quantity} × {line.unit_price} = {(line.quantity * line.unit_price).toFixed(2)}
                  </p>
                </div>
                <span className="font-semibold">
                  {(line.quantity * line.unit_price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderQuotationItems();
      case 2:
        return renderReview();
      default:
        return null;
    }
  };

  return (
    <Dialog
      header={item ? "Edit Quotation" : "Create Quotation"}
      visible={visible}
      style={{ width: "800px" }}
      onHide={onClose}
      footer={
        <div className="flex justify-between items-center">
          <div>
            {activeStep > 0 && (
              <Button 
                label="Back" 
                icon="pi pi-arrow-left" 
                onClick={prevStep}
                className="p-button-text"
              />
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              label="Cancel" 
              className="p-button-text p-button-danger !bg-red-500" 
              onClick={onClose} 
            />
            {activeStep < steps.length - 1 ? (
              <Button 
                label="Next" 
                icon="pi pi-arrow-right" 
                onClick={nextStep}
                disabled={
                  activeStep === 0 && (!formState.customer_id || !formState.issue_date || !formState.expiry_date)
                }
              />
            ) : (
              <Button 
                label={isSubmitting ? "Submitting..." : "Submit Quotation"} 
                icon="pi pi-check" 
                loading={isSubmitting}
                onClick={handleSubmit}
                disabled={formState.lines.length === 0}
              />
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <Steps 
          model={steps} 
          activeIndex={activeStep} 
          onSelect={(e) => setActiveStep(e.index)}
          readOnly={false}
        />
        
        <form id="quotation-form" onSubmit={handleSubmit}>
          {renderStepContent()}
        </form>
      </div>
    </Dialog>
  );
};

export default AddOrModifyItem;