import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { apiRequest } from "../../../../utils/api";
import { ACCOUNTS_ENDPOINTS } from "../../../../api/accountsEndpoints";
import { StoreRequisition } from "../../../../redux/slices/types/accounts/cash_requisitions/CashRequisition";

interface DialogState {
  currentAction: "approve" | "";
  selectedItem?: StoreRequisition;
}

interface ApproveOrRejectProps {
  dialogState: DialogState;
  setDialogState: (state: DialogState) => void;
  refresh: () => void;
}

interface ApprovalItem {
  store_requisition_item_id: string;
  approved_quantity: number;
  comments?: string | null;
  action: "approve" | "reject";
  ticked: boolean; // for checkbox
}

interface ApprovalData {
  remarks: string;
  items: ApprovalItem[];
}

const ApproveOrReject = ({
  dialogState,
  setDialogState,
  refresh,
}: ApproveOrRejectProps) => {
  const token = useSelector((state: RootState) => state.userAuth?.token);
  const [approvalData, setApprovalData] = useState<ApprovalData>({
    remarks: "",
    items: [],
  });

  // populate items when modal opens
    useEffect(() => {
    if (dialogState.currentAction === "approve" && dialogState.selectedItem) {
      const items = dialogState.selectedItem.items.map((i) => ({
        store_requisition_item_id: i.id,
        approved_quantity: i.requested_quantity,
        comments: "",
        action: "approve" as "approve" | "reject",
        ticked: true, // default all ticked
      }));
      setApprovalData({ remarks: "", items });
    }
  }, [dialogState.currentAction, dialogState.selectedItem]);

  const handleApprovalChange = (field: keyof ApprovalData, value: any) => {
    setApprovalData((prev) => ({ ...prev, [field]: value }));
  };

  const handleApprovalItemChange = (
    index: number,
    field: keyof ApprovalItem,
    value: any
  ) => {
    setApprovalData((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      return { ...prev, items: updatedItems };
    });
  };

  const handleSubmit = async () => {
    const payload = {
      remarks: approvalData.remarks,
      items: approvalData.items.map((item) => ({
        store_requisition_item_id: item.store_requisition_item_id,
        approved_quantity: item.approved_quantity,
        comments: item.comments || null,
        action: item.ticked ? "approve" : "reject",
      })),
    };

      try {
          if (dialogState.currentAction === "approve") {
            await apiRequest(
                ACCOUNTS_ENDPOINTS.STORE_REQUISITIONS.APPROVE(dialogState.selectedItem?.id),
                "POST",
                token.access_token,
                payload
              );
              toast.success("Requisition approved successfully");
          } else {
            await apiRequest(
                ACCOUNTS_ENDPOINTS.STORE_REQUISITIONS.REJECT(dialogState.selectedItem?.id),
                "POST",
                token.access_token,
                payload
              );
              toast.success("Requisition rejected successfully");
            }
      setDialogState({ selectedItem: undefined, currentAction: "" });
      refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Operation failed");
    }
  };

  return (
    <Dialog
    header={
        dialogState.currentAction === "approve"
          ? "Approve Store Requisition"
          : "Reject Store Requisition"
      }
      visible={dialogState.currentAction === "approve" || dialogState.currentAction === "reject"}
  style={{ width: "90vw", maxWidth: "800px" }}
  onHide={() => setDialogState({ selectedItem: undefined, currentAction: "" })}
>
  <div className="space-y-4">
    {/* Requisition Details */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4 mb-4">
      <div>
        <strong>Department:</strong>{" "}
        {dialogState.selectedItem?.department.name || "-"}
      </div>
      <div>
        <strong>Requested By:</strong>{" "}
        {dialogState.selectedItem?.requested_by_name || "-"}
      </div>
      <div>
            <strong>Priority: </strong>
            <span
                style={{
                color:
                    dialogState.selectedItem?.priority === "High"
                    ? "red"
                    : dialogState.selectedItem?.priority === "Medium"
                    ? "orange"
                    : dialogState.selectedItem?.priority === "Low"
                    ? "goldenrod"
                    : "inherit",
                fontWeight: "bold",
                }}
            >
                {dialogState.selectedItem?.priority || "-"}
            </span>
        </div>

      <div>
        <strong>Total Items:</strong> {dialogState.selectedItem?.items.length || 0}
      </div>
      <div className="md:col-span-2">
        <strong>Remarks:</strong>{" "}
        {dialogState.selectedItem?.remarks || "-"}
      </div>
    </div>

    {/* Approval Remarks */}
    <div className="field">
      <label htmlFor="remarks">Approval Remarks</label>
      <InputText
        id="remarks"
        value={approvalData.remarks}
        onChange={(e) => handleApprovalChange("remarks", e.target.value)}
        className="w-full"
      />
    </div>

    {/* Items Approval */}
    <div className="space-y-4">
      <h4 className="text-lg font-semibold">Items</h4>
      {approvalData.items.map((item, index) => {
        const originalItem = dialogState.selectedItem?.items.find(
          (i) => i.id === item.store_requisition_item_id
        );
        return (
          <div key={index} className="border p-4 rounded-lg flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={item.ticked}
                onChange={(e) =>
                  handleApprovalItemChange(index, "ticked", e.checked)
                }
              />
              <span className="font-semibold">{originalItem?.item.name}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="field">
                <label>Requested Quantity</label>
                <InputNumber
                  value={originalItem?.requested_quantity || 0}
                  readOnly
                  className="w-full"
                />
              </div>
                    {dialogState.currentAction === "approve" && (
                        <div className="field">
                            <label htmlFor={`approved_quantity-${index}`}>Approved Quantity<span className="text-red-500">*</span></label>
                            <InputNumber
                            id={`approved_quantity-${index}`}
                            value={item.approved_quantity}
                            onValueChange={(e) =>
                                handleApprovalItemChange(index, "approved_quantity", e.value || 0)
                            }
                            min={0}
                            className="w-full"
                            required
                            />
                      </div>
                )}

              <div className="field md:col-span-2">
                <label htmlFor={`comments-${index}`}>Comments</label>
                <InputText
                  id={`comments-${index}`}
                  value={item.comments || ""}
                  onChange={(e) =>
                    handleApprovalItemChange(index, "comments", e.target.value || null)
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>

    {/* Buttons */}
    <div className="flex justify-end gap-2 mt-4">
        
                  <Button label={dialogState.currentAction === "reject" ? "Reject" : "Approve"} icon={dialogState.currentAction === "reject" ? "pi pi-times" : "pi pi-check"} onClick={handleSubmit} />
    </div>
  </div>
</Dialog>

  );
};

export default ApproveOrReject;
