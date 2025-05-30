import React from "react";

interface AcknowledgeModalProps {
  visible: boolean;
  onClose: () => void;
  onAcknowledge: () => void;
}

const AcknowledgeModal: React.FC<AcknowledgeModalProps> = ({
  visible,
  onClose,
  onAcknowledge,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Acknowledge Order</h2>
        <p className="mb-4">
          Are you sure you want to acknowledge this purchase order?
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={onAcknowledge}
            className="px-4 py-2 bg-teal-500 text-white rounded"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcknowledgeModal;
