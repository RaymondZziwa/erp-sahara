import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import usePaymentMethods from "../../../hooks/procurement/usePaymentMethods";
import useAuth from "../../../hooks/useAuth";
import { Settlement } from "../../../redux/slices/types/itemPurchases/purchase";
import { apiRequest } from "../../../utils/api";
import useCurrencies from "../../../hooks/procurement/useCurrencies";
import { Divider } from "primereact/divider";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";

interface PaySettlementModalProps {
  settlement: Settlement;
  onClose: () => void;
  onSave: () => void;
}

const PaySettlementModal: React.FC<PaySettlementModalProps> = ({
  settlement,
  onClose,
  onSave,
}) => {
  const amountPaidSoFar = settlement.total_paid || 0;
  const settlementBalance = settlement.total_payable - amountPaidSoFar;
  const supplierLoans = settlement.delivery?.supplier?.supplier_loans || [];
  const supplierLoanBalance = supplierLoans.reduce(
    (total, loan) => total + (parseFloat(loan.disbursed_amount) || 0),
    0
  );

  const { token } = useAuth();
  const { data: paymentMethods } = usePaymentMethods();
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [amountPaid, setAmountPaid] = useState<number | null>(settlementBalance);
  const [remarks, setRemarks] = useState("");
  const { data: currencies } = useCurrencies();
  const [loanId, setLoanId] = useState("");
  const [loanAmount, setLoanAmount] = useState<number | null>(null);
  const [currencyId, setCurrencyId] = useState("");

  const handleSave = async () => {
    if (!amountPaid || amountPaid <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    if (!paymentMethodId) {
      toast.error("Please select a payment method");
      return;
    }

    try {
      const payload = {
        payment_method_id: paymentMethodId,
        amount: amountPaid,
        remarks,
        //loan_id: loanId,
        //loan_amount: loanAmount,
        //currency_id: currencyId
      };
      
      const res = await apiRequest(
        `/purchases/settlements/${settlement.id}/cashierpay`,
        "POST",
        token.access_token,
        payload
      );
      
      if (res.success) {
        toast.success("Payment recorded successfully");
        onSave();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to record payment");
    }
  };

  const renderSummaryCard = (
    label: string,
    value: number,
    icon: string,
    valueClass: string,
    extraClass?: string
  ) => (
    <div className={`p-5 rounded-xl ${extraClass}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        <Icon icon={icon} className="text-2xl opacity-70" />
      </div>
      <p className={`mt-2 text-2xl font-bold ${valueClass}`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
  

  return (
    <Dialog
      visible={true}
      onHide={onClose}
      header="Supplier Payment"
      className="w-full max-w-2xl"
      draggable={false}
      resizable={false}
      blockScroll
    >
      <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto p-2">
        {/* Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
  {renderSummaryCard(
    "Total Payable",
    parseFloat(settlement.total_payable),
    "mdi:cash-multiple",
    "text-gray-800",
    "bg-white/70 backdrop-blur-lg border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
  )}
  {/* {renderSummaryCard(
    "Paid So Far",
    amountPaidSoFar,
    "mdi:cash-check",
    "text-teal-600",
    "bg-white/70 backdrop-blur-lg border border-teal-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
  )} */}
  {/* {renderSummaryCard(
    "Remaining Balance",
    settlementBalance,
    "mdi:scale-balance",
    settlementBalance > 0 ? "text-orange-500" : "text-green-500",
    "bg-white/70 backdrop-blur-lg border border-orange-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
  )}
  {renderSummaryCard(
    "Loan Balance",
    supplierLoanBalance,
    "mdi:hand-coin-outline",
    supplierLoanBalance > 0 ? "text-red-500" : "text-green-500",
    "bg-white/70 backdrop-blur-lg border border-red-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
  )} */}
</div>


        <Divider />

        {/* Payment Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Currency <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={currencyId}
              onChange={(e) => setCurrencyId(e.value)}
              options={currencies?.map((c) => ({
                label: c.name,
                value: c.id,
              }))}
              placeholder="Select Currency"
              className="w-full"
              filter
            />
          </div> */}

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(e.value)}
              options={paymentMethods?.map((pm) => ({
                label: pm.name,
                value: pm.id,
              }))}
              placeholder="Select Payment Method"
              className="w-full"
              filter
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Amount to Pay <span className="text-red-500">*</span>
            </label>
            <InputNumber
              value={amountPaid}
              onValueChange={(e) => setAmountPaid(e.value)}
              min={0}
              max={settlementBalance}
              className="w-full"
              placeholder={`Max: ${settlementBalance.toLocaleString()}`}
            />
          </div>

          {/* <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Loan (optional)
            </label>
            <Dropdown
              value={loanId}
              onChange={(e) => setLoanId(e.value)}
              options={supplierLoans.map((loan) => ({
                label: `Loan ${loan.purpose} (${loan.disbursed_amount})`,
                value: loan.id,
              }))}
              placeholder="Select Loan"
              className="w-full"
              filter
            />
          </div> */}

          {loanId && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Loan Amount
              </label>
              <InputNumber
                value={loanAmount}
                onValueChange={(e) => setLoanAmount(e.value)}
                min={0}
                className="w-full"
              />
            </div>
          )}

          <div className="md:col-span-2 space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Remarks <span className="text-red-500">*</span>
            </label>
            <InputTextarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className="w-full"
              placeholder="Payment notes..."
            />
          </div>
        </div>

        <Divider />

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Icon icon="mdi:cancel" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors flex items-center gap-2"
            disabled={!amountPaid || !paymentMethodId}
          >
            <Icon icon="mdi:content-save-check" />
            Record Payment
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default PaySettlementModal;