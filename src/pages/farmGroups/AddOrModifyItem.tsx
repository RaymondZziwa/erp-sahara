import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { createRequest } from "../../utils/api";
import useAuth from "../../hooks/useAuth";
import { FarmGroup, Customer } from "../../redux/slices/types/farmGroups/FarmGroup";
import { FARM_GROUPS_ENDPOINTS } from "../../api/farmGroupsEndpoints";

interface AddOrModifyFarmGroupProps {
  visible: boolean;
  onClose: () => void;
  item?: FarmGroup;
  onSave: () => void;
}

const AddOrModifyFarmGroup: React.FC<AddOrModifyFarmGroupProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<FarmGroup>>({
    number_of_members: 0,
    description: "",
    customer: {
      organization_name: "",
      email: "",
      industry: "Farming",
      organization_type: "Farmers Group",
      primary_contact_person: "",
      phone_number: "",
      headquarters_address: "",
      credit_limit: "0.00",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        number_of_members: item.number_of_members,
        description: item.description || "",
        customer: {
          ...item.customer,
          credit_limit: item.customer.credit_limit || "0.00",
        },
      });
    } else {
      setFormState({
        number_of_members: 0,
        description: "",
        customer: {
          organization_name: "",
          email: "",
          industry: "Farming",
          organization_type: "Farmers Group",
          primary_contact_person: "",
          phone_number: "",
          headquarters_address: "",
          credit_limit: "0.00",
        },
      });
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name.startsWith("customer.")) {
      const customerField = name.split(".")[1];
      setFormState(prev => ({
        ...prev,
        customer: {
          ...prev.customer!,
          [customerField]: value
        }
      }));
    } else {
      setFormState(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    // Validate required fields
    if (!formState.customer?.organization_name || !formState.customer?.industry || (formState.number_of_members ?? 0) <= 0) {
      alert("Please fill in all required fields: Organization Name, Industry, and Number of Members.");
      setIsSubmitting(false);
      return;
    }
  
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? FARM_GROUPS_ENDPOINTS.FARM_GROUPS.UPDATE(item.id.toString())
      : FARM_GROUPS_ENDPOINTS.FARM_GROUPS.ADD;
  
    // Prepare payload
    const payload = {
      number_of_members: Number(formState.number_of_members),
      description: formState.description,
      organization_name: formState.customer?.organization_name,
      email: formState.customer?.email,
      industry: formState.customer?.industry,
      primary_contact_person: formState.customer?.primary_contact_person,
      phone_number: formState.customer?.phone_number,
      headquarters_address: formState.customer?.headquarters_address,
      credit_limit: formState.customer?.credit_limit,
      payment_terms: formState.customer?.payment_terms,
      bank_details: formState.customer?.bank_details,
      tax_identification_number: formState.customer?.tax_identification_number,
    };
  
    console.log("Submitting payload:", payload); // Debug log
  
    try {
      const response = await createRequest(endpoint, token.access_token, payload, onSave, method);
      console.log("API Response:", response); // Debug log
      onSave();
      onClose();
    } catch (error) {
      console.error("API Error:", error); // Debug log
      alert("Whoops! Something went wrong. We could not save farm group details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
        form="farmgroup-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Farm Group" : "Add Farm Group"}
      visible={visible}
      style={{ width: "600px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="farmgroup-form" onSubmit={handleSave} className="p-fluid grid grid-cols-1 gap-4">
        {/* Customer Fields */}
        <div className="p-field">
          <label htmlFor="customer.organization_name">Organization Name*</label>
          <InputText
            id="customer.organization_name"
            name="customer.organization_name"
            value={formState.customer?.organization_name || ""}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="p-field">
          <label htmlFor="customer.industry">Industry*</label>
          <InputText
            id="customer.industry"
            name="customer.industry"
            value={formState.customer?.industry || ""}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="p-field">
          <label htmlFor="number_of_members">Number of Members*</label>
          <InputText
            id="number_of_members"
            name="number_of_members"
            type="number"
            value={formState.number_of_members?.toString() || "0"}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="p-field">
          <label htmlFor="customer.primary_contact_person">Primary Contact</label>
          <InputText
            id="customer.primary_contact_person"
            name="customer.primary_contact_person"
            value={formState.customer?.primary_contact_person || ""}
            onChange={handleInputChange}
          />
        </div>

        <div className="p-field">
          <label htmlFor="customer.phone_number">Phone Number</label>
          <InputText
            id="customer.phone_number"
            name="customer.phone_number"
            value={formState.customer?.phone_number || ""}
            onChange={handleInputChange}
          />
        </div>

        <div className="p-field">
          <label htmlFor="customer.email">Email</label>
          <InputText
            id="customer.email"
            name="customer.email"
            value={formState.customer?.email || ""}
            onChange={handleInputChange}
          />
        </div>

        <div className="p-field">
          <label htmlFor="customer.credit_limit">Credit Limit</label>
          <InputText
            id="customer.credit_limit"
            name="customer.credit_limit"
            type="number"
            step="0.01"
            value={formState.customer?.credit_limit || "0.00"}
            onChange={handleInputChange}
          />
        </div>

        <div className="p-field">
          <label htmlFor="description">Description</label>
          <InputTextarea
            id="description"
            name="description"
            value={formState.description || ""}
            onChange={handleInputChange}
            rows={3}
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyFarmGroup;