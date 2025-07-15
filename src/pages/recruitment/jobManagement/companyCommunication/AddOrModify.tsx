import React, { useEffect, useState } from "react";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { toast } from "react-toastify";
import useAuth from "../../../../hooks/useAuth";
import useCompany from "../../../../hooks/recruitment/useCompany";
import useEmployees from "../../../../hooks/hr/useEmployees";
import useJobOrder from "../../../../hooks/recruitment/useJobOrder";
import { RECRUITMENT_ENDPOINTS } from "../../../../api/recruitmentEndpoints";
import { baseURL } from "../../../../utils/api";

interface CompanyInteraction {
  id?: string;
  company_id: string;
  company_contact_id?: string | null;
  job_order_id?: string | null;
  initiated_by?: string | null;
  type: "email" | "call" | "meeting" | "note" | "document";
  subject: string;
  content: string;
  direction: "inbound" | "outbound";
  date_time: string;
  needs_follow_up: boolean;
  follow_up_date?: string;
  follow_up_notes?: string;
  metadata?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  interaction?: CompanyInteraction;
  onSave: () => void;
}

const typeOptions = ["email", "call", "meeting", "note", "document"];
const directionOptions = ["inbound", "outbound"];

const AddOrModifyCompanyCommunication: React.FC<Props> = ({
  visible,
  onClose,
  interaction,
  onSave,
}) => {
  const { token, user } = useAuth();
  const { data: companies = [] } = useCompany();
  const { data: jobOrders = [] } = useJobOrder();
  const { data: employees = [] } = useEmployees();

  const [formState, setFormState] = useState<CompanyInteraction>({
    company_id: "",
    company_contact_id: null,
    job_order_id: null,
    initiated_by: user?.id ?? null,
    type: "call",
    subject: "",
    content: "",
    direction: "inbound",
    date_time: "",
    needs_follow_up: false,
    follow_up_date: "",
    follow_up_notes: "",
    metadata: "",
  });

  const [metadataFields, setMetadataFields] = useState<{ call_duration?: string; recording_url?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyContacts, setCompanyContacts] = useState<Array<{id: string, label: string}>>([]);

  useEffect(() => {
    if (interaction) {
      // Create a copy of the interaction and ensure boolean values are properly set
      const interactionCopy = { 
        ...interaction,
        initiated_by: interaction?.initiated_by?.id || null,
        needs_follow_up: Boolean(interaction.needs_follow_up) // Ensure this is a boolean
      };
      setFormState(interactionCopy);
      
      try {
        const meta = interaction.metadata ? JSON.parse(interaction.metadata) : {};
        setMetadataFields(meta);
      } catch {
        setMetadataFields({});
      }
    } else if (user) {
      setFormState((prev) => ({
        ...prev,
        initiated_by: user.id,
      }));
      setMetadataFields({});
    }
  }, [interaction, user]);

  // Load contacts when company is selected
  useEffect(() => {
    if (formState.company_id) {
      const selectedCompany = companies.find(c => c.id === formState.company_id);
      if (selectedCompany && selectedCompany.contacts) {
        const contactsOptions = selectedCompany.contacts.map(contact => ({
          label: `${contact.first_name} ${contact.last_name}`,
          value: contact.id
        }));
        setCompanyContacts(contactsOptions);
        
        // If there's a primary contact, select it by default
        const primaryContact = selectedCompany.contacts.find(c => c.is_primary);
        if (primaryContact) {
          handleChange("company_contact_id", primaryContact.id);
        }
      } else {
        setCompanyContacts([]);
        handleChange("company_contact_id", null);
      }
    } else {
      setCompanyContacts([]);
      handleChange("company_contact_id", null);
    }
  }, [formState.company_id, companies]);

  const handleChange = (name: keyof CompanyInteraction, value: any) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleMetadataChange = (field: keyof typeof metadataFields, value: string) => {
    setMetadataFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...formState,
      metadata: JSON.stringify(metadataFields),
    };

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      };

      if (interaction?.id) {
        await axios.put(
          `${baseURL}${RECRUITMENT_ENDPOINTS.COMPANY_COMMUNICATIONS.UPDATE(interaction.id)}`,
          payload,
          config
        );
      } else {
        await axios.post(
          `${baseURL}${RECRUITMENT_ENDPOINTS.COMPANY_COMMUNICATIONS.ADD}`,
          payload,
          config
        );
      }

      toast.success("Communication saved successfully");
      onSave();
        onClose();
        setFormState({
            company_id: "",
            company_contact_id: null,
            job_order_id: null,
            initiated_by: user?.id ?? null,
            type: "call",
            subject: "",
            content: "",
            direction: "inbound",
            date_time: "",
            needs_follow_up: false,
            follow_up_date: "",
            follow_up_notes: "",
            metadata: "",
        })
    } catch (error) {
      console.error("Failed to save communication:", error);
      toast.error("Failed to save communication");
    } finally {
      setIsSubmitting(false);
    }
  };

  const companyOptions = companies.map((c) => ({ label: c.name, value: c.id }));
  const jobOrderOptions = jobOrders.map((j) => ({ label: j.title, value: j.id }));
  const employeeOptions = employees.map((e) => ({
    label: `${e.first_name} ${e.last_name}`,
    value: e.id,
  }));

  const footer = (
    <div className="flex justify-end gap-2">
      <Button label="Cancel" onClick={onClose} className="p-button-text !bg-red-500" disabled={isSubmitting} />
      <Button
        label={interaction ? "Update" : "Submit"}
        type="submit"
        form="comm-form"
        loading={isSubmitting}
        disabled={isSubmitting}
      />
    </div>
  );

  return (
    <Dialog
      header={interaction ? "Edit Communication" : "Add Communication"}
      visible={visible}
      style={{ width: "700px" }}
      footer={footer}
      onHide={onClose}
      modal
    >
      <form id="comm-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>Company</label>
            <Dropdown
              value={formState.company_id}
              options={companyOptions}
              onChange={(e) => handleChange("company_id", e.value)}
              className="w-full"
              placeholder="Select Company"
              required
            />
          </div>

          <div>
            <label>Company Contact</label>
            <Dropdown
              value={formState.company_contact_id}
              options={companyContacts}
              onChange={(e) => handleChange("company_contact_id", e.value)}
              className="w-full"
              placeholder="Select Contact"
              showClear
            />
          </div>

          <div>
            <label>Job Order (Optional)</label>
            <Dropdown
              value={formState.job_order_id}
              options={jobOrderOptions}
              onChange={(e) => handleChange("job_order_id", e.value)}
              className="w-full"
              placeholder="Select Job Order"
              showClear
            />
          </div>

          <div>
            <label>Type</label>
            <Dropdown
              value={formState.type}
              options={typeOptions.map((t) => ({ label: t, value: t }))}
              onChange={(e) => handleChange("type", e.value)}
              className="w-full"
              required
            />
          </div>

          <div>
            <label>Direction</label>
            <Dropdown
              value={formState.direction}
              options={directionOptions.map((d) => ({ label: d, value: d }))}
              onChange={(e) => handleChange("direction", e.value)}
              className="w-full"
              required
            />
          </div>

          <div>
            <label>Date & Time</label>
            <InputText
              type="datetime-local"
              value={formState.date_time}
              onChange={(e) => handleChange("date_time", e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div>
          <label>Needs Follow-Up?</label>
          <Dropdown
            value={formState.needs_follow_up}
            options={[
              { label: "Yes", value: true },
              { label: "No", value: false },
            ]}
            onChange={(e) => handleChange("needs_follow_up", e.value)}
            className="w-full"
            placeholder="Select option"
            valueTemplate={(option) => (
              <span>{option?.value === true ? "Yes" : option?.value === false ? "No" : ""}</span>
            )}
          />
        </div>

          {formState.needs_follow_up && (
            <>
              <div>
                <label>Follow Up Date</label>
                <InputText
                  type="datetime-local"
                  value={formState.follow_up_date ?? ""}
                  onChange={(e) => handleChange("follow_up_date", e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label>Follow Up Notes</label>
                <InputTextarea
                  value={formState.follow_up_notes ?? ""}
                  onChange={(e) => handleChange("follow_up_notes", e.target.value)}
                  rows={2}
                  className="w-full"
                />
              </div>
            </>
          )}

          <div>
            <label>Initiated By</label>
            <Dropdown
              value={formState.initiated_by}
              options={employeeOptions}
              onChange={(e) => handleChange("initiated_by", e.value)}
              className="w-full"
              placeholder="Select Employee"
              required
            />
          </div>
        </div>

        <div>
          <label>Subject</label>
          <InputText
            value={formState.subject}
            onChange={(e) => handleChange("subject", e.target.value)}
            className="w-full"
            required
          />
        </div>

        <div>
          <label>Content</label>
          <InputTextarea
            value={formState.content}
            onChange={(e) => handleChange("content", e.target.value)}
            rows={3}
            className="w-full"
            required
          />
        </div>

        {/* Metadata Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>Call Duration</label>
            <InputText
              value={metadataFields.call_duration ?? ""}
              onChange={(e) => handleMetadataChange("call_duration", e.target.value)}
              className="w-full"
              placeholder="e.g. 15min"
            />
          </div>
          <div>
            <label>Recording URL</label>
            <InputText
              value={metadataFields.recording_url ?? ""}
              onChange={(e) => handleMetadataChange("recording_url", e.target.value)}
              className="w-full"
              placeholder="https://example.com/recording"
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyCompanyCommunication;