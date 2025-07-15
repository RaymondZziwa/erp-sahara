import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { INVENTORY_ENDPOINTS } from "../../../api/inventoryEndpoints";
import { Customer } from "../../../redux/slices/types/inventory/Customers";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Customer;
  onSave: () => void;
}

const organizationTypes = [
  { label: "Corporation", value: "Corporation" },
  { label: "Partnership", value: "Partnership" },
  { label: "LLC", value: "LLC" },
  { label: "Sole Proprietorship", value: "Sole Proprietorship" },
];

const salutations = ["Mr", "Mrs", "Ms", "Miss", "Dr", "Prof", "Rev"].map((s) => ({ label: s, value: s }));

const statuses = ["active", "inactive", "suspended"].map((s) => ({ label: s, value: s }));

const paymentTerms = [
  "DOR", "Net7", "Net30", "Net60", "Net90", "Prepaid",
  "COD", "CIA", "EOM", "Custom",
].map((p) => ({ label: p, value: p }));

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({ visible, onClose, item, onSave }) => {
  const [formState, setFormState] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({ ...item });
    } else {
      setFormState({
        organization_name: "",
        first_name: "",
        last_name: "",
        other_name: "",
        phone: "",
        email: "",
        industry: "",
        headquarters_address: "",
        organization_type: "Corporation",
        salutation: "",
        status: "active",
        billing_address: "",
        shipping_address: "",
        credit_limit: "",
        payment_terms: "",
        bank_details: "",
        tax_identification_number: "",
        description: "",
      });
    }
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (name: string, value: any) => {
    setFormState((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = { ...formState, bank_details: Number(formState.bank_details) };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? INVENTORY_ENDPOINTS.CUSTOMERS.UPDATE(item.id.toString())
      : INVENTORY_ENDPOINTS.CUSTOMERS.ADD;
    await createRequest(endpoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose();
  };

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button label="Cancel" icon="pi pi-times" onClick={onClose} className="p-button-text !bg-red-500 hover:bg-red-400" size="small" disabled={isSubmitting} />
      <Button loading={isSubmitting} disabled={isSubmitting} label={item?.id ? "Update" : "Submit"} icon="pi pi-check" type="submit" form="item-form" size="small" />
    </div>
  );

  return (
    <Dialog header={item?.id ? "Edit Customer" : "Add Customer"} visible={visible} style={{ width: "720px" }} footer={footer} onHide={onClose}>
      <form id="item-form" onSubmit={handleSave} className="p-fluid grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          "organization_name",
          "first_name",
          "last_name",
          "other_name",
          "phone",
          "email",
          "industry",
          "headquarters_address",
          "billing_address",
          "shipping_address",
          "credit_limit",
          "tax_identification_number",
          "description",
        ].map((field) => (
          <div className="p-field" key={field}>
            <label htmlFor={field}>{field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</label>
            <InputText id={field} name={field} value={formState[field] || ""} onChange={handleInputChange} className="w-full" />
          </div>
        ))}

        <div className="p-field">
          <label htmlFor="organization_type">Organization Type</label>
          <Dropdown id="organization_type" value={formState.organization_type} options={organizationTypes} onChange={(e) => handleDropdownChange("organization_type", e.value)} className="w-full" required />
        </div>

        <div className="p-field">
          <label htmlFor="salutation">Salutation</label>
          <Dropdown id="salutation" value={formState.salutation} options={salutations} onChange={(e) => handleDropdownChange("salutation", e.value)} className="w-full" />
        </div>

        <div className="p-field">
          <label htmlFor="status">Status</label>
          <Dropdown id="status" value={formState.status} options={statuses} onChange={(e) => handleDropdownChange("status", e.value)} className="w-full" />
        </div>

        <div className="p-field">
          <label htmlFor="payment_terms">Payment Terms</label>
          <Dropdown id="payment_terms" value={formState.payment_terms} options={paymentTerms} onChange={(e) => handleDropdownChange("payment_terms", e.value)} className="w-full" />
        </div>

        <div className="p-field">
          <label htmlFor="bank_details">Bank Details (ID)</label>
          <InputText id="bank_details" name="bank_details" value={formState.bank_details} onChange={handleInputChange} className="w-full" />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
