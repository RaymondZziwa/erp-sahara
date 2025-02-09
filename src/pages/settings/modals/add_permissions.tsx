import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RootState } from "../../../redux/store";
import { baseURL } from "../../../utils/api";
import { Permission } from "../../../redux/slices/permissions/permissionSlice";

interface Props {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  selectedRole: any;
  permissionsByService: any[];
  refresh: () => void;
}

const AddPermissionsModal: React.FC<Props> = ({
  isOpen,
  setIsOpen,
  selectedRole,
  permissionsByService,
  refresh,
}) => {
  const token = useSelector(
    (state: RootState) => state.userAuth.token.access_token
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  useEffect(() => {
    if (selectedRole) {
      const rolePermissionIds = selectedRole.permissions.map((p: Permission) => p.id);
      setSelectedPermissions(rolePermissionIds);
    }
  }, [selectedRole]);

  const handlePermissionSelection = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSavePermissions = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedRole || selectedPermissions.length === 0) {
      toast.error("Please select at least one permission.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `${baseURL}/roles/${selectedRole.id}/attach-permissions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ permissions: selectedPermissions }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Permissions updated successfully!");
        refresh();
        setIsOpen(false);
      } else {
        toast.error(data.message || "Failed to update permissions.");
      }
    } catch (error) {
      toast.error("An error occurred while updating permissions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Add Permissions to <span className="text-blue-600">{selectedRole?.name}</span>
        </h2>

        <div className="space-y-4">
          {permissionsByService.map((service) => (
            <div key={service.id}>
              <h3 className="font-semibold text-lg text-gray-700 border-b pb-1 mb-2">
                {service.name}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {service.permissions.map((permission: Permission) => (
                  <label key={permission.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={() => handlePermissionSelection(permission.id)}
                      className="accent-blue-500"
                    />
                    <span className="text-sm text-gray-600">{permission.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSavePermissions}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-lg text-white transition ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isSubmitting ? "Saving..." : "Save Permissions"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPermissionsModal;
