import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { API_ENDPOINTS } from "../../../api/apiEndpoints";
import { apiRequest } from "../../../utils/api";
import { toast } from "react-toastify";

interface Employee {
  employee_id: string;
  first_name: string;
  last_name: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  employee: Employee | null;
}

const SetPinModal: React.FC<Props> = ({ visible, onClose, employee }) => {
  const [pin, setPin] = useState("");
  const token = useSelector((state: RootState) => state.userAuth.token);

  if (!visible || !employee) return null;

  const handleSubmit = async () => {
    if (pin.length !== 5) {
      toast.error("PIN must be 5 digits");
      return;
    }
      
    if (!employee || !employee.id) {
        toast.error("No employee selected or invalid employee data");
        return;
    }
    

      try {
          const payload = {
            pin, 
            employee_id: employee.id 
          }
          
          console.log(payload)
      await apiRequest(
        API_ENDPOINTS.PIN.SET_PIN, 
        'POST', 
        token?.access_token,
       payload
      );
      toast.success(`PIN set for ${employee.first_name} ${employee.last_name}`);
      setPin("");
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to set PIN");
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-teal-700 mb-4">
          Set Access PIN for {employee.first_name} {employee.last_name}
        </h2>
        <input
          type="password"
          maxLength={5}
          className="w-full border border-teal-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="Enter 5-digit PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
          >
            Set
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetPinModal;