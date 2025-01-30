import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";

import { createRequest } from "../../../../utils/api";
import useAuth from "../../../../hooks/useAuth";
import { PROJECTS_ENDPOINTS } from "../../../../api/projectsEndpoints";
import useCurrencies from "../../../../hooks/procurement/useCurrencies";
import { Calendar } from "primereact/calendar";
import { Activity } from "../../../../redux/slices/types/projects/Activity";

interface AddProjectActivity {
  project_id: number;
  name: string;
  priority: string;
  status: string;
  objectives: string;
  activity_methodology: string;
  cost: number;
  currency_id: number;
  start_date: string;
  end_date: string;
  description: string;
}

// Sample options for select fields
const PRIORITY_OPTIONS = [
  { label: "High", value: "High" },
  { label: "Medium", value: "Medium" },
  { label: "Low", value: "Low" },
];

const STATUS_OPTIONS = [
  { label: "Not Started", value: "Not Started" },
  { label: "In Progress", value: "In Progress" },
  { label: "Completed", value: "Completed" },
  { label: "On Hold", value: "On Hold" },
  { label: "Cancelled", value: "Cancelled" },
];

interface AddOrModifyItemProps {
  projectId: string;
  visible: boolean;
  onClose: () => void;
  item?: Activity;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
  projectId,
}) => {
  const [formState, setFormState] = useState<Partial<AddProjectActivity>>({
    project_id: +projectId,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();

  const { data: currencies } = useCurrencies();

  useEffect(() => {
    if (item) {
      setFormState({
        project_id: item.project_id,
        name: item.name,
        priority: item.prioty, //in:High,Medium,Low',
        status: item.status, //'nullable|in:Not Started,In Progress,Completed,On Hold,Cancelled',
        objectives: item.objectives ?? "",
        activity_methodology: item.activity_methodology,
        cost: +item.cost, //Nullable
        currency_id: item.currency_id, //Currencies nullable
        start_date: item.start_date,
        end_date: item.end_date, //Nullable if project has no clear end date
        description: item.description, //Nullable
      });
    } else {
      setFormState({ project_id: +projectId });
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSelectChange = (
    name: keyof AddProjectActivity,
    value: string | number
  ) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (!formState.name || !formState.cost || !formState.end_date) {
      return; // Handle validation error here
    }

    const method = item?.id ? "PUT" : "POST";

    const data = {
      ...formState,
      start_date: new Date(formState.start_date ?? new Date())
        .toISOString()
        .slice(0, 10),
      end_date: new Date(formState.end_date ?? new Date())
        .toISOString()
        .slice(0, 10),
    };

    const endpoint = item?.id
      ? PROJECTS_ENDPOINTS.PROJECT_ACTIVITIES.UPDATE(
          projectId,
          item.id.toString()
        )
      : PROJECTS_ENDPOINTS.PROJECT_ACTIVITIES.ADD(projectId);

    await createRequest(endpoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose(); // Close the modal after saving
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
        form="project-activity-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Project Activity" : "Add Project Activity"}
      visible={visible}
      footer={footer}
      onHide={onClose}
      className="max-w-md md:max-w-2xl xl:max-w-screen-xl"
    >
      <form
        id="project-activity-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 md:grid-cols-2  gap-4"
      >
        <div className="p-field">
          <label htmlFor="name">Name</label>
          <InputText
            id="name"
            name="name"
            value={formState.name || ""}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="priority">Priority</label>
          <Dropdown
            id="priority"
            name="priority"
            value={formState.priority}
            options={PRIORITY_OPTIONS}
            onChange={(e) => handleSelectChange("priority", e.value)}
            placeholder="Select Priority"
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="status">Status</label>
          <Dropdown
            id="status"
            name="status"
            value={formState.status}
            options={STATUS_OPTIONS}
            onChange={(e) => handleSelectChange("status", e.value)}
            placeholder="Select Status"
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="cost">Cost</label>
          <InputText
            id="cost"
            name="cost"
            value={formState.cost?.toString() || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="currency_id">Currency</label>
          <Dropdown
            id="currency_id"
            name="currency_id"
            value={formState.currency_id}
            options={currencies.map((curr) => ({
              label: curr.code,
              value: curr.id,
            }))}
            onChange={(e) => handleSelectChange("currency_id", e.value)}
            placeholder="Select Currency"
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="start_date">Start Date</label>
          <Calendar
            id="start_date"
            name="start_date"
            value={new Date(formState.start_date ?? new Date()) || null}
            onChange={(e) =>
              setFormState((prevState) => ({
                ...prevState,
                start_date: e.value?.toString(),
              }))
            }
            required
            showIcon
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="end_date">End Date</label>
          <Calendar
            id="end_date"
            name="end_date"
            value={new Date(formState.end_date ?? new Date()) || null}
            onChange={(e) =>
              setFormState((prevState) => ({
                ...prevState,
                end_date: e.value?.toString(),
              }))
            }
            required
            showIcon
            className="w-full"
          />
        </div>

        {/* Objectives */}
        <div className="p-field md:col-span-2">
          <label htmlFor="objectives">Objectives</label>
          <InputText
            id="objectives"
            name="objectives"
            value={formState.objectives || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        {/* Activity Methodology */}
        <div className="p-field md:col-span-2">
          <label htmlFor="activity_methodology">Activity Methodology</label>
          <InputText
            id="activity_methodology"
            name="activity_methodology"
            value={formState.activity_methodology || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        {/* Description */}
        <div className="p-field md:col-span-2">
          <label htmlFor="description">Description</label>
          <InputText
            id="description"
            name="description"
            value={formState.description || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
