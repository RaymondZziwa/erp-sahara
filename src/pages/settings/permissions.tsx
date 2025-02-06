//@ts-nocheck
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import useRoles from "../../hooks/roles/useRoles";
import usePermissions from "../../hooks/permissions/usePermissions";

// Import modal components
import AddRoleModal from "./modals/create_role";
import EditRoleModal from "./modals/edit_role";
import AddPermissionsModal from "./modals/add_permissions";

const RoleManagement = () => {
  const roles = useSelector((state: RootState) => state.roles.data);
  const { refresh: refreshRoles, deleteRole } = useRoles();
  const {
    data: permissionsData,
    loading,
    error,
    refresh: refreshPermissions,
  } = usePermissions();

  // Modal state management
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [isAddPermissionsModalOpen, setIsAddPermissionsModalOpen] = useState(false);

  // Stores the role that is currently being edited or having permissions added
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    if (!roles) {
      refreshRoles();
    }
    refreshPermissions();
  }, []);

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setIsEditRoleModalOpen(true);
  };

  const handleAddPermissions = (role) => {
    setSelectedRole(role);
    setIsAddPermissionsModalOpen(true);
  };

  const handleDeleteRole = async (role) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        await deleteRole(role.id);
        refreshRoles();
        // You can add a success toast here if needed
      } catch (error) {
        // You can add an error toast here if needed
        console.error("Error deleting role:", error);
      }
    }
  };

  return (
    <div className="p-6">
      <ToastContainer />
      <div className="flex flex-row justify-between items-center mb-2">
        <h1 className="text-2xl font-bold mb-4">Role Management</h1>
        <button
          onClick={() => setIsAddRoleModalOpen(true)}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition-all transform hover:scale-105"
        >
          + Add Role
        </button>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="table-auto w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">#</th>
              <th className="p-4">Name</th>
              <th className="p-4">Permissions</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles && roles.length > 0 ? (
              roles.map((role) => (
                <tr key={role.id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="p-4">{role.id}</td>
                  <td className="p-4">{role.name}</td>
                  <td className="p-4">
                    <details>
                      <summary className="cursor-pointer text-teal-600 hover:text-teal-800 font-medium">
                        View Permissions ({role.permissions.length})
                      </summary>
                      <ul className="mt-2 pl-4">
                        {role.permissions.map((permission) => (
                          <li key={permission.id} className="text-sm text-gray-700">
                            {permission.name} - {permission.service?.name}
                          </li>
                        ))}
                      </ul>
                    </details>
                  </td>
                  <td className="p-4 space-x-3">
                    <button
                      onClick={() => handleAddPermissions(role)}
                      className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
                    >
                      Add Permissions
                    </button>
                    <button
                      onClick={() => handleEditRole(role)}
                      className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg shadow-md hover:from-yellow-600 hover:to-yellow-700 transition-all transform hover:scale-105"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role)}
                      className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No roles found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals remain unchanged */}
      <AddRoleModal
        isOpen={isAddRoleModalOpen}
        setIsOpen={setIsAddRoleModalOpen}
        refreshRoles={refreshRoles}
      />

      <EditRoleModal
        isOpen={isEditRoleModalOpen}
        setIsOpen={setIsEditRoleModalOpen}
        refreshRoles={refreshRoles}
        selectedRole={selectedRole}
      />

      <AddPermissionsModal
        isOpen={isAddPermissionsModalOpen}
        setIsOpen={setIsAddPermissionsModalOpen}
        selectedRole={selectedRole}
        permissionsByService={permissionsData}
        refresh={refreshRoles}
      />
    </div>
  );
};

export default RoleManagement;