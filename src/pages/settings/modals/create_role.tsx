import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';
import { RootState } from "../../../redux/store";
import { baseURL } from "../../../utils/api";

interface props {
    setIsModalOpen: (val: boolean) => void,
    refresh: () => void
}

const AddRoleModal: React.FC<props> = ({setIsModalOpen, refresh}) => {
    const token = useSelector((state: RootState) => state.userAuth.token.access_token)

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
      });
    
      const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
      };
    
      const handleAddRole = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!formData.name) {
          toast.error('Role name is required!');
          return;
        }
    
        try {
          setIsSubmitting(true)
          const response = await fetch(`${baseURL}/roles/create`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData),
          });
    
          const data = await response.json();
          if (data.success) {
            refresh()
            toast.success('Role added successfully!');
            setFormData({ name: '' });
            setIsModalOpen(false);
            setIsSubmitting(false)
          } else {
            toast.error(data.message || 'Failed to add role');
            setIsSubmitting(false)
          }
        } catch (error) {
          toast.error('An error occurred while adding the role.');
          setIsSubmitting(false)
        }
      };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-auto z-50">
          <div className="bg-white p-6 rounded mt-12 shadow-md w-[500]">
            <h2 className="text-xl font-bold mb-4">Create role</h2>
            <form>
              <div>
                <label className="block text-gray-700 mb-1">Role name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter name"
                />
              </div> 
            </form>
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
                  onClick={handleAddRole}
                >
                  {isSubmitting ? 'Creating...' : 'Create role'}
                </button>
              </div>
          </div>
        </div>
    )
}
export default AddRoleModal