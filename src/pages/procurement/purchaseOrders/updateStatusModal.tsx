import React, { useState } from "react";

interface UpdateStatusModalProps {
  visible: boolean;
  onClose: () => void;
  onUpdate: (status: string) => void;
}

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  visible,
  onClose,
  onUpdate,
}) => {
  const [status, setStatus] = useState("");

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Update Status</h2>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
        >
          <option value="">Select status</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={() => onUpdate(status)}
            className="px-4 py-2 bg-teal-500 text-white rounded"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateStatusModal;
