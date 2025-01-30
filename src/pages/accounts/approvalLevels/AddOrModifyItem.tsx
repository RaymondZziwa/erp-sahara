import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";

import { ApprovalLevel } from "../../../redux/slices/types/accounts/cash_requisitions/ApprovalLevels";
import { ACCOUNTS_ENDPOINTS } from "../../../api/accountsEndpoints";
import { Dropdown } from "primereact/dropdown";
import useEmployees from "../../../hooks/hr/useEmployees";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: ApprovalLevel;
  onSave: () => void;
}
interface AddLevel {
  name: string;
  level: number;
  user_id?: number;
  branch_id?: number;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<ApprovalLevel>>({
    name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();
  const { data: users, loading: usersLoading } = useEmployees();

  useEffect(() => {
    if (item) {
      setFormState({
        ...item,
      });
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

  const handleSelectChange = (name: keyof ApprovalLevel, value: any) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Basic validation
    if (!formState.name || !formState.level) {
      setIsSubmitting(false);
      return; // Handle validation error here
    }
    const data: AddLevel = {
      ...formState,
      name: formState.name ?? "",
      level: formState.level,
    };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? ACCOUNTS_ENDPOINTS.APPROVAL_LEVELS.UPDATE(item.id.toString())
      : ACCOUNTS_ENDPOINTS.APPROVAL_LEVELS.ADD;
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
        form="truck-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Level" : "Add Level"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="truck-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        <div className="p-field">
          <label htmlFor="name">Name</label>
          <InputText
            id="name"
            name="name"
            value={formState.name}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="level">Level</label>
          <InputText
            type="number"
            min={1}
            id="level"
            name="level"
            value={formState.level?.toString()}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="user_id">Approver</label>
          <Dropdown
            loading={usersLoading}
            id="user_id"
            name="user_id"
            value={formState.user_id}
            options={users.map((user) => ({
              value: user.id,
              label: user.first_name + " " + user.last_name,
            }))}
            onChange={(e) => handleSelectChange("user_id", e.value)}
            placeholder="Select a User"
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
