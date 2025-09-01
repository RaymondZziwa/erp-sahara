import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { toast } from "react-toastify";
import { SupplierLoanRequest } from "../../redux/slices/types/supplierLoans/supplierLoans";

interface ApprovalModalProps {
  visible: boolean;
  actionType: "approve" | "reject";
  onHide: () => void;
  onConfirm: (payload: any) => void;
  loan: SupplierLoanRequest
}

const ApprovalOrRejectionModal: React.FC<ApprovalModalProps> = ({
  visible,
  actionType,
  onHide,
  onConfirm,
  loan
}) => {
  const [formData, setFormData] = useState<any>({
    remarks: "",
    approved_amount: "",
    installments: "",
    interest_rate: "",
    rejection_reason: ""
  });

  useEffect(() => {
    if (loan) {
      setFormData({
        remarks: loan?.remarks,
        approved_amount: loan?.requested_amount,
        installments: parseInt(loan?.installments),
        interest_rate: parseInt(loan?.interest_rate),
        rejection_reason: ""
      })
    }
  }, [loan])

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

    const handleConfirm = () => {
    if (actionType === "approve" && (!formData.approved_amount || !formData.installments || !formData.interest_rate)) {
      toast.error("Please fill in all required fields for approval.");
      return;
    }
    if (actionType === "approve") {
      const payload = {
        remarks: formData.remarks,
        approved_amount: formData.approved_amount,
        installments: formData.installments,
        interest_rate: formData.interest_rate
      };
    onConfirm(payload);
    } else {
      const payload = {
        rejection_reason: formData.rejection_reason
      };
      onConfirm(payload);
      setFormData({
        ...formData,
        rejection_reason: ""
      })
    }
    onHide();
  };

  const footerContent = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancel"
        severity="secondary"
        style={{
            backgroundColor: "#adb5bd",
            borderColor: "#adb5bd"
        }}
        onClick={onHide}
      />
      <Button
        label="Confirm"
        icon="pi pi-check"
        onClick={handleConfirm}
        severity={actionType === "approve" ? "success" : "danger"}
      />
    </div>
  );

  return (
    <Dialog
      header={actionType === "approve" ? "Approve Loan" : "Reject Loan"}
      visible={visible}
      style={{ width: "400px" }}
      modal
      footer={footerContent}
      onHide={onHide}
    >
      {actionType === "approve" ? (
        <div className="flex flex-col gap-3">
          <div>
            <label className="block mb-1">Approved Amount<span className="text-red-500">*</span></label>
            <InputNumber
              value={formData.approved_amount}
              onValueChange={(e) => handleChange("approved_amount", e.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Installments<span className="text-red-500">*</span></label>
            <InputNumber
              value={formData.installments}
              onValueChange={(e) => handleChange("installments", e.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Interest Rate (%)<span className="text-red-500">*</span></label>
            <InputNumber
              value={formData.interest_rate}
              onValueChange={(e) => handleChange("interest_rate", e.value)}
              className="w-full"
              suffix="%"
            />
                  </div>
            <div>
            <label className="block mb-1">Remarks<span className="text-red-500">*</span></label>
            <InputTextarea
              value={formData.remarks}
              onChange={(e) => handleChange("remarks", e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      ) : (
        <div>
          <label className="block mb-1">Rejection Reason<span className="text-red-500">*</span></label>
            <InputTextarea
            rows={3}
            value={formData.rejection_reason}
            onChange={(e) => handleChange("rejection_reason", e.target.value)}
            className="w-full"
          />
        </div>
      )}
    </Dialog>
  );
};

export default ApprovalOrRejectionModal;
