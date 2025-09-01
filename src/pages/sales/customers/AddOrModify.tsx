import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import useAuth from "../../../hooks/useAuth";
import { createRequest } from "../../../utils/api";
import { INVENTORY_ENDPOINTS } from "../../../api/inventoryEndpoints";
import { Customer } from "../../../redux/slices/types/inventory/Customers";
interface AddOrModifyCustomerProps {
  visible: boolean;
  onClose: () => void;
  customer?: Customer;
  onSave: () => void;
}

const salutationOptions = [
  { label: "Mr", value: "Mr" },
  { label: "Mrs", value: "Mrs" },
  { label: "Ms", value: "Ms" },
  { label: "Miss", value: "Miss" },
  { label: "Dr", value: "Dr" },
  { label: "Prof", value: "Prof" },
  { label: "Rev", value: "Rev" },
];

const orgTypeOptions = [
  { label: "Organisation", value: "organisation" },
  { label: "Individual", value: "individual" },
];

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Suspended", value: "suspended" },
];

const paymentTermsOptions = [
  "DOR", "Net7", "Net30", "Net60", "Net90",
  "Prepaid", "COD", "CIA", "EOM", "Custom",
].map(term => ({ label: term, value: term }));

const AddOrModifyCustomer: React.FC<AddOrModifyCustomerProps> = ({
  visible,
  onClose,
  customer,
  onSave,
}) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState<Customer>({
    organization_name: "",
    first_name: "",
    last_name: "",
    other_name: "",
    phone: "",
    email: "",
    industry: "",
    headquarters_address: "",
    organization_type: "",
    salutation: null,
    status: "active",
    billing_address: "",
    shipping_address: "",
    credit_limit: "",
    payment_terms: "",
    bank_details: "",
    tax_identification_number: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    console.log(customer)
    if (customer) setFormData(customer);
    else
      setFormData({
        organization_name: "",
        first_name: "",
        last_name: "",
        other_name: "",
        phone: "",
        email: "",
        industry: "",
        headquarters_address: "",
        type: "",
        salutation: null,
        status: "active",
        billing_address: "",
        shipping_address: "",
        credit_limit: "",
        payment_terms: "",
        bank_details: "",
        tax_identification_number: "",
        description: "",
      });
  }, [customer]);

  const handleChange = (name: keyof Customer, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const endpoint = customer
      ? INVENTORY_ENDPOINTS.CUSTOMERS.UPDATE(customer.id) // adjust if using a different customer endpoint
      : INVENTORY_ENDPOINTS.CUSTOMERS.ADD;

    const method = customer ? "PUT" : "POST";
    await createRequest(endpoint, token.access_token, formData, onSave, method);

    setIsSubmitting(false);
    onSave();
    onClose();
    setFormData({
      organization_name: "",
      first_name: "",
      last_name: "",
      other_name: "",
      phone: "",
      email: "",
      industry: "",
      headquarters_address: "",
      type: "",
      salutation: null,
      status: "active",
      billing_address: "",
      shipping_address: "",
      credit_limit: "",
      payment_terms: "",
      bank_details: "",
      tax_identification_number: "",
      description: "",
    });
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        className="p-button-text !bg-red-500"
        onClick={onClose}
      />
      <Button
        label={customer ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="customer-form"
        loading={isSubmitting}
        disabled={isSubmitting}
      />
    </div>
  );

  return (
    <Dialog
      header={customer ? "Edit Customer" : "Add Customer"}
      visible={visible}
      style={{ width: "600px" }}
      footer={footer}
      onHide={onClose}
    >
      <p className="mb-4 text-sm text-gray-600">
        Fields marked with <span className="text-red-500">*</span> are required.
      </p>
      <form id="customer-form" onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <Dropdown
          value={formData.type}
          options={orgTypeOptions}
          onChange={(e) => handleChange("type", e.value)}
          placeholder="Organization Type *"
          required
          className="w-full p-inputtext-sm"
        />
        {
          formData.type === "organisation" && (
            <InputText
              value={formData.organization_name}
              onChange={(e) => handleChange("organization_name", e.target.value)}
              placeholder="Organization Name"
              className="w-full p-inputtext-sm"
            />
          )
        }
            <Dropdown
              value={formData.salutation}
              options={salutationOptions}
              onChange={(e) => handleChange("salutation", e.value)}
              placeholder="Salutation"
              className="w-full p-inputtext-sm"
            />
        <InputText
          value={formData.first_name}
          onChange={(e) => handleChange("first_name", e.target.value)}
          placeholder="First Name *"
          required
          className="w-full p-inputtext-sm"
        />
        <InputText
          value={formData.last_name}
          onChange={(e) => handleChange("last_name", e.target.value)}
          placeholder="Last Name *"
          required
          className="w-full p-inputtext-sm"
        />
        <InputText
          value={formData.other_name}
          onChange={(e) => handleChange("other_name", e.target.value)}
          placeholder="Other Name"
          className="w-full p-inputtext-sm"
        />
        <InputText
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          placeholder="Phone *"
          required
          className="w-full p-inputtext-sm"
        />
        <InputText
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="Email *"
          required
          className="w-full p-inputtext-sm"
        />
        <InputText
          value={formData.industry}
          onChange={(e) => handleChange("industry", e.target.value)}
          placeholder="Industry *"
          required
          className="w-full p-inputtext-sm"
        />
        <InputText
          value={formData.headquarters_address}
          onChange={(e) => handleChange("headquarters_address", e.target.value)}
          placeholder="Headquarters Address *"
          required
          className="w-full p-inputtext-sm"
        />
        <Dropdown
          value={formData.status}
          options={statusOptions}
          onChange={(e) => handleChange("status", e.value)}
          placeholder="Status *"
          required
          className="w-full p-inputtext-sm"
        />
        <InputText
          value={formData.billing_address}
          onChange={(e) => handleChange("billing_address", e.target.value)}
          placeholder="Billing Address"
          className="w-full p-inputtext-sm"
        />
        <InputText
          value={formData.shipping_address}
          onChange={(e) => handleChange("shipping_address", e.target.value)}
          placeholder="Shipping Address"
          className="w-full p-inputtext-sm"
        />
        <InputText
          value={formData.credit_limit}
          onChange={(e) => handleChange("credit_limit", e.target.value)}
          placeholder="Credit Limit"
          className="w-full p-inputtext-sm"
        />
        <Dropdown
          value={formData.payment_terms}
          options={paymentTermsOptions}
          onChange={(e) => handleChange("payment_terms", e.value)}
          placeholder="Payment Terms *"
          required
          className="w-full p-inputtext-sm"
        />
        <InputText
          value={formData.tax_identification_number}
          onChange={(e) => handleChange("tax_identification_number", e.target.value)}
          placeholder="Tax Identification Number"
          className="w-full p-inputtext-sm"
        />
        <InputText
          type="text"
          value={formData.bank_details}
          onChange={(e) => handleChange("bank_details", parseInt(e.target.value))}
          placeholder="Bank Details (ID)"
          className="w-full p-inputtext-sm"
        />
        <div className="col-span-2">
          <InputTextarea
            rows={3}
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Description"
            className="w-full p-inputtext-sm"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyCustomer;
