//@ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { apiRequest, baseURL } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import useAuth from "../../../hooks/useAuth";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import { useReactToPrint } from "react-to-print";
import Header from "../../../components/custom/print_header";
import axios from "axios";

interface FinancialCategory {
  subcategory: string;
  id: number;
  code: number;
  current_period: {
    total_amount: number;
    total_credit: number;
    total_debit: number;
  };
  previous_period: {
    total_amount: number;
    total_credit: number;
    total_debit: number;
  };
  difference: {
    amount: number;
    percentage: number;
  };
  children?: FinancialCategory[];
}

interface FinancialGroup {
  [key: string]: FinancialCategory[];
}

interface FinancialStatement {
  "Revenue and Costs": FinancialGroup[];
  "Income and Expenses": FinancialGroup[];
}

function ComparisonIncomeStatementReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [financialData, setFinancialData] = useState<
    FinancialStatement[] | null
  >(null);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [selectedLedgers, setSelectedLedgers] = useState<{
    title: string;
    items: FinancialCategory[];
  } | null>(null);

  const { token, isFetchingLocalToken } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;
    setIsLoading(true);
    try {
      const response = await apiRequest<ServerResponse<FinancialStatement[]>>(
        REPORTS_ENDPOINTS.COMPARISON_INCOME_STATEMENT.GET_ALL,
        "GET",
        token.access_token
      );
      setFinancialData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const calculateGrossProfit = () => {
    if (!financialData) return 0;

    const revenueGroup = financialData[0]["Revenue and Costs"];
    let totalRevenue = 0;
    let totalDirectCosts = 0;

    revenueGroup.forEach((group) => {
      if (group["Sales Revenue"]) {
        totalRevenue = group["Sales Revenue"][0].current_period.total_amount;
      }
      if (group["Direct Costs"]) {
        totalDirectCosts = group["Direct Costs"][0].current_period.total_amount;
      }
    });

    return totalRevenue - totalDirectCosts;
  };

  const calculateNetProfit = () => {
    if (!financialData) return 0;

    const grossProfit = calculateGrossProfit();
    const expenseGroup = financialData[0]["Income and Expenses"];
    let totalExpenses = 0;

    expenseGroup.forEach((group) => {
      if (group["Operating Expenses"]) {
        totalExpenses =
          group["Operating Expenses"][0].current_period.total_amount;
      }
    });

    return grossProfit - totalExpenses;
  };

  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  const openLedgerModal = (title: string, items: FinancialCategory[]) => {
    setSelectedLedgers({ title, items });
  };

  const closeModal = () => {
    setSelectedLedgers(null);
  };

      const print = async () => {
        try {
          const response = await axios.get(
            `${baseURL}reports/accounting/print-comparison-income-statement`,
            {
              responseType: "blob", // Important for downloading files
              headers: {
                Authorization: `Bearer ${token.access_token || ""}`,
              },
            }
          );

          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "income statement comparison.pdf"); // Adjust filename/extension if needed
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error("Error downloading the trial balance report:", error);
        }
      };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Income Statement Comparison
        </h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
          onClick={print}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print Report
        </button>
      </div>

      <div ref={contentRef} className="p-4 print:p-0">
        <Header title={"Income Statement Comparison Report"} />

        {financialData ? (
          <div className="space-y-8">
            {/* Revenue and Costs Section */}
            <div className="border rounded-lg overflow-hidden">
              {/* <div className="bg-gray-50 px-6 py-3 border-b">
                {/* <h2 className="text-lg font-medium text-gray-700">
                  Revenue and Costs
                </h2>
              </div> */}

              {financialData[0]["Revenue and Costs"].map(
                (group, groupIndex) => (
                  <div key={groupIndex} className="divide-y">
                    {Object.entries(group).map(([category, items]) => (
                      <div key={category}>
                        <div
                          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 cursor-pointer flex justify-between items-center"
                          onClick={() =>
                            toggleSection(`${category}-${groupIndex}`)
                          }
                        >
                          <h3 className="font-medium text-gray-700">
                            {category}
                          </h3>
                          <Icon
                            icon={
                              expandedSections[`${category}-${groupIndex}`]
                                ? "mdi:chevron-up"
                                : "mdi:chevron-down"
                            }
                            className="text-gray-500"
                          />
                        </div>

                        {expandedSections[`${category}-${groupIndex}`] && (
                          <div className="divide-y">
                            {items.map((item, itemIndex) => (
                              <div key={itemIndex} className="px-6 py-3">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">
                                    {item.subcategory}
                                  </span>
                                  <div className="flex gap-8">
                                    <span className="w-32 text-right">
                                      {formatCurrency(
                                        item.current_period.total_amount
                                      )}
                                    </span>
                                    <span className="w-32 text-right">
                                      {formatCurrency(
                                        item.previous_period.total_amount
                                      )}
                                    </span>
                                  </div>
                                </div>

                                {item.children && (
                                  <div className="mt-2 ml-4 space-y-2">
                                    {item.children.map((child, childIndex) => (
                                      <div
                                        key={childIndex}
                                        className="flex justify-between items-center hover:bg-gray-50 px-2 py-1 rounded cursor-pointer"
                                        onClick={() =>
                                          openLedgerModal(child.subcategory, [
                                            child,
                                          ])
                                        }
                                      >
                                        <span className="text-gray-600">
                                          {child.subcategory}
                                        </span>
                                        <div className="flex gap-8">
                                          <span className="w-32 text-right">
                                            {formatCurrency(
                                              child.current_period.total_amount
                                            )}
                                          </span>
                                          <span className="w-32 text-right">
                                            {formatCurrency(
                                              child.previous_period.total_amount
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}

              <div className="px-6 py-3 bg-gray-50 border-t">
                <div className="flex justify-between items-center font-medium">
                  <span>Gross Profit</span>
                  <div className="flex gap-8">
                    <span className="w-32 text-right">
                      {formatCurrency(calculateGrossProfit())}
                    </span>
                    <span className="w-32 text-right">
                      {formatCurrency(calculateGrossProfit())}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Income and Expenses Section */}
            <div className="border rounded-lg overflow-hidden">
              {/* <div className="bg-gray-50 px-6 py-3 border-b">
                <h2 className="text-lg font-medium text-gray-700">
                  Income and Expenses
                </h2>
              </div> */}

              {financialData[0]["Income and Expenses"].map(
                (group, groupIndex) => (
                  <div key={groupIndex} className="divide-y">
                    {Object.entries(group).map(([category, items]) => (
                      <div key={category}>
                        {items.length > 0 && (
                          <>
                            <div
                              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 cursor-pointer flex justify-between items-center"
                              onClick={() =>
                                toggleSection(`${category}-${groupIndex}`)
                              }
                            >
                              <h3 className="font-medium text-gray-700">
                                {category}
                              </h3>
                              <Icon
                                icon={
                                  expandedSections[`${category}-${groupIndex}`]
                                    ? "mdi:chevron-up"
                                    : "mdi:chevron-down"
                                }
                                className="text-gray-500"
                              />
                            </div>

                            {expandedSections[`${category}-${groupIndex}`] && (
                              <div className="divide-y">
                                {items.map((item, itemIndex) => (
                                  <div key={itemIndex} className="px-6 py-3">
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium">
                                        {item.subcategory}
                                      </span>
                                      <div className="flex gap-8">
                                        <span className="w-32 text-right">
                                          {formatCurrency(
                                            item.current_period.total_amount
                                          )}
                                        </span>
                                        <span className="w-32 text-right">
                                          {formatCurrency(
                                            item.previous_period.total_amount
                                          )}
                                        </span>
                                      </div>
                                    </div>

                                    {item.children && (
                                      <div className="mt-2 ml-4 space-y-2">
                                        {item.children.map(
                                          (child, childIndex) => (
                                            <div
                                              key={childIndex}
                                              className="flex justify-between items-center hover:bg-gray-50 px-2 py-1 rounded cursor-pointer"
                                              onClick={() =>
                                                openLedgerModal(
                                                  child.subcategory,
                                                  [child]
                                                )
                                              }
                                            >
                                              <span className="text-gray-600">
                                                {child.subcategory}
                                              </span>
                                              <div className="flex gap-8">
                                                <span className="w-32 text-right">
                                                  {formatCurrency(
                                                    child.current_period
                                                      .total_amount
                                                  )}
                                                </span>
                                                <span className="w-32 text-right">
                                                  {formatCurrency(
                                                    child.previous_period
                                                      .total_amount
                                                  )}
                                                </span>
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}

              <div className="px-6 py-3 bg-gray-50 border-t">
                <div className="flex justify-between items-center font-medium">
                  <span>Net Profit</span>
                  <div className="flex gap-8">
                    <span className="w-32 text-right">
                      {formatCurrency(calculateNetProfit())}
                    </span>
                    <span className="w-32 text-right">
                      {formatCurrency(calculateNetProfit())}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Icon
                icon="eos-icons:loading"
                className="text-4xl text-blue-500 mb-2"
              />
              <p className="text-gray-600">Generating financial report...</p>
            </div>
          </div>
        )}
      </div>

      {/* Ledger Details Modal */}
      {selectedLedgers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedLedgers.title}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Period
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Previous Period
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difference
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedLedgers.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.subcategory}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatCurrency(item.current_period.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatCurrency(item.previous_period.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        <span
                          className={`${
                            item.difference.amount >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {item.difference.amount >= 0 ? "+" : ""}
                          {formatCurrency(item.difference.amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComparisonIncomeStatementReport;
