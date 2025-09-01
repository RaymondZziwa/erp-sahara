import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { Supplier } from "../../../redux/slices/types/inventory/Suppliers";
import { INVENTORY_ENDPOINTS } from "../../../api/inventoryEndpoints";
import { ToastContainer } from "react-toastify";
import { InputTextarea } from "primereact/inputtextarea";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Supplier;
  onSave: () => void;
}

const supplierTypes = [
  { label: "Company", value: "Company" },
  { label: "Individual", value: "Individual" },
];

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState({
    supplier_type: "Company",
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
    contact_person: "",
    contact_person_title: "",
    company_registration_number: "",
    tax_identification_number: "",
    credit_limit: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        supplier_type: item.supplier_type || "Company",
        name: item.name || "",
        email: item.email || "",
        phone: item.phone || "",
        address: item.address || "",
        notes: item.notes || "",
        contact_person: item.contact_person || "",
        contact_person_title: item.contact_person_title || "",
        company_registration_number: item.company_registration_number || "",
        tax_identification_number: item.tax_identification_number || "",
        credit_limit: item.credit_limit ?? 0,
      });
    } else {
      setFormState({
        supplier_type: "Company",
        name: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
        contact_person: "",
        contact_person_title: "",
        company_registration_number: "",
        tax_identification_number: "",
        credit_limit: 0,
      });
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: name === "credit_limit" ? Number(value) : value,
    }));
  };

  const handleDropdownChange = (e: { value: string }) => {
    setFormState((prev) => ({
      ...prev,
      supplier_type: e.value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formState.name) {
      setIsSubmitting(false);
      return;
    }

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? INVENTORY_ENDPOINTS.SUPPLIERS.UPDATE(item.id.toString())
      : INVENTORY_ENDPOINTS.SUPPLIERS.ADD;

    await createRequest(endpoint, token.access_token, formState, onSave, method);

    setIsSubmitting(false);
    onSave();
    onClose();
    setFormState({
      supplier_type: "Company",
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
      contact_person: "",
      contact_person_title: "",
      company_registration_number: "",
      tax_identification_number: "",
      credit_limit: 0,
    });
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
        style={{ width: "600px" }}
        footer={footer}
        onHide={onClose}
      >
        <form
          id="item-form"
          onSubmit={handleSave}
          className="p-fluid grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          <div>
            <label>Supplier Type<span className="text-red-500">*</span></label>
            <Dropdown
              value={formState.supplier_type}
              options={supplierTypes}
              onChange={handleDropdownChange}
              required
            />
          </div>

          <div>
            <label>Name<span className="text-red-500">*</span></label>
            <InputText
              name="name"
              value={formState.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label>Email</label>
            <InputText
              name="email"
              value={formState.email}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label>Phone<span className="text-red-500">*</span></label>
            <InputText
              name="phone"
              value={formState.phone}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label>Address</label>
            <InputText
              name="address"
              value={formState.address}
              onChange={handleInputChange}
            />
          </div>

          {formState.supplier_type === "Company" && (
            <>
              <div>
                <label>Contact Person</label>
                <InputText
                  name="contact_person"
                  value={formState.contact_person}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label>Contact Person Title</label>
                <InputText
                  name="contact_person_title"
                  value={formState.contact_person_title}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label>Company Registration Number</label>
                <InputText
                  name="company_registration_number"
                  value={formState.company_registration_number}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label>Tax Identification Number</label>
                <InputText
                  name="tax_identification_number"
                  value={formState.tax_identification_number}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label>Credit Limit</label>
                <InputText
                  type="number"
                  name="credit_limit"
                  value={formState.credit_limit}
                  onChange={handleInputChange}
                />
              </div>
            </>
          )}

          <div className="lg:col-span-2">
            <label>Notes</label>
            <InputTextarea
              name="notes"
              value={formState.notes}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default AddOrModifyItem;
