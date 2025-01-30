import React, { useState, useEffect, FormEvent } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

import { PROJECTS_ENDPOINTS } from "../../../../api/projectsEndpoints";
import { createRequest } from "../../../../utils/api";
import useAuth from "../../../../hooks/useAuth";
import { ProjectTeamMember } from "../../../../redux/slices/types/projects/Team";
import { Dropdown } from "primereact/dropdown";
import useEmployees from "../../../../hooks/hr/useEmployees";
import useProjectRoles from "../../../../hooks/projects/useProjectRoles";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: ProjectTeamMember;
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
  const [formState, setFormState] = useState<Partial<ProjectTeamMember>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();
  const { data: employees } = useEmployees();
  const { data: projectRoles } = useProjectRoles(projectId);

  useEffect(() => {
    if (item) {
      setFormState(item);
    } else {
      setFormState({});
    }
  }, [item]);

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (!formState.user_id) {
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
      header={item?.id ? "Edit Project Team Member" : "Add Project Team Member"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="item-form" onSubmit={handleSave}>
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="user_id">Team Member</label>
            <Dropdown
              id="user_id"
              name="user_id"
              value={formState.user_id}
              options={employees.map((emloyee) => ({
                label: emloyee.first_name + " " + emloyee.last_name,
                value: emloyee.id,
              }))}
              onChange={(e) => setFormState({ ...formState, user_id: e.value })}
              className="w-full"
            />
          </div>
          <div className="p-field">
            <label htmlFor="project_role_id">Role</label>
            <Dropdown
              id="project_role_id"
              name="project_role_id"
              value={formState.project_role_id}
              options={projectRoles.map((role) => ({
                label: role.name,
                value: role.id,
              }))}
              onChange={(e) =>
                setFormState({ ...formState, project_role_id: e.value })
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
