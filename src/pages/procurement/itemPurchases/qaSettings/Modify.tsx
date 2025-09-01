import React, { useState, useEffect } from "react";

interface QaSettingItem {
  name: string;
  value: number;
}

interface EditQaSettingsModalProps {
  visible: boolean;
  initialData: QaSettingItem[];
  initialReason: string;
  onClose: () => void;
  onSave: (updatedValues: { data: QaSettingItem[]; reason: string }) => void;
}

// Convert array to object for easier form editing
function arrayToObject(data: QaSettingItem[]) {
  return data.reduce((acc, { name, value }) => {
    acc[name] = value;
    return acc;
  }, {} as Record<string, number>);
}

// Convert object back to array for saving
function objectToArray(obj: Record<string, number>): QaSettingItem[] {
  return Object.entries(obj).map(([name, value]) => ({ name, value }));
}

const EditQaSettingsModal: React.FC<EditQaSettingsModalProps> = ({
  visible,
  initialData,
  initialReason,
  onClose,
  onSave,
}) => {
  const [values, setValues] = useState<Record<string, number>>(
    arrayToObject(initialData)
  );
  const [reason, setReason] = useState(initialReason);

  useEffect(() => {
    setValues(arrayToObject(initialData));
    setReason(initialReason);
  }, [initialData, initialReason]);

  const handleChange = (field: string, val: string) => {
    setValues((prev) => ({
      ...prev,
      [field]: parseFloat(val) || 0,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ data: objectToArray(values), reason });
    onClose();
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Edit QA Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.keys(values).map((field) => (
            <label key={field} className="block">
              {field
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())}
              <input
                type="number"
                step="0.01"
                value={values[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </label>
          ))}

          <label className="block">
            Reason / Notes
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </label>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQaSettingsModal;
