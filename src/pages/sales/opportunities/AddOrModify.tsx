import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import useAuth from "../../../hooks/useAuth";
import { createRequest } from "../../../utils/api";
import { Opportunity } from "../../../redux/slices/types/sales/Opportunities";
import { SALES_ENDPOINTS } from "../../../api/salesEndpoints";
import useLeads from "../../../hooks/sales/useLeads";
import useEmployees from "../../../hooks/hr/useEmployees";

interface AddOrModifyOpportunityProps {
  visible: boolean;
  onClose: () => void;
  opportunity?: Opportunity & { id?: string | number };
  onSave: () => void;
}

const stageOptions = [
  { label: "Initial", value: "initial" },
  { label: "Negotiation", value: "negotiation" },
  { label: "Proposal", value: "proposal" },
  { label: "Closed Won", value: "closed_won" },
  { label: "Closed Lost", value: "closed_lost" },
];

const AddOrModifyOpportunity: React.FC<AddOrModifyOpportunityProps> = ({
  visible,
  onClose,
  opportunity,
  onSave,
}) => {
  const { token } = useAuth();
  const { data: leads } = useLeads()
  const {data: employees} = useEmployees()

  const [formData, setFormData] = useState<Opportunity>({
    lead_id: null,
    assigned_to: null,
    title: "",
    description: "",
    value: "",
    stage: "new",
    expected_close_date: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (opportunity) {
      setFormData({
        lead_id: opportunity.lead_id ?? null,
        assigned_to: opportunity.assigned_to ?? null,
        title: opportunity.title,
        description: opportunity.description ?? "",
        value: opportunity.value ?? "",
        stage: opportunity.stage,
        expected_close_date: opportunity.expected_close_date ?? null,
      });
    } else {
      setFormData({
        lead_id: null,
        assigned_to: null,
        title: "",
        description: "",
        value: "",
        stage: "new",
        expected_close_date: null,
      });
    }
  }, [opportunity]);

  const handleChange = (name: keyof Opportunity, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const endpoint = opportunity?.id
      ? SALES_ENDPOINTS.OPPORTUNITIES.UPDATE(opportunity.id)
      : SALES_ENDPOINTS.OPPORTUNITIES.ADD;

    const method = opportunity?.id ? "PUT" : "POST";
    await createRequest(endpoint, token.access_token, formData, onSave, method);

    setIsSubmitting(false);
    onSave();
    onClose();
    setFormData({
      lead_id: null,
      assigned_to: null,
      title: "",
      description: "",
      value: "",
      stage: "new",
      expected_close_date: null,
    })
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
        label={opportunity ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="opportunity-form"
        loading={isSubmitting}
        disabled={isSubmitting}
      />
    </div>
  );

  return (
    <Dialog
      header={opportunity ? "Edit Opportunity" : "Add Opportunity"}
      visible={visible}
      style={{ width: "600px" }}
      footer={footer}
      onHide={onClose}
    >
      <p className="mb-4 text-sm text-gray-600">
        Fields marked with <span className="text-red-500">*</span> are required.
      </p>
      <form id="opportunity-form" onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <InputText
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Title *"
          required
          className="w-full p-inputtext-sm"
        />
        <Dropdown
          value={formData.stage}
          options={stageOptions}
          onChange={(e) => handleChange("stage", e.value)}
          placeholder="Stage *"
          required
          className="w-full p-inputtext-sm"
        />
        <Dropdown
          value={formData.lead_id ?? ""}
          options={leads.map((l) => ({
            label: l.name,
            value: l.id,
          }))}          
          onChange={(e) => handleChange("lead_id", e.value)}
          placeholder="Lead *"
          required
          className="w-full p-inputtext-sm"
        />
        <Dropdown
          value={formData.assigned_to ?? ""}
          options={employees.map((emp) => ({
            label: `${emp.first_name} ${emp.last_name}`,
            value: emp.id,
          }))}          
          onChange={(e) => handleChange("assigned_to", e.value)}
          placeholder="Assigned to *"
          required
          className="w-full p-inputtext-sm"
        />
       
        <InputText
          value={formData.value ?? ""}
          onChange={(e) => handleChange("value", e.target.value)}
          placeholder="Value (e.g. 200000)"
          className="w-full p-inputtext-sm"
        />
        <Calendar
          value={formData.expected_close_date ? new Date(formData.expected_close_date) : null}
          onChange={(e) =>
            handleChange(
              "expected_close_date",
              e.value ? e.value.toISOString().split("T")[0] : null
            )
          }
          placeholder="Expected Close Date"
          dateFormat="yy-mm-dd"
          className="w-full p-inputtext-sm"
        />
        <div className="col-span-2">
          <InputTextarea
            rows={3}
            value={formData.description ?? ""}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Description"
            className="w-full p-inputtext-sm"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyOpportunity;
