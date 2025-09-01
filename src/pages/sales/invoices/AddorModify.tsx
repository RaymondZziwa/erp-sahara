import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";

import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { SALES_ENDPOINTS } from "../../../api/salesEndpoints";

interface InvoiceItem {
  sale_order_item_id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  tax_amount: number;
}

interface Invoice {
  id?: string;
  sale_order_id: string;
  grn_id?: string | null;
  issue_date: string;
  due_date: string;
  currency_id: string;
  status: "draft" | "sent";
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  amount_paid: number;
  notes?: string;
  payment_instructions?: string;
  items: InvoiceItem[];
}

interface Props {
  visible: boolean;
  onClose: () => void;
  item?: Invoice;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<Props> = ({ visible, onClose, item, onSave }) => {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formState, setFormState] = useState<Partial<Invoice>>({
    status: "draft",
    issue_date: new Date().toISOString().split("T")[0],
    due_date: new Date().toISOString().split("T")[0],
    items: [],
  });

  useEffect(() => {
    if (item) setFormState(item);
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
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
          description: "",
          quantity: 1,
          unit: "",
          unit_price: 0,
          tax_amount: 0,
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
      ? SALES_ENDPOINTS.INVOICES.UPDATE(item.id)
      : SALES_ENDPOINTS.INVOICES.ADD;

    await createRequest(endpoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
    onClose();
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button label="Cancel" icon="pi pi-times" onClick={onClose} className="p-button-text" />
      <Button label={item?.id ? "Update" : "Submit"} icon="pi pi-check" loading={isSubmitting} type="submit" form="invoice-form" />
    </div>
  );

  return (
    <Dialog header={item?.id ? "Edit Invoice" : "Add Invoice"} visible={visible} style={{ width: "60vw" }} footer={footer} onHide={onClose}>
      <form id="invoice-form" onSubmit={handleSubmit} className="p-fluid space-y-4">
        <InputText name="sale_order_id" placeholder="Sale Order ID" value={formState.sale_order_id || ""} onChange={handleChange} required />
        <InputText name="grn_id" placeholder="GRN ID" value={formState.grn_id || ""} onChange={handleChange} />
        <InputText name="currency_id" placeholder="Currency ID" value={formState.currency_id || ""} onChange={handleChange} required />
        <InputText name="issue_date" type="date" value={formState.issue_date || ""} onChange={handleChange} required />
        <InputText name="due_date" type="date" value={formState.due_date || ""} onChange={handleChange} required />
        <Dropdown value={formState.status} options={["draft", "sent"]} onChange={(e) => setFormState({ ...formState, status: e.value })} placeholder="Status" />
        <InputText name="subtotal" placeholder="Subtotal" type="number" value={formState.subtotal || 0} onChange={handleChange} />
        <InputText name="tax_amount" placeholder="Tax Amount" type="number" value={formState.tax_amount || 0} onChange={handleChange} />
        <InputText name="discount_amount" placeholder="Discount Amount" type="number" value={formState.discount_amount || 0} onChange={handleChange} />
        <InputText name="total_amount" placeholder="Total Amount" type="number" value={formState.total_amount || 0} onChange={handleChange} />
        <InputText name="amount_paid" placeholder="Amount Paid" type="number" value={formState.amount_paid || 0} onChange={handleChange} />
        <InputTextarea name="notes" placeholder="Notes" rows={2} value={formState.notes || ""} onChange={handleChange} />
        <InputTextarea name="payment_instructions" placeholder="Payment Instructions" rows={2} value={formState.payment_instructions || ""} onChange={handleChange} />

        <h4 className="mt-4">Items</h4>
        {(formState.items || []).map((item, index) => (
          <div key={index} className="grid grid-cols-6 gap-2 items-end">
            <InputText value={item.sale_order_item_id} placeholder="Item ID" onChange={(e) => handleItemChange(index, "sale_order_item_id", e.target.value)} />
            <InputText value={item.description} placeholder="Description" onChange={(e) => handleItemChange(index, "description", e.target.value)} />
            <InputText value={item.quantity} type="number" placeholder="Qty" onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))} />
            <InputText value={item.unit} placeholder="Unit" onChange={(e) => handleItemChange(index, "unit", e.target.value)} />
            <InputText value={item.unit_price} type="number" placeholder="Unit Price" onChange={(e) => handleItemChange(index, "unit_price", Number(e.target.value))} />
            <InputText value={item.tax_amount} type="number" placeholder="Tax" onChange={(e) => handleItemChange(index, "tax_amount", Number(e.target.value))} />
            <Button icon="pi pi-trash" className="p-button-danger" type="button" onClick={() => removeItem(index)} />
          </div>
        ))}
        <Button label="Add Item" icon="pi pi-plus" type="button" onClick={addItem} className="mt-2" />
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
