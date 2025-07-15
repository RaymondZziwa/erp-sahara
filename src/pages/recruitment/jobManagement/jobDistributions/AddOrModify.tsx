import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { RECRUITMENT_ENDPOINTS } from "../../../../api/recruitmentEndpoints";
import useEmployees from "../../../../hooks/hr/useEmployees";
import useJobBoard from "../../../../hooks/recruitment/useJobBoard";
import useJobOrder from "../../../../hooks/recruitment/useJobOrder";
import useAuth from "../../../../hooks/useAuth";
import { createRequest } from "../../../../utils/api";

export interface JobDistribution {
  job_order_id: string;
  job_board_id: string;
  distributed_by: string;
  external_reference_id?: string | null;
  status: "pending" | "active";
  posted_at?: string | null;
  removed_at?: string | null;
  distribution_metadata?: string | null;
  notes?: string | null;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  distribution?: JobDistribution;
  onSave: () => void;
}

const statusOptions = ["pending", "active"];

const AddOrModifyJobDistribution: React.FC<Props> = ({ visible, onClose, distribution, onSave }) => {
  const { data: jobOrders = [] } = useJobOrder();
  const { data: jobBoards = [] } = useJobBoard();
  const { data: employees = [] } = useEmployees();
  const { token, user } = useAuth();

  const [formState, setFormState] = useState<JobDistribution>({
    job_order_id: "",
    job_board_id: "",
    distributed_by: "",
    external_reference_id: "",
    status: "pending",
    posted_at: "",
    removed_at: "",
    distribution_metadata: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const jobOrderOptions = jobOrders.map((order) => ({ label: order.title, value: order.id }));
  const jobBoardOptions = jobBoards.map((board) => ({ label: board.name, value: board.id }));
  const employeeOptions = employees.map((emp) => ({ label: `${emp.first_name} ${emp.last_name}`, value: emp.id }));

  useEffect(() => {
    if (distribution) {
      setFormState({ ...distribution });
    } else if (user) {
      setFormState((prev) => ({ ...prev, distributed_by: user.id }));
    }
  }, [distribution, user]);

  const handleChange = (name: string, value: any) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const method = distribution ? "PUT" : "POST";
    const endpoint = distribution
      ? RECRUITMENT_ENDPOINTS.JOB_DISTRIBUTION.UPDATE(distribution.id)
      : RECRUITMENT_ENDPOINTS.JOB_DISTRIBUTION.ADD;

    await createRequest(endpoint, token.access_token, formState, onSave, method);

    setIsSubmitting(false);
    setFormState({
      job_order_id: "",
      job_board_id: "",
      distributed_by: user?.id ?? "",
      external_reference_id: "",
      status: "pending",
      posted_at: "",
      removed_at: "",
      distribution_metadata: "",
      notes: "",
    });
    onClose();
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button label="Cancel" onClick={onClose} className="p-button-text !bg-red-500" />
      <Button
        label={distribution ? "Update" : "Submit"}
        type="submit"
        form="distribution-form"
        loading={isSubmitting}
      />
    </div>
  );

  return (
    <Dialog
      header={distribution ? "Edit Distribution" : "Add Distribution"}
      visible={visible}
      style={{ width: "700px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="distribution-form" onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>Job Order</label>
            <Dropdown
              value={formState.job_order_id}
              options={jobOrderOptions}
              onChange={(e) => handleChange("job_order_id", e.value)}
              placeholder="Select Job Order"
              className="w-full"
              required
            />
          </div>
          <div>
            <label>Job Board</label>
            <Dropdown
              value={formState.job_board_id}
              options={jobBoardOptions}
              onChange={(e) => handleChange("job_board_id", e.value)}
              placeholder="Select Job Board"
              className="w-full"
              required
            />
          </div>
          <div>
            <label>Distributed By</label>
            <Dropdown
              value={formState.distributed_by}
              options={employeeOptions}
              onChange={(e) => handleChange("distributed_by", e.value)}
              placeholder="Select Employee"
              className="w-full"
              required
            />
          </div>
          <div>
            <label>External Ref ID</label>
            <InputText
              value={formState.external_reference_id ?? ""}
              onChange={(e) => handleChange("external_reference_id", e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label>Status</label>
            <Dropdown
              value={formState.status}
              options={statusOptions}
              onChange={(e) => handleChange("status", e.value)}
              className="w-full"
            />
          </div>
          <div>
            <label>Posted At</label>
            <InputText
              type="datetime-local"
              value={formState.posted_at ?? ""}
              onChange={(e) => handleChange("posted_at", e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label>Removed At</label>
            <InputText
              type="datetime-local"
              value={formState.removed_at ?? ""}
              onChange={(e) => handleChange("removed_at", e.target.value)}
              className="w-full"
            />
          </div>
          {/* <div className="md:col-span-2">
            <label>Metadata (JSON)</label>
            <InputTextarea
              rows={3}
              value={formState.distribution_metadata ?? ""}
              onChange={(e) => handleChange("distribution_metadata", e.target.value)}
              className="w-full"
            />
          </div> */}
          <div className="md:col-span-2">
            <label>Notes</label>
            <InputTextarea
              rows={2}
              value={formState.notes ?? ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyJobDistribution;
