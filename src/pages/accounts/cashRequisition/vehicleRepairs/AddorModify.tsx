import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";

import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";

import useTrucks from "../../../../hooks/inventory/useTrucks";
import { apiRequest } from "../../../../utils/api";
import { ACCOUNTS_ENDPOINTS } from "../../../../api/accountsEndpoints";
import { FuelRequisition } from "../../../../redux/slices/types/accounts/cash_requisitions/CashRequisition";
import { toast } from "react-toastify";
import useVehicleRepairRequisitions from "../../../../hooks/accounts/cash_requisitions/useVehicleRepairs";

interface DialogState {
  currentAction: "add" | "edit" | "";
  selectedItem?: FuelRequisition;
}

interface Props {
  dialogState: DialogState;
  setDialogState: (state: DialogState) => void;
  requisition?: FuelRequisition;
}

const AddorModify: React.FC<Props> = ({ dialogState, setDialogState }) => {
  const { data: trucks } = useTrucks();
  const { refresh } = useVehicleRepairRequisitions();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = useSelector(
    (state: RootState) => state.userAuth.token.access_token
  );

  const [formData, setFormData] = useState({
    truck_id: "",
    request_details: "",
    last_quantity_fuel_used: 0,
    last_mileage: 0,
  });

  useEffect(() => {
    if (dialogState.currentAction === "edit" && dialogState.selectedItem) {
      const item = dialogState.selectedItem;
      setFormData({
        truck_id: item.truck_id,
        request_details: item.request_details || "",
        last_quantity_fuel_used: item.last_quantity_fuel_used || 0,
        last_mileage: item.last_mileage || 0,
      });
    } else if (dialogState.currentAction === "add") {
      // reset form when adding new
      setFormData({
        truck_id: "",
        request_details: "",
        last_quantity_fuel_used: 0,
        last_mileage: 0,
      });
    }
  }, [dialogState.selectedItem, dialogState.currentAction]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const payload = {
        truck_id: formData.truck_id,
        request_details: formData.request_details,
        last_quantity_fuel_used: formData.last_quantity_fuel_used,
        last_mileage: formData.last_mileage
      };

      if (dialogState.currentAction === "add") {
        await apiRequest(
          ACCOUNTS_ENDPOINTS.VEHICLE_REPAIR_REQUISITIONS.ADD,
          "POST",
          token,
          payload
        );
        toast.success("Vehicle repair requisition saved successfully");
      } else if (dialogState.currentAction === "edit" && dialogState?.selectedItem) {
        await apiRequest(
          ACCOUNTS_ENDPOINTS.FUEL_REQUISITIONS.UPDATE(dialogState.selectedItem.id),
          "POST",
          token,
          payload
        );
        toast.success("Vehicle repair requisition modified successfully");
      }

      refresh();
      setDialogState({ selectedItem: undefined, currentAction: "" });
      setIsSubmitting(false);
    } catch (err) {
      toast.error(err?.response?.data?.message);
      console.error("Error submitting fuel requisition:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      header={
        dialogState.currentAction === "add"
          ? "Add Vehicle Repair Requisition"
          : "Edit Vehicle Repair Requisition"
      }
      visible={!!dialogState.currentAction}
      style={{ width: "40vw" }}
      modal
      onHide={() =>
        setDialogState({ selectedItem: undefined, currentAction: "" })
      }
    >
      <div className="p-fluid grid grid-cols-1 gap-4">
        {/* Truck */}
        <div>
          <label htmlFor="truck">Truck<span className="text-red-500">*</span></label>
          <Dropdown
            id="truck"
            value={formData.truck_id}
            options={trucks?.map((truck) => ({
              label: truck.license_plate,
              value: truck.id,
            }))}
            onChange={(e) =>
              setFormData({ ...formData, truck_id: e.value })
            }
            placeholder="Select Truck"
          />
        </div>

        {/* Last Fuel Used */}
        {/* <div>
          <label htmlFor="last_quantity_fuel_used">Last Fuel Used (L)<span className="text-red-500">*</span></label>
          <InputNumber
            id="last_quantity_fuel_used"
            value={formData.last_quantity_fuel_used}
            onValueChange={(e) =>
              setFormData({ ...formData, last_quantity_fuel_used: e.value || 0 })
            }
            suffix="L"
            min={0}
            mode="decimal"
          />
        </div> */}

        {/* Last Mileage */}
        <div>
          <label htmlFor="last_mileage">Last Mileage (km)<span className="text-red-500">*</span></label>
          <InputNumber
            id="last_mileage"
            value={formData.last_mileage}
            onValueChange={(e) =>
              setFormData({ ...formData, last_mileage: e.value || 0 })
            }
            suffix="km"
            min={0}
          />
        </div>

        {/* Request Details */}
        <div>
          <label htmlFor="request_details">Request Details<span className="text-red-500">*</span></label>
          <InputTextarea
            id="request_details"
            value={formData.request_details}
            onChange={(e) =>
              setFormData({ ...formData, request_details: e.target.value })
            }
            placeholder="Truck was last refueled in Kampala depot."
            rows={3}
            autoResize
          />
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-2 mt-4">
        <Button
          label={isSubmitting ? "Saving..." : "Save"}
          disabled={isSubmitting}
          loading={isSubmitting}
          icon="pi pi-check"
          className="p-button-primary"
          onClick={handleSubmit}
        />
      </div>
    </Dialog>
  );
};

export default AddorModify;