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
import CustomReportHeader from "../../../components/custom/customReportHeader";
import { PropagateLoader } from "react-spinners";

interface FinancialItem {
  id: number;
  name: string;
  code: number;
  total: number;
  accounts?: Array<{
    id: number;
    code: string;
    name: string;
    subcategory_name: string;
    subcategory_code: number;
    total: number;
    total_amount: number;
  }>;
  children: FinancialItem[];
}

interface ReportSection {
  section: string;
  name: string;
  subcategories: FinancialItem[];
  totals?: {
    [key: string]: number;
  };
}

interface ApiResponse {
  current_period: ReportSection[];
  comparison: ReportSection[];
}

const IncomeStatementReport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportSection[] | null>(null);
  const [otherIncome, setOtherIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const [filters, setFilters] = useState({
    start_date: startOfMonth.toISOString().split("T")[0],
    end_date: endOfMonth.toISOString().split("T")[0],
  });
  
  const [ledgerModal, setLedgerModal] = useState<{
    title: string;
    ledgers: { ledger_name: string; current_amount: number }[];
    isLoading: boolean;
  } | null>(null);

  const { token, isFetchingLocalToken } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);

  const print = async () => {
    try {
      setIsLoading(true)
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
      setIsLoading(false)
    } catch (error) {
      console.error("Error previewing the trial balance report:", error);
    }
  };

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;
    setIsLoading(true);
    try {
      const response = await apiRequest<ApiResponse>(
        REPORTS_ENDPOINTS.DETAILED_INCOME_STATEMENT.GET_ALL,
        "GET",
        token.access_token
      );
      
      // Extract current_period data from the response
      if (response.data && response.data.current_period) {
        setReportData(response.data.current_period);
      } else {
        setReportData(null);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setReportData(null);
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
    
    const revenueSection = reportData.find((section: any) => 
      section.section === "Revenue and Costs" && section.name === "Sales Revenue"
    );
    
    const costSection = reportData.find((section: any) => 
      section.section === "Revenue and Costs" && section.name === "Direct Costs"
    );
    
    const revenueTotal = revenueSection?.subcategories?.reduce((sum: number, sub: any) => sum + sub.total, 0) || 0;
    const costTotal = costSection?.subcategories?.reduce((sum: number, sub: any) => sum + sub.total, 0) || 0;
    
    return revenueTotal - costTotal;
  };

  useEffect(() => {
    if (reportData) {
      let expensesTotal = 0;
      let otherIncomeTotal = 0;

      // Find operating expenses section
      const operatingExpensesSection = reportData.find(
        (section: any) => section.section === "Income and Expenses" && section.name === "Operating Expenses"
      );

      // Find other income section
      const otherIncomeSection = reportData.find(
        (section: any) => section.section === "Income and Expenses" && section.name === "Other Income"
      );

      // Calculate operating expenses total
      if (operatingExpensesSection && operatingExpensesSection.subcategories) {
        expensesTotal = operatingExpensesSection.subcategories.reduce(
          (sum: number, subcategory: any) => sum + subcategory.total,
          0
        );
      }

      // Calculate other income total
      if (otherIncomeSection && otherIncomeSection.subcategories) {
        otherIncomeTotal = otherIncomeSection.subcategories.reduce(
          (sum: number, subcategory: any) => sum + subcategory.total,
          0
        );
      }

      // Update state
      setOtherIncome(otherIncomeTotal);
      setTotalExpenses(expensesTotal);
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
            isClickable && handleCategoryClick(item.id, item.name)
          }
        >
          <td
            className={`py-3 ${depth === 0 ? "font-semibold" : ""}`}
            style={{ paddingLeft }}
          >
            {item.name}
          </td>
          <td className="py-3 text-right pr-6">
            {item.total.toLocaleString()}
          </td>
        </tr>

        {hasChildren &&
          item.children.map((child) =>
            renderFinancialItem(child, depth + 1, item.name)
          )}
      </React.Fragment>
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <CustomReportHeader printfn={print} loading={isLoading} />

      <div className="flex flex-row justify-center items-center mt-20">
        <Header title={"Income Statement"} />
      </div>
      {(filters.start_date || filters.end_date) && (
        <div className="text-center mb-4 text-s  m text-gray-600">
          Showing data from {filters.start_date || "the beginning"} to{" "}
          {filters.end_date || "now"}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <PropagateLoader color="#007f80"/>
        </div>
      ) : reportData && reportData.length > 0 ? (
        <div className="overflow-x-auto" ref={contentRef}>
          <table className="min-w-full bg-white border border-gray-200">
            <tbody className="divide-y divide-gray-200">
              {reportData.map((section: any, index: number) => (
                <React.Fragment key={index}>
                  {/* Section Header */}
                  <tr className="bg-[#eff6ff]">
                    <td colSpan={2} className="py-3 font-bold text-lg">
                      {section.section}
                    </td>
                  </tr>
                  
                  {/* Category Name */}
                  <tr className="bg-gray-100">
                    <td colSpan={2} className="py-2 font-semibold">
                      {section.name}
                    </td>
                  </tr>
                  
                  {/* Subcategories - Only show if they have non-zero accounts */}
                  {section.subcategories
                    ?.filter((subcategory: any) => 
                      // Show subcategory if it has accounts with non-zero amounts
                      subcategory.accounts?.some((account: any) => account.total_amount !== 0) ||
                      // OR if it has a non-zero total (even if no accounts displayed)
                      subcategory.total !== 0
                    )
                    ?.map((subcategory: any, subIndex: number) => (
                      <React.Fragment key={subIndex}>
                        <tr className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleCategoryClick(subcategory.id, subcategory.name)}>
                          <td className="py-2 pl-6">{subcategory.name}</td>
                          <td className="py-2 text-right pr-6">
                            {subcategory.total.toLocaleString()}
                          </td>
                        </tr>
                        
                        {/* Accounts - Only show non-zero amounts */}
                        {subcategory.accounts
                          ?.filter((account: any) => account.total_amount !== 0)
                          ?.map((account: any, accIndex: number) => (
                            <tr key={accIndex} className="hover:bg-gray-50">
                              <td className="py-1 pl-12 text-sm">{account.name}</td>
                              <td className="py-1 text-right pr-6 text-sm">
                                {account.total_amount.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        
                        {/* Subcategory Total */}
                        <tr className="border-t border-gray-200">
                          <td className="py-2 pl-6 font-semibold">Total {subcategory.name}</td>
                          <td className="py-2 text-right pr-6 font-semibold">
                            {subcategory.total.toLocaleString()}
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  
                  {/* Summary Section */}
                  {section.section === "Summary" && section.totals && (
                    <>
                      {Object.entries(section.totals).map(([key, value]: [string, any]) => (
                        <tr key={key} className={key === "Net Profit/Loss" ? "bg-yellow-50 font-bold" : ""}>
                          <td className="py-2 pl-4">{key}</td>
                          <td className="py-2 text-right pr-6 font-medium">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex justify-center items-center p-8">
          <p>No data available for the current period</p>
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