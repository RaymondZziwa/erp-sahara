import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown} from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { CustomerOrder } from "../../../redux/slices/types/sales/CustomerOrder";
import useCustomers from "../../../hooks/sales/useCustomers";
import useItems from "../../../hooks/inventory/useItems";
import useCurrencies from "../../../hooks/procurement/useCurrencies";
import useQuotations from "../../../hooks/sales/useQuotations";
import useEmployees from "../../../hooks/hr/useEmployees";
import useUnitsOfMeasurement from "../../../hooks/inventory/useUnitsOfMeasurement";
import { SALES_ENDPOINTS } from "../../../api/salesEndpoints";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";

type Nullable<T> = T | null | undefined;

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: CustomerOrder;
  onSave: () => void;
}

interface OrderLine {
  quote_line_id?: string;
  name?: string;
  qty_ordered: number;
  unit_price: number;
  discount_pct: number;
  tax_pct: number;
  selected?: boolean;
}

interface OrderPayload {
  quote_id?: string;
  order_type: "item" | "service";
  order_date: string;
  expected_delivery_date: string;
  special_instructions?: string;
  lines: OrderLine[];
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const { data: currencies } = useCurrencies();
  const { data: items } = useItems();
  const { data: customers } = useCustomers();
  const { data: quotations } = useQuotations();
  const { data: employees } = useEmployees();
  const { data: uoms } = useUnitsOfMeasurement();
  const { token } = useAuth();

    useEffect(() => {
      console.log('od',item)
    }, [])

  const deliveryMethods = [
    { label: "Courier", value: "Courier" },
    { label: "Pickup", value: "Pickup" },
    { label: "Shipping", value: "Shipping" },
    { label: "Air Freight", value: "Air Freight" },
  ];

  const [formState, setFormState] = useState<OrderPayload>({
    quote_id: undefined,
    order_type: "item",
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    special_instructions: "",
    lines: [],
  });

