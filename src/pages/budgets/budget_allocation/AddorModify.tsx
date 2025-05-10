// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import axios from "axios";
import { baseURL } from "../../../utils/api";
import { RootState } from "../../../redux/store";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import useProjects from "../../../hooks/projects/useProjects";
import { Dropdown } from "primereact/dropdown";

interface props {
  visible: boolean;
  refresh: any;
  onHide: () => void;
  id: string;
}

const BudgetAllocationModal: React.FC<props> = ({
  refresh,
  visible,
  onHide,
  id,
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

  const fetchActivitiesByProject = async (projectId: string) => {
    try {
      const res = await axios.get(
        `${baseURL}/projects/${projectId}/activities`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setActivities(res.data.activities || []);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      setActivities([]);
    }
  }

  useEffect(() => {
    getProjects();
  }, []);

  const handleChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleItemChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "project_id" ? { activity_id: "" } : {}),
    }));

    if (field === "project_id") {
      fetchActivitiesByProject(value);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        `${baseURL}/accounts/budgets/${id}/budgetallocations/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        refresh();
      } else {
        toast.error(response.data.message);
      }
      onHide();
    } catch (error) {
      console.error("Error submitting allocation:", error);
    }
  };

  return (
    <>
      <ToastContainer />
      <Dialog header="Add Budget Allocation" visible={visible} onHide={onHide}>
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
              onChange={(e) => handleItemChange("project_id", e.value)}
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
              onChange={(e) => handleItemChange("activity_id", e.value)}
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
            label="Save"
            icon="pi pi-check"
            onClick={handleSubmit}
            className="p-button-success"
          />
        </div>
      </Dialog>
    </>
  );
};

export default BudgetAllocationModal;
