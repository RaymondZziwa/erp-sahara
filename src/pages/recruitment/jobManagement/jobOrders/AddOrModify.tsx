import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import useEmployees from "../../../../hooks/hr/useEmployees";
import { RECRUITMENT_ENDPOINTS } from "../../../../api/recruitmentEndpoints";
import useCompany from "../../../../hooks/recruitment/useCompany";
import useAuth from "../../../../hooks/useAuth";
import { createRequest } from "../../../../utils/api";

export interface JobPosting {
  company_id: string;
  manager_id: string;
  title: string;
  job_reference: string;
  description: string;
  requirements: string;
  employment_type: "full-time" | "part-time" | "contract" | "internship";
  priority: "low" | "medium" | "high";
  status: "open" | "closed" | "paused";
  positions: number;
  positions_filled: number;
  start_date: string;
  end_date: string;
  deadline: string;
  location_type: "onsite" | "remote" | "hybrid";
  location_details: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  item?: JobPosting;
  onSave: () => void;
}

const employmentTypes = ["full-time", "part-time", "contract", "internship"];
const priorities = ["low", "medium", "high"];
const statuses = ["open", "closed", "paused"];
const locationTypes = ["onsite", "remote", "hybrid"];

const AddOrModifyJobOrder: React.FC<Props> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const { data: employees = [] } = useEmployees();
  const { data: companies = [] } = useCompany();
  const { token, user } = useAuth();

  const [formState, setFormState] = useState<JobPosting>({
    company_id: "",
    manager_id: "",
    title: "",
    job_reference: "",
    description: "",
    requirements: "",
    employment_type: "full-time",
    priority: "medium",
    status: "open",
    positions: 1,
    positions_filled: 0,
    start_date: "",
    end_date: "",
    deadline: "",
    location_type: "onsite",
    location_details: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const employeeOptions = employees.map((emp) => ({
    label: `${emp.first_name} ${emp.last_name}`,
    value: emp.id,
  }));

  const companyOptions = companies.map((comp) => ({
    label: comp.name,
    value: comp.id,
  }));

  useEffect(() => {
    if (item) {
      setFormState({ ...item });
    } else if (user) {
      setFormState((prev) => ({
        ...prev,
        manager_id: user.id,
        company_id: user.company_id,
      }));
    }
  }, [item, user]);

  const handleChange = (name: string, value: any) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? RECRUITMENT_ENDPOINTS.JOB_ORDERS.UPDATE(item?.id)
      : RECRUITMENT_ENDPOINTS.JOB_ORDERS.ADD;
  
    await createRequest(endpoint, token.access_token, formState, onSave, method);
  
    setIsSubmitting(false);
  
    // Reset form state to initial values
    setFormState({
      company_id: "",
      manager_id: "",
      title: "",
      job_reference: "",
      description: "",
      requirements: "",
      employment_type: "full-time",
      priority: "medium",
      status: "open",
      positions: 1,
      positions_filled: 0,
      start_date: "",
      end_date: "",
      deadline: "",
      location_type: "onsite",
      location_details: "",
    });
  
    onClose();
  };
  
  const footer = (
    <div className="flex justify-end gap-2">
      <Button label="Cancel" onClick={onClose} className="p-button-text !bg-red-500" />
      <Button
        label={item?.id ? "Update" : "Submit"}
        type="submit"
        form="job-form"
        loading={isSubmitting}
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Job Order" : "Add Job Order"}
      visible={visible}
      style={{ width: "750px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="job-form" onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>Company</label>
            <Dropdown
              value={formState.company_id}
              options={companyOptions}
              onChange={(e) => handleChange("company_id", e.value)}
              placeholder="Select Company"
              className="w-full"
              required
            />
          </div>
          <div>
            <label>Hiring Manager</label>
            <Dropdown
              value={formState.manager_id}
              options={employeeOptions}
              onChange={(e) => handleChange("manager_id", e.value)}
              placeholder="Select Manager"
              className="w-full"
              required
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
            <label>Job Reference</label>
            <InputText
              value={formState.job_reference}
              onChange={(e) => handleChange("job_reference", e.target.value)}
              className="w-full"
              required
              disabled={!!item?.job_reference}
            />
          </div>
          <div>
            <label>Employment Type</label>
            <Dropdown
              options={employmentTypes}
              value={formState.employment_type}
              onChange={(e) => handleChange("employment_type", e.value)}
              className="w-full"
            />
          </div>
          <div>
            <label>Priority</label>
            <Dropdown
              options={priorities}
              value={formState.priority}
              onChange={(e) => handleChange("priority", e.value)}
              className="w-full"
            />
          </div>
          <div>
            <label>Status</label>
            <Dropdown
              options={statuses}
              value={formState.status}
              onChange={(e) => handleChange("status", e.value)}
              className="w-full"
            />
          </div>
          <div>
            <label>Positions</label>
            <InputNumber
              value={formState.positions}
              onValueChange={(e) => handleChange("positions", e.value ?? 0)}
              className="w-full"
            />
          </div>
          <div>
            <label>Positions Filled</label>
            <InputNumber
              value={formState.positions_filled}
              onValueChange={(e) => handleChange("positions_filled", e.value ?? 0)}
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
            <label>Deadline</label>
            <InputText
              type="date"
              value={formState.deadline}
              onChange={(e) => handleChange("deadline", e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label>Location Type</label>
            <Dropdown
              options={locationTypes}
              value={formState.location_type}
              onChange={(e) => handleChange("location_type", e.value)}
              className="w-full"
            />
          </div>
          <div>
            <label>Location Details</label>
            <InputText
              value={formState.location_details}
              onChange={(e) => handleChange("location_details", e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        <div>
          <label>Description</label>
          <InputTextarea
            rows={3}
            value={formState.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label>Requirements</label>
          <InputTextarea
            rows={3}
            value={formState.requirements}
            onChange={(e) => handleChange("requirements", e.target.value)}
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyJobOrder;
