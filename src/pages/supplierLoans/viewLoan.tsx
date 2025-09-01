import React from "react";
import { Dialog } from "primereact/dialog";
import { format } from "date-fns";

interface LoanViewModalProps {
  visible: boolean;
  onHide: () => void;
  loan: any;
  onApprove?: () => void;
  onReject?: () => void;
}

const LoanViewModal: React.FC<LoanViewModalProps> = ({
  visible,
  onHide,
  loan,
}) => {

    const formatDate = (dateString?: string | null) => {
    if (!dateString) return "—";
        return format(new Date(dateString), "dd MMM yyyy");
    };
  return (
    <Dialog
      header="Loan Details"
      visible={visible}
      style={{ width: "50rem" }}
      modal
      onHide={onHide}
    >
      {/* Status Badge */}
      <div className="mb-4">
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
            loan.status === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : loan.status === "approved"
              ? "bg-green-100 text-green-700"
              : loan.status === "disbursed"
              ? "bg-green-100 text-green-700"
              : loan.status === "cleared"
              ? "bg-green-100 text-green-700"
              : loan.status === "partially_paid"
              ? "bg-orange-100 text-orange-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {loan.status}
        </span>
      </div>

      {/* Loan Info */}
      <h3 className="text-lg font-bold mb-2">Loan Information</h3>
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <p><strong>Loan Ref:</strong> {loan.loan_reference}</p>
        <p><strong>Requested Amount:</strong> {loan.requested_amount}</p>
        <p><strong>Interest Rate:</strong> {loan.interest_rate}%</p>
        {/* <p><strong>Balance:</strong> {loan.balance}</p> */}
        <p><strong>Purpose:</strong> {loan.purpose}</p>
        <p><strong>Requested Date:</strong> {formatDate(loan.requested_at)}</p>
        <p><strong>Expected Repayment Date:</strong> {formatDate(loan.expected_repayment_date)}</p>
        <p><strong>Installments:</strong> {loan.installments}</p>
      </div>

      {/* Supplier Info */}
      <h3 className="text-lg font-bold mb-2">Supplier Information</h3>
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <p><strong>Name:</strong> {loan.supplier?.name}</p>
        <p><strong>Type:</strong> {loan.supplier?.supplier_type}</p>
        <p><strong>Email:</strong> {loan.supplier?.email || "—"}</p>
        <p><strong>Phone:</strong> {loan.supplier?.phone || "—"}</p>
        <p><strong>Status:</strong> {loan.supplier?.status}</p>
      </div>

      {/* Created By */}
      <h3 className="text-lg font-bold mb-2">Created By</h3>
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <p><strong>Name:</strong> {`${loan.creator?.first_name} ${loan.creator?.last_name}`}</p>
        <p><strong>Email:</strong> {loan.creator?.email}</p>
      </div>


      {/*


          {loan.status === "approved" && (
                <div className="flex justify-end gap-3 mt-6">
                <Button
                    label="Disburse"
                    icon="pi pi-check"
                    style={{ backgroundColor: "teal", borderColor: "teal" }}
                    onClick={() => setIsDisburseOpen(true)}
                />
                </div>
          )}
          {loan.status === "disbursed" && (
                <div className="flex justify-end gap-3 mt-6">
                    <Button
                        label="Pay"
                        icon="pi pi-dollar"
                        style={{ backgroundColor: "teal", borderColor: "teal" }}
                        onClick={() => setIsPaymentOpen(true)}
                    />
                </div>
          )} */}
    </Dialog>
  );
};

export default LoanViewModal;
