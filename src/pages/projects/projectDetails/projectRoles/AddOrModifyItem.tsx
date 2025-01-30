import React, { useState, useEffect, FormEvent } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { ProjectRole } from "../../../../redux/slices/types/projects/ProjectRole";
import { PROJECTS_ENDPOINTS } from "../../../../api/projectsEndpoints";
import { createRequest } from "../../../../utils/api";
import { InputTextarea } from "primereact/inputtextarea";
import useAuth from "../../../../hooks/useAuth";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: ProjectRole;
  onSave: () => void;
  projectId: string;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
  projectId,
}) => {
  const [formState, setFormState] = useState<Partial<ProjectRole>>({
    description: "",
    name: "",
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

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (!formState.name) {
      setIsSubmitting(false);
      return; // You can handle validation error here
    }

    const data = {
      ...formState,
    };

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? PROJECTS_ENDPOINTS.ROLES.UPDATE(projectId, item.id.toString())
      : PROJECTS_ENDPOINTS.ROLES.ADD(projectId);

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
            <label htmlFor="name">Service Name</label>
            <InputText
              id="name"
              name="name"
              value={formState.name || ""}
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
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
