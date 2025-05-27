import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import axios from "axios";
import { toast } from "react-toastify";
import useAuth from "../../../hooks/useAuth";
import useAssets from "../../../hooks/assets/useAssets";
import { ASSETSENDPOINTS } from "../../../api/assetEndpoints";
import { baseURL } from "../../../utils/api";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

interface AddOrModifyDisposalProps {
  visible: boolean;
  onClose: () => void;
  item?: any;
  onSave: () => void;
}

const disposalTypes = [
  "Sale",
  "Scrap",
  "Donation",
  "Lost",
  "Theft",
  "Trade-In",
  "Out-of-use",
];

const AddOrModifyDisposal: React.FC<AddOrModifyDisposalProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const { token } = useAuth();
  const { data: assets } = useAssets();

  const [formState, setFormState] = useState<any>({
    asset_id: "",
    disposal_date: "",
    disposal_type: "",
    disposal_value: 0,
    net_book_value: 0,
    disposal_reference: "",
    reason: "",
    notes: "",
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
        disposal_date: "",
        disposal_type: "",
        disposal_value: 0,
        net_book_value: 0,
        disposal_reference: "",
        reason: "",
        notes: "",
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
        disposal_date: formState.disposal_date
          ? new Date(formState.disposal_date).toISOString().split("T")[0]
          : undefined,
        disposal_type: formState.disposal_type,
        disposal_value: formState.disposal_value,
        net_book_value: formState.net_book_value,
        disposal_reference: formState.disposal_reference,
        reason: formState.reason,
        notes: formState.notes || "",
      };

      const method = item?.id ? "PUT" : "POST";
      const endpoint = item?.id
        ? ASSETSENDPOINTS.ASSETS.DISPOSAL.MODIFY(item.id.toString())
        : ASSETSENDPOINTS.ASSETS.DISPOSAL.CREATE(formState.asset_id);

      await api.request({ method, url: endpoint, data: payload });

      toast.success(
        `Disposal ${item?.id ? "updated" : "recorded"} successfully`
      );
      onSave();
      onClose();
    } catch (err) {
      console.error("Failed to save disposal:", err);
      setError("Failed to save disposal.");
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
        form="disposal-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Asset Disposal" : "Record Asset Disposal"}
      visible={visible}
      style={{ width: "700px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="disposal-form" onSubmit={handleSave}>
        <div className="p-fluid grid grid-cols-2 gap-4">
          {!item && (
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
          )}

          <div>
            <label>Disposal Date *</label>
            <Calendar
              value={
                formState.disposal_date
                  ? new Date(formState.disposal_date)
                  : undefined
              }
              onChange={(e) => handleChange("disposal_date", e.value)}
              showIcon
              className="w-full"
            />
          </div>

          <div>
            <label>Disposal Type *</label>
            <Dropdown
              value={formState.disposal_type}
              onChange={(e) => handleChange("disposal_type", e.value)}
              options={disposalTypes.map((type) => ({
                label: type,
                value: type,
              }))}
              placeholder="Select Type"
              className="w-full"
            />
          </div>

          <div>
            <label>Disposal Value *</label>
            <InputNumber
              value={formState.disposal_value}
              onValueChange={(e) => handleChange("disposal_value", e.value)}
              className="w-full"
            />
          </div>

          <div>
            <label>Net Book Value *</label>
            <InputNumber
              value={formState.net_book_value}
              onValueChange={(e) => handleChange("net_book_value", e.value)}
              className="w-full"
            />
          </div>

          <div className="col-span-2">
            <label>Disposal Reference *</label>
            <InputText
              value={formState.disposal_reference}
              onChange={(e) =>
                handleChange("disposal_reference", e.target.value)
              }
              className="w-full"
            />
          </div>

          <div className="col-span-2">
            <label>Reason *</label>
            <InputTextarea
              value={formState.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="col-span-2">
            <label>Notes (Optional)</label>
            <InputTextarea
              value={formState.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyDisposal;
