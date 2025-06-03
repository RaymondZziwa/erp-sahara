import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { apiRequest, baseURL } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import useAuth from "../../../hooks/useAuth";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import { useReactToPrint } from "react-to-print";
import Header from "../../../components/custom/print_header";
import axios from "axios";
import { toast } from "react-toastify";

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
  asOfDate: string;
}

const IncomeStatementReport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [otherIncome, setOtherIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [ledgerModal, setLedgerModal] = useState<{
    title: string;
    ledgers: { ledger_name: string; current_amount: number }[];
    isLoading: boolean;
  } | null>(null);

  const { token, isFetchingLocalToken } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);

  const print = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/reports/accounting/print-income-statement`,
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
    } catch (error) {
      console.error("Error previewing the trial balance report:", error);
    }
  };

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;
    setIsLoading(true);
    try {
      const response = await apiRequest<any>(
        REPORTS_ENDPOINTS.DETAILED_INCOME_STATEMENT.GET_ALL,
        "GET",
        token.access_token
      );
      // The response is an array, we need to combine the data
      const combinedData = {
        "Revenue and Costs": response.data[0]["Revenue and Costs"],
        "Income and Expenses": response.data[1]["Income and Expenses"],
        asOfDate: response.data[2].asOfDate,
      };
      setReportData(combinedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLedgerDetails = async (categoryId: number, title: string) => {
    setLedgerModal({
      title,
      ledgers: [],
      isLoading: true,
    });

    try {
      const response = await apiRequest<any>(
        `/reports/accounting/get-category-ledger-totals/${categoryId}`,
        "GET",
        token.access_token
      );

      setLedgerModal({
        title,
        ledgers: response.data || [],
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching ledger details:", error);
      setLedgerModal((prev) =>
        prev
          ? {
              ...prev,
              isLoading: false,
              ledgers: [],
            }
          : null
      );
    }
  };

  const calculateGrossProfit = () => {
    if (!reportData) return 0;

    let revenue = 0;
    let costs = 0;

    const revenueGroups = reportData["Revenue and Costs"];
    if (Array.isArray(revenueGroups)) {
      // Find Sales Revenue
      const salesRevenueGroup = revenueGroups.find(
        (group: any) => group["Sales Revenue"]
      );
      if (
        salesRevenueGroup &&
        typeof salesRevenueGroup["Sales Revenue"] === "object"
      ) {
        const salesItems: FinancialItem[] = Object.values(
          salesRevenueGroup["Sales Revenue"]
        );
        revenue = salesItems.reduce((sum, item) => sum + item.total_amount, 0);
      }

      // Find Direct Costs
      const directCostsGroup = revenueGroups.find(
        (group: any) => group["Direct Costs"]
      );
      if (
        directCostsGroup &&
        typeof directCostsGroup["Direct Costs"] === "object"
      ) {
        const costItems: FinancialItem[] = Object.values(
          directCostsGroup["Direct Costs"]
        );
        costs = costItems.reduce((sum, item) => sum + item.total_amount, 0);
      }
    }

    return revenue - costs;
  };

  const calculateNetProfit = () => {
    const grossProfit = calculateGrossProfit();
    if (!reportData) return grossProfit;

    let expenses = 0;
    let otherIncomeTotal = 0;

    const incomeGroups = reportData["Income and Expenses"];
    if (Array.isArray(incomeGroups)) {
      // Find Other Income
      const otherIncomeGroup = incomeGroups.find(
        (group: any) => group["Other Income"]
      );
      if (
        otherIncomeGroup &&
        typeof otherIncomeGroup["Other Income"] === "object"
      ) {
        const incomeItems: FinancialItem[] = Object.values(
          otherIncomeGroup["Other Income"]
        );
        otherIncomeTotal = incomeItems.reduce(
          (sum, item) => sum + item.total_amount,
          0
        );
      }

      // Find Operating Expenses
      const expenseGroup = incomeGroups.find(
        (group: any) => group["Operating Expenses"]
      );
      if (
        expenseGroup &&
        typeof expenseGroup["Operating Expenses"] === "object"
      ) {
        const expenseItems: FinancialItem[] = Object.values(
          expenseGroup["Operating Expenses"]
        );
        expenses = expenseItems.reduce(
          (sum, item) => sum + item.total_amount,
          0
        );
      }
    }

    return grossProfit - expenses + otherIncomeTotal;
  };


  useEffect(() => {
    if (reportData) {
      let expensesTotal = 0;
      let otherIncomeTotal = 0;

      // Get income and expense groups
      const incomeExpenseGroups = reportData["Income and Expenses"];

      // Ensure it's an array and not null
      if (Array.isArray(incomeExpenseGroups)) {
        // ----- Other Income -----
        const otherIncomeGroup = incomeExpenseGroups.find(
          (group: any) => group["Other Income"]
        );

        if (otherIncomeGroup && otherIncomeGroup["Other Income"]) {
          const incomeItemsObj = otherIncomeGroup["Other Income"];
          const incomeItems: FinancialItem[] = Object.values(incomeItemsObj);

          otherIncomeTotal = incomeItems.reduce(
            (sum: number, item: FinancialItem) => sum + item.total_amount,
            0
          );
        }

        // ----- Operating Expenses -----
        const operatingExpensesGroup = incomeExpenseGroups.find(
          (group: any) => group["Operating Expenses"]
        );

        if (
          operatingExpensesGroup &&
          operatingExpensesGroup["Operating Expenses"]
        ) {
          const expenseItemsObj = operatingExpensesGroup["Operating Expenses"];
          const expenseItems: FinancialItem[] = Object.values(expenseItemsObj);

          expensesTotal = expenseItems.reduce(
            (sum: number, item: FinancialItem) => sum + item.total_amount,
            0
          );
        }

        // Update state
        setOtherIncome(otherIncomeTotal);
        setTotalExpenses(expensesTotal);
      }
    }
  }, [reportData]);


  const handleCategoryClick = (categoryId: number, title: string) => {
    fetchLedgerDetails(categoryId, title);
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
  const hasChildren = item.children?.length > 0;
  const isClickable = depth === 0 || (depth === 1 && parentName !== "");

  // Padding increases by 25px per depth level, starting from 8px
  const paddingLeft = `${depth * 25 + 25}px`;

  return (
    <React.Fragment key={`${item.id}-${depth}`}>
      <tr
        className={`${depth === 0 ? "bg-gray-50" : ""} hover:bg-gray-100 ${
          isClickable ? "cursor-pointer" : ""
        }`}
        onClick={() =>
          isClickable && handleCategoryClick(item.id, item.subcategory)
        }
      >
        <td
          className={`py-3 ${depth === 0 ? "font-semibold" : ""}`}
          style={{ paddingLeft }}
        >
          {item.subcategory}
        </td>
        <td className="py-3 text-right pr-6">
          {item.total_amount.toLocaleString()}
        </td>
      </tr>

      {hasChildren &&
        item.children.map((child) =>
          renderFinancialItem(child, depth + 1, item.subcategory)
        )}

      {/* {hasChildren && (
        <tr className="border-t border-gray-200">
          <td className="py-2 font-bold" style={{ paddingLeft }}>
            Total {item.subcategory}
          </td>
          <td className="py-2 text-right pr-6 font-medium border-t-2 border-black">
            {item.total_amount.toLocaleString()}
          </td>
        </tr>
      )} */}
    </React.Fragment>
  );
};




const renderCategoryGroup = (group: any) => {
  if (!group || typeof group !== "object") return null;

  const categoryName = Object.keys(group)[0];
  const items = group[categoryName];

  if (!items || typeof items !== "object") return null;

  const itemArray: FinancialItem[] = Object.values(items);

  return (
    <React.Fragment key={categoryName}>
      <tr className="bg-gray-100">
        <td colSpan={2} className="py-2 font-bold">
          {categoryName}
        </td>
      </tr>

      {itemArray.map((item: FinancialItem) =>
        renderFinancialItem(item, 0, categoryName)
      )}

      <tr className="border-t border-gray-200">
        <td className="py-2 font-bold">Total {categoryName}</td>
        <td className="py-2 text-right pr-6 font-medium border-t-2 border-black">
          {itemArray
            .reduce((sum, item) => sum + item.total_amount, 0)
            .toLocaleString()}
        </td>
      </tr>
    </React.Fragment>
  );
};


  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-end items-center mb-4">
        <button
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded flex items-center gap-2"
          onClick={print}
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
            <div className="flex flex-row justify-center items-center">
              <Header
                title={"Income Statement Report"}
                date={reportData.asOfDate}
              />
            </div>
            <table className="min-w-full bg-white border border-gray-200">
              <tbody className="divide-y divide-gray-200 p-4">
                {reportData["Revenue and Costs"]?.map(
                  (group: any, index: number) => (
                    <React.Fragment key={`revenue-${index}`}>
                      {renderCategoryGroup(group)}
                    </React.Fragment>
                  )
                )}
                <tr className="bg-gray-50">
                  <td className="font-bold">Gross Profit/Loss</td>
                  <td className="px-6 py-3 text-right font-semibold border-t-2 border-black">
                    {calculateGrossProfit().toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Income and Expenses Section */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 p-4">
              <tbody className="divide-y divide-gray-200 pl-10">
                {reportData["Income and Expenses"]?.map(
                  (group: any, index: number) => (
                    <React.Fragment key={`income-${index}`}>
                      {renderCategoryGroup(group)}
                    </React.Fragment>
                  )
                )}
                <tr className="bg-gray-50">
                  <td className="font-bold">Net Other Income/Expenses</td>
                  <td className="px-6 py-3 text-right font-semibold border-t-2 border-black">
                    {(otherIncome - totalExpenses).toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="font-bold">Net Profit/Loss</td>
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
              {ledgerModal.isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <p>Loading ledger details...</p>
                </div>
              ) : ledgerModal.ledgers.length > 0 ? (
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
                          {ledger.net_amount?.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex justify-center items-center p-8">
                  <p>No ledger details available</p>
                </div>
              )}
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
