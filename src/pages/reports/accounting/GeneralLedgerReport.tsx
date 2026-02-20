import React, { useEffect, useState, useRef } from "react";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import { apiRequest, baseURL } from "../../../utils/api";
import { useReactToPrint } from "react-to-print";
import Header from "../../../components/custom/print_header";
import CustomReportHeader from "../../../components/custom/customReportHeader";
import { PropagateLoader } from "react-spinners";
import { Card } from "primereact/card";
import TableFooter from "../../../components/custom/customFooter";
import useAuth from "../../../hooks/useAuth";
import useChartOfAccounts from "../../../hooks/accounts/useChartOfAccounts";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";

interface Transaction {
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  debit_account_id: number;
  debit_account_name: string;
  credit_account_id: number;
  credit_account_name: string;
  journal_type_id: number;
  running_balance: number;
}

const TransactionTable: React.FC = () => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [entries, setEntries] = useState(10);
  const [filters, setFilters] = useState({
    start_date: startOfMonth.toISOString().split("T")[0],
    end_date: endOfMonth.toISOString().split("T")[0],
  });

  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const token = useSelector((state: RootState) => state.userAuth.token);
  const { isFetchingLocalToken } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const { data: accountsData, isLoading: accountsLoading } = useChartOfAccounts();

    const print = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${baseURL}/reports/accounting/general-ledger-transactions-print`,
          {
            responseType: "blob",
            headers: {
              Authorization: `Bearer ${token.access_token || ""}`,
            },
          }
        );
  
        const file = new Blob([response.data], { type: "application/pdf" });
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, "_blank");
        setIsLoading(false);
      } catch (error) {
        console.error("Error previewing the trial balance report:", error);
        setIsLoading(false);
      }
    };
  

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;
    if (!selectedAccountId) return;

    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.start_date) queryParams.append("start_date", filters.start_date);
      if (filters.end_date) queryParams.append("end_date", filters.end_date);

      const endpoint = `/reports/accounting/general-ledger-transactions/${selectedAccountId}?${queryParams.toString()}`;

      const response = await apiRequest<
        ServerResponse<{ data: Transaction[] }>
      >(endpoint, "GET", token.access_token);

      setTransactions(response.data.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token, selectedAccountId, filters]);

  return (
    <div className="bg-white p-3 rounded-lg shadow">
      <CustomReportHeader printfn={print}/>

      <div className="flex flex-col md:items-center md:justify-between gap-4 mb-6 mt-14">
        <Header title="General Ledger" />
      </div>

      {/* ✅ Always show the dropdown */}
      <div className="mb-6">
        <label
          htmlFor="accountSelect"
          className="text-sm font-medium text-gray-700 mb-1"
        >
          Select Account
        </label>

        <Dropdown
          id="accountSelect"
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.value)}
          options={
            accountsData?.map((acc: { id: string; name: string }) => ({
              label: acc.name,
              value: acc.id,
            })) || []
          }
          placeholder={
            accountsLoading ? "Loading accounts..." : "Choose an account"
          }
          className="w-64 md:w-72"
          showClear
        />
      </div>

      {isLoading && transactions === null ? (
        <div className="flex justify-center items-center p-8">
          <PropagateLoader color="#007f80" />
        </div>
      ) : transactions ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-teal-500 text-white">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Date</th>
                <th className="px-6 py-3 text-left font-medium">Description</th>
                <th className="px-6 py-3 text-left font-medium">Reference</th>
                <th className="px-6 py-3 text-left font-medium">Debit</th>
                <th className="px-6 py-3 text-left font-medium">Credit</th>
                <th className="px-6 py-3 text-left font-medium">
                  Running Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, entries).map((t, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-2">{t.date}</td>
                  <td className="px-6 py-2">{t.description}</td>
                  <td className="px-6 py-2">{t.reference}</td>
                  <td className="px-6 py-2">{t.debit.toLocaleString()}</td>
                  <td className="px-6 py-2">{t.credit.toLocaleString()}</td>
                  <td className="px-6 py-2">
                    {t.running_balance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-6 shadow-sm">
          <i className="pi pi-database text-4xl mb-3 text-gray-400"></i>
          <p className="text-sm font-medium text-gray-600">No data available</p>
          <span className="text-xs text-gray-400">
            Try selecting a different account or date range
          </span>
        </Card>
      )}

      <TableFooter setEntries={setEntries} entries={entries} />
    </div>
  );
};

export default TransactionTable;
