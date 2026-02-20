import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { apiRequest, baseURL } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import Header from "../../../components/custom/print_header";
import axios from "axios";
import CustomReportHeader from "../../../components/custom/customReportHeader";
import { PropagateLoader } from "react-spinners";

interface Account {
  id: number;
  code: string;
  name: string;
  subcategory_name: string;
  subcategory_code: number;
  total: number;
  total_amount: number;
}

interface FinancialItem {
  id: number;
  name: string;
  code: number;
  total: number;
  accounts?: Account[];
  children: FinancialItem[];
}

interface ReportItem {
  name: string;
  subcategories: FinancialItem[];
}

interface ReportSection {
  section: string;
  items?: ReportItem[];
  name?: string;
  totals?: {
    [key: string]: number;
  };
}

interface ApiResponse {
  current_period: ReportSection[];
  comparison: ReportSection[];
}

interface IncomeStatementProps {
  currency?: string;
}

const IncomeStatementReport: React.FC<IncomeStatementProps> = ({ 
  currency = "TZS" 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportSection[] | null>(null);
  const [ledgerModal, setLedgerModal] = useState<{
    title: string;
    ledgers: { ledger_name: string; current_amount: number }[];
    isLoading: boolean;
  } | null>(null);

  const { token, isFetchingLocalToken } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const [filters] = useState({
    start_date: startOfMonth.toISOString().split("T")[0],
    end_date: endOfMonth.toISOString().split("T")[0],
  });

  const print = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${baseURL}/reports/accounting/detail-income-statement-simple-print`,
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
    setIsLoading(true);
    try {
      const response = await apiRequest<ApiResponse>(
        REPORTS_ENDPOINTS.DETAILED_INCOME_STATEMENT.GET_ALL,
        "GET",
        token.access_token
      );
      
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
        prev ? { ...prev, isLoading: false, ledgers: [] } : null
      );
    }
  };

  const handleCategoryClick = (categoryId: number, title: string) => {
    fetchLedgerDetails(categoryId, title);
  };

  const closeModal = () => setLedgerModal(null);

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  // Extract sections for the new structure
  const revenueAndCosts = reportData?.find((d) => d.section === "Revenue and Costs");
  const incomeAndExpenses = reportData?.find((d) => d.section === "Income and Expenses");
  const summary = reportData?.find((d) => d.section === "Summary");

  // Calculate total incomes correctly
  const totalIncomes = (summary?.totals?.["Total Sales Revenue"] || 0) + (summary?.totals?.["Other Income"] || 0);

  // Calculate total expenses
  const totalExpenses = (
    (summary?.totals?.["Total Direct Costs"] || 0) +
    (summary?.totals?.["Operating Expenses"] || 0) +
    (summary?.totals?.["Interest Expenses"] || 0) +
    (summary?.totals?.["Taxes"] || 0)
  );

  // Helper function to check if a subcategory should be displayed
  const shouldDisplaySubcategory = (subcategory: FinancialItem) => {
    return subcategory.total !== 0 || 
           subcategory.accounts?.some(acc => acc.total_amount !== 0) ||
           subcategory.children?.some(child => child.total !== 0);
  };

  // Helper function to render income items
  const renderIncomeItems = () => {
    const incomeItems = [];

    // Sales Revenue
    const salesRevenue = revenueAndCosts?.items?.find(i => i.name === "Sales Revenue");
    if (salesRevenue) {
      salesRevenue.subcategories
        .filter(shouldDisplaySubcategory)
        .forEach(subcat => {
          incomeItems.push(
            <tr 
              key={subcat.id}
              className={subcat.accounts?.some(acc => acc.total_amount !== 0) ? "clickable-row" : ""}
              onClick={subcat.accounts?.some(acc => acc.total_amount !== 0) ? () => handleCategoryClick(subcat.id, subcat.name) : undefined}
            >
              <td>{subcat.name}</td>
              <td className="right-align">
                {formatCurrency(subcat.total)}
              </td>
            </tr>
          );
        });
    }

    // Other Income
    const otherIncome = incomeAndExpenses?.items?.find(i => i.name === "Other Income");
    if (otherIncome) {
      otherIncome.subcategories
        .filter(shouldDisplaySubcategory)
        .forEach(subcat => {
          incomeItems.push(
            <tr 
              key={subcat.id}
              className={subcat.accounts?.some(acc => acc.total_amount !== 0) ? "clickable-row" : ""}
              onClick={subcat.accounts?.some(acc => acc.total_amount !== 0) ? () => handleCategoryClick(subcat.id, subcat.name) : undefined}
            >
              <td>{subcat.name}</td>
              <td className="right-align">
                {formatCurrency(subcat.total)}
              </td>
            </tr>
          );
        });
    }

    return incomeItems;
  };

  // Helper function to render expense items
  const renderExpenseItems = () => {
    const expenseItems = [];

    // Direct Costs
    const directCosts = revenueAndCosts?.items?.find(i => i.name === "Direct Costs");
    if (directCosts) {
      directCosts.subcategories
        .filter(shouldDisplaySubcategory)
        .forEach(subcat => {
          expenseItems.push(
            <tr 
              key={subcat.id}
              className={subcat.accounts?.some(acc => acc.total_amount !== 0) ? "clickable-row" : ""}
              onClick={subcat.accounts?.some(acc => acc.total_amount !== 0) ? () => handleCategoryClick(subcat.id, subcat.name) : undefined}
            >
              <td>{subcat.name}</td>
              <td className="right-align">
                {formatCurrency(subcat.total)}
              </td>
            </tr>
          );
        });
    }

    // Operating Expenses, Interest Expenses, Taxes Expenses
    const expenseCategories = ["Operating Expenses", "Interest Expenses", "Taxes Expenses"];
    expenseCategories.forEach(categoryName => {
      const category = incomeAndExpenses?.items?.find(i => i.name === categoryName);
      if (category) {
        category.subcategories
          .filter(shouldDisplaySubcategory)
          .forEach(subcat => {
            expenseItems.push(
              <tr 
                key={subcat.id}
                className={subcat.accounts?.some(acc => acc.total_amount !== 0) ? "clickable-row" : ""}
                onClick={subcat.accounts?.some(acc => acc.total_amount !== 0) ? () => handleCategoryClick(subcat.id, subcat.name) : undefined}
              >
                <td>{subcat.name}</td>
                <td className="right-align">
                  {formatCurrency(subcat.total)}
                </td>
              </tr>
            );
          });
      }
    });

    return expenseItems;
  };

  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  // Debug: Log the data to see what's being rendered
  useEffect(() => {
    if (reportData) {
      console.log("Report Data:", reportData);
      console.log("Total Incomes:", totalIncomes);
      console.log("Total Expenses:", totalExpenses);
      console.log("Net Profit/Loss:", summary?.totals?.["Net Profit/Loss"]);
    }
  }, [reportData]);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <CustomReportHeader printfn={print} loading={isLoading} />

      {isLoading ? (
        <div className="flex justify-center items-center">
          <PropagateLoader color="#007f80" />
        </div>
      ) : reportData && reportData.length > 0 ? (
        <div className="container" ref={contentRef}>
          {/* Header */}
          <div className="header mt-14">
            <Header title={"Income Statement Report"}/>
            {(filters.start_date || filters.end_date) && (
              <div className="text-center mb-4 text-sm text-gray-600">
                Period: {new Date(filters.start_date).toLocaleDateString()} - {new Date(filters.end_date).toLocaleDateString()}
              </div>
            )}
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Particulars</th>
                <th className="right-align">Amount ({currency})</th>
              </tr>
            </thead>
            <tbody className="text-lg">
              {/* Incomes */}
              <tr className="section-header">
                <td colSpan="2">Incomes</td>
              </tr>
              
              {renderIncomeItems()}
              
              <tr className="section-total">
                <td>Total Incomes</td>
                <td className="right-align">
                  {formatCurrency(totalIncomes)}
                </td>
              </tr>

              {/* Expenses */}
              <tr className="section-header">
                <td colSpan="2">Expenses</td>
              </tr>
              
              {renderExpenseItems()}
              
              <tr className="section-total">
                <td>Total Expenses</td>
                <td className="right-align">
                  {formatCurrency(totalExpenses)}
                </td>
              </tr>

              {/* Net Profit / Loss */}
              <tr
                className="section-total net-profit-loss"
                style={{
                  color: (summary?.totals?.["Net Profit/Loss"] || 0) < 0 ? "#dc2626" : "#059669",
                }}
              >
                <td>Net Profit / Loss</td>
                <td className="right-align">
                  {formatCurrency(summary?.totals?.["Net Profit/Loss"] || 0)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer */}
          <div className="footer">
            Generated on {new Date().toLocaleString()}
          </div>

          {/* Inline Styles */}
          <style jsx>{`
            .container {
              max-width: full;
              margin: auto;
              font-family: Arial, sans-serif;
              font-size: 14px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 10pt;
            }
            .data-table th,
            .data-table td {
              border: 1px solid #ccc;
              padding: 6px 8px;
            }
            .data-table th {
              background-color: #eff9f8;
              font-weight: bold;
              text-align: left;
            }
            .right-align {
              text-align: right;
            }
            .section-header {
              font-weight: bold;
              background-color: #e0e0e0;
            }
            .section-total {
              font-weight: bold;
              background-color: #f0f0f0;
            }
            .net-profit-loss {
              font-size: 13pt;
              font-weight: bold;
            }
            .clickable-row {
              cursor: pointer;
            }
            .clickable-row:hover {
              background-color: #f5f5f5;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 9pt;
              color: #555;
              border-top: 1px solid #ccc;
              padding-top: 10px;
            }
          `}</style>
        </div>
      ) : (
        <div className="flex justify-center items-center p-8">
          <div className="text-center">
            <Icon icon="solar:chart-bold" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No financial data available</p>
            <p className="text-gray-400 text-sm">No income statement data found for the current period</p>
          </div>
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
                  <PropagateLoader color="#007f80" size={10} />
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
                        <td className="px-6 py-4 text-right font-medium">
                          {formatCurrency(ledger.current_amount || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex justify-center items-center p-8">
                  <p className="text-gray-500">No ledger details available</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-teal-500 text-white hover:bg-teal-600 rounded-md transition-colors"
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