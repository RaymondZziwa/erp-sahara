import React, { useState } from "react";

interface props {
    setIsModalOpen: (val: boolean) => void,
    setSelectedRole: (val: any) => void
}
const SetPermissionsModal: React.FC<props> = ({setIsModalOpen, setSelectedRole}) => {
    const [permissions, setPermissions] = useState({
        read: false,
        write: false,
        update: false,
        delete: false,
      });
    
      const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedRole(null);
        setPermissions({
          read: false,
          write: false,
          update: false,
          delete: false,
        });
      };
    
    //@ts-expect-error --ignore
  const handlePermissionChange = (permission) => {
    setPermissions((prev) => ({
      ...prev,
      //@ts-expect-error --ignore
      [permission]: !prev[permission],
    }));
  };

  const handleSave = () => {}

    return (
        <div className="bg-white fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
          <div className="rounded-lg shadow-lg w-96 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
            {/* @ts-expect-error --ignore */}
              Set Permissions for {selectedRole?.name}
            </h3>

            {/* Permissions */}
            <div className="space-y-3">
              {Object.keys(permissions).map((permission) => (
                <div key={permission} className="flex items-center">
                  <input
                    type="checkbox"
                    id={permission}
                    //@ts-expect-error --ignore
                    checked={permissions[permission]}
                    onChange={() => handlePermissionChange(permission)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label
                    htmlFor={permission}
                    className="ml-2 text-gray-700 capitalize"
                  >
                    {permission}
                  </label>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 bg-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-teal-500 text-white rounded-md text-sm font-medium hover:bg-teeal-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
    )
}
export default SetPermissionsModal;