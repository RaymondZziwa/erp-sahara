import React from "react";
import { FaPrint, FaTimes } from "react-icons/fa";
import { apiRequest } from "../../../utils/api";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

interface Supplier {
  name: string;
  email?: string;
  phone?: string;
}

interface Item {
  name: string;
  description?: string;
  cost_price: string;
  selling_price: string;
}

interface SettlementPayment {
  id: string;
  amount: string;
  date_paid: string;
  remarks: string;
  status: string;
}

interface Delivery {
    supplier: Supplier;
    item: Item;
    quantity: string;
    uom: { id: string; name: string; abbreviation: string };       // object
    warehouse: { id: string; name: string; warehouse_type: string; location: string }; // object
    delivery_date: string;
  }
  

interface Settlement {
  id: string;
  total_payable: string;
  total_paid: string;
  balance: string;
  status: string;
  date_paid: string;
  delivery: Delivery;
  settlement_payments: SettlementPayment[];
}

interface SettlementModalProps {
  visible: boolean;
  onClose: () => void;
  settlement: Settlement | null;
}

const SettlementModal: React.FC<SettlementModalProps> = ({
  visible,
  onClose,
  settlement,
}) => {

    const token = useSelector((state: RootState) => state.userAuth.token.access_token)
      const printReceipt = async (id: string) => {
        try {
          await apiRequest(`/purchases/settlements/${id}/print`, 'GET', token);
        } catch (error) {
          toast.error(error?.response?.data?.message)
        }
      }
    
  if (!visible || !settlement) return null;

  const { delivery, settlement_payments, total_payable, total_paid, balance, status } =
    settlement;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-y-auto max-h-[90vh] p-6 relative">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Settlement Details
        </h2>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p><span className="font-semibold">Total Payable:</span> {total_payable}</p>
            <p><span className="font-semibold">Total Paid:</span> {total_paid}</p>
            <p><span className="font-semibold">Balance:</span> {balance}</p>
          </div>
          <div>
            <p><span className="font-semibold">Status:</span> {status}</p>
            <p><span className="font-semibold">Delivery Date:</span> {new Date(delivery.delivery_date).toLocaleDateString()}</p>
            {/* <p><span className="font-semibold">Warehouse:</span> {delivery.warehouse.name}</p> */}
          </div>
        </div>

        {/* Supplier Info */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">Supplier Info</h3>
          <p><span className="font-semibold">Name:</span> {delivery.supplier.name}</p>
          {delivery.supplier.email && <p><span className="font-semibold">Email:</span> {delivery.supplier.email}</p>}
          {delivery.supplier.phone && <p><span className="font-semibold">Phone:</span> {delivery.supplier.phone}</p>}
        </div>

        {/* Item Info */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">Item Info</h3>
          <p><span className="font-semibold">Name:</span> {delivery.item.name}</p>
          <p><span className="font-semibold">Cost Price:</span> {delivery.item.cost_price}</p>
          <p><span className="font-semibold">Selling Price:</span> {delivery.item.selling_price}</p>
          {delivery.item.description && <p><span className="font-semibold">Description:</span> {delivery.item.description}</p>}
          <p><span className="font-semibold">Quantity:</span> {delivery.quantity} {delivery.uom.name}</p>
        </div>

        {/* Settlement Payments Table */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">Settlement Payments</h3>
          <table className="w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1 text-left">Amount</th>
                <th className="border px-2 py-1 text-left">Date Paid</th>
                <th className="border px-2 py-1 text-left">Remarks</th>
                <th className="border px-2 py-1 text-left">Status</th>
                <th className="border px-2 py-1 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {settlement_payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="border px-2 py-1">{payment.amount}</td>
                  <td className="border px-2 py-1">{payment.date_paid}</td>
                  <td className="border px-2 py-1">{payment.remarks}</td>
                      <td className="border px-2 py-1">{payment.status}</td>
                      <td className="border px-2 py-1">
                        <button
                        className="flex items-center gap-1 bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700"
                        onClick={() => {
                            printReceipt(payment.id)
                        }}
                        >
                        <FaPrint /> Print Receipt
                        </button>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-right">
          <button
            className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettlementModal;
