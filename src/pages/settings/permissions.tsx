// @ts-nocheck
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import useRoles from "../../hooks/roles/useRoles";
import usePermissions from "../../hooks/permissions/usePermissions";

// Icons
import { FiPlus, FiEdit2, FiTrash2, FiChevronDown, FiCheck, FiX } from "react-icons/fi";

// Modals
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

  // State management
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [isAddPermissionsModalOpen, setIsAddPermissionsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [expandedRoles, setExpandedRoles] = useState({});
  const [permissionStates, setPermissionStates] = useState({});
  

  const updateRolePermissions = () => {}
  // Initialize permission states when roles load
// 1. Improved initialization in useEffect
useEffect(() => {
  if (roles) {
    const states = {};
    roles.forEach(role => {
      states[role.id] = {};
      // Initialize all available permissions first as false
      permissionsData?.forEach(service => {
        service.permissions.forEach(perm => {
          states[role.id][perm.id] = true;
        });
      });
      // Then set the actual role permissions to true
      role.permissions.forEach(perm => {
        states[role.id][perm.id] = true;
      });
    });
    setPermissionStates(states);
  }
}, [roles, permissionsData]);

// 2. Improved toggle function
const togglePermission = async (roleId, permissionId) => {
  // Create a deep copy of the current state
  const newStates = JSON.parse(JSON.stringify(permissionStates));
  
  // Toggle the specific permission
  newStates[roleId][permissionId] = !newStates[roleId][permissionId];
  
  // Optimistic UI update
  setPermissionStates(newStates);

  try {
    // Get only the active permissions
    const activePermissions = Object.entries(newStates[roleId])
      .filter(([_, isActive]) => isActive)
      .map(([id]) => parseInt(id));

    await updateRolePermissions(roleId, activePermissions);
    
    // Confirm the update was successful
    refreshRoles();
  } catch (error) {
    console.error("Error updating permissions:", error);
    
    // Revert on error - use functional update to ensure correct state
    setPermissionStates(prev => {
      const reverted = JSON.parse(JSON.stringify(prev));
      reverted[roleId][permissionId] = !reverted[roleId][permissionId];
      return reverted;
    });
  }
};

  useEffect(() => {
    if (!roles) refreshRoles();
    refreshPermissions();
  }, []);

  const toggleRoleExpansion = (roleId) => {
    setExpandedRoles(prev => ({
      ...prev,
      [roleId]: !prev[roleId]
    }));
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setIsEditRoleModalOpen(true);
  };

  const handleAddPermissions = (role) => {
    setSelectedRole(role);
    setIsAddPermissionsModalOpen(true);
  };

  const handleDeleteRole = async (role) => {
    if (window.confirm(`Are you sure you want to delete the "${role.name}" role?`)) {
      try {
        await deleteRole(role.id);
        refreshRoles();
      } catch (error) {
        console.error("Error deleting role:", error);
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Role Management</h1>
          <p className="text-gray-600 mt-1">Manage user roles and their permissions</p>
        </div>
        <button
          onClick={() => setIsAddRoleModalOpen(true)}
          className="mt-4 md:mt-0 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <FiPlus className="text-lg" />
          Add Role
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles && roles.length > 0 ? (
                roles.map((role) => (
                  <>
                    <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                            <span className="text-teal-600 font-medium">{role.name.charAt(0)}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{role.name}</div>
                            <div className="text-sm text-gray-500">ID: {role.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {role.permissions.length} permissions
                          </span>
                          <button 
                            onClick={() => toggleRoleExpansion(role.id)}
                            className="text-teal-600 hover:text-teal-900 flex items-center gap-1 text-sm"
                          >
                            <FiChevronDown className={`transition-transform ${expandedRoles[role.id] ? 'rotate-180' : ''}`} />
                            {expandedRoles[role.id] ? 'Hide' : 'View'}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleAddPermissions(role)}
                          className="text-teal-600 hover:text-teal-900 px-3 py-1.5 rounded-md hover:bg-teal-50 transition-colors text-sm"
                        >
                          Add More
                        </button>
                        <button
                          onClick={() => handleEditRole(role)}
                          className="text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role)}
                          className="text-red-600 hover:text-red-900 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    {expandedRoles[role.id] && (
                      <tr>
                      <td colSpan={3} className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {role.permissions.length > 0 ? (
                            role.permissions.map((permission) => (
                              <div key={permission.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                                <div className="truncate">
                                  <h4 className="font-medium text-gray-800 truncate">{permission.name}</h4>
                                  <p className="text-sm text-gray-600 mt-1 truncate">{permission.service?.name}</p>
                                </div>
                                <label className="inline-flex items-center cursor-pointer flex-shrink-0 ml-2">
                                  <input
                                    type="checkbox"
                                    checked={permissionStates[role.id]?.[permission.id] || false}
                                    onChange={() => togglePermission(role.id, permission.id)}
                                    className="absolute opacity-0 w-0 h-0"
                                  />
                                  <div className="relative w-11 h-6 bg-gray-200 rounded-full transition-all duration-200 peer-checked:bg-indigo-600">
                                    <div className="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 peer-checked:translate-x-5"></div>
                                    <FiX className="absolute left-1 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 peer-checked:opacity-0" />
                                    <FiCheck className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs text-white opacity-0 peer-checked:opacity-100" />
                                  </div>
                                </label>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-full text-center text-gray-500 py-4">
                              No permissions assigned to this role
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                    )}
                  </>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <FiPlus className="text-gray-400 text-2xl" />
                      </div>
                      <p className="text-lg font-medium">No roles found</p>
                      <p className="mt-1 text-sm">Create your first role to get started</p>
                      <button
                        onClick={() => setIsAddRoleModalOpen(true)}
                        className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
                      >
                        Create Role
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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