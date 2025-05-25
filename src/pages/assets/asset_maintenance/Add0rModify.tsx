import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Chips } from "primereact/chips";
import axios from "axios";
import { toast } from "react-toastify";
import useAuth from "../../../hooks/useAuth";
import useAssets from "../../../hooks/assets/useAssets";
import useSuppliers from "../../../hooks/inventory/useSuppliers";
import { ASSETSENDPOINTS } from "../../../api/assetEndpoints";
import { baseURL } from "../../../utils/api";
import { InputTextarea } from "primereact/inputtextarea";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

interface AddOrModifyMaintenanceProps {
  visible: boolean;
  onClose: () => void;
  item?: any;
  onSave: () => void;
}

const maintenanceTypes = ["Corrective", "Preventive", "Scheduled"];

const priorityOptions = ["Low", "Medium", "High", "Critical"];

const AddOrModifyMaintenance: React.FC<AddOrModifyMaintenanceProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const { token } = useAuth();
  const { data: assets } = useAssets();
  const { data: suppliers } = useSuppliers();

  const [formState, setFormState] = useState<any>({
    asset_id: "",
    start_date: "",
    end_date: "",
    maintenance_type: "",
    downtime_days: 0,
    description: "",
    cost: 0,
    service_provider_id: "",
    priority: "",
    checklist: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        start_date: "",
        end_date: "",
        maintenance_type: "",
        downtime_days: 0,
        description: "",
        cost: 0,
        service_provider_id: "",
        priority: "",
        checklist: [],
      });
    }
  }, [item]);

  const handleChange = (name: string, value: any) => {
    setFormState((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

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
        ? ASSETSENDPOINTS.ASSETS.MAINTENANCE.MODIFY(item.id.toString())
        : ASSETSENDPOINTS.ASSETS.MAINTENANCE.CREATE;

      await api.request({ method, url: endpoint, data: payload });

      toast.success(
        `Maintenance ${item?.id ? "updated" : "created"} successfully`
      );
      onSave();
      onClose();
    } catch (err) {
      console.error("Failed to save maintenance:", err);
      setError("Failed to save maintenance.");
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
        form="maintenance-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Maintenance" : "Add Maintenance"}
      visible={visible}
      style={{ width: "700px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="maintenance-form" onSubmit={handleSave}>
        <div className="p-fluid grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label>Asset *</label>
            <Dropdown
              value={formState.asset_id}
              onChange={(e) => handleChange("asset_id", e.value)}
              options={assets.map((asset) => ({
                label: asset.name,
                value: asset.id,
              }))}
              placeholder="Select Asset"
              className="w-full"
            />
          </div>

          <div>
            <label>Start Date *</label>
            <Calendar
              value={
                formState.start_date
                  ? new Date(formState.start_date)
                  : undefined
              }
              onChange={(e) => handleChange("start_date", e.value)}
              showIcon
              className="w-full"
            />
          </div>

          <div>
            <label>End Date</label>
            <Calendar
              value={
                formState.end_date ? new Date(formState.end_date) : undefined
              }
              onChange={(e) => handleChange("end_date", e.value)}
              showIcon
              className="w-full"
            />
          </div>

          <div>
            <label>Maintenance Type *</label>
            <Dropdown
              value={formState.maintenance_type}
              onChange={(e) => handleChange("maintenance_type", e.value)}
              options={maintenanceTypes.map((type) => ({
                label: type,
                value: type,
              }))}
              placeholder="Select Type"
              className="w-full"
            />
          </div>

          <div>
            <label>Priority *</label>
            <Dropdown
              value={formState.priority}
              onChange={(e) => handleChange("priority", e.value)}
              options={priorityOptions.map((p) => ({ label: p, value: p }))}
              placeholder="Select Priority"
              className="w-full"
            />
          </div>

          <div>
            <label>Downtime Days</label>
            <InputNumber
              value={formState.downtime_days}
              onValueChange={(e) => handleChange("downtime_days", e.value)}
              className="w-full"
            />
          </div>

          <div>
            <label>Cost</label>
            <InputNumber
              value={formState.cost}
              onValueChange={(e) => handleChange("cost", e.value)}
              className="w-full"
            />
          </div>

          <div className="col-span-2">
            <label>Service Provider *</label>
            <Dropdown
              value={formState.service_provider_id}
              onChange={(e) => handleChange("service_provider_id", e.value)}
              options={suppliers.map((s) => ({
                label: s.name,
                value: s.id,
              }))}
              placeholder="Select Supplier"
              className="w-full"
              filter
            />
          </div>

          <div className="col-span-2">
            <label>Description</label>
            <InputText
              value={formState.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="col-span-2">
            <label>Checklist (Optional - Separated by commas)</label>
            <InputTextarea
              value={formState.checklist}
              onChange={(e) => handleChange("checklist", e.value)}
              className="w-full"
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyMaintenance;
