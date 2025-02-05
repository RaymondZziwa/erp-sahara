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
  const { refresh: refreshRoles } = useRoles();
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

  return (
    <div className="p-6">
      <ToastContainer />
      <div className="flex flex-row justify-between items-center mb-2">
        <h1 className="text-2xl font-bold mb-4">Role Management</h1>
        <button
          onClick={() => setIsAddRoleModalOpen(true)}
          className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-300"
        >
          + Add Role
        </button>
      </div>

      <div className="overflow-x-auto shadow-md">
        <table className="table-auto w-full text-left border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">Permissions</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles && roles.length > 0 ? (
              roles.map((role) => (
                <tr key={role.id} className="border-t">
                  <td className="p-3">{role.id}</td>
                  <td className="p-3">{role.name}</td>
                  <td className="p-3">
                    <details>
                      <summary className="cursor-pointer text-teal-500 hover:text-teal-700">
                        View Permissions ({role.permissions.length})
                      </summary>
                      <ul className="mt-2 pl-4">
                        {role.permissions.map((permission) => (
                          <li key={permission.id} className="text-sm">
                            {permission.name} - {permission.service?.name}
                          </li>
                        ))}
                      </ul>
                    </details>
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => handleAddPermissions(role)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-300"
                    >
                      Add Permissions
                    </button>
                    <button
                      onClick={() => handleEditRole(role)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-400"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-3 text-center text-gray-500">
                  No roles found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Role Modal */}
      <AddRoleModal
        isOpen={isAddRoleModalOpen}
        setIsOpen={setIsAddRoleModalOpen}
        refreshRoles={refreshRoles}
      />

      {/* Edit Role Modal */}
      <EditRoleModal
        isOpen={isEditRoleModalOpen}
        setIsOpen={setIsEditRoleModalOpen}
        refreshRoles={refreshRoles}
        selectedRole={selectedRole}
      />

      {/* Add Permissions Modal */}
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
