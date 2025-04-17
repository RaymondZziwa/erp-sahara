// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { apiRequest } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import useAuth from "../../../hooks/useAuth";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import { useReactToPrint } from "react-to-print";
import { PrintableContent } from "./IS_print_template";
import Header from "../../../components/custom/print_header";

interface FinancialItem {
  subcategory: string;
  id: number;
  code: number;
  total_credit: number;
  total_debit: number;
  total_amount: number;
  children: FinancialItem[];
  ledgers?: {
    ledger_name: string;
    current_amount: number;
  }[];
}

interface CategoryGroup {
  [key: string]: FinancialItem[];
}

interface ReportData {
  "Revenue and Costs": CategoryGroup[];
  "Income and Expenses": CategoryGroup[];
}

const IncomeStatementReport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData[] | null>(null);
  const [ledgerModal, setLedgerModal] = useState<{
    title: string;
    ledgers: { ledger_name: string; current_amount: number }[];
  } | null>(null);

  const { token, isFetchingLocalToken } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;
    setIsLoading(true);
    try {
      const response = await apiRequest<ServerResponse<ReportData[]>>(
        REPORTS_ENDPOINTS.DETAILED_INCOME_STATEMENT.GET_ALL,
        "GET",
        token.access_token
      );
      setReportData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateGrossProfit = () => {
    if (!reportData) return 0;

    const revenueData =
      reportData[0]?.["Revenue and Costs"]?.[0]?.["Sales Revenue"];
    const costsData =
      reportData[0]?.["Revenue and Costs"]?.[1]?.["Direct Costs"];

    const revenue = revenueData?.[0]?.total_amount || 0;
    const costs = costsData?.[0]?.total_amount || 0;

    return revenue - costs;
  };

  const calculateNetProfit = () => {
    const grossProfit = calculateGrossProfit();
    if (!reportData) return grossProfit;

    const expensesData =
      reportData[0]?.["Income and Expenses"]?.[1]?.["Operating Expenses"];
    const otherIncomeData =
      reportData[0]?.["Income and Expenses"]?.[0]?.["Other Income"];

    const expenses = expensesData?.[0]?.total_amount || 0;
    const otherIncome = otherIncomeData?.[0]?.total_amount || 0;

    return grossProfit - expenses + otherIncome;
  };

  const openLedgerModal = (
    title: string,
    ledgers: { ledger_name: string; current_amount: number }[]
  ) => {
    if (ledgers?.length > 0) {
      setLedgerModal({ title, ledgers });
    }
  };

  const closeModal = () => setLedgerModal(null);

  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  const renderFinancialItem = (
    item: FinancialItem,
    depth = 0,
    parentName = ""
  ) => {
    const paddingLeft = `${depth * 24}px`;
    const hasChildren = item.children?.length > 0;
    const isClickable = item.ledgers?.length > 0;

    return (
      <React.Fragment key={`${item.id}-${depth}`}>
        <tr
          className={`${depth === 0 ? "bg-gray-50" : ""} hover:bg-gray-100 ${
            isClickable ? "cursor-pointer" : ""
          }`}
          onClick={() =>
            isClickable && openLedgerModal(item.subcategory, item.ledgers || [])
          }
        >
          <td
            className={`py-3 ${depth === 0 ? "font-semibold" : ""}`}
            style={{ paddingLeft }}
          >
            {item.subcategory}
          </td>
          <td className="py-3 text-right pr-6">
            {item.total_amount?.toLocaleString()}
          </td>
        </tr>

        {hasChildren &&
          item.children.map((child) =>
            renderFinancialItem(child, depth + 1, item.subcategory)
          )}

        {hasChildren && (
          <tr className="border-t border-gray-200">
            <td
              className="py-2 font-medium"
              style={{ paddingLeft: `${(depth + 1) * 24}px` }}
            >
              Total {item.subcategory}
            </td>
            <td className="py-2 text-right pr-6 font-medium border-t-2 border-black">
              {item.total_amount?.toLocaleString()}
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  const renderCategoryGroup = (group: CategoryGroup) => {
    const categoryName = Object.keys(group)[0];
    const items = group[categoryName];

    return items.map((item) => renderFinancialItem(item, 0, categoryName));
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-end items-center mb-4">
        {/* <h1 className="text-xl font-bold">Income Statement Report</h1> */}
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
          onClick={() => reactToPrintFn()}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print Report
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <p>Loading report data...</p>
        </div>
      ) : reportData ? (
        <div className="space-y-8">
          {/* Revenue and Costs Section */}
          <div className="overflow-x-auto" ref={contentRef}>
            <div className="flex flex-row justify-centeritems-center">
              <Header title={"Income Statement Report"} />
            </div>
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th colSpan={2} className="px-6 py-3 text-left font-medium">
                    Revenue and Costs
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData[0]?.["Revenue and Costs"]?.map((group, index) => (
                  <React.Fragment key={`revenue-${index}`}>
                    {renderCategoryGroup(group)}
                  </React.Fragment>
                ))}
                <tr className="bg-gray-50">
                  <td className="px-6 py-3 font-semibold">Gross Profit/Loss</td>
                  <td className="px-6 py-3 text-right font-semibold border-t-2 border-black">
                    {calculateGrossProfit().toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Income and Expenses Section */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th colSpan={2} className="px-6 py-3 text-left font-medium">
                    Income and Expenses
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData[0]?.["Income and Expenses"]?.map((group, index) => (
                  <React.Fragment key={`income-${index}`}>
                    {renderCategoryGroup(group)}
                  </React.Fragment>
                ))}
                <tr className="bg-gray-50">
                  <td className="px-6 py-3 font-semibold">Net Profit/Loss</td>
                  <td className="px-6 py-3 text-right font-semibold border-t-2 border-black">
                    {calculateNetProfit().toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center p-8">
          <p>No data available</p>
        </div>
      )}

      {/* Ledger Details Modal */}
      {ledgerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 flex justify-between items-center border-b">
              <h3 className="text-lg font-semibold">
                Ledger Details: {ledgerModal.title}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <Icon icon="mdi:close" fontSize={24} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ledger Name
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ledgerModal.ledgers.map((ledger, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ledger.ledger_name}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {ledger.current_amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default IncomeStatementReport;
