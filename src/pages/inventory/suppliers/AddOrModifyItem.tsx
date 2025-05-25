import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown"; // Import Dropdown component

import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { Supplier } from "../../../redux/slices/types/inventory/Suppliers";
import { INVENTORY_ENDPOINTS } from "../../../api/inventoryEndpoints";
import { ToastContainer } from "react-toastify";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Supplier;
  onSave: () => void;
}

const supplierTypes = [
  { label: "Local", value: "Local" },
  { label: "International", value: "International" },
];

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<{
    supplier_name: string;
    email: string;
    supplier_address: string;
    supplier_type: string;
    contact_person: string;
    contact_person_title: string;
    phone_number: string;
    company_registration_number: string;
    tax_identification_number: string;
    credit_limit: string;
    notes: string;
  }>({
    supplier_name: "",
    email: "",
    supplier_address: "",
    supplier_type: "Local",
    contact_person: "",
    contact_person_title: "",
    phone_number: "",
    company_registration_number: "",
    tax_identification_number: "",
    credit_limit: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        supplier_name: item.supplier_name || "",
        email: item.email || "",
        supplier_address: item.supplier_address || "",
        supplier_type: item.supplier_type || "Local",
        contact_person: item.contact_person || "",
        contact_person_title: item.contact_person_title || "",
        phone_number: item.phone_number || "",
        company_registration_number: item.company_registration_number || "",
        tax_identification_number: item.tax_identification_number || "",
        credit_limit: item.credit_limit || "",
        notes: item.notes || "",
      });
    } else {
      setFormState({
        supplier_name: "",
        email: "",
        supplier_address: "",
        supplier_type: "Local",
        contact_person: "",
        contact_person_title: "",
        phone_number: "",
        company_registration_number: "",
        tax_identification_number: "",
        credit_limit: "",
        notes: "",
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
      supplier_type: e.value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Basic validation
    if (!formState.supplier_name) {
      return; // Handle validation error here
    }
    const data = { ...formState };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? INVENTORY_ENDPOINTS.SUPPLIERS.UPDATE(item.id.toString())
      : INVENTORY_ENDPOINTS.SUPPLIERS.ADD;
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
    <>
      <ToastContainer />
      <Dialog
        header={item?.id ? "Edit Supplier" : "Add Supplier"}
        visible={visible}
        style={{ width: "720px" }}
        footer={footer}
        onHide={onClose}
      >
        <p className="mb-6">
          Fields marked with a red asterik (
          <span className="text-red-500">*</span>) are mandatory.
        </p>
        <form
          id="item-form"
          onSubmit={handleSave}
          className="p-fluid grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          <div className="p-field">
            <label htmlFor="supplier_name">
              Supplier Name<span className="text-red-500">*</span>
            </label>
            <InputText
              id="supplier_name"
              name="supplier_name"
              value={formState.supplier_name}
              onChange={handleInputChange}
              required
              className="w-full"
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
            />
          </div>
          <div className="p-field">
            <label htmlFor="supplier_address">
              Supplier Address<span className="text-red-500">*</span>
            </label>
            <InputText
              id="supplier_address"
              name="supplier_address"
              value={formState.supplier_address}
              onChange={handleInputChange}
              className="w-full"
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="supplier_type">
              Supplier Type<span className="text-red-500">*</span>
            </label>
            <Dropdown
              id="supplier_type"
              name="supplier_type"
              value={formState.supplier_type}
              options={supplierTypes}
              onChange={handleDropdownChange}
              className="w-full"
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="contact_person">
              Contact Person<span className="text-red-500">*</span>
            </label>
            <InputText
              id="contact_person"
              name="contact_person"
              value={formState.contact_person}
              onChange={handleInputChange}
              className="w-full"
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="contact_person_title">
              Contact Person Title<span className="text-red-500">*</span>
            </label>
            <InputText
              id="contact_person_title"
              name="contact_person_title"
              value={formState.contact_person_title}
              onChange={handleInputChange}
              className="w-full"
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="phone_number">
              Phone Number<span className="text-red-500">*</span>
            </label>
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
            <label htmlFor="company_registration_number">
              Company Registration Number
            </label>
            <InputText
              id="company_registration_number"
              name="company_registration_number"
              value={formState.company_registration_number}
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
          <div className="p-field">
            <label htmlFor="credit_limit">
              Credit Limit<span className="text-red-700">*</span>
            </label>
            <InputText
              id="credit_limit"
              name="credit_limit"
              value={formState.credit_limit}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
          <div className="p-field lg:col-span-2">
            <label htmlFor="notes">Notes</label>
            <InputText
              id="notes"
              name="notes"
              value={formState.notes}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default AddOrModifyItem;
