import React, { useState, useEffect, FormEvent } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import useAuth from "../../../../../hooks/useAuth";
import { PROJECTS_ENDPOINTS } from "../../../../../api/projectsEndpoints";
import { createRequest } from "../../../../../utils/api";
import { InputTextarea } from "primereact/inputtextarea";
import { ActivityService } from "../../../../../redux/slices/types/projects/ActivityService";
import { Dropdown } from "primereact/dropdown";
import useAgeGroups from "../../../../../hooks/projects/useAgeGroups";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: ActivityService;
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
  const [formState, setFormState] = useState<Partial<ActivityService>>({
    service_name: "",
    description: "",
    cost: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();
  const { data: ageGroups } = useAgeGroups();

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

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (!formState.service_name || !formState.cost || !formState.age_group_id) {
      setIsSubmitting(false);
      return; // You can handle validation error here
    }

    const data = {
      ...formState,
    };

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? PROJECTS_ENDPOINTS.PROJECT_ACTIVITY_SERVICES.UPDATE(
          projectId,
          activityId,
          item.id.toString()
        )
      : PROJECTS_ENDPOINTS.PROJECT_ACTIVITY_SERVICES.ADD(projectId, activityId);

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
      header={item?.id ? "Edit Activity Service" : "Add Activity Service"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="item-form" onSubmit={handleSave}>
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="service_name">Service Name</label>
            <InputText
              id="service_name"
              name="service_name"
              value={formState.service_name || ""}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="name">Service Description</label>
            <InputTextarea
              id="description"
              name="description"
              value={formState.description || ""}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="cost">Cost</label>
            <InputText
              id="cost"
              name="cost"
              value={formState.cost || ""}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="age_group_id">Age Group</label>
            <Dropdown
              showClear
              placeholder="Select age group"
              id="age_group_id"
              name="age_group_id"
              value={formState.age_group_id}
              options={ageGroups.map((group) => ({
                label: group.age_group_name + " " + group.age_range,
                value: group.id,
              }))}
              onChange={(e) =>
                setFormState({ ...formState, age_group_id: e.value })
              }
              className="w-full"
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
