import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import useAuth from "../../../../hooks/useAuth";
import useApplicants from "../../../../hooks/recruitment/useApplicants";
import { createRequest } from "../../../../utils/api";
import { RECRUITMENT_ENDPOINTS } from "../../../../api/recruitmentEndpoints";
import useCurrencies from "../../../../hooks/procurement/useCurrencies";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  item?: any;
}

const payFrequencyOptions = [
  { label: "Weekly", value: "weekly" },
  { label: "Bi-weekly", value: "bi-weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Annually", value: "annually" },
];

const offerStatusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },
  { label: "Withdrawn", value: "withdrawn" },
];

const AddOrModifyOffer: React.FC<Props> = ({ visible, onClose, onSave, item }) => {
  const { token } = useAuth();
  const { data: applicants = [] } = useApplicants();
  const { data: currencies = [] } = useCurrencies();

  const [form, setForm] = useState<any>({
    application_id: "",
    offer_number: "",
    salary: null,
    currency_id: "", // Default currency
    pay_frequency: "monthly",
    start_date: null,
    benefits: "",
    notes: "",
    status: "draft",
    document_path: "",
  });

  const [documentFile, setDocumentFile] = useState<File | null>(null);

  useEffect(() => {
    if (item) {
      setForm({
        ...item,
        start_date: item.start_date ? new Date(item.start_date) : null,
      });
    } else {
      setForm({
        application_id: "",
        offer_number: "",
        salary: null,
        currency_id: "USD",
        pay_frequency: "monthly",
        start_date: null,
        benefits: "",
        notes: "",
        status: "draft",
        document_path: "",
      });
      setDocumentFile(null);
    }
  }, [item]);

  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      
      // Append all form fields to FormData
      Object.keys(form).forEach(key => {
        if (key === 'start_date' && form[key]) {
          formData.append(key, form[key].toISOString().split('T')[0]);
        } else if (form[key] !== null && form[key] !== undefined) {
          formData.append(key, form[key]);
        }
      });

      // Append the document file if it exists
      if (documentFile) {
        formData.append('document', documentFile);
      }

      const isEdit = !!item?.id;
      const endpoint = isEdit 
        ? RECRUITMENT_ENDPOINTS.OFFER.UPDATE(item.id)
        : RECRUITMENT_ENDPOINTS.OFFER.ADD;
      const method = isEdit ? "PUT" : "POST";

      await createRequest(
        endpoint,
        token.access_token,
        formData,
        () => {
          onSave();
          onClose();
        },
        method,
        true // Set to true for FormData
      );

    } catch (error) {
      console.error("Error saving offer:", error);
      // Add error notification here
    }
  };

  return (
    <Dialog 
      header={item?.id ? "Edit Job Offer" : "Create Job Offer"} 
      visible={visible} 
      style={{ width: "700px" }} 
      onHide={onClose}
    >
      <div className="space-y-4">
        {/* General Fields in 2-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Dropdown
            value={form.application_id}
            options={applicants.map((a) => ({ 
              label: a.candidate?.user?.full_name || `Applicant ${a.id}`, 
              value: a.id 
            }))}
            onChange={(e) => handleChange("application_id", e.value)}
            placeholder="Select Application"
            className="w-full"
          />
          <Dropdown
            value={form.status}
            options={offerStatusOptions}
            onChange={(e) => handleChange("status", e.value)}
            placeholder="Offer Status"
            className="w-full"
          />

          {/* <InputText
            value={form.offer_number}
            onChange={(e) => handleChange("offer_number", e.target.value)}
            placeholder="Offer Number"
            className="w-full"
          /> */}
          <InputNumber
            value={form.salary}
            onValueChange={(e) => handleChange("salary", e.value)}
            placeholder="Salary"
            className="w-full"
            mode="currency"
            currency="USD"
            minFractionDigits={2}
          />

          <Dropdown
            value={form.currency_id}
            options={currencies.map((c) => ({ label: c.name, value: c.id }))}
            onChange={(e) => handleChange("currency_id", e.value)}
            placeholder="Currency"
            className="w-full"
          />
          <Dropdown
            value={form.pay_frequency}
            options={payFrequencyOptions}
            onChange={(e) => handleChange("pay_frequency", e.value)}
            placeholder="Pay Frequency"
            className="w-full"
          />

          <Calendar
            value={form.start_date}
            onChange={(e) => handleChange("start_date", e.value)}
            dateFormat="yy-mm-dd"
            showIcon
            className="w-full"
            placeholder="Start Date"
          />
          <div className="field">
            <label htmlFor="document" className="block text-sm font-medium mb-1">
              Offer Document
            </label>
            <input
              type="file"
              id="document"
              onChange={handleFileChange}
              className="w-full"
              accept=".pdf,.doc,.docx"
            />
          </div>
        </div>

        {/* Benefits */}
        <InputText
          value={form.benefits}
          onChange={(e) => handleChange("benefits", e.target.value)}
          placeholder="Benefits (comma separated)"
          className="w-full"
        />

        {/* Notes - Full width */}
        <InputTextarea
          value={form.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Notes"
          className="w-full"
          rows={4}
        />

        {/* Submit */}
        <div className="flex justify-end mt-4">
          <Button label="Submit" onClick={handleSubmit} />
        </div>
      </div>
    </Dialog>
  );
};

export default AddOrModifyOffer;