import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RootState } from "../../../redux/store";
import { baseURL } from "../../../utils/api";
import useEmployees from "../../../hooks/hr/useEmployees";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

interface Props {
  setIsModalOpen: (val: boolean) => void;
  refresh: () => void;
  levelId: number;
}

const AddStaffToApprovalLevelModal: React.FC<Props> = ({
  setIsModalOpen,
  refresh,
  levelId,
}) => {
  const token = useSelector(
    (state: RootState) => state.userAuth.token.access_token
  );
  const { data: emp } = useEmployees();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    approver_id: "",
    rank: 0,
    approver_title: "",
    description: "",
  });

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRole = async () => {
    if (!formData.approver_id) {
      toast.error("Staff is required!");
      return;
    }

    try {
      const payload = { approvers: [formData] };
      setIsSubmitting(true);

      const response = await axios.post(
        `${baseURL}/accounts/approval-level/${levelId}/add_approver`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        refresh();
        toast.success("Staff added successfully!");
        setFormData({
          approver_id: "",
          rank: 0,
          approver_title: "",
          description: "",
        });
        setIsModalOpen(false);
      } else {
        toast.error(response.data.message || "Failed to add staff");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while adding the staff.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      header="Add Staff to Approval Level"
      visible
      style={{ width: "450px" }} // reduced width
      modal
      className="p-fluid"
      onHide={() => setIsModalOpen(false)}
    >
      {/* Staff Selector */}
      <div className="field">
        <label htmlFor="approver_id">Select Staff</label>
        <Dropdown
          id="approver_id"
          value={formData.approver_id}
          options={emp?.map((user) => ({
            label: `${user.first_name} ${user.last_name}`,
            value: user.id,
          }))}
          onChange={(e) => handleInputChange("approver_id", e.value)}
          placeholder="Select staff"
          className="w-full"
        />
      </div>

      {/* Rank Selector */}
      <div className="field">
        <label htmlFor="rank">Select Rank</label>
        <Dropdown
          id="rank"
          value={formData.rank}
          options={[
            { label: "1", value: 1 },
            { label: "2", value: 2 },
            { label: "3", value: 3 },
          ]}
          onChange={(e) => handleInputChange("rank", e.value)}
          placeholder="Select rank"
          className="w-full"
        />
      </div>

      {/* Approver Title */}
      <div className="field">
        <label htmlFor="approver_title">Approver Title</label>
        <InputText
          id="approver_title"
          value={formData.approver_title}
          onChange={(e) => handleInputChange("approver_title", e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="field">
        <label htmlFor="description">Description</label>
        <InputText
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
        />
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-2 mt-4">
        <Button
          label="Cancel"
          icon="pi pi-times"
          className="p-button-text"
          style={{
            backgroundColor: "#adb5bd",
            borderColor: "#adb5bd"
        }}
          onClick={() => setIsModalOpen(false)}
        />
        <Button
          label={isSubmitting ? "Adding..." : "Add Staff"}
          icon="pi pi-check"
          className="p-button-sm p-button-success"
          loading={isSubmitting}
          onClick={handleAddRole}
        />
      </div>
    </Dialog>
  );
};

export default AddStaffToApprovalLevelModal;
