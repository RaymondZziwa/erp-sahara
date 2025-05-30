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
      className={`mb-2 ${isChild ? "ml-6" : "bg-blue-50 rounded p-2"}`}
    >
      <div className="flex items-center">
        <div
          className={`w-48 ${
            isChild ? "font-normal" : "font-semibold text-blue-700"
          }`}
        >
          {category.subcategory_name}
        </div>
        <div className="flex-1" />
        <div className="w-40 text-right pr-4 font-medium text-gray-800">
          {formatCurrency(category.amount)}
        </div>
      </div>
      {category.accounts?.map((account) => (
        <div key={account.account_code} className="flex ml-6 text-gray-600">
          <div className="w-16">{account.account_code}</div>
          <div className="w-32">{account.account_name}</div>
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">Balance Sheet</h1>
        <button
          onClick={printPdf}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Export as PDF
        </button>
      </div>

      <div ref={contentRef} className="text-sm font-sans space-y-10">
        <div className="text-center">
          <Header title="Balance Sheet Report" />
        </div>

        {/* Assets */}
        <section>
          <div className="border-b-2 border-blue-200 pb-2 mb-4">
            <h2 className="text-lg font-bold text-blue-700">ASSETS</h2>
          </div>
          {assets.map((cat) => renderCategory(cat))}
          <div className="flex border-t-2 border-gray-300 pt-3 mt-4 font-bold text-gray-900">
            <div className="w-48">TOTAL ASSETS</div>
            <div className="flex-1" />
            <div className="w-40 text-right pr-4">
              {formatCurrency(totals.assets)}
            </div>
          </div>
        </section>

        {/* Liabilities & Equity */}
        <section>
          <div className="border-b-2 border-purple-200 pb-2 mb-4">
            <h2 className="text-lg font-bold text-purple-700">
              LIABILITIES & EQUITY
            </h2>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2 text-purple-600">LIABILITIES</h3>
            {liabilities.map((cat) => renderCategory(cat, true))}

            <div className="flex border-t border-gray-200 pt-2 mt-2 font-semibold text-gray-800">
              <div className="w-48">TOTAL LIABILITIES</div>
              <div className="flex-1" />
              <div className="w-40 text-right pr-4">
                {formatCurrency(
                  liabilities.reduce((sum, cat) => sum + cat.amount, 0)
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2 text-purple-600">EQUITY</h3>
            {equity.map((cat) => renderCategory(cat, true))}

            <div className="flex border-t border-gray-200 pt-2 mt-2 font-semibold text-gray-800">
              <div className="w-48">TOTAL EQUITY</div>
              <div className="flex-1" />
              <div className="w-40 text-right pr-4">
                {formatCurrency(
                  equity.reduce((sum, cat) => sum + cat.amount, 0)
                )}
              </div>
            </div>
          </div>

          <div className="flex mb-2 text-gray-700">
            <div className="w-48">Current Year Profit/Loss</div>
            <div className="flex-1" />
            <div className="w-40 text-right pr-4">
              {formatCurrency(current_profit_or_loss)}
            </div>
          </div>

          <div className="flex border-t-2 border-gray-300 pt-2 mt-4 font-bold text-gray-900">
            <div className="w-48">TOTAL LIABILITIES & EQUITY</div>
            <div className="flex-1" />
            <div className="w-40 text-right pr-4">
              {formatCurrency(totals.liabilities_equity)}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-6 mt-10 border-t border-gray-300 text-sm text-gray-500">
          <div>
            Generated on{" "}
            {format(new Date(metadata.generated_at || new Date()), "PPpp")}
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
        </footer>
      </div>
    </div>
  );
};

export default BalanceSheetReport;
