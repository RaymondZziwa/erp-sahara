import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import useItems from "../../../hooks/inventory/useItems";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import useCurrencies from "../../../hooks/procurement/useCurrencies";
import { Quotation } from "../../../redux/slices/types/sales/Quotation";
import { SALES_ENDPOINTS } from "../../../api/salesEndpoints";
import useCustomers from "../../../hooks/inventory/useCustomers";
import useLeads from "../../../hooks/sales/useLeads";

interface QuotationAdd {
  title: string;
  customer_id: number;
  currency_id: number;
  issue_date: string;
  expiry_date: string;
  lead_id: number;
  notes: string;
  vat_rate: number | string;
  items: Item[];
}

interface Item {
  item_id: number;
  quantity: string | number;
  unit_price: string;
  currency_id: number;
  notes: string;
}

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Partial<Quotation>;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const initialItem: QuotationAdd = {
    title: "",
    customer_id: 0,
    currency_id: 0,
    issue_date: "",
    expiry_date: "",
    lead_id: 0,
    notes: "",
    vat_rate: 0,
    items: [],
  };

  const [formState, setFormState] = useState<QuotationAdd>(initialItem);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: currencies } = useCurrencies();
  const { data: items } = useItems(); // Fetch items for dropdown
  const { data: customers } = useCustomers();
  const { data: leads } = useLeads();
  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        title: item.title ?? "",
        customer_id: item.customer_id ?? 0,
        currency_id: item.currency_id ?? 0,
        issue_date: item.issue_date ?? "",
        expiry_date: item.expiry_date ?? "",
        lead_id: item.lead_id ?? 0,
        notes: item.notes ?? "",
        vat_rate: item.vat_rate ?? 0,
        items:
          item.quotation_items?.map((item) => ({
            currency_id: item.currency_id,
            item_id: item.item_id,
            notes: item.notes ?? "",
            quantity: item.quantity,
            unit_price: item.unit_price,
          })) ?? [],
      });
    } else {
      setFormState(initialItem);
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDropdownChange = (
    e: DropdownChangeEvent,
    field: keyof QuotationAdd // Explicitly type the field
  ) => {
    setFormState((prevState) => ({
      ...prevState,
      [field]: e.value as QuotationAdd[typeof field], // Cast the value to the correct type
    }));
  };

  const handleItemDropdownChange = (
    e: DropdownChangeEvent,
    index: number,
    field: keyof Item // Explicitly type the field
  ) => {
    const updatedItems = [...formState.items];

    // Check the field type and cast e.value accordingly
    if (field === "quantity") {
      updatedItems[index][field] = e.value as string | number;
    } else if (field === "unit_price") {
      updatedItems[index][field] = e.value as string;
    } else if (field === "currency_id" || field === "item_id") {
      updatedItems[index][field] = e.value as number;
    } else if (field === "notes") {
      updatedItems[index][field] = e.value as string;
    }

    setFormState((prevState) => ({
      ...prevState,
      items: updatedItems,
    }));
  };

  const handleAddItem = () => {
    const newItem: Item = {
      item_id: 0,
      quantity: "",
      unit_price: "",
      currency_id: 0,
      notes: "",
    };
    setFormState((prevState) => ({
      ...prevState,
      items: [...prevState.items, newItem],
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmitting(true);
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? SALES_ENDPOINTS.QUOTES.UPDATE(item.id.toString())
      : SALES_ENDPOINTS.QUOTES.ADD;
    const data = item?.id ? { ...item, ...formState } : formState;

    await createRequest(endpoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose(); // Close the modal after saving
  };

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
        loading={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="item-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Quotation" : "Add Quotation"}
      visible={visible}
      style={{ width: "800px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="item-form"
        onSubmit={handleSave}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4"
      >
        <div className="p-field">
          <label htmlFor="title">Title</label>
          <InputText
            id="title"
            name="title"
            value={formState.title}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="customer_id">Customer</label>
          <Dropdown
            id="customer_id"
            value={formState.customer_id}
            onChange={(e) => handleDropdownChange(e, "customer_id")}
            options={customers}
            optionLabel="email"
            optionValue="id"
            placeholder="Select a customer"
            filter
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="currency_id">Currency</label>
          <Dropdown
            id="currency_id"
            value={formState.currency_id}
            onChange={(e) => handleDropdownChange(e, "currency_id")}
            options={currencies}
            optionLabel="name"
            optionValue="id"
            placeholder="Select a currency"
            filter
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="issue_date">Issue Date</label>
          <InputText
            id="issue_date"
            name="issue_date"
            type="date"
            value={formState.issue_date}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="expiry_date">Expiry Date</label>
          <InputText
            id="expiry_date"
            name="expiry_date"
            type="date"
            value={formState.expiry_date}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="lead_id">Lead</label>
          <Dropdown
            id="lead_id"
            value={formState.lead_id}
            onChange={(e) => handleDropdownChange(e, "lead_id")}
            options={leads}
            optionLabel="name"
            optionValue="id"
            placeholder="Select a lead"
            filter
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="notes">Notes</label>
          <InputTextarea
            id="notes"
            name="notes"
            value={formState.notes}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="vat_rate">VAT Rate (%)</label>
          <InputText
            id="vat_rate"
            name="vat_rate"
            type="number"
            value={formState.vat_rate.toString()}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>

        <div className="p-field col-span-2">
          <h3 className="font-semibold">Items</h3>
          <DataTable
            value={formState.items}
            dataKey="index" // Use index as the unique key
            className="p-datatable-customers"
          >
            <Column
              header="Item"
              body={(rowData, { rowIndex }) => (
                <Dropdown
                  value={rowData.item_id}
                  options={items}
                  onChange={(e) =>
                    handleItemDropdownChange(e, rowIndex, "item_id")
                  }
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Select Item"
                />
              )}
            />
            <Column
              header="Quantity"
              body={(rowData, { rowIndex }) => (
                <InputText
                  type="number"
                  value={rowData.quantity}
                  onChange={(e) => {
                    const updatedItems = [...formState.items];
                    updatedItems[rowIndex].quantity = e.target.value;
                    setFormState((prevState) => ({
                      ...prevState,
                      items: updatedItems,
                    }));
                  }}
                />
              )}
            />
            <Column
              header="Unit Price"
              body={(rowData, { rowIndex }) => (
                <InputText
                  type="number"
                  value={rowData.unit_price}
                  onChange={(e) => {
                    const updatedItems = [...formState.items];
                    updatedItems[rowIndex].unit_price = e.target.value;
                    setFormState((prevState) => ({
                      ...prevState,
                      items: updatedItems,
                    }));
                  }}
                />
              )}
            />
            <Column
              header="Currency"
              body={(rowData, { rowIndex }) => (
                <Dropdown
                  value={rowData.currency_id}
                  options={currencies}
                  onChange={(e) =>
                    handleItemDropdownChange(e, rowIndex, "currency_id")
                  }
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Select Currency"
                />
              )}
            />
            <Column
              header="Notes"
              body={(rowData, { rowIndex }) => (
                <InputTextarea
                  value={rowData.notes}
                  onChange={(e) => {
                    const updatedItems = [...formState.items];
                    updatedItems[rowIndex].notes = e.target.value;
                    setFormState((prevState) => ({
                      ...prevState,
                      items: updatedItems,
                    }));
                  }}
                />
              )}
            />
          </DataTable>
          <Button
            type="button"
            label="Add Item"
            icon="pi pi-plus"
            className="p-button-text mt-2"
            onClick={handleAddItem}
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
