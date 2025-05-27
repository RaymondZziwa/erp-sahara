import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RootState } from "../../../redux/store";
import { baseURL } from "../../../utils/api";

interface props {
  setIsModalOpen: (val: boolean) => void;
  refresh: () => void;
}

const AddLevelModal: React.FC<props> = ({ setIsModalOpen, refresh }) => {
  const token = useSelector(
    (state: RootState) => state.userAuth.token.access_token
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    level: "",
    approval_type: "",
    mandate: "",
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRole = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Role name is required!");
      return;
    }
    try {
      setIsSubmitting(true);
      const tempdata = {
        ...formData,
        level: Number(formData.level),
        mandate: Number(formData.mandate),
      };
      console.log(tempdata);
      console.log(baseURL);

      const response = await fetch(
        `${baseURL}/accounts/approval-level/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(tempdata),
        }
      );

      const data = await response.json();
      if (data.success) {
        refresh();
        toast.success("Approval level added successfully!");
        setFormData({ name: "", level: "", mandate: "", approval_type: "" });
        setIsModalOpen(false);
        setIsSubmitting(false);
      } else {
        toast.error("Failed to add approval level");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.log(error);

      toast.error("An error occurred while adding the approval level.");
      setIsSubmitting(false);
    }
  };
  
 const appType: string[] = [
   "Cash",
   "Fuel",
   "Repair",
   "PurchaseRequest",
   "PurchaseOrder",
   "SalesOrder",
   "Store",
   "PayRoll",
   "Disposal",
   "PurchaseQuoteEvaluation",
   "Disposals",
   "AssetFinancing",
 ];


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-auto z-50">
      <div className="bg-white p-6 rounded mt-12 shadow-md w-[500px]">
        <h2 className="text-xl font-bold mb-4">Create level</h2>
        <form>
          <div>
            <label className="block text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter name"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Approval Type </label>
            <select
              name="approval_type"
              value={formData.approval_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="" disabled>
                Select approval type
              </option>
              {appType.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Rank</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="" disabled>
                Select rank
              </option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Mandate</label>
            <select
              name="mandate"
              value={formData.mandate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="" disabled>
                Select mandate
              </option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
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
            className={`${
              isSubmitting
                ? "px-4 py-2 bg-gray-200 text-white rounded hover:bg-gray-200"
                : "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            }`}
            disabled={isSubmitting ? true : false}
            onClick={handleAddRole}
          >
            {isSubmitting ? "Creating..." : "Create level"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default AddLevelModal;
