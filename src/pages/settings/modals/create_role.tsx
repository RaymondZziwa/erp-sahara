import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RootState } from "../../../redux/store";
import { baseURL } from "../../../utils/api";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

interface AddRoleModalProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  refreshRoles: () => void;
}

const AddRoleModal: React.FC<AddRoleModalProps> = ({
  isOpen,
  setIsOpen,
  refreshRoles,
}) => {
  const token = useSelector(
    (state: RootState) => state.userAuth.token.access_token
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRole = async () => {
    if (!formData.name.trim()) {
      toast.error("Role name is required!");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${baseURL}/roles/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        refreshRoles();
        toast.success("Role added successfully!");
        setFormData({ name: "" });
        setIsOpen(false);
      } else {
        toast.error(data.message || "Failed to add role");
      }
    } catch {
      toast.error("An error occurred while adding the role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        className="p-button-text !bg-gray-400"
        onClick={() => setIsOpen(false)}
      />
      <Button
        label={isSubmitting ? "Creating..." : "Create Role"}
        icon="pi pi-check"
        onClick={handleAddRole}
        loading={isSubmitting}
      />
    </div>
  );

  return (
    <Dialog
      header="Create Role"
      visible={isOpen}
      style={{ width: "30rem" }}
      modal
      className="p-fluid"
      onHide={() => setIsOpen(false)}
      footer={footer}
    >
      <div className="field">
        <label htmlFor="name">Role Name</label>
        <InputText
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter role name"
        />
      </div>
    </Dialog>
  );
};

export default AddRoleModal;
