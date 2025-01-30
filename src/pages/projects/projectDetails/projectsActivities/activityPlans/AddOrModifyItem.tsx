import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { ActivityPlan } from "../../../../../redux/slices/types/projects/ActivityPlan";
import useAuth from "../../../../../hooks/useAuth";
import { PROJECTS_ENDPOINTS } from "../../../../../api/projectsEndpoints";
import { createRequest } from "../../../../../utils/api";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: ActivityPlan;
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
  const [formState, setFormState] = useState<Partial<ActivityPlan>>({
    plan_details: "",
    due_date: null,
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDateChange = (e: any) => {
    const value = e.value;
    setFormState((prevState) => ({
      ...prevState,
      due_date: value,
    }));
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (!formState.plan_details || !formState.due_date) {
      setIsSubmitting(false);
      return; // You can handle validation error here
    }

    const data = {
      ...formState,
      due_date: formatDate(new Date(formState.due_date)),
    };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? PROJECTS_ENDPOINTS.PROJECT_ACTIVITY_PLANS.UPDATE(
          projectId,
          activityId,
          item.id.toString()
        )
      : PROJECTS_ENDPOINTS.PROJECT_ACTIVITY_PLANS.ADD(projectId, activityId);

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
      header={item?.id ? "Edit Activity Plan" : "Add Activity Plan"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="item-form" onSubmit={handleSave}>
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="plan_details">Plan Details</label>
            <InputText
              id="plan_details"
              name="plan_details"
              value={formState.plan_details}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="due_date">Due Date</label>
            <Calendar
              id="due_date"
              name="due_date"
              value={formState.due_date ? new Date(formState.due_date) : null}
              onChange={handleDateChange}
              showIcon
              placeholder="Select Due Date"
              dateFormat="yy-mm-dd"
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
