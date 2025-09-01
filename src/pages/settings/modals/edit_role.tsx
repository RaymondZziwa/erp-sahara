import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RootState } from "../../../redux/store";
import { baseURL } from "../../../utils/api";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

interface EditRoleModalProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  refreshRoles: () => void;
  selectedRole: { id: number; name: string } | null;
}

const EditRoleModal: React.FC<EditRoleModalProps> = ({
  isOpen,
  setIsOpen,
  refreshRoles,
  selectedRole,
}) => {
  const token = useSelector(
    (state: RootState) => state.userAuth.token.access_token
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    if (selectedRole) {
      setFormData({ name: selectedRole.name });
    }
  }, [selectedRole]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value });
  };

  const handleUpdateRole = async () => {
    if (!formData.name) {
      toast.error("Role name is required!");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `${baseURL}/roles/${selectedRole?.id}/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        refreshRoles();
        setIsOpen(false);
      } else {
        toast.error(data.message || "Failed to update role");
      }
    } catch (error) {
      toast.error("An error occurred while updating the role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      visible={isOpen}
      onHide={() => setIsOpen(false)}
      header="Edit Role"
      style={{ width: "400px" }}
      modal
      className="p-fluid"
    >
      <div className="mb-4">
        <label htmlFor="roleName" className="block font-medium mb-2">
          Role Name
        </label>
        <InputText
          id="roleName"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter role name"
          className="w-full"
        />
      </div>

      <div className="flex justify-end gap-2">
        {/* <Button
          label="Cancel"
          icon="pi pi-times"
          className="p-button-text"
          onClick={() => setIsOpen(false)}
        /> */}
        <Button
          label={isSubmitting ? "Updating..." : "Update Role"}
          icon="pi pi-check"
          onClick={handleUpdateRole}
          disabled={isSubmitting}
          className="p-button-raised p-button-success"
          style={{ backgroundColor: "#0d9488", borderColor: "#0d9488" }} // Teal
        />
      </div>
    </Dialog>
  );
};

export default EditRoleModal;
