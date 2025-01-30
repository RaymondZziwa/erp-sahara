import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import axios from "axios";
import { toast } from "react-toastify";
import { baseURL } from "../../../utils/api";

interface props {
    setIsModalOpen: (val: boolean) => void,
}

const AddUserModal: React.FC<props> = ({setIsModalOpen}) => {
    const token = useSelector((state: RootState) => state.userAuth.token.access_token)
    const roles = useSelector((state: RootState) => state.roles.data)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        other_name: '',
        email: '',
        gender: '',
        date_of_birth: '',
        phone_number: '',
        salutation: '',
        password: '',
        comment: '',
        role_id:'',
        staff_no:'',
        profilePicture: null,
        signaturePicture: null,
      });
    
      const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
      };
    
      const handleFileChange = (e: any) => {
        const { name, files } = e.target;
        setFormData((prev) => ({ ...prev, [name]: files[0] }));
      };
    
      const handleAddUser = async (e: any) => {
        e.preventDefault();
        const {
            first_name,
            last_name,
            email,
            gender,
            date_of_birth,
            phone_number,
            password,
            role_id,
            profilePicture,
            signaturePicture,
          } = formData;
        
          if (
            !first_name ||
            !last_name ||
            !email ||
            !gender ||
            !date_of_birth ||
            !phone_number ||
            !password ||
            !role_id ||
            !profilePicture ||
            !signaturePicture
          ) {
            toast.error('Please fill in all the required fields.');
            return;
          }
    
        const payload = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            //@ts-expect-error --ignore
          payload.append(key, value);
        });
    
        try {
          setIsSubmitting(true)
          const response = await axios.post(
            `${baseURL}/staff/create`,
            payload,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
              },
            }
          );
          if (response.data.success) {
            setIsSubmitting(false)
            toast.success('User added successfully!');
            setFormData({
              first_name: '',
              last_name: '',
              other_name: '',
              email: '',
              gender: '',
              date_of_birth: '',
              phone_number: '',
              salutation: '',
              password: '',
              comment: '',
              role_id: '',
              staff_no: '',
              profilePicture: null,
              signaturePicture: null,
            });
            setIsModalOpen(false)
          } else {
            setIsSubmitting(false)
            setIsModalOpen(false)
            toast.error('Failed to add user. Please try again.');
          }
        } catch (error) {
          console.error(error);
          setIsSubmitting(false)
          setIsModalOpen(false)
          toast.error(
            'An error occurred while adding the user.'
          );
        }
      };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-auto z-50">
          <div className="bg-white p-6 rounded mt-36 shadow-md w-[500]">
            <h2 className="text-xl font-bold mb-4">Add User</h2>
            <form className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">First name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Last name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Other name (optional)</label>
                <input
                  type="text"
                  name="other_name"
                  value={formData.other_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter other name"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Gender</label>
                <select
                    name='gender'
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded"
                    >
                    <option value=" ">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Date of birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder=""
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Phone number</label>
                <input
                  type="number"
                  min='1'
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Salutation</label>
                <select
                    name='salutation'
                    value={formData.salutation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded"
                    >
                    <option value=" ">Select Salutation</option>
                    <option value="mr">Mr</option>
                    <option value="mrs">Mrs</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Role</label>
                <select
                    name='role_id'
                    value={formData.role_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded"
                    >
                    <option value=" ">Select Role</option>
                    {
                        roles && roles.map((role) => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))
                    }
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Staff Id (optional)</label>
                <input
                  type="number"
                  min='1'
                  name="staff_no"
                  value={formData.staff_no}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter staff number"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Profile Picture</label>
                <input
                  type="file"
                  name="profilePicture"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Signature Specimen</label>
                <input
                  type="file"
                  name="signaturePicture"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </form>
            <div>
                <label className="block text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter password"
                />
            </div>
            <div>
                <label className="block text-gray-700 mb-1">Comment (optional)</label>
                <textarea
                    value={formData.comment}
                    name='comment'
                    onChange={handleInputChange}
                    className="border p-2 rounded w-full mt-1 h-[100px]"
                >
                </textarea>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${isSubmitting ? 'px-4 py-2 bg-gray-200 text-white rounded hover:bg-gray-200' : 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'}`}
                  disabled={isSubmitting ? true : false}
                  onClick={handleAddUser}
                >
                  {isSubmitting ? 'Creating...' : 'Create user'}
                </button>
              </div>
          </div>
        </div>
    )
}
export default AddUserModal