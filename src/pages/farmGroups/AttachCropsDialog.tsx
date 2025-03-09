import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";

import { apiRequest } from "../../utils/api";
import useAuth from "../../hooks/useAuth";
import { ServerResponse } from "../../redux/slices/types/ServerResponse";
import { FARM_GROUPS_ENDPOINTS } from "../../api/farmGroupsEndpoints";
import { CROPS_ENDPOINTS } from "../../api/cropsEndpoints";
interface AttachCropsDialogProps {
  visible: boolean;
  farmGroupId: number;
  onClose: () => void;
  onConfirm: () => void;
}

interface Crop {
  id: number;
  name: string;
}

const AttachCropsDialog: React.FC<AttachCropsDialogProps> = ({
  visible,
  farmGroupId,
  onClose,
  onConfirm,
}) => {
  const toast = useRef<Toast>(null);
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrops, setSelectedCrops] = useState<number[]>([]);

  // Fetch all crops and pre-selected crops for the farm group
  useEffect(() => {
    if (visible) {
      fetchCrops();
      fetchAttachedCrops();
    }
  }, [visible]);

  const fetchCrops = async () => {
    try {
      const response = await apiRequest<ServerResponse<Crop[]>>(
        CROPS_ENDPOINTS.CROPS.GET_ALL,
        "GET",
        token.access_token
      );
      setCrops(response.data ?? []);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch crops",
        life: 3000,
      });
    }
  };

  const fetchAttachedCrops = async () => {
    try {
      const response = await apiRequest<ServerResponse<Crop[]>>(
        `${FARM_GROUPS_ENDPOINTS.FARM_GROUPS.GET_BY_ID(farmGroupId.toString())}/crops`,
        "GET",
        token.access_token
      );
      setSelectedCrops(response.data?.map((crop) => crop.id) ?? []);
    } catch (error) {
      toast.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: "Failed to fetch attached crops.",
        life: 3000,
      });
    }
  };

  // Handle attaching crops
  const handleAttachCrops = async () => {
    setLoading(true);
    try {
      await apiRequest<ServerResponse<unknown>>(
        `${FARM_GROUPS_ENDPOINTS.FARM_GROUPS.GET_BY_ID(farmGroupId.toString())}/crops`,
        "POST",
        token.access_token,
        { crop_ids: selectedCrops }
      );

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Crops attached successfully!",
        life: 3000,
      });

      onConfirm(); // Refresh parent data
      onClose(); // Close modal
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to attach crops.",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle crop selection
  const toggleCrop = (cropId: number) => {
    setSelectedCrops((prev) =>
      prev.includes(cropId) ? prev.filter((id) => id !== cropId) : [...prev, cropId]
    );
  };

  // Dialog footer buttons
  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500 text-white"
        disabled={loading}
      />
      <Button
        label="Attach"
        icon="pi pi-check"
        onClick={handleAttachCrops}
        className="p-button-text !bg-green-500 text-white"
        disabled={loading}
        loading={loading}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Attach Crops"
        visible={visible}
        style={{ width: "500px" }}
        footer={footer}
        onHide={onClose}
      >
        <p>Select crops to attach to this farm group:</p>
        <div className="grid gap-2 mt-4">
          {crops.map((crop) => (
            <div key={crop.id} className="flex items-center gap-2">
              <Checkbox
                inputId={`crop-${crop.id}`}
                checked={selectedCrops.includes(crop.id)}
                onChange={() => toggleCrop(crop.id)}
              />
              <label htmlFor={`crop-${crop.id}`} className="cursor-pointer">
                {crop.name}
              </label>
            </div>
          ))}
        </div>
      </Dialog>
    </>
  );
};

export default AttachCropsDialog;
