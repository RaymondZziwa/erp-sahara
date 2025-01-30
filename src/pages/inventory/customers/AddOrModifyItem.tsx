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

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<{
    organization_name: string;
    email: string;
    industry: string;
    headquarters_address: string;
    organization_type: string;
    primary_contact_person: string;
    contact_person_title: string;
    phone_number: string;
    billing_address: string;
    shipping_address: string;
    credit_limit: string;
    payment_terms: string;
    bank_details: string; // Assuming bank_details is a string here, adjust as needed
    tax_identification_number: string;
  }>({
    organization_name: "",
    email: "",
    industry: "",
    headquarters_address: "",
    organization_type: "Corporation",
    primary_contact_person: "",
    contact_person_title: "",
    phone_number: "",
    billing_address: "",
    shipping_address: "",
    credit_limit: "",
    payment_terms: "",
    bank_details: "",
    tax_identification_number: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        organization_name: item.organization_name || "",
        email: item.email || "",
        industry: item.industry || "",
        headquarters_address: item.headquarters_address || "",
        organization_type: item.organization_type || "Corporation",
        primary_contact_person: item.primary_contact_person || "",
        contact_person_title: item.contact_person_title || "",
        phone_number: item.phone_number || "",
        billing_address: item.billing_address || "",
        shipping_address: item.shipping_address || "",
        credit_limit: item.credit_limit || "",
        payment_terms: item.payment_terms || "",
        bank_details: item.bank_details || "",
        tax_identification_number: item.tax_identification_number || "",
      });
    } else {
      setFormState({
        organization_name: "",
        email: "",
        industry: "",
        headquarters_address: "",
        organization_type: "Corporation",
        primary_contact_person: "",
        contact_person_title: "",
        phone_number: "",
        billing_address: "",
        shipping_address: "",
        credit_limit: "",
        payment_terms: "",
        bank_details: "",
        tax_identification_number: "",
      });
    }
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDropdownChange = (e: { value: string }) => {
    setFormState((prevState) => ({
      ...prevState,
      organization_type: e.value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Basic validation
    if (!formState.organization_name) {
      return; // Handle validation error here
    }
    const data = { ...formState };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? INVENTORY_ENDPOINTS.CUSTOMERS.UPDATE(item.id.toString())
      : INVENTORY_ENDPOINTS.CUSTOMERS.ADD;
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
        disabled={isSubmitting}
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
      header={item?.id ? "Edit Customer" : "Add Customer"}
      visible={visible}
      style={{ width: "720px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="item-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <div className="p-field">
          <label htmlFor="organization_name">Organization Name</label>
          <InputText
            id="organization_name"
            name="organization_name"
            value={formState.organization_name}
            onChange={handleInputChange}
            className="w-full"
            required
          />
        </div>
        <div className="p-field">
          <label htmlFor="email">Email</label>
          <InputText
            id="email"
            name="email"
            value={formState.email}
            onChange={handleInputChange}
            className="w-full"
            required
          />
        </div>
        <div className="p-field">
          <label htmlFor="industry">Industry</label>
          <InputText
            id="industry"
            name="industry"
            value={formState.industry}
            onChange={handleInputChange}
            className="w-full"
            required
          />
        </div>
        <div className="p-field">
          <label htmlFor="headquarters_address">Headquarters Address</label>
          <InputText
            id="headquarters_address"
            name="headquarters_address"
            value={formState.headquarters_address}
            onChange={handleInputChange}
            className="w-full"
            required
          />
        </div>
        <div className="p-field">
          <label htmlFor="organization_type">Organization Type</label>
          <Dropdown
            id="organization_type"
            name="organization_type"
            value={formState.organization_type}
            options={organizationTypes}
            onChange={handleDropdownChange}
            className="w-full"
            required
          />
        </div>
        <div className="p-field">
          <label htmlFor="primary_contact_person">Primary Contact Person</label>
          <InputText
            id="primary_contact_person"
            name="primary_contact_person"
            value={formState.primary_contact_person}
            onChange={handleInputChange}
            className="w-full"
            required
          />
        </div>
        <div className="p-field">
          <label htmlFor="contact_person_title">Contact Person Title</label>
          <InputText
            id="contact_person_title"
            name="contact_person_title"
            value={formState.contact_person_title}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="phone_number">Phone Number</label>
          <InputText
            id="phone_number"
            name="phone_number"
            value={formState.phone_number}
            onChange={handleInputChange}
            className="w-full"
            required
          />
        </div>
        <div className="p-field">
          <label htmlFor="billing_address">Billing Address</label>
          <InputText
            id="billing_address"
            name="billing_address"
            value={formState.billing_address}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="shipping_address">Shipping Address</label>
          <InputText
            id="shipping_address"
            name="shipping_address"
            value={formState.shipping_address}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="credit_limit">Credit Limit</label>
          <InputText
            id="credit_limit"
            name="credit_limit"
            value={formState.credit_limit}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="payment_terms">Payment Terms</label>
          <InputText
            id="payment_terms"
            name="payment_terms"
            value={formState.payment_terms}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="bank_details">Bank Details</label>
          <InputText
            id="bank_details"
            name="bank_details"
            value={formState.bank_details}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="tax_identification_number">
            Tax Identification Number
          </label>
          <InputText
            id="tax_identification_number"
            name="tax_identification_number"
            value={formState.tax_identification_number}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
