import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import useAuth from "../../../hooks/useAuth";
import { baseURL } from "../../../utils/api";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import { apiRequest } from "../../../utils/api";
import { format } from "date-fns";
import Header from "../../../components/custom/print_header";
import { PropagateLoader } from "react-spinners";
import CustomReportHeader from "../../../components/custom/customReportHeader";

interface Account {
  account_code: string;
  account_name: string;
  amount: number;
}

interface Category {
  subcategory_name: string;
  amount: number;
  accounts: Account[];
}

interface BalanceSheetData {
  assets?: Category[];
  equity?: Category[];
  liabilities?: Category[];
  totals?: {
    assets?: number;
    liabilities_equity?: number;
    check_balance?: boolean;
  };
  metadata?: {
    generated_at?: string;
    currency?: string;
  };
  current_profit_or_loss?: number;
}

const BalanceSheetReport = () => {
  const [data, setData] = useState<BalanceSheetData>({});
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const [filters, setFilters] = useState({
          start_date: startOfMonth.toISOString().split("T")[0],
          end_date: endOfMonth.toISOString().split("T")[0],
        });
  

  const fetchData = async () => {
    if (!token?.access_token) return;

    setLoading(true);
    try {
      const response = await apiRequest<BalanceSheetData>(
        REPORTS_ENDPOINTS.DETAILED_BALANCE_SHEET.GET_ALL,
        "GET",
        token.access_token
      );
      setData(response.data || {});
    } catch (error: any) {
      console.error("Failed to fetch balance sheet:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token?.access_token]);

  const printPdf = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/reports/accounting/balance-sheet/pdf`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token?.access_token || ""}`,
          },
        }
      );
      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, "_blank");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const renderCategory = (category: Category, isChild = false) => (
    <div
      key={category.subcategory_name}
      className={`mb-2 ${isChild ? "ml-6  rounded p-2" : " rounded p-2"}`}
    >
      <div className="flex items-center">
        <div
          className={`w-48 ${
            isChild ? "font-semibold" : "font-semibold"
          }`}
        >
          {category.subcategory_name}
        </div>
        <div className="flex-1" />
        <div className="w-40 text-right pr-4 font-medium text-gray-800">
          {formatCurrency(category.subcategory_total)}
        </div>
      </div>
      {category.accounts?.map((account) => (
        <div key={account.account_code} className="flex flex-row ml-6 text-gray-600">
          <div>{account.account_code}-{account.account_name}</div>
          <div className="flex-1" />
          <div className="w-40 text-right pr-4">
            {formatCurrency(account.balance)}
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
       <PropagateLoader color="#007f80"/>
      </div>
    );
  }

  const {
    assets = [],
    equity = [],
    liabilities = [],
    totals = {},
    metadata = {},
    current_profit_or_loss = 0,
  } = data;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <CustomReportHeader printfn={printPdf}/>
      <div className="flex flex-row justify-center items-center mt-20">
      <Header title="Balance Sheet Report" />
      </div>
      {(filters.start_date || filters.end_date) && (
                <div className="text-center mb-4 text-sm text-gray-600">
                  Showing data from {filters.start_date || "the beginning"} to{" "}
                  {filters.end_date || "now"}
                </div>
              )}

      <div ref={contentRef} className="text-sm font-sans space-y-10">
        {/* Assets */}
        <section>
          <div className=" pb-2 mb-4 bg-teal-500 p-2">
            <h2 className="text-lg font-bold text-white">ASSETS</h2>
          </div>
          {assets.map((cat) => renderCategory(cat))}
          <div className="flex border-t-2 border-gray-300 pt-3 mt-4 font-bold text-gray-900">
            <div className="w-48 text-lg">TOTAL ASSETS</div>
            <div className="flex-1" />
            <div className="w-40 text-right pr-4 text-lg">
              {formatCurrency(totals.assets)}
            </div>
          </div>
        </section>

        {/* Liabilities & Equity */}
        <section>
          <div className="pb-2 mb-4">
            <h2 className="text-lg font-bold text-white bg-teal-500 p-2">
              LIABILITIES & EQUITY
            </h2>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2 text-sm">LIABILITIES</h3>
            {liabilities.map((cat) => renderCategory(cat, true))}

            <div className="flex border-t border-gray-200 pt-2 mt-2 font-bold text-gray-800">
              <div className="w-48 text-md">TOTAL LIABILITIES</div>
              <div className="flex-1" />
              <div className="w-40 text-right pr-4 text-lg">
                {formatCurrency(
                  liabilities.reduce((sum, cat) => sum + cat.subcategory_total, 0)
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2 text-sm">EQUITY</h3>
            {equity.length > 0 ? equity.map((cat) => renderCategory(cat, true)) : (
              <div className="grid grid-cols-2 gap-1 mb-2 ml-4 text-md">
                <div className="text-gray-600">No equity</div>
                <div className={`text-right font-medium pr-4`}>
                  0
                </div>
              </div>
            )}

            <div className="flex border-t border-gray-200 pt-2 mt-2 font-bold text-gray-800">
              <div className="w-48 text-md">TOTAL EQUITY</div>
              <div className="flex-1" />
              <div className="w-40 text-right text-lg pr-4">
                {formatCurrency(
                  equity.reduce((sum, cat) => sum + cat.subcategory_total, 0)
                )}
              </div>
            </div>
          </div>

          <div className="flex mb-2 text-gray-700 text-semibold">
            <div className="w-48 text-md">Current Year Profit/Loss</div>
            <div className="flex-1" />
            <div className="w-40 text-right text-md pr-4">
             ({formatCurrency(current_profit_or_loss)})
            </div>
          </div>

          <div className="flex border-t-2 border-gray-300 pt-2 mt-4 font-bold text-gray-900">
            <div className="w-58 text-lg">TOTAL LIABILITIES & EQUITY</div>
            <div className="flex-1" />
            <div className="w-40 text-right text-lg pr-4">
              {formatCurrency(totals.liabilities_equity)}
            </div>
          </div>
          <div
            className={`mt-1 font-medium ${
              totals.check_balance ? "text-green-600" : "text-red-600"
            }`}
          >
            {totals.check_balance
              ? "✓ Accounting equation balanced (Assets = Liabilities + Equity)"
              : "✗ Accounting equation not balanced"}
          </div>
        </section>

        {/* Footer */}
      </div>
      <div className="p-4 text-sm text-gray-500 text-center border-t border-gray-200">
          **Amount is being displayed in your base currency
        </div>
    </div>
  );
};

export default BalanceSheetReport;
