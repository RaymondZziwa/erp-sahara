import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import usePaymentMethods from "../../hooks/procurement/usePaymentMethods";
import { toast } from "react-toastify";
import { apiRequest } from "../../utils/api";
import { SUPPLIER_LOAN_ENDPOINTS } from "../../api/supplierLoanEndpoints";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import useSupplierLoans from "../../hooks/supplierLoans/useSupplierLoans";

interface DisburseLoanModalProps {
  loanId: string;
  onSuccess: () => void;
  onClose: () => void;
  isVisible: boolean;
}

const DisburseLoanModal: React.FC<DisburseLoanModalProps> = ({
  onClose,
  isVisible,
  loanId,
  onSuccess,
}) => {
  const { data: paymentMethods } = usePaymentMethods();
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const {refresh} = useSupplierLoans()
  const [remarks, setRemarks] = useState("");
    const [loading, setLoading] = useState(false);
    const token = useSelector((state: RootState) => state.userAuth.token.access_token);

  const handleSubmit = async () => {
    if (!paymentMethodId || !remarks.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        payment_method_id: paymentMethodId,
        remarks,
      };
        
        await apiRequest(SUPPLIER_LOAN_ENDPOINTS.SUPPLIER_LOANS.DISBURSE(loanId), "POST", token, payload);
        toast.success("Loan disbursed successfully!");

      setPaymentMethodId("");
      setRemarks("");
      onSuccess();
      onClose();
      refresh()
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to disburse loan");
      console.error("Error disbursing loan:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header="Disburse Loan"
      visible={isVisible}
      style={{ width: "400px" }}
      onHide={onClose}
    >
      <div className="flex flex-col gap-3">
        {/* Payment Method */}
<div className="mb-4">
  <label className="block text-sm font-medium mb-1">Payment Method<span className="text-red-500">*</span></label>
  <Dropdown
    value={paymentMethodId}
    options={paymentMethods?.map((pm) => ({
      label: pm.name,
      value: pm.id,
    }))}
    onChange={(e) => setPaymentMethodId(e.value)}
    placeholder="Select Payment Method"
    className="w-full"
  />
</div>

{/* Remarks */}
<div className="mb-4">
  <label className="block text-sm font-medium mb-1">Remarks<span className="text-red-500">*</span></label>
  <InputTextarea
    value={remarks}
    onChange={(e) => setRemarks(e.target.value)}
    placeholder="Remarks"
    rows={3}
    className="w-full"
  />
</div>


        {/* Actions */}
        <div className="flex justify-end gap-2 mt-3">
          <Button label="Cancel" className="p-button-text" style={{
            backgroundColor: "#adb5bd",
            borderColor: "#adb5bd"
        }} onClick={onClose} />
          <Button
            label="Submit"
            icon="pi pi-check"
            className="p-button-sm p-button-raised p-button-success bg-teal-600 border-teal-600"
            onClick={handleSubmit}
            loading={loading}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default DisburseLoanModal;
