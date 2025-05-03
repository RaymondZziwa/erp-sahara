import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import axios from "axios";
import { baseURL } from "../../../utils/api";
import { RootState } from "../../../redux/store";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Budget } from "../../../redux/slices/types/budgets/Budget";
import { Dropdown } from "primereact/dropdown";
import projects from "../../projects/projects";
import useProjects from "../../../hooks/projects/useProjects";

interface Props {
  visible: boolean;
  onHide: () => void;
  allocation: any;
  budgetId: string;
  budget: Budget;
  refresh: () => void;
}

const BudgetAllocationEditModal: React.FC<Props> = ({
  visible,
  onHide,
  allocation,
  budgetId,
  budget,
  refresh,
}) => {
  const token = useSelector(
    (state: RootState) => state.userAuth.token.access_token
  );
  const { data: projects, refresh: getProjects } = useProjects();
  const [activities, setActivities] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    project_id: "",
    activity_id: "",
    allocated_amount: null,
    description: "",
  });

  useEffect(() => {
    if (allocation) {
      setFormData({
        name: allocation.name || "",
        project_id: allocation.project_id || "",
        activity_id: allocation.activity_id || "",
        allocated_amount: allocation.allocated_amount || null,
        description: allocation.description || "",
      });
    }
  }, [allocation]);

  const handleChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.put(
        `${baseURL}/accounts/budgets/${budgetId}/budgetallocations/${allocation.id}/update`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Allocation updated successfully!");
        refresh();
        onHide();
      } else {
        toast.error("Failed to update allocation.");
      }
    } catch (error) {
      console.error("Error updating allocation:", error);
      toast.error("An error occurred while updating.");
    }
  };

  return (
    <Dialog header="Edit Budget Allocation" visible={visible} onHide={onHide}>
      <div className="p-fluid space-y-4">
        <div className="p-field">
          <label className="font-semibold">
            Name <span className="text-red-500">*</span>
          </label>
          <InputText
            value={formData.name}
            onChange={(e) => handleChange(e, "name")}
            required
          />
        </div>
        <div className="p-field">
          <label>Project</label>
          <Dropdown
            placeholder="Select Project"
            value={formData.project_id}
            options={projects.map((proj) => ({
              label: proj.name,
              value: proj.id,
            }))}
            onChange={(e) => handleChange("project_id", e.value)}
            filter
            showClear
          />
        </div>
        <div className="p-field">
          <label>Activity</label>
          <Dropdown
            placeholder="Select Activity"
            value={formData.activity_id}
            options={activities.map((act) => ({
              label: act.name,
              value: act.id,
            }))}
            onChange={(e) => handleChange("activity_id", e.value)}
            disabled={!formData.project_id}
            filter
            showClear
          />
        </div>
        <div className="p-field">
          <label className="font-semibold">
            Allocated Amount <span className="text-red-500">*</span>
          </label>
          <InputNumber
            value={formData.allocated_amount}
            onValueChange={(e) =>
              setFormData({ ...formData, allocated_amount: e.value })
            }
            required
          />
        </div>
        <div className="p-field">
          <label>Description</label>
          <InputText
            value={formData.description}
            onChange={(e) => handleChange(e, "description")}
          />
        </div>
        <Button
          label="Save Changes"
          icon="pi pi-check"
          onClick={handleSubmit}
          className="p-button-success"
        />
      </div>
    </Dialog>
  );
};

export default BudgetAllocationEditModal;