  const [previousQuotationId, setPreviousQuotationId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormState({
        quote_id: item.quotation_id,
        order_type: item.order_type as "item" | "service",
        order_date: item.order_date,
        expected_delivery_date: item.expected_delivery_date,
        special_instructions: item.order_note,
        lines: item.order_lines.map(orderItem => ({
          quote_line_id: orderItem.id,
          name: orderItem.name,
          qty_ordered: orderItem.quantity,
          unit_price: orderItem.unit_price,
          discount_pct: 0,
          tax_pct: orderItem.tax_amount / (orderItem.quantity * orderItem.unit_price) * 100 || 0,
          selected: true
        }))
      });
      setPreviousQuotationId(item.quote_id);
    } else {
      // Reset form when adding new
      setFormState({
        quote_id: undefined,
        order_type: "item",
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        special_instructions: "",
        lines: [],
      });
      setPreviousQuotationId(undefined);
    }
  }, [item, visible]);

  // Handle quotation selection separately
  const handleQuotationChange = (quotationId: string) => {
    const selectedQuotation = quotations?.find(q => q.id === quotationId);
    
    console.log('Selected Quotation:', selectedQuotation); // Debug log
    console.log('Quotation Lines:', selectedQuotation?.quote_lines); // Debug log
    
    if (selectedQuotation) {
      // Use quote_lines instead of quotation_items
      const quoteLines = selectedQuotation.quote_lines || selectedQuotation.quotation_items || [];
      
      setFormState(prev => ({
        ...prev,
        quote_id: quotationId,
        lines: quoteLines.map(line => ({
          quote_line_id: line.id, // Use the quotation line ID
          name: line.name || line.item_name || "",
          qty_ordered: line.quantity || line.qty_ordered || 1,
          unit_price: line.unit_price || 0,
          discount_pct: line.discount_pct || line.discount_rate || 0,
          tax_pct: line.tax_pct || line.tax_rate || 0,
          selected: true // Auto-select lines from quotation
        }))
      }));
    } else {
      // If no quotation selected, clear quotation-specific data but keep other form data
      setFormState(prev => ({
        ...prev,
        quote_id: quotationId,
        lines: []
      }));
    }
    
    setPreviousQuotationId(quotationId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: keyof OrderPayload, date: Nullable<Date>) => {
    if (date) {
      setFormState(prev => ({
        ...prev,
        [name]: date.toISOString().split('T')[0]
      }));
    }
  };

  const handleLineChange = (index: number, field: keyof OrderLine, value: any) => {
    const updatedLines = [...formState.lines];
    updatedLines[index] = { ...updatedLines[index], [field]: value };
    setFormState(prev => ({ ...prev, lines: updatedLines }));
  };

  const toggleLineSelection = (index: number) => {
    const updatedLines = [...formState.lines];
    updatedLines[index].selected = !updatedLines[index].selected;
    setFormState(prev => ({ ...prev, lines: updatedLines }));
  };

  const addCustomLine = (e: React.MouseEvent) => {
    e.preventDefault();
    setFormState(prev => ({
      ...prev,
      lines: [
        ...prev.lines,
        {
          name: "",
          qty_ordered: 1,
          unit_price: 0,
          discount_pct: 0,
          tax_pct: 0,
          selected: true
        }
      ]
    }));
  };

  const removeLine = (index: number) => {
    setFormState(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Filter only selected lines and remove the 'selected' property from payload
    const payload = {
      ...formState,
      lines: formState.lines
        .filter(line => line.selected)
        .map(({ selected, ...line }) => line)
    };

    console.log('Submitting payload:', payload);

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? SALES_ENDPOINTS.CUSTOMER_ORDERS.UPDATE(item.id)
      : SALES_ENDPOINTS.CUSTOMER_ORDERS.ADD;
    
    try {
      await createRequest(endpoint, token.access_token, payload, onSave, method);
      onClose();
    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        label={item ? "Update Order" : "Create Order"}
        icon="pi pi-check"
        loading={isSubmitting}
        onClick={handleSave}
        disabled={formState.lines.filter(line => line.selected).length === 0}
      />
    </div>
  );

  return (
    <Dialog
      header={item ? "Edit Order" : "Create Order"}
      visible={visible}
      style={{ width: "900px" }}
      footer={footer}
      onHide={onClose}
      modal
      onShow={() => {
        if (!item) {
          setFormState({
            quote_id: undefined,
            order_type: "item",
            order_date: new Date().toISOString().split('T')[0],
            expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            special_instructions: "",
            lines: [],
          });
        }
      }}
    >
      <form id="order-form" className="p-fluid grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quotation */}
        <div className="field">
          <label htmlFor="quote_id">Quotation (Optional)</label>
          <Dropdown
            id="quote_id"
            value={formState.quote_id}
            options={quotations?.map(q => ({
              label: `Quotation #${q.quotation_number || q.id}`,
              value: q.id
            })) || []}
            onChange={(e) => handleQuotationChange(e.value)}
            placeholder="Select Quotation"
            filter
          />
        </div>

        {/* Order Type */}
        <div className="field">
          <label htmlFor="order_type">Order Type*</label>
          <Dropdown
            id="order_type"
            value={formState.order_type}
            options={[
              { label: "Item", value: "item" },
              { label: "Service", value: "service" }
            ]}
            onChange={(e) => setFormState(prev => ({ ...prev, order_type: e.value }))}
            placeholder="Select Type"
            required
          />
        </div>

        {/* Dates */}
        <div className="field">
          <label htmlFor="order_date">Order Date*</label>
          <Calendar
            id="order_date"
            value={new Date(formState.order_date)}
            onChange={(e) => handleDateChange("order_date", e.value)}
            dateFormat="yy-mm-dd"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="expected_delivery_date">Expected Delivery Date*</label>
          <Calendar
            id="expected_delivery_date"
            value={new Date(formState.expected_delivery_date)}
            onChange={(e) => handleDateChange("expected_delivery_date", e.value)}
            dateFormat="yy-mm-dd"
            required
          />
        </div>

        {/* Special Instructions */}
        <div className="field col-span-2">
          <label htmlFor="special_instructions">Special Instructions</label>
          <InputTextarea
            id="special_instructions"
            name="special_instructions"
            value={formState.special_instructions}
            onChange={handleInputChange}
            rows={3}
            placeholder="Please ensure quality packaging"
          />
        </div>

        {/* Lines Section */}
        <div className="col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Order Lines</h3>
            <Button
              label="Add Custom Line"
              icon="pi pi-plus"
              onClick={addCustomLine}
              className="p-button-outlined"
              type="button"
            />
          </div>

          {formState.lines.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <i className="pi pi-inbox text-4xl text-gray-400 mb-2"></i>
              <p className="text-gray-500">No lines added</p>
              <p className="text-gray-400 text-sm">Select a quotation or add custom lines</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 border-b">Select</th>
                    <th className="text-left p-3 border-b">Name</th>
                    <th className="text-left p-3 border-b">Quantity</th>
                    <th className="text-left p-3 border-b">Unit Price</th>
                    <th className="text-left p-3 border-b">Discount %</th>
                    <th className="text-left p-3 border-b">Tax %</th>
                    <th className="text-left p-3 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formState.lines.map((line, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <Checkbox
                          checked={!!line.selected}
                          onChange={() => toggleLineSelection(index)}
                        />
                      </td>
                      <td className="p-3">
                        <InputText
                          value={line.name}
                          onChange={(e) => handleLineChange(index, "name", e.target.value)}
                          placeholder="Item/Service name"
                          disabled={!!line.quote_line_id} // Disable if from quotation
                        />
                      </td>
                      <td className="p-3">
                        <InputText
                          type="number"
                          min="1"
                          value={line.qty_ordered}
                          onChange={(e) => handleLineChange(index, "qty_ordered", parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                      </td>
                      <td className="p-3">
                        <InputText
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.unit_price}
                          onChange={(e) => handleLineChange(index, "unit_price", parseFloat(e.target.value) || 0)}
                          className="w-24"
                        />
                      </td>
                      <td className="p-3">
                        <InputText
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={line.discount_pct}
                          onChange={(e) => handleLineChange(index, "discount_pct", parseFloat(e.target.value) || 0)}
                          className="w-20"
                        />
                      </td>
                      <td className="p-3">
                        <InputText
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={line.tax_pct}
                          onChange={(e) => handleLineChange(index, "tax_pct", parseFloat(e.target.value) || 0)}
                          className="w-20"
                        />
                      </td>
                      <td className="p-3">
                        <Button
                          icon="pi pi-trash"
                          className="p-button-rounded p-button-danger p-button-text"
                          onClick={() => removeLine(index)}
                          tooltip="Remove line"
                          type="button"
                          disabled={!!line.quote_line_id} // Disable delete for quotation lines
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;