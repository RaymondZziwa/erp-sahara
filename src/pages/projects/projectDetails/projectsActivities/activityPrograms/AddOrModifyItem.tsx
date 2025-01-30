import React, { useState, useEffect, FormEvent } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { ActivityProgram } from "../../../../../redux/slices/types/projects/ActivityProgram";
import useAuth from "../../../../../hooks/useAuth";
import { PROJECTS_ENDPOINTS } from "../../../../../api/projectsEndpoints";
import { createRequest } from "../../../../../utils/api";
import { InputTextarea } from "primereact/inputtextarea";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: ActivityProgram;
  onSave: () => void;
  projectId: string;
  activityId: string;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
  projectId,
  activityId,
}) => {
  const [formState, setFormState] = useState<Partial<ActivityProgram>>({
    name: "",
    description: "",
    start_date: null,
    end_date: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState(item);
    } else {
      setFormState({});
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

  const handleDateChange = (name: string) => (e: any) => {
    const value = e.value as Date | null;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (!formState.name || !formState.start_date || !formState.end_date) {
      setIsSubmitting(false);
      return; // You can handle validation error here
    }

    const data = {
      ...formState,
      start_date: formatDate(new Date(formState.start_date as string)),
      end_date: formatDate(new Date(formState.end_date as string)),
    };

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? PROJECTS_ENDPOINTS.PROJECT_ACTIVITY_PROGRAMS.UPDATE(
          projectId,
          activityId,
          item.id.toString()
        )
      : PROJECTS_ENDPOINTS.PROJECT_ACTIVITY_PROGRAMS.ADD(projectId, activityId);

    await createRequest(endpoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose(); // Close the modal after saving
  };

  const footer = (
    <div>
      <Button
        disabled={isSubmitting}
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text"
      />
      <Button
        disabled={isSubmitting}
        loading={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="item-form"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Activity Program" : "Add Activity Program"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="item-form" onSubmit={handleSave}>
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="name">Program Name</label>
            <InputText
              id="name"
              name="name"
              value={formState.name || ""}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="name">Program Description</label>
            <InputTextarea
              id="description"
              name="description"
              value={formState.description || ""}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="start_date">Start Date</label>
            <Calendar
              id="start_date"
              name="start_date"
              value={
                formState.start_date ? new Date(formState.start_date) : null
              }
              onChange={handleDateChange("start_date")}
              showIcon
              placeholder="Select Start Date"
              dateFormat="yy-mm-dd"
            />
          </div>
          <div className="p-field">
            <label htmlFor="end_date">End Date</label>
            <Calendar
              id="end_date"
              name="end_date"
              value={formState.end_date ? new Date(formState.end_date) : null}
              onChange={handleDateChange("end_date")}
              showIcon
              placeholder="Select End Date"
              dateFormat="yy-mm-dd"
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
