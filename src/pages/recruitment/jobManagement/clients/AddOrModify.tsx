import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import useAuth from "../../../../hooks/useAuth";
import { createRequest } from "../../../../utils/api";
import { API_ENDPOINTS } from "../../../../api/apiEndpoints";
import { RECRUITMENT_ENDPOINTS } from "../../../../api/recruitmentEndpoints";
import { Company } from "../../../../redux/slices/types/recruitment/types";

interface Contact {
  first_name: string;
  last_name: string;
  position: string;
  email: string;
  phone?: string;
  mobile?: string;
  is_primary: boolean;
  preferred_communication_methods?: string[];
  notes?: string;
}

interface Address {
  street_address_1: string;
  street_address_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_primary: boolean;
}

interface CompanyForm {
  name: string;
  legal_name: string;
  tax_id: string;
  website: string;
  industry: string;
  description: string;
  company_size: string;
  contacts: Contact[];
  addresses: Address[];
}

const companySizes = [
  "1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5001+",
];

const communicationOptions = [
    { label: "Email", value: "email" },
    { label: "Phone", value: "phone" },
    { label: "Mobile", value: "mobile" },
];

const AddOrModifyCompany: React.FC<{
    visible: boolean;
    item?: Company;
  onClose: () => void;
  onSave: () => void;
}> = ({ visible, onClose, onSave, item }) => {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formState, setFormState] = useState<CompanyForm>({
    name: "",
    legal_name: "",
    tax_id: "",
    website: "",
    industry: "",
    description: "",
    company_size: "1-10",
    contacts: [
      {
        first_name: "",
        last_name: "",
        position: "",
        email: "",
        phone: "",
        mobile: "",
        is_primary: true,
        preferred_communication_methods: ["email"],
        notes: "",
      },
    ],
    addresses: [
      {
        street_address_1: "",
        street_address_2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "Uganda",
        is_primary: true,
      },
    ],
  });
    
  useEffect(() => {
    if (item) {
      setFormState({
        name: item.name || "",
        legal_name: item.legal_name || "",
        tax_id: item.tax_id || "",
        website: item.website || "",
        industry: item.industry || "",
        description: item.description || "",
        company_size: item.company_size || "1-10",
        contacts: item.contacts?.length
          ? item.contacts.map((c) => ({
              ...c,
              preferred_communication_methods:
                Array.isArray(c.preferred_communication_methods)
                  ? c.preferred_communication_methods
                  : [c.preferred_communication_methods ?? "email"],
            }))
          : [
              {
                first_name: "",
                last_name: "",
                position: "",
                email: "",
                phone: "",
                mobile: "",
                is_primary: true,
                preferred_communication_methods: ["email"],
                notes: "",
              },
            ],
        addresses: item.addresses?.length
          ? item.addresses
          : [
              {
                street_address_1: "",
                street_address_2: "",
                city: "",
                state: "",
                postal_code: "",
                country: "Uganda",
                is_primary: true,
              },
            ],
      });
    }
  }, [item]);

  const handleChange = (field: keyof CompanyForm, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (index: number, field: keyof Contact, value: any) => {
    const updated = [...formState.contacts];
    updated[index][field] = value;
    setFormState((prev) => ({ ...prev, contacts: updated }));
  };

  const handleAddressChange = (field: keyof Address, value: any) => {
    const updated = [...formState.addresses];
    updated[0][field] = value;
    setFormState((prev) => ({ ...prev, addresses: updated }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    // Prepare the payload with guaranteed array for preferred_communication_methods
    const payload = {
      ...formState,
      contacts: formState.contacts.map(contact => ({
        ...contact,
        preferred_communication_methods: 
          contact.preferred_communication_methods 
            ? Array.isArray(contact.preferred_communication_methods)
              ? contact.preferred_communication_methods
              : [contact.preferred_communication_methods]
            : []
      }))
    };
      
    const endpoint = item ? RECRUITMENT_ENDPOINTS.COMPANY.UPDATE(item.id)
            : RECRUITMENT_ENDPOINTS.COMPANY.ADD;
    
          const method = item?.id ? "PUT" : "POST";
  
    await createRequest(
      endpoint,
      token.access_token,
      payload,
      onSave,
      method
    );
  
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog
    header={item?.id ? "Edit Company" : "Add Company"}
      visible={visible}
      style={{ width: "700px" }}
      onHide={onClose}
    >
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <InputText
            placeholder="Company Name"
            value={formState.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          <InputText
            placeholder="Legal Name"
            value={formState.legal_name}
            onChange={(e) => handleChange("legal_name", e.target.value)}
          />
          <InputText
            placeholder="Tax ID"
            value={formState.tax_id}
            onChange={(e) => handleChange("tax_id", e.target.value)}
          />
          <InputText
            placeholder="Website"
            value={formState.website}
            onChange={(e) => handleChange("website", e.target.value)}
          />
          <InputText
            placeholder="Industry"
            value={formState.industry}
            onChange={(e) => handleChange("industry", e.target.value)}
          />
          <Dropdown
            value={formState.company_size}
            options={companySizes}
            onChange={(e) => handleChange("company_size", e.value)}
            placeholder="Company Size"
            className="w-full"
          />
        </div>

        <InputTextarea
          rows={3}
          placeholder="Description"
          value={formState.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="w-full"
        />

<div className="mt-4 border-t pt-4">
  <h4 className="font-semibold mb-2">Primary Contact</h4>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {["first_name", "last_name", "position", "email", "phone", "mobile"].map((field) => (
      <InputText
        key={field}
        placeholder={field
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())}
        value={(formState.contacts[0] as any)[field]}
        onChange={(e) => handleContactChange(0, field as keyof Contact, e.target.value)}
        className="w-full"
      />
    ))}

    <div className="md:col-span-2">
      <InputTextarea
        rows={3}
        placeholder="Notes"
        value={formState.contacts[0].notes}
        onChange={(e) => handleContactChange(0, "notes", e.target.value)}
        className="w-full"
      />
    </div>

    <div className="md:col-span-2">
  <Dropdown
    value={formState.contacts[0].preferred_communication_methods || []}
    options={communicationOptions}
    onChange={(e) => {
      // PrimeReact's multiple dropdown returns an array of values when multiple is true
      handleContactChange(0, "preferred_communication_methods", e.value || []);
    }}
    optionLabel="label"
    optionValue="value"
    multiple
    placeholder="Preferred Communication"
    className="w-full"
  />
</div>
  </div>
</div>

        <div className="mt-4 border-t pt-4">
            <h4 className="font-semibold mb-2">Primary Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                "street_address_1",
                "street_address_2",
                "city",
                "state",
                "postal_code",
                "country",
                ].map((field) => (
                <InputText
                    key={field}
                    placeholder={field
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                    value={(formState.addresses[0] as any)[field]}
                    onChange={(e) => handleAddressChange(field as keyof Address, e.target.value)}
                    className="w-full"
                />
                ))}
            </div>
        </div>


        <div className="flex justify-end mt-4">
          <Button label="Cancel" onClick={onClose} className="p-button-text !bg-red-500" />
          <Button label="Submit" type="submit" loading={isSubmitting} className="ml-2" />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyCompany;
