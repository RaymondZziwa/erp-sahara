import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import axios from "axios";
import { toast } from "react-toastify";
import { ASSETSENDPOINTS } from "../../../api/assetEndpoints";
import useAssetAssignments from "../../../hooks/assets/useAssetAssignment";
import useAuth from "../../../hooks/useAuth";
import { AssetAssignment } from "../../../redux/slices/types/mossApp/assets/asset";
import { baseURL } from "../../../utils/api";
import useAssets from "../../../hooks/assets/useAssets";
import useEmployees from "../../../hooks/hr/useEmployees";

// API instance with base URL
const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

interface AddOrModifyAssignmentProps {
  visible: boolean;
  onClose: () => void;
  item?: AssetAssignment;
  onSave: () => void;
}

const AddOrModifyAssignment: React.FC<AddOrModifyAssignmentProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const { token } = useAuth();
  const [formState, setFormState] = useState<Partial<AssetAssignment>>({
    asset_id: "",
    assigned_to: "",
    reason_for_assignment: "",
    start_date: "",
    end_date: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: assets } = useAssets();
  const { data: employees } = useEmployees();

  useEffect(() => {
    const interceptor = api.interceptors.request.use((config) => {
      if (token?.access_token) {
        config.headers.Authorization = `Bearer ${token.access_token}`;
      }
      return config;
    });
    return () => api.interceptors.request.eject(interceptor);
  }, [token]);

  useEffect(() => {
    if (item) {
      setFormState({ ...item });
    } else {
      setFormState({
        asset_id: "",
        assigned_to: "",
        reason_for_assignment: "",
        start_date: "",
        end_date: "",
        notes: "",
      });
    }
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (name: keyof AssetAssignment, value: any) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const requiredFields: (keyof AssetAssignment)[] = [
      "asset_id",
      "assigned_to",
      "start_date",
    ];
    for (const field of requiredFields) {
      if (!formState[field]) {
        setError(`Field ${field} is required.`);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const payload = {
        ...formState,
        start_date: formState.start_date
          ? new Date(formState.start_date).toISOString().split("T")[0]
          : undefined,
        end_date: formState.end_date
          ? new Date(formState.end_date).toISOString().split("T")[0]
          : undefined,
      };

      const method = item?.id ? "PUT" : "POST";
      const endpoint = item?.id
        ? ASSETSENDPOINTS.ASSETS.ASSIGNMENTS.UPDATE(item.id.toString())
        : ASSETSENDPOINTS.ASSETS.ASSIGNMENTS.CREATE;

      await api.request({ method, url: endpoint, data: payload });

      toast.success(
        `Assignment ${item?.id ? "updated" : "created"} successfully`
      );
      onSave();
      onClose();
    } catch (err) {
      console.error("Failed to save assignment:", err);
      setError("Failed to save assignment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500 hover:bg-red-400"
        size="small"
        disabled={isSubmitting}
      />
      <Button
        loading={isSubmitting}
        disabled={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="assignment-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Assignment" : "Add Assignment"}
      visible={visible}
      style={{ width: "600px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="assignment-form" onSubmit={handleSave}>
        <div className="p-fluid grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label>
              Asset <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={formState.asset_id}
              onChange={(e) => handleDropdownChange("asset_id", e.value)}
              options={assets.map((asset) => ({
                label: asset.name,
                value: asset.id,
              }))}
              placeholder="Select Asset"
              className="w-full"
            />
          </div>

          <div className="col-span-2">
            <label>
              Assigned To <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={formState.assigned_to}
              onChange={(e) => handleDropdownChange("assigned_to", e.value)}
              options={employees.map((emp) => ({
                label: `${emp.first_name} ${emp.last_name}`,
                value: emp.id,
              }))}
              placeholder="Select Employee"
              className="w-full"
            />
          </div>

          <div className="col-span-2">
            <label>
              Start Date <span className="text-red-500">*</span>
            </label>
            <Calendar
              value={
                formState.start_date
                  ? new Date(formState.start_date)
                  : undefined
              }
              onChange={(e) => handleDropdownChange("start_date", e.value)}
              showIcon
              className="w-full"
            />
          </div>

          <div className="col-span-2">
            <label>End Date</label>
            <Calendar
              value={
                formState.end_date ? new Date(formState.end_date) : undefined
              }
              onChange={(e) => handleDropdownChange("end_date", e.value)}
              showIcon
              className="w-full"
            />
          </div>

          <div className="col-span-2">
            <label>Reason for Assignment</label>
            <InputText
              name="reason_for_assignment"
              value={formState.reason_for_assignment || ""}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          <div className="col-span-2">
            <label>Notes</label>
            <InputText
              name="notes"
              value={formState.notes || ""}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </Dialog>
  );
};

export default AddOrModifyAssignment;
