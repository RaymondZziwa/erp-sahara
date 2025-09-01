import React, { useEffect, useState } from "react";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import useAuth from "../../../../hooks/useAuth";
import useEmployees from "../../../../hooks/hr/useEmployees";
import useCompany from "../../../../hooks/recruitment/useCompany";
import useJobOrder from "../../../../hooks/recruitment/useJobOrder";
import { RECRUITMENT_ENDPOINTS } from "../../../../api/recruitmentEndpoints";
import { toast } from "react-toastify";
import { baseURL } from "../../../../utils/api";

interface JobContractTerms {
  id?: string;
  job_order_id: string;
  company_id: string;
  title: string;
  type: "direct-hire" | "contract" | "temp-to-perm" | "master";
  start_date: string;
  end_date: string;
  terms?: string | null;
  payment_terms?: string | null;
  termination_terms?: string | null;
  status: "draft" | "active" | "expired" | "terminated";
  signed_date: string;
  signed_by: string;
  document_path?: File | string | null;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  contract?: JobContractTerms;
  onSave: () => void;
}

const contractTypes = ["direct-hire", "contract", "temp-to-perm", "master"];
const contractStatuses = ["draft", "active", "expired", "terminated"];

const AddOrModifyContractTerms: React.FC<Props> = ({ visible, onClose, contract, onSave }) => {
  const { token, user } = useAuth();
  const { data: jobOrders = [] } = useJobOrder();
  const { data: companies = [] } = useCompany();
  const { data: employees = [] } = useEmployees();

  const [formState, setFormState] = useState<JobContractTerms>({
    job_order_id: "",
    company_id: "",
    title: "",
    type: "direct-hire",
    start_date: "",
    end_date: "",
    terms: "",
    payment_terms: "",
    termination_terms: "",
    status: "draft",
    signed_date: "",
    signed_by: "",
    document_path: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (contract) {
      setFormState(contract);
    } else if (user) {
      setFormState((prev) => ({
        ...prev,
        signed_by: user.id,
        company_id: user.company_id,
      }));
    }
  }, [contract, user]);

  const handleChange = (name: keyof JobContractTerms, value: any) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFormState((prev) => ({ ...prev, document_path: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    const formData = new FormData();
  
    Object.entries(formState).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === "document_path" && value instanceof File) {
          formData.append(key, value);
        } else if (key !== "document_path") {
          formData.append(key, String(value));
        }
      }
    });
  
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          "Content-Type": "multipart/form-data",
        },
      };
  
      let response;
      if (contract?.job_order_id) {
        // Update contract
        response = await axios.post(
          `${baseURL}${RECRUITMENT_ENDPOINTS.CONTRACT_TERMS.UPDATE(contract.id)}`,
          formData,
          config
        );
      } else {
        // Create new contract
        response = await axios.post(
          `${baseURL}${RECRUITMENT_ENDPOINTS.CONTRACT_TERMS.ADD}`,
          formData,
          config
        );
      }
  
      toast.success("Contract terms saved successfully");
      onSave();
      onClose();
        setFormState({
          job_order_id: "",
          company_id: user?.company_id ?? "",
          title: "",
          type: "direct-hire",
          start_date: "",
          end_date: "",
          terms: "",
          payment_terms: "",
          termination_terms: "",
          status: "draft",
          signed_date: "",
          signed_by: user?.id ?? "",
          document_path: null,
        });
    } catch (error) {
      console.error("Error saving contract:", error);
      toast.error("Failed to save contract terms");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const companyOptions = companies.map((c) => ({ label: c.name, value: c.id }));
  const employeeOptions = employees.map((e) => ({
    label: `${e.first_name} ${e.last_name}`,
    value: e.id,
  }));
  const jobOrderOptions = jobOrders.map((e) => ({
    label: e.title,
    value: e.id,
  }));

  const footer = (
    <div className="flex justify-end gap-2">
      <Button 
        label="Cancel" 
        onClick={onClose} 
        className="p-button-text !bg-red-500" 
        disabled={isSubmitting}
      />
      <Button
        label={contract ? "Update" : "Submit"}
        type="submit"
        form="contract-form"
        loading={isSubmitting}
        disabled={isSubmitting}
      />
    </div>
  );

  return (
    <Dialog
      header={contract ? "Edit Contract Terms" : "Add Contract Terms"}
      visible={visible}
      style={{ width: "700px" }}
      footer={footer}
      onHide={onClose}
      modal
    >
      <form id="contract-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>Job Order</label>
            <Dropdown
              value={formState.job_order_id}
              options={jobOrderOptions}
              onChange={(e) => handleChange("job_order_id", e.value)}
              className="w-full"
              placeholder="Select Job Order"
              required
            />
          </div>
          <div>
            <label>Company</label>
            <Dropdown
              value={formState.company_id}
              options={companyOptions}
              onChange={(e) => handleChange("company_id", e.value)}
              className="w-full"
              placeholder="Select Company"
              disabled={!!user?.company_id}
            />
          </div>
          <div>
            <label>Title</label>
            <InputText
              value={formState.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full"
              required
            />
          </div>
          <div>
            <label>Contract Type</label>
            <Dropdown
              value={formState.type}
              options={contractTypes.map(type => ({ label: type, value: type }))}
              onChange={(e) => handleChange("type", e.value)}
              className="w-full"
            />
          </div>
          <div>
            <label>Start Date</label>
            <InputText
              type="date"
              value={formState.start_date}
              onChange={(e) => handleChange("start_date", e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label>End Date</label>
            <InputText
              type="date"
              value={formState.end_date}
              onChange={(e) => handleChange("end_date", e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label>Status</label>
            <Dropdown
              value={formState.status}
              options={contractStatuses.map(status => ({ label: status, value: status }))}
              onChange={(e) => handleChange("status", e.value)}
              className="w-full"
            />
          </div>
          <div>
            <label>Signed Date</label>
            <InputText
              type="date"
              value={formState.signed_date}
              onChange={(e) => handleChange("signed_date", e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label>Signed By</label>
            <Dropdown
              value={formState.signed_by}
              options={employeeOptions}
              onChange={(e) => handleChange("signed_by", e.value)}
              className="w-full"
            />
          </div>
          <div>
            <label>Upload Document</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            {contract?.document_path && typeof contract.document_path === 'string' && (
              <div className="text-sm mt-1">
                Current file: {contract.document_path.split('/').pop()}
              </div>
            )}
          </div>
        </div>

        <div>
          <label>Terms</label>
          <InputTextarea
            value={formState.terms ?? ""}
            onChange={(e) => handleChange("terms", e.target.value)}
            rows={2}
            className="w-full"
          />
        </div>
        <div>
          <label>Payment Terms</label>
          <InputTextarea
            value={formState.payment_terms ?? ""}
            onChange={(e) => handleChange("payment_terms", e.target.value)}
            rows={2}
            className="w-full"
          />
        </div>
        <div>
          <label>Termination Terms</label>
          <InputTextarea
            value={formState.termination_terms ?? ""}
            onChange={(e) => handleChange("termination_terms", e.target.value)}
            rows={2}
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyContractTerms;