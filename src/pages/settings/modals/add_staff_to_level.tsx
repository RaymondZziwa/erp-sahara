import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RootState } from "../../../redux/store";
import { apiRequest, baseURL } from "../../../utils/api";
import useEmployees from "../../../hooks/hr/useEmployees";
import axios from "axios";

interface props {
  setIsModalOpen: (val: boolean) => void;
  refresh: () => void;
  levelId: number;
}

const AddStaffToApprovalLevelModal: React.FC<props> = ({
  setIsModalOpen,
  refresh,
  levelId,
}) => {
  const token = useSelector(
    (state: RootState) => state.userAuth.token.access_token
  );
  // const users = useSelector((state: RootState) => state.usersList.data);
  const { data: emp } = useEmployees();
  console.log("emp", emp);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    approver_id: "",
    rank: 0,
    approver_title: "",
    description: "",
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    if (name === 'rank') {
      setFormData((prev) => ({ ...prev, [name]: +value }));
    }else{
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddRole = async (e: React.MouseEvent) => {
    e.preventDefault();
    console.log(formData);
    if (!formData.approver_id) {
      toast.error("Staff is required!");
      return;
    }

    try {
      const payload = {
        approvers: [formData],
      };
      setIsSubmitting(true);
      const response = await axios.post(
        `${baseURL}/accounts/approval-level/${levelId}/add_approver`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        refresh();
        toast.success("Staff added successfully!");
        setFormData({
          user_id: "",
          approver_names: "",
          rank: "",
          approver_title: "",
          description: "",
        });
        setIsModalOpen(false);
        setIsSubmitting(false);
      } else {
        toast.error(response.data.message || "Failed to add staff");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred while adding the staff.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-auto z-50">
      <div className="bg-white p-6 rounded mt-12 shadow-md w-[800px]">
        <h2 className="text-xl font-bold mb-4">Add staff to approval level</h2>
        <form>
          <div>
            <label className="block text-gray-700 mb-1">Add staff</label>
            <select
              name="approver_id"
              value={formData.approver_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value=" ">Select staff</option>
              {emp?.map((user) => (
                <option value={user.id} key={user.id}>
                  {user.first_name} {user.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Select rank</label>
            <select
              name="rank"
              value={formData.rank}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value=" ">Select rank</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1  mt-2">
              Enter Approver title
            </label>
            <input
              type="text"
              className="p-2 border border-gray-200 w-full"
              name="approver_title"
              onChange={(e) => handleInputChange(e)}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1  mt-2">
              Description
            </label>
            <input
              type="text"
              className="p-2 border border-gray-200 w-full"
              name="description"
              onChange={(e) => handleInputChange(e)}
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
            className={`${
              isSubmitting
                ? "px-4 py-2 bg-gray-200 text-white rounded hover:bg-gray-200"
                : "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            }`}
            disabled={isSubmitting ? true : false}
            onClick={handleAddRole}
          >
            {isSubmitting ? "Adding..." : "Add staff"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default AddStaffToApprovalLevelModal;
