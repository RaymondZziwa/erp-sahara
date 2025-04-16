import { useState } from "react";
import { FiEdit2, FiSave, FiX } from "react-icons/fi";

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  // const [showPassword, setShowPassword] = useState(false);
  // const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [user, setUser] = useState({
    firstName: "John",
    lastName: "Doe",
    department: "IT",
    designation: "Software Engineer",
    address: "123 Main Street, Kampala",
    dob: "1990-05-15",
    email: "johndoe@example.com",
    password: "",
    confirmPassword: "",
  });

  const [tempUser, setTempUser] = useState({ ...user });

  const handleEditToggle = () => {
    if (isEditing) setTempUser({ ...user }); // Reset changes if canceling
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    if (tempUser.password && tempUser.password !== tempUser.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setUser({ ...tempUser });
    setIsEditing(false);
    // API call to update user profile can be added here
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempUser({ ...tempUser, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          User Profile
        </h2>

        {/* Action Buttons */}
        <div className="flex justify-end mb-4">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition"
              >
                <FiSave /> Save Changes
              </button>
              <button
                onClick={handleEditToggle}
                className="ml-2 flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 transition"
              >
                <FiX /> Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleEditToggle}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition"
            >
              <FiEdit2 /> Edit Profile
            </button>
          )}
        </div>

        {/* Profile Details */}
        <div className="space-y-6">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="firstName"
                value={tempUser.firstName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
              />
            ) : (
              <p className="mt-1 text-gray-800">{user.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="lastName"
                value={tempUser.lastName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
              />
            ) : (
              <p className="mt-1 text-gray-800">{user.lastName}</p>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Department
            </label>
            {isEditing ? (
              <input
                type="text"
                name="department"
                value={tempUser.department}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
              />
            ) : (
              <p className="mt-1 text-gray-800">{user.department}</p>
            )}
          </div>

          {/* Designation */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Designation
            </label>
            {isEditing ? (
              <input
                type="text"
                name="designation"
                value={tempUser.designation}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
              />
            ) : (
              <p className="mt-1 text-gray-800">{user.designation}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            {isEditing ? (
              <input
                type="text"
                name="address"
                value={tempUser.address}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
              />
            ) : (
              <p className="mt-1 text-gray-800">{user.address}</p>
            )}
          </div>

          {/* DOB */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            {isEditing ? (
              <input
                type="date"
                name="dob"
                value={tempUser.dob}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
              />
            ) : (
              <p className="mt-1 text-gray-800">{user.dob}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
