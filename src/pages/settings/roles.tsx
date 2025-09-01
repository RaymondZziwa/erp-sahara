import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Icons
import { FiPlus, FiEdit2, FiTrash2, FiKey, FiEye } from "react-icons/fi";

// Modals
import AddRoleModal from "./modals/create_role";
import EditRoleModal from "./modals/edit_role";
import useRoles from "../../hooks/settings/useRoles";
import { PropagateLoader } from "react-spinners";
import useModulePermissions from "../../hooks/settings/usePermissions";

const RoleManagement = () => {
  const { refresh: refreshRoles, data: roles, isLoading } = useRoles();
  const { data: permissionsData } = useModulePermissions();
  const navigate = useNavigate();

  // State management
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissionStates, setPermissionStates] = useState({});

  // Initialize permission states
  useEffect(() => {
    if (roles && permissionsData) {
      const states = {};
      roles.forEach(role => {
        states[role.id] = {};
        role.permissions.forEach(perm => {
          states[role.id][perm.id] = true;
        });
      });
      setPermissionStates(states);
    }
  }, [roles, permissionsData]);

  // Only fetch roles if they're not already loaded
  useEffect(() => {
    if (!roles && !isLoading) {
      refreshRoles();
    }
  }, [roles, isLoading, refreshRoles]);

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setIsEditRoleModalOpen(true);
  };

  const handleViewPermissions = (role) => {
    setSelectedRole(role)
    navigate(`/roles/${role.id}/permissions`, {
      state: {
      selectedRolePermissions: role?.permissions
    }});
  };

  const handleDeleteRole = async (role) => {
    try {
      await deleteRole(role.id);
      refreshRoles();
    } catch (error) {
      console.error("Error deleting role:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Role Management</h1>
          <p className="text-gray-500 mt-1">Manage user roles and permissions</p>
        </div>
        <button
          onClick={() => setIsAddRoleModalOpen(true)}
          className="mt-4 md:mt-0 px-3 py-1.5 bg-teal-600 text-sm text-white rounded-md hover:bg-teal-700 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <FiPlus className="text-base" />
          Add New Role
        </button>
      </div>

      {/* Loading State - Only show when loading AND no roles exist */}
      {isLoading && !roles?.length && (
        <div className="flex justify-center items-center py-12">
          <PropagateLoader color="#007f80"/>
        </div>
      )}

      {/* Roles Grid */}
      {(!isLoading || roles?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles && roles.length > 0 ? (
            roles.map((role) => (
              <div key={role.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Role Header */}
                <div className="p-5 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-teal-100 text-teal-600">
                        <FiKey size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{role.name}</h3>
                        <p className="text-sm text-gray-500">{role.permissions.length} permissions</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditRole(role)}
                        className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors"
                        title="Edit role"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteRole(role)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete role"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
                  <button
                    onClick={() => {
                      setSelectedRole(role)
                      handleViewPermissions(role)
                    }}
                    className="text-sm text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1"
                  >
                    <FiEye size={14} />
                    View Permissions
                  </button>
                </div>
              </div>
            ))
          ) : (
            !isLoading && (
              <div className="col-span-full text-center py-12">
                <div className="mx-auto max-w-md">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 mx-auto">
                    <FiKey className="text-gray-400 text-2xl" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No roles found</h3>
                  <p className="mt-1 text-gray-500">Get started by creating a new role</p>
                  <button
                    onClick={() => setIsAddRoleModalOpen(true)}
                    className="mt-6 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
                  >
                    Create Role
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Modals */}
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
    </div>
  );
};

export default RoleManagement;