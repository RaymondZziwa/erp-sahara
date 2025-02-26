import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RootState } from "../../../redux/store";
import { baseURL } from "../../../utils/api";

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

  // When selectedRole changes, update the formData to prefill the input.
  useEffect(() => {
    if (selectedRole) {
      setFormData({ name: selectedRole.name });
    }
  }, [selectedRole]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateRole = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Role name is required!");
      return;
    }

    try {
      setIsSubmitting(true);
      // Replace the endpoint below with the appropriate one for your API.
      const response = await fetch(
        `${baseURL}/roles/${selectedRole?.id}/update`,
        {
          method: "PUT", // Adjust the method if needed (PUT or PATCH might also be common)
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
      setIsSubmitting(false);
    } catch (error) {
      toast.error("An error occurred while updating the role.");
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !selectedRole) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-auto z-50">
      <div className="bg-white p-6 rounded mt-12 shadow-md w-[500px]">
        <h2 className="text-xl font-bold mb-4">Edit Role</h2>
        <form>
          <div>
            <label className="block text-gray-700 mb-1">Role Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter role name"
            />
          </div>
        </form>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleUpdateRole}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded ${
              isSubmitting
                ? "bg-gray-200 text-white cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isSubmitting ? "Updating..." : "Update Role"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRoleModal;
