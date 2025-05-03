import { useState } from "react";
import { FiEdit2, FiSave, FiX } from "react-icons/fi";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

interface EmployeeProfile {
  // Fields that can be edited by the employee
  first_name: string;
  last_name: string;
  other_name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  marital_status: string;
  state: string;
  postal_code: string;
  country: string;
  profile_picture: string;
  signature: string;
  salutation: string;
  password?: string;
  confirmPassword?: string;

  // Fields that can only be edited by HR
  department_id: number;
  department_name: string;
  designation_id: number;
  designation_name: string;
  salary_structure_id: number;
  salary_structure_name: string;
  employee_code: string;
  gender: string;
  hire_date: string;
  supervisor_id?: number;
  supervisor_name?: string;
  role_id: string;
  role_name: string;
}

const UserProfile = () => {
  const { token, user } = useAuth(); // Assuming your useAuth hook provides the current user
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const currentProfile = useSelector((state: RootState) => state.userAuth.user)
  // Sample employee data - in a real app, this would come from an API
  const [employee, setEmployee] = useState<EmployeeProfile>({
    first_name: currentProfile?.first_name,
    last_name: currentProfile?.last_name,
    other_name: currentProfile?.other_name,
    email: currentProfile?.email,
    phone: currentProfile?.phone_number,
    address: currentProfile?.address,
    date_of_birth: currentProfile?.date_of_birth,
    marital_status: currentProfile?.marital_status,
    state: "Kampala",
    postal_code: "256",
    country: "Uganda",
    profile_picture: "",
    signature: "",
    salutation: currentProfile?.salutation,
    department_id: 1,
    department_name: "IT",
    designation_id: 1,
    designation_name: "Software Engineer",
    salary_structure_id: currentProfile?.salary_structure_id ?? "",
    salary_structure_name: currentProfile?.salary_structure_name ?? "",
    employee_code: currentProfile?.employee_code ?? "",
    gender: currentProfile?.gender ?? "",
    hire_date: currentProfile?.hire_date ?? "",
    supervisor_id: currentProfile?.supervisor_id ?? "",
    supervisor_name: currentProfile?.supervisor_name ?? "",
    role_id: currentProfile?.roles[0]?.id,
    role_name: currentProfile?.roles[0]?.name,
  });

  const [tempEmployee, setTempEmployee] = useState<EmployeeProfile>({
    ...employee,
  });

  const handleEditToggle = () => {
    if (isEditing) {
      setTempEmployee({ ...employee }); // Reset changes if canceling
    }
    setIsEditing(!isEditing);
    setError("");
  };

  const handleSave = async () => {
    if (
      tempEmployee.password &&
      tempEmployee.password !== tempEmployee.confirmPassword
    ) {
      setError("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const payload = {
        first_name: tempEmployee.first_name,
        last_name: tempEmployee.last_name,
        other_name: tempEmployee.other_name,
        email: tempEmployee.email,
        phone: tempEmployee.phone,
        address: tempEmployee.address,
        date_of_birth: tempEmployee.date_of_birth,
        marital_status: tempEmployee.marital_status,
        state: tempEmployee.state,
        postal_code: tempEmployee.postal_code,
        country: tempEmployee.country,
        profile_picture: tempEmployee.profile_picture,
        signature: tempEmployee.signature,
        salutation: tempEmployee.salutation,
        password: tempEmployee.password,
      };

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/hr/employees/${user?.id}/update`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token?.access_token}`,
          },
        }
      );

      if (response.data.success) {
        setEmployee({ ...tempEmployee });
        setIsEditing(false);
      } else {
        setError(response.data.message || "Failed to update profile");
      }
    } catch (err) {
      setError("An error occurred while updating your profile");
      console.error("Update error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setTempEmployee({ ...tempEmployee, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Employee Profile
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end mb-4">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {isLoading ? (
                  "Saving..."
                ) : (
                  <>
                    <FiSave /> Save Changes
                  </>
                )}
              </button>
              <button
                onClick={handleEditToggle}
                disabled={isLoading}
                className="ml-2 flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 transition disabled:opacity-50"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* HR-Managed Fields (Read-only) */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700 border-b pb-2">
              Employment Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                Employee Code
              </label>
              <p className="mt-1 text-gray-800">{employee.employee_code}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                Department
              </label>
              <p className="mt-1 text-gray-800">{employee.department_name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                Designation
              </label>
              <p className="mt-1 text-gray-800">{employee.designation_name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                Salary Structure
              </label>
              <p className="mt-1 text-gray-800">
                {employee.salary_structure_name}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                Supervisor
              </label>
              <p className="mt-1 text-gray-800">
                {employee.supervisor_name || "None"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                Role
              </label>
              <p className="mt-1 text-gray-800">{employee.role_name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                Hire Date
              </label>
              <p className="mt-1 text-gray-800">{employee.hire_date}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                Gender
              </label>
              <p className="mt-1 text-gray-800">{employee.gender}</p>
            </div>
          </div>

          {/* Employee-Editable Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700 border-b pb-2">
              Personal Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Salutation
              </label>
              {isEditing ? (
                <select
                  name="salutation"
                  value={tempEmployee.salutation}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Dr.">Dr.</option>
                </select>
              ) : (
                <p className="mt-1 text-gray-800">{employee.salutation}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="first_name"
                  value={tempEmployee.first_name}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="mt-1 text-gray-800">{employee.first_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="last_name"
                  value={tempEmployee.last_name}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="mt-1 text-gray-800">{employee.last_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Other Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="other_name"
                  value={tempEmployee.other_name}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="mt-1 text-gray-800">
                  {employee.other_name || "-"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={tempEmployee.email}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="mt-1 text-gray-800">{employee.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={tempEmployee.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="mt-1 text-gray-800">{employee.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              {isEditing ? (
                <input
                  type="date"
                  name="date_of_birth"
                  value={tempEmployee.date_of_birth}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="mt-1 text-gray-800">{employee.date_of_birth}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Marital Status
              </label>
              {isEditing ? (
                <select
                  name="marital_status"
                  value={tempEmployee.marital_status}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              ) : (
                <p className="mt-1 text-gray-800">{employee.marital_status}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={tempEmployee.address}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="mt-1 text-gray-800">{employee.address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                State/Region
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="state"
                  value={tempEmployee.state}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="mt-1 text-gray-800">{employee.state}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Postal Code
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="postal_code"
                  value={tempEmployee.postal_code}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="mt-1 text-gray-800">{employee.postal_code}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Country
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="country"
                  value={tempEmployee.country}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="mt-1 text-gray-800">{employee.country}</p>
              )}
            </div>

            {isEditing && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={tempEmployee.password || ""}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current password"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={tempEmployee.confirmPassword || ""}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
