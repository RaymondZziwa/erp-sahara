import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import usePaymentMethods from "../../hooks/procurement/usePaymentMethods";
import { toast } from "react-toastify";
import { SUPPLIER_LOAN_ENDPOINTS } from "../../api/supplierLoanEndpoints";
import { apiRequest } from "../../utils/api";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import useSupplierLoans from "../../hooks/supplierLoans/useSupplierLoans";

interface LoanPaymentModalProps {
    loanId: string;
    onSuccess: () => void;
    onClose: () => void;
    isVisible: boolean;
}

export const LoanPaymentModal: React.FC<LoanPaymentModalProps> = ({
    onClose,
    isVisible,
    loanId,
    onSuccess
}) => {
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [remarks, setRemarks] = useState("");
  const {refresh} = useSupplierLoans()
  const [amount, setAmount] = useState<number | null>(null);
  const { data: paymentMethods, loading } = usePaymentMethods();
    const [submitting, setSubmitting] = useState(false);
    const token = useSelector((state: RootState) => state.userAuth.token.access_token);

  const handleSubmit = async () => {
    if (!paymentMethodId || !amount) return;

    try {
      setSubmitting(true);
     
        const payload = {
                payment_method_id: paymentMethodId,
            remarks,
            amount,
              };
                
      await apiRequest(SUPPLIER_LOAN_ENDPOINTS.SUPPLIER_LOANS.PAY(loanId), "POST", token, payload);
      toast.success("Loan repayment processed succesfully")
      setPaymentMethodId("");
      setRemarks("");
      setAmount(null);
      refresh()
      if (onSuccess) onSuccess();
      onClose()
    } catch (err) {
      console.error("Payment failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog
        header="Pay Loan"
        visible={isVisible}
        onHide={onClose}
        style={{ width: "400px" }}
        modal
      >
        <div className="flex flex-col gap-4">
        <div className="field">
  <label htmlFor="paymentMethod">Payment Method<span className="text-red-500">*</span></label>
  <Dropdown
    id="paymentMethod"
    value={paymentMethodId}
    options={paymentMethods?.map((pm) => ({ label: pm.name, value: pm.id })) || []}
    onChange={(e) => setPaymentMethodId(e.value)}
    placeholder={loading ? "Loading..." : "Select Payment Method"}
    className="w-full"
  />
</div>

<div className="field">
  <label htmlFor="amount">Amount<span className="text-red-500">*</span></label>
  <InputNumber
    id="amount"
    value={amount}
    onValueChange={(e) => setAmount(e.value ?? null)}
    placeholder="Amount"
    className="w-full"
  />
</div>

<div className="field">
  <label htmlFor="remarks">Remarks<span className="text-red-500">*</span></label>
  <InputText
    id="remarks"
    value={remarks}
    onChange={(e) => setRemarks(e.target.value)}
    placeholder="Remarks"
    className="w-full"
  />
</div>


          <Button
            label={submitting ? "Processing..." : "Submit Payment"}
            icon="pi pi-check"
            className="p-button-sm p-button-primary"
            onClick={handleSubmit}
            disabled={submitting || !paymentMethodId || !amount}
          />
        </div>
      </Dialog>
    </>
  );
};
