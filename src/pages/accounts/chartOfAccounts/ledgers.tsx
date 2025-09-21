import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../../../utils/api";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { toast } from "react-toastify";
import { PropagateLoader } from "react-spinners";
import BreadCrump from "../../../components/layout/bread_crump";
const Ledgers = () => {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = useSelector((state: RootState) => state.userAuth.token.access_token);
  const baseCurrency = useSelector((state: RootState) => state.userAuth?.user?.organisation?.base_currency?.code) || ""

  const getLedgers = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`/accounts/details/${id}`, "GET", token);
      setData(response.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch ledger data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: `${baseCurrency}`,
      minimumFractionDigits: 0,
    }).format(amount ?? 0);

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  useEffect(() => {
    getLedgers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <PropagateLoader color="#007f80"/>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
        <p className="text-red-600">Failed to load ledger data</p>
        <button
          onClick={getLedgers}
          className="mt-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { account, debit_transactions, credit_transactions, ledger_total } = data;

    const allTransactions = [
    ...(debit_transactions?.data || []).map((t: any) => ({ ...t, type: "debit" })),
    ...(credit_transactions?.data || []).map((t: any) => ({ ...t, type: "credit" })),
    ];

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadCrump name="Ledger Details" pageName="All" />
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* -------- Account Details Header -------- */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Account Name</p>
              <p className="text-lg font-semibold">{account.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Number/Code</p>
              <p className="text-lg font-semibold">{account.code}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Category</p>
              <p className="text-lg font-semibold">{account.account_sub_category.account_category.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sub Category</p>
              <p className="text-lg font-semibold">{account.account_sub_category.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Description</p>
              <p className="text-lg font-semibold">{account.description}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Opening Balance</p>
              <p className="text-lg font-semibold">{formatCurrency(ledger_total)}</p>
            </div>
          </div>
        </div>

        {/* -------- Transactions Table -------- */}
        <div className="p-6">
          {allTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100 text-white">
                  <tr className="bg-teal-500 text-white">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Reference No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium  uppercase tracking-wider">Transaction Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium  uppercase tracking-wider">Journal Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Created By</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Debit</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Credit</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allTransactions.map((txn: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-teal-700">{txn.reference}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{formatDateTime(txn.created_at)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{txn.journal_type}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{txn.created_by}</td>
                       {/* Debit column */}
                        <td className="px-4 py-3 text-sm text-right text-gray-700">
                            {txn.type === "debit" ? txn.amount : "-"}
                        </td>

                        {/* Credit column */}
                        <td className="px-4 py-3 text-sm text-right text-gray-700">
                            {txn.type === "credit" ? txn.amount : "-"}
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No transactions found for this ledger</p>
            </div>
          )}
        </div>

        {/* -------- Total -------- */}
        <div className="p-4 border-t border-gray-200 text-right">
          <span className="text-gray-700 font-medium">
            Ledger Total: {formatCurrency(ledger_total)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Ledgers;
