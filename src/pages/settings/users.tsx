//@ts-nocheck
import { useEffect, useState } from 'react';
import AddUserModal from './modals/create_user';
import { ToastContainer } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import useUsers from '../../hooks/users/useUsers';

const UserSettings = () => {
//   const [users, setUsers] = useState([]);
 const users = useSelector((state: RootState) => state.users.data)
 const {refresh} = useUsers()
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(()=> {
    if (!users) {
      refresh()
      console.log(users)
    }
  }, [])
  
  return (
    <div className="p-6">
      <ToastContainer />
      <div className='flex flex-row justify-between items-center mb-2'>
        <h1 className="text-2xl font-bold mb-4">User Settings</h1>
        <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-300"
        >
            + Add User
        </button>
      </div>
      <div className="overflow-x-auto shadow-md">
        <table className="table-auto w-full text-left border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Gender</th>
              <th className="p-3">Profile Picture</th>
              <th className="p-3">Signature Picture</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="p-3">{user.id}</td>
                  <td className="p-3">{user.user.first_name} {user.user.last_name}</td>
                  <td className="p-3">{user.user.email}</td>
                  <td className="p-3">{user.user.gender}</td>
                  <td className="p-3">
                    {user.profilePicture && (
                      <img
                        src={URL.createObjectURL(user.profilePicture)}
                        alt="Profile"
                        className="h-10 w-10 rounded-full"
                      />
                    )}
                  </td>
                  <td className="p-3">
                    {user.signaturePicture && (
                      <img
                        src={URL.createObjectURL(user.signaturePicture)}
                        alt="Signature"
                        className="h-10 w-10"
                      />
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-3 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <AddUserModal setIsModalOpen={setIsModalOpen} />
      )}
    </div>
  );
};

export default UserSettings;
