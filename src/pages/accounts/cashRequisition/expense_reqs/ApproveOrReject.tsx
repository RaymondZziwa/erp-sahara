import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { ConfirmDialog } from "primereact/confirmdialog";
import { CashRequisition } from "../../../../redux/slices/types/accounts/cash_requisitions/CashRequisition";
import { apiRequest } from "../../../../utils/api";
import { ACCOUNTS_ENDPOINTS } from "../../../../api/accountsEndpoints";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";

interface ApproveOrRejectProps {
  requisition: CashRequisition | null;
  visible: boolean;
  onHide: () => void;
  onCompleted: () => void;
  token: string;
}

const ApproveOrReject: React.FC<ApproveOrRejectProps> = ({
  requisition,
  visible,
  onHide,
  onCompleted,
}) => {
  const [remarks, setRemarks] = useState<string>("");
  const [approvedItems, setApprovedItems] = useState<Record<string, { 
    approved_unit_cost: number; 
    quantity: number;
    comments: string 
  }>>({});

  const token = useSelector((state: RootState) => state.userAuth.token)

  // Initialize approved items with default values
  React.useEffect(() => {
    if (requisition) {
      const initialItems: Record<string, any> = {};
      requisition.cash_requisition_items.forEach(item => {
        initialItems[item.id] = {
          approved_unit_cost: parseFloat(item.unit_cost),
          quantity: parseFloat(item.quantity),
          comments: ""
        };
      });
      setApprovedItems(initialItems);
    }
  }, [requisition]);

  const handleApprove = async () => {
    if (!requisition) return;

    try {
      const payload = {
        remarks: remarks || "Requisition approved",
        items: requisition.cash_requisition_items.map(item => ({
          cash_requisition_item_id: item.id,
          quantity: approvedItems[item.id]?.quantity || parseFloat(item.quantity),
          approved_unit_cost: approvedItems[item.id]?.approved_unit_cost || parseFloat(item.unit_cost),
          comments: approvedItems[item.id]?.comments || "Approved as requested"
        }))
      };

      await apiRequest(
        ACCOUNTS_ENDPOINTS.CASH_REQUISITIONS.APPROVE(requisition.id),
        "POST",
        token.access_token,
        payload
      );

      toast.success("Requisition approved successfully");
      
      onCompleted();
      onHide();
    } catch (error: any) {
      toast.error(error?.response?.data?.message)
    }
  };

  const handleReject = async () => {
    if (!requisition) return;

    try {
      const payload = {
        remarks: remarks || "Requisition rejected"
      };

      await apiRequest(
        ACCOUNTS_ENDPOINTS.CASH_REQUISITIONS.REJECT(requisition.id),
        "POST",
        token.access_token,
        payload
      );

      toast.success("Requisition rejected successfully");
      onCompleted();
      onHide();
    } catch (error: any) {
      toast.error(error?.response?.data?.message);
    }
  };

  const updateApprovedItem = (itemId: string, field: string, value: any) => {
    setApprovedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const calculateItemTotal = (item: any) => {
    const approvedItem = approvedItems[item.id];
    const unitCost = approvedItem?.approved_unit_cost || parseFloat(item.unit_cost);
    const quantity = approvedItem?.quantity || parseFloat(item.quantity);
    return unitCost * quantity;
  };

  const calculateGrandTotal = () => {
    if (!requisition) return 0;
    return requisition.cash_requisition_items.reduce((total, item) => {
      return total + calculateItemTotal(item);
    }, 0);
  };

  if (!requisition) return null;

  return (
    <>
      <ConfirmDialog />
      
      <Dialog
        header={`Review Cash Requisition - ${requisition.requisition_no}`}
        visible={visible}
        style={{ width: "20vw", minWidth: "500px", maxWidth: "900px" }}
        modal
        onHide={onHide}
        className="approval-dialog"
      >
        <div className="grid gap-4 mb-4">
          {/* Requisition Details */}
          <div className="col-12 md:col-6">
            <div className="bg-gray-50 p-3 rounded border-1 border-200 flex flex-row justify-between">
              <span className="font-medium text-gray-700 block mb-1">Requisition No:</span>
              <span className="text-gray-900 font-semibold">{requisition.requisition_no}</span>
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="bg-gray-50 p-3 rounded border-1 border-200 flex flex-row justify-between">
              <span className="font-medium text-gray-700 block mb-1">Department:</span>
              <span className="text-gray-900">{requisition.department?.name}</span>
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="bg-gray-50 p-3 rounded border-1 border-200 flex flex-row justify-between">
              <span className="font-medium text-gray-700 block mb-1">Requested By:</span>
              <span className="text-gray-900">
                {requisition.requested_by?.first_name} {requisition.requested_by?.last_name}
              </span>
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="bg-gray-50 p-3 rounded border-1 border-200 flex flex-row justify-between">
              <span className="font-medium text-gray-700 block mb-1">Expected Date:</span>
              <span className="text-gray-900">{requisition.date_expected}</span>
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="bg-gray-50 p-3 rounded border-1 border-200 flex flex-row justify-between">
              <span className="font-medium text-gray-700 block mb-1">Budget:</span>
              <span className="text-gray-900">{requisition.budget?.name}</span>
            </div>
          </div>

          <div className="col-12 md:col-6">
            <div className="bg-gray-50 p-3 rounded border-1 border-200 flex flex-row justify-between">
              <span className="font-medium text-gray-700 block mb-1">Requested Total:</span>
              <span className="text-gray-900 font-semibold">
                {parseFloat(requisition.total_amount).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="col-12">
            <div className="bg-gray-50 p-3 rounded border-1 border-200 flex flex-row justify-between">
              <span className="font-medium text-gray-700 block mb-1">Title:</span>
              <span className="text-gray-900">{requisition.title}</span>
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="mb-4">
          <h4 className="text-lg font-semibold mb-3">Items</h4>
          {requisition.cash_requisition_items.map((item, index) => (
            <div key={item.id} className="p-3 border-1 border-200 rounded mb-3">
              <div className="flex justify-between items-center mb-2">
                <h5 className="m-0">Item {index + 1}: {item.budget_item?.name}</h5>
                <span className="text-sm text-gray-600">
                  Account: {item.chart_of_account?.name}
                </span>
              </div>
              
              <div className="grid gap-3">
                <div className="col-12 md:col-4">
                  <label className="block text-900 font-medium mb-2">Quantity</label>
                  <InputNumber
                    value={approvedItems[item.id]?.quantity || parseFloat(item.quantity)}
                    onValueChange={(e) => updateApprovedItem(item.id, "quantity", e.value)}
                    className="w-full"
                    min={0}
                    mode="decimal"
                  />
                </div>
                
                <div className="col-12 md:col-4">
                  <label className="block text-900 font-medium mb-2">Unit Cost</label>
                  <InputNumber
                    value={approvedItems[item.id]?.approved_unit_cost || parseFloat(item.unit_cost)}
                    onValueChange={(e) => updateApprovedItem(item.id, "approved_unit_cost", e.value)}
                    className="w-full"
                    min={0}
                  />
                </div>
                
                <div className="col-12 md:col-4">
                  <label className="block text-900 font-medium mb-2">Total</label>
                  <InputNumber
                    value={calculateItemTotal(item)}
                    className="w-full"
                    disabled
                  />
                </div>
                
                <div className="col-12">
                  <label className="block text-900 font-medium mb-2">Specifications</label>
                  <div className="p-2 bg-gray-50 rounded border-1 border-200">
                    {item.specifications || "No specifications provided"}
                  </div>
                </div>
                
                <div className="col-12">
                  <label className="block text-900 font-medium mb-2">Comments</label>
                  <InputTextarea
                    value={approvedItems[item.id]?.comments || ""}
                    onChange={(e) => updateApprovedItem(item.id, "comments", e.target.value)}
                    rows={2}
                    className="w-full"
                    placeholder="Enter comments for this item"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Grand Total */}
        <div className="p-3 border-1 border-200 rounded bg-blue-50 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">Approved Grand Total:</span>
            <span className="text-xl font-bold">
              {calculateGrandTotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Remarks */}
        <div className="mb-4">
          <label className="block text-900 font-medium mb-2">Remarks</label>
          <InputTextarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
            className="w-full"
            placeholder="Enter remarks for this approval"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-2 mt-4">
          <Button
            label="Reject"
            icon="pi pi-times-circle"
            className="p-button-danger !bg-red-500"
            onClick={handleReject}
          />
          <Button
            label="Approve"
            icon="pi pi-check-circle"
            className="p-button-success"
            onClick={handleApprove}
          />
        </div>
      </Dialog>

      <style jsx>{`
        .approval-dialog :global(.p-dialog-content) {
          max-height: 70vh;
          overflow-y: auto;
        }
      `}</style>
    </>
  );
};

export default ApproveOrReject;