import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { toast } from "react-toastify";
import { apiRequest } from "../../../../utils/api";
import { ACCOUNTS_ENDPOINTS } from "../../../../api/accountsEndpoints";

export interface VehicleRepair {
  id: string;
  requisition_no: string;
  truck_id: string;
  requested_by?: string | null;
  request_details: string;
  last_quantity_fuel_used: number;
  last_mileage: number;
  amount: number;
  department?: {
    name: string;
  };
  truck?: {
    license_plate: string;
  };
  trip?: string;
  total_round_kilometers?: number;
  reason?: string;
  // Added other necessary properties from the original FuelRequisition interface
}

interface ApprovalModalProps {
  visible: boolean;
  mode: "approve" | "reject";
  requisition: VehicleRepair | null;
  onHide: () => void;
  onCompleted: () => void; // callback to refresh table
  token: string;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  visible,
  mode,
  requisition,
  onHide,
  onCompleted,
  token,
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [comments, setComments] = useState<string>("");

  useEffect(() => {
    if (requisition) {
      setAmount(requisition.amount); // default to requested amount
      setComments("");
    }
  }, [requisition]);

  const handleSubmit = async () => {
    if (!requisition) return;

    const payload = {
      approved_amount: amount,
      comments,
    };

    try {
      const endpoint =
        mode === "approve"
          ? ACCOUNTS_ENDPOINTS.VEHICLE_REPAIR_REQUISITIONS.APPROVE(requisition.id)
          : ACCOUNTS_ENDPOINTS.VEHICLE_REPAIR_REQUISITIONS.REJECT(requisition.id);

      await apiRequest(endpoint, "POST", token, payload);
      toast.success(
        `Requisition ${mode === "approve" ? "approved" : "rejected"} successfully!`
      );
      onCompleted();
      onHide();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to complete action");
      console.error(err);
    }
  };

  if (!requisition) return null;

  return (
    <Dialog
      header={mode === "approve" ? "Approve Vehicle Repair Requisition" : "Reject Vehicle Repair Requisition"}
      visible={visible}
      style={{ width: "40vw" }}
      modal
      onHide={onHide}
    >
      <div className="p-fluid space-y-3">
        <div className="grid gap-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 p-2 rounded">
            <span className="font-medium text-gray-700">Requisition No:</span>
            <span className="text-gray-900">{requisition.requisition_no}</span>
          </div>

          {/* <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 p-2 rounded">
            <span className="font-medium text-gray-700">Department:</span>
            <span className="text-gray-900">{requisition.department?.name}</span>
          </div> */}

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 p-2 rounded">
            <span className="font-medium text-gray-700">Truck:</span>
            <span className="text-gray-900">{requisition.truck?.license_plate}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 p-2 rounded">
            <span className="font-medium text-gray-700">Request Details:</span>
            <span className="text-gray-900">{requisition.request_details}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 p-2 rounded">
            <span className="font-medium text-gray-700">Last Fuel Used:</span>
            <span className="text-gray-900">{requisition.last_quantity_fuel_used} L</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 p-2 rounded">
            <span className="font-medium text-gray-700">Last Mileage:</span>
            <span className="text-gray-900">{requisition.last_mileage} km</span>
          </div>

          {/* <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 p-2 rounded">
            <span className="font-medium text-gray-700">Requested Amount:</span>
            <span className="text-gray-900 font-semibold">{requisition.amount}</span>
          </div> */}
        </div>

        {/* Amount Input */}
        {/* <div>
          <label>{mode === "approve" ? "Approved Amount" : "Rejected Amount"}</label>
          <InputNumber
            value={amount}
            onValueChange={(e) => setAmount(e.value || 0)}
            className="w-full"
            disabled={mode === "reject"}
          />
        </div> */}

        {/* Comments */}
        <div>
          <label>Comments</label>
          <InputTextarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
            className="w-full"
            placeholder={`Optional comments for ${mode}`}
          />
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            label={mode === "approve" ? "Approve" : "Reject"}
            className={mode === "approve" ? "p-button-success" : "p-button-danger"}
            onClick={handleSubmit}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default ApprovalModal;