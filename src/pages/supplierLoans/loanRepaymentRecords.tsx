import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useSupplierLoans from "../../hooks/supplierLoans/useSupplierLoans";


const LoanRepayments: React.FC = () => {
    const {data: supplierLoans} = useSupplierLoans()
    const { id } = useParams<{ id: string }>();
    const loan = supplierLoans.find((loan) => loan.id === id)
    
    useEffect(() => {
        console.log('id', id)
    }, [])
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-2xl">
      {/* Loan Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Loan Reference: {loan.loan_reference}
        </h1>
        <p className="text-gray-600 text-sm">
          Created by {loan.creator.first_name} {loan.creator.last_name} on{" "}
          {new Date(loan.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Loan Details */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-8">
        <div>
          <span className="font-semibold">Supplier:</span>{" "}
          {loan.supplier?.name}
        </div>
        <div>
          <span className="font-semibold">Requested Amount:</span>{" "}
          {Number(loan.requested_amount).toLocaleString()}
        </div>
        <div>
          <span className="font-semibold">Approved Amount:</span>{" "}
          {Number(loan.approved_amount).toLocaleString()}
        </div>
        <div>
          <span className="font-semibold">Disbursed:</span>{" "}
          {Number(loan.disbursed_amount).toLocaleString()}
        </div>
        <div>
          <span className="font-semibold">Total Paid:</span>{" "}
          {Number(loan.total_paid).toLocaleString()}
        </div>
        <div>
          <span className="font-semibold">Balance:</span>{" "}
          {Number(loan.balance).toLocaleString()}
        </div>
        <div>
          <span className="font-semibold">Interest Rate:</span>{" "}
          {loan.interest_rate}%
        </div>
        <div>
          <span className="font-semibold">Installments:</span>{" "}
          {loan.installments}
        </div>
        <div>
          <span className="font-semibold">Status:</span>{" "}
          <span
            className={`px-2 py-1 rounded-md text-xs font-semibold ${
              loan.status === "approved" || loan.status === "active"
                ? "bg-green-100 text-green-700"
                : loan.status === "partially_paid"
                ? "bg-yellow-100 text-yellow-700"
                : loan.status === "closed"
                ? "bg-blue-100 text-blue-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {loan.status}
          </span>
        </div>
        <div>
          <span className="font-semibold">Disbursed Date:</span>{" "}
          {new Date(loan.disbursed_date).toLocaleDateString()}
        </div>
        <div>
          <span className="font-semibold">Expected Repayment:</span>{" "}
          {new Date(loan.expected_repayment_date).toLocaleDateString()}
        </div>
        <div>
          <span className="font-semibold">Purpose:</span> {loan.purpose}
        </div>
      </div>

      {/* Repayments Section */}
      <h2 className="text-xl font-bold text-gray-800 mb-3">
        Repayment Records
      </h2>

      {loan.repayments && loan.repayments.length > 0 ? (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Amount Paid</th>
              <th className="p-2 border">Method</th>
            </tr>
          </thead>
          <tbody>
            {loan.repayments.map((repayment: any) => (
              <tr key={repayment.id} className="hover:bg-gray-50">
                <td className="p-2 border">
                  {new Date(repayment.paid_at).toLocaleDateString()}
                </td>
                <td className="p-2 border">
                  {Number(repayment.amount_paid).toLocaleString()}
                </td>
                <td className="p-2 border capitalize">{repayment.method}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 italic">No repayments recorded yet.</p>
      )}
    </div>
  );
};

export default LoanRepayments;
