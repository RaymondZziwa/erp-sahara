import { useState } from "react";
import AddRoleModal from "./modals/create_role";
import { ToastContainer } from "react-toastify";
import useRoles from "../../hooks/roles/useRoles";

const RoleManagement = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const {data, refresh} = useRoles();
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  //@ts-expect-error --ignore
  const handleRoleClick = (role) => {
    setSelectedRole(role);
    console.log(selectedRole)
    // setIsModalOpen(true);
  };


  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <ToastContainer />
        <div className="flex flex-row justify-between items-center w-full">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Role Management</h1>
            <button className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-300" onClick={()=> setIsModalOpen(true)}>+ Add Role</button>
        </div>
      

      {/* Role List */}
      <div className="rounded-lg">
        <ul className=" flex flex-row gap-4">
          {data && data.map((role) => (
            <li
              key={role.id}
              onClick={() => handleRoleClick(role)}
              className="p-3 rounded-lg bg-white hover:bg-teal-500 hover:text-white cursor-pointer font-medium w-full"
            >
              {role.name}
            </li>
          ))}
        </ul>
      </div>

      {
        isModalOpen && (
          <AddRoleModal setIsModalOpen={setIsModalOpen} refresh={refresh}/>
        )
      }
    </div>
  );
};

export default RoleManagement;
