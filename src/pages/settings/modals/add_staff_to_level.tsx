import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';
import { RootState } from "../../../redux/store";
import { baseURL } from "../../../utils/api";

interface props {
    setIsModalOpen: (val: boolean) => void,
    refresh: () => void,
    levelId: number,
}

const AddStaffToApprovalLevelModal: React.FC<props> = ({setIsModalOpen, refresh, levelId}) => {
    const token = useSelector((state: RootState) => state.userAuth.token.access_token)
    const users = useSelector((state: RootState) => state.usersList.data)

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        user_id: '',
        role: '',
        approver_names:"Alfred",
        approver_email:"mplat84@gmail.com"
      });
    
      const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
      };
    
      const handleAddRole = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!formData.user_id) {
          toast.error('Staff is required!');
          return;
        }

        if (!formData.role) {
            toast.error('Role is required!');
            return;
        }
    
        try {
          setIsSubmitting(true)
          const response = await fetch(`${baseURL}/erp/accounts/requisitions-approval-level/${levelId}/add_approver`, {
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
            toast.success('Staff added successfully!');
            setFormData({ user_id: '' , role: '', approver_names:"", approver_email: ""});
            setIsModalOpen(false);
            setIsSubmitting(false)
          } else {
            toast.error(data.message || 'Failed to add staff');
            setIsSubmitting(false)
          }
        } catch (error) {
          toast.error('An error occurred while adding the staff.');
          setIsSubmitting(false)
        }
      };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-auto z-50">
          <div className="bg-white p-6 rounded mt-12 shadow-md w-[500]">
            <h2 className="text-xl font-bold mb-4">Add staff to approval level</h2>
            <form>
              <div>
                <label className="block text-gray-700 mb-1">Add staff</label>
                <select
                    name='user_id'
                    value={formData.user_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded"
                    >
                    <option value=" ">Select staff</option>
                    {
                        users.map((user) => (
                            <option value={user.id}>{user.user.first_name} {user.user.last_name}</option>
                        ))
                    }
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Select role</label>
                <select
                    name='role'
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded"
                    >
                    <option value=" ">Select role</option>
                    <option value="approver">Approver</option>
                    <option value="reviewer">Reviewer</option>
                </select>
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
                  {isSubmitting ? 'Adding...' : 'Add staff'}
                </button>
              </div>
          </div>
        </div>
    )
}
export default AddStaffToApprovalLevelModal