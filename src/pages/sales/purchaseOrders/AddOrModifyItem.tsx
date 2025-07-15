import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown} from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { CustomerOrder } from "../../../redux/slices/types/sales/CustomerOrder";
import useCustomers from "../../../hooks/inventory/useCustomers";
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

interface OrderItem {
  item_id?: string;
  name?: string;
  quantity: number;
  uom_id: string;
  unit_price: number;
  tax_amount: number;
  description: string;
  selected?: boolean;
}

interface OrderPayload {
  customer_id: string;
  quotation_id?: string;
  order_date: string;
  order_type: "item" | "service";
  expected_delivery_date: string;
  delivery_method: string;
  sales_rep_id: string;
  order_note?: string;
  terms_and_conditions?: string;
  items: OrderItem[];
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

  const deliveryMethods = [
    { label: "Courier", value: "Courier" },
    { label: "Pickup", value: "Pickup" },
    { label: "Shipping", value: "Shipping" },
    { label: "Air Freight", value: "Air Freight" },
  ];

  const [formState, setFormState] = useState<OrderPayload>({
    customer_id: "",
    quotation_id: undefined,
    order_date: new Date().toISOString().split('T')[0],
    order_type: "item",
    expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    delivery_method: "Courier",
    sales_rep_id: "",
    order_note: "",
    terms_and_conditions: "",
    items: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormState({
        customer_id: item.customer_id,
        quotation_id: item.quotation_id,
        order_date: item.order_date,
        order_type: item.order_type as "item" | "service",
        expected_delivery_date: item.expected_delivery_date,
        delivery_method: item.delivery_method,
        sales_rep_id: item.sales_rep_id,
        order_note: item.order_note,
        terms_and_conditions: item.terms_and_conditions,
        items: item.customer_order_items.map(orderItem => ({
          item_id: orderItem.item_id,
          name: orderItem.name,
          quantity: orderItem.quantity,
          uom_id: orderItem.uom_id,
          unit_price: orderItem.unit_price,
          tax_amount: orderItem.tax_amount,
          description: orderItem.description,
          selected: true
        }))
      });
    }
  }, [item]);

  useEffect(() => {
    if (formState.quotation_id) {
      const selectedQuotation = quotations?.find(q => q.id === formState.quotation_id);
      if (selectedQuotation) {
        setFormState(prev => ({
          ...prev,
          customer_id: selectedQuotation.customer_id,
          items: selectedQuotation.items.map(item => ({
            item_id: item.item_id,
            name: item.name,
            quantity: item.quantity,
            uom_id: item.uom_id || "",
            unit_price: item.unit_price,
            tax_amount: item.tax_amount || 0,
            description: item.description || "",
            selected: false // Start with items unselected
          }))
        }));
      }
    }
  }, [formState.quotation_id, quotations]);

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

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const updatedItems = [...formState.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormState(prev => ({ ...prev, items: updatedItems }));
  };

  const toggleItemSelection = (index: number) => {
    const updatedItems = [...formState.items];
    updatedItems[index].selected = !updatedItems[index].selected;
    setFormState(prev => ({ ...prev, items: updatedItems }));
  };

  const addCustomItem = () => {
    setFormState(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          name: "",
          quantity: 1,
          uom_id: "",
          unit_price: 0,
          tax_amount: 0,
          description: "",
          selected: true
        }
      ]
    }));
  };

  const removeItem = (index: number) => {
    setFormState(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Filter only selected items
    const payload = {
      ...formState,
      items: formState.items.filter(item => item.selected)
    };

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? SALES_ENDPOINTS.CUSTOMER_ORDERS.UPDATE(item.id)
      : SALES_ENDPOINTS.CUSTOMER_ORDERS.ADD;
    
    try {
      await createRequest(endpoint, token.access_token, payload, onSave, method);
      onClose();
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
        className="p-button-text !bg-red-500 hover:bg-red-400"
        disabled={isSubmitting}
      />
      <Button
        label={item ? "Update Order" : "Create Order"}
        icon="pi pi-check"
        loading={isSubmitting}
        onClick={handleSave}
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
    >
      <form id="order-form" className="p-fluid grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Customer */}
        <div className="field">
          <label htmlFor="customer_id">Customer*</label>
          <Dropdown
            id="customer_id"
            value={formState.customer_id}
            options={customers?.map(c => ({
              label: c.organization_name || `${c.first_name} ${c.last_name}`,
              value: c.id
            })) || []}
            onChange={(e) => setFormState(prev => ({ ...prev, customer_id: e.value }))}
            placeholder="Select Customer"
            required
          />
        </div>

        {/* Quotation */}
        <div className="field">
          <label htmlFor="quotation_id">Quotation (Optional)</label>
          <Dropdown
            id="quotation_id"
            value={formState.quotation_id}
            options={quotations?.map(q => ({
              label: `Quotation #${q.quotation_number}`,
              value: q.id
            })) || []}
            onChange={(e) => setFormState(prev => ({ ...prev, quotation_id: e.value }))}
            placeholder="Select Quotation"
            filter
          />
        </div>

        {/* Sales Rep */}
        <div className="field">
          <label htmlFor="sales_rep_id">Sales Representative*</label>
          <Dropdown
            id="sales_rep_id"
            value={formState.sales_rep_id}
            options={employees?.map(e => ({
              label: `${e.first_name} ${e.last_name}`,
              value: e.id
            })) || []}
            onChange={(e) => setFormState(prev => ({ ...prev, sales_rep_id: e.value }))}
            placeholder="Select Sales Rep"
            required
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

        {/* Delivery Method */}
        <div className="field">
          <label htmlFor="delivery_method">Delivery Method*</label>
          <Dropdown
            id="delivery_method"
            value={formState.delivery_method}
            options={deliveryMethods}
            onChange={(e) => setFormState(prev => ({ ...prev, delivery_method: e.value }))}
            placeholder="Select Method"
            required
          />
        </div>

        {/* Notes */}
        <div className="field col-span-2">
          <label htmlFor="order_note">Order Notes</label>
          <InputTextarea
            id="order_note"
            name="order_note"
            value={formState.order_note}
            onChange={handleInputChange}
            rows={3}
          />
        </div>

        {/* Terms */}
        <div className="field col-span-2">
          <label htmlFor="terms_and_conditions">Terms & Conditions</label>
          <InputTextarea
            id="terms_and_conditions"
            name="terms_and_conditions"
            value={formState.terms_and_conditions}
            onChange={handleInputChange}
            rows={3}
          />
        </div>

        {/* Items Section */}
        <div className="col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Order Items</h3>
            <Button
              label="Add Custom Item"
              icon="pi pi-plus"
              onClick={addCustomItem}
              className="p-button-outlined"
            />
          </div>

          <div className="overflow-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">Select</th>
                  <th className="text-left p-2">Item/Service</th>
                  <th className="text-left p-2">Quantity</th>
                  <th className="text-left p-2">UOM</th>
                  <th className="text-left p-2">Unit Price</th>
                  <th className="text-left p-2">Tax Amount</th>
                  <th className="text-left p-2">Description</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {formState.items.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2">
                      <Checkbox
                        checked={!!item.selected}
                        onChange={() => toggleItemSelection(index)}
                      />
                    </td>
                    <td className="p-2">
                      {item.item_id ? (
                        <Dropdown
                          value={item.item_id}
                          options={items?.map(i => ({
                            label: i.name,
                            value: i.id
                          })) || []}
                          onChange={(e) => handleItemChange(index, "item_id", e.value)}
                          placeholder="Select Item"
                          disabled={!!formState.quotation_id}
                        />
                      ) : (
                        <InputText
                          value={item.name}
                          onChange={(e) => handleItemChange(index, "name", e.target.value)}
                          placeholder="Service Name"
                        />
                      )}
                    </td>
                    <td className="p-2">
                      <InputText
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 0)}
                      />
                    </td>
                    <td className="p-2">
                      <Dropdown
                        value={item.uom_id}
                        options={uoms?.map(u => ({
                          label: u.name,
                          value: u.id
                        })) || []}
                        onChange={(e) => handleItemChange(index, "uom_id", e.value)}
                        placeholder="Select UOM"
                      />
                    </td>
                    <td className="p-2">
                      <InputText
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, "unit_price", parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="p-2">
                      <InputText
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.tax_amount}
                        onChange={(e) => handleItemChange(index, "tax_amount", parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="p-2">
                      <InputText
                        value={item.description}
                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                        placeholder="Description"
                      />
                    </td>
                    <td className="p-2">
                      <Button
                        icon="pi pi-trash"
                        className="p-button-rounded p-button-danger p-button-text bg-red-500"
                        onClick={() => removeItem(index)}
                        tooltip="Remove item"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;