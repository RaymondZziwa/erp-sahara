import React, { useState, useEffect, FormEvent } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import useAuth from "../../../../../hooks/useAuth";
import { PROJECTS_ENDPOINTS } from "../../../../../api/projectsEndpoints";
import { createRequest } from "../../../../../utils/api";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { ProjectActivityParameter } from "../../../../../redux/slices/types/projects/ProjectParameter";
import useUnitsOfMeasurement from "../../../../../hooks/inventory/useUnitsOfMeasurement";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: ProjectActivityParameter;
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
  const [formState, setFormState] = useState<Partial<ProjectActivityParameter>>(
    {
      description: "",
      name: "",
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();
  const { data: uoms } = useUnitsOfMeasurement();

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
    if (!formState.name || !formState.unit_of_measure_id) {
      setIsSubmitting(false);
      return; // You can handle validation error here
    }

    const data = {
      ...formState,
    };

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? PROJECTS_ENDPOINTS.PROJECT_ACTIVITY_PARAMETERS.UPDATE(
          projectId,
          activityId,
          item.id.toString()
        )
      : PROJECTS_ENDPOINTS.PROJECT_ACTIVITY_PARAMETERS.ADD(
          projectId,
          activityId
        );

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
      header={item?.id ? "Edit Activity Parameter" : "Add Activity Parameter"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="item-form" onSubmit={handleSave}>
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="name"> Name</label>
            <InputText
              id="name"
              name="name"
              value={formState.name || ""}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="name"> Description</label>
            <InputTextarea
              id="description"
              name="description"
              value={formState.description || ""}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="p-field">
            <label htmlFor="unit_of_measure_id">Unit of Measurement</label>
            <Dropdown
              filter
              showClear
              placeholder="Select unit"
              id="unit_of_measure_id"
              name="unit_of_measure_id"
              value={formState.unit_of_measure_id}
              options={uoms.map((uom) => ({
                label: uom.name + " " + uom.abbreviation,
                value: uom.id,
              }))}
              onChange={(e) =>
                setFormState({ ...formState, unit_of_measure_id: e.value })
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
