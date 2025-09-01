import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { FuelRequisition } from "../../../../redux/slices/types/accounts/cash_requisitions/CashRequisition";
import { toast } from "react-toastify";
import { apiRequest } from "../../../../utils/api";
import { ACCOUNTS_ENDPOINTS } from "../../../../api/accountsEndpoints";

interface ApprovalModalProps {
  visible: boolean;
  mode: "approve" | "reject";
  requisition: FuelRequisition | null;
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
          ? ACCOUNTS_ENDPOINTS.FUEL_REQUISITIONS.APPROVE(requisition.id)
          : ACCOUNTS_ENDPOINTS.FUEL_REQUISITIONS.REJECT(requisition.id);

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
      header={mode === "approve" ? "Approve Fuel Requisition" : "Reject Fuel Requisition"}
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

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 p-2 rounded">
                <span className="font-medium text-gray-700">Department:</span>
                <span className="text-gray-900">{requisition.department?.name}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 p-2 rounded">
                <span className="font-medium text-gray-700">Truck:</span>
                <span className="text-gray-900">{requisition.truck?.license_plate}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 p-2 rounded">
                <span className="font-medium text-gray-700">Trip:</span>
                <span className="text-gray-900">{requisition.trip}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 p-2 rounded">
                <span className="font-medium text-gray-700">Total Round Kilometers:</span>
                <span className="text-gray-900">{requisition.total_round_kilometers}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 p-2 rounded">
                <span className="font-medium text-gray-700">Reason:</span>
                <span className="text-gray-900">{requisition.reason}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 p-2 rounded">
                <span className="font-medium text-gray-700">Requested Amount:</span>
                <span className="text-gray-900 font-semibold">{requisition.amount}</span>
            </div>
            </div>


        {/* Amount Input */}
        <div>
          <label>{mode === "approve" ? "Approved Amount" : "Rejected Amount"}</label>
          <InputNumber
            value={amount}
            onValueChange={(e) => setAmount(e.value || 0)}
            className="w-full"
            disabled={mode === "reject"}
          />
        </div>

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
