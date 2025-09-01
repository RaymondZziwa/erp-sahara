import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { apiRequest, baseURL } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import useAuth from "../../../hooks/useAuth";
import axios from "axios";
import Header from "../../../components/custom/print_header";
import CustomReportHeader from "../../../components/custom/customReportHeader";
import { PropagateLoader } from "react-spinners";

interface CashFlowData {
  net_income: number;
  adjustments: {
    description: string;
    amount: number;
  }[];
  working_capital_changes: {
    description: string;
    amount: number;
    account_type: string;
  }[];
  investing_activities: {
    description: string;
    amount: number;
  }[];
  financing_activities: {
    description: string;
    amount: number;
  }[];
  net_cash_increase: number;
  cash_balances: {
    beginning: number;
    ending: number;
    net_increase: number;
  };
}

function Cashflow() {
  const [cashFlow, setCashFlow] = useState<CashFlowData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token, isFetchingLocalToken } = useAuth();
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const [filters, setFilters] = useState({
        start_date: startOfMonth.toISOString().split("T")[0],
        end_date: endOfMonth.toISOString().split("T")[0],
      });

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;
    setIsLoading(true);
    try {
      const response = await apiRequest<ServerResponse<CashFlowData>>(
        REPORTS_ENDPOINTS.CASH_FLOW_STATEMENT.GET_ALL,
        "GET",
        token.access_token
      );
      setCashFlow(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  const print = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/reports/accounting/cash-flow-statement-indirect-download`,
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
      console.error("Error previewing the cash flow report:", error);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getAmountColor = (amount: number) => {
    return amount < 0 ? 'text-red-600' : 'text-green-600';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
       <PropagateLoader color="#007f80"/>
      </div>
    );
  }

  if (!cashFlow) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <p className="text-lg text-gray-600 mb-4">No cash flow data available</p>
          <button
            onClick={fetchDataFromApi}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <CustomReportHeader />
      <div className="flex flex-row justify-center items-center mt-20">
      <Header title="Cash Flow Statement" />
      </div>
      {(filters.start_date || filters.end_date) && (
                <div className="text-center mb-4 text-sm text-gray-600">
                  Showing data from {filters.start_date || "the beginning"} to{" "}
                  {filters.end_date || "now"}
                </div>
              )}

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        
        
        {/* Operating Activities */}
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="font-bold text-lg text-white mb-3 bg-teal-500 p-2">
            CASH FLOWS FROM OPERATING ACTIVITIES
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-2 ml-4 text-md">
            <div>Net Income</div>
            <div className={`text-right font-medium`}>
              ({formatAmount(cashFlow.net_income)})
            </div>
          </div>

          {
            cashFlow.adjustments.length === 0 ? (
              <div className="grid grid-cols-2 gap-4 mb-2 ml-4 text-md">
                <div className="font-bold text-gray-600">Adjustments to reconcile net income to net cash</div>
                <div className={`text-right font-medium`}>
                  0
                </div>
              </div>
            ) : (
              <div className="ml-4 mt-3 text-md">
                <div className="font-bold text-gray-600">
                  Adjustments to reconcile net income to net cash
                </div>
                {cashFlow.adjustments.map((item, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4 mb-1 text-md">
                    <div className="pl-4">{item.description}</div>
                    <div className={`text-right ${getAmountColor(item.amount)}`}>
                      {formatAmount(item.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )
          }

{
            cashFlow.working_capital_changes.length === 0 ? (
              <div className="grid grid-cols-2 gap-4 mb-2 ml-4 text-md">
                <div className="font-bold text-gray-600">Changes in working capital</div>
                <div className={`text-right font-medium`}>
                  0
                </div>
              </div>
            ) : (
              <div className="ml-4 mt-3 text-md">
                <div className="font-bold text-gray-600">
                  Changes in working capital
                </div>
                {cashFlow.working_capital_changes.map((item, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4 mb-1 text-md">
                    <div className="pl-4">{item.description}</div>
                    <div className={`text-right`}>
                      {formatAmount(item.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )
          }

          <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-gray-200 font-bold text-md">
            <div>Net Cash Provided by Operating Activities</div>
            <div className={`text-right font-bold`}>
              {formatAmount(cashFlow.net_income)}
            </div>
          </div>
        </div>

        {/* Investing Activities */}
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="font-bold text-lg text-white mb-3 bg-teal-500 p-2">
            CASH FLOWS FROM INVESTING ACTIVITIES
          </div>

          {cashFlow.investing_activities.length > 0 ? (
            cashFlow.investing_activities.map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 mb-1">
                <div>{item.description}</div>
                <div className={`text-right`}>
                  {formatAmount(item.amount)}
                </div>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-1 gap-4 mb-1 text-gray-500">
              <div>No investing activities</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-gray-200 font-bold text-md">
            <div>Net Cash Used in Investing Activities</div>
            <div className={`text-right`}>
              {formatAmount(
                cashFlow.investing_activities.reduce((sum, item) => sum + item.amount, 0)
              )}
            </div>
          </div>
        </div>

        {/* Financing Activities */}
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="font-bold text-lg text-white bg-teal-500 p-2 mb-3 ">
            CASH FLOWS FROM FINANCING ACTIVITIES
          </div>

          {cashFlow.financing_activities.length > 0 ? (
            cashFlow.financing_activities.map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 mb-1">
                <div>{item.description}</div>
                <div className={`text-right`}>
                  {formatAmount(item.amount)}
                </div>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-1 text-gray-500">
              <div>No financing activities</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-gray-200 font-bold">
            <div>Net Cash Provided by Financing Activities</div>
            <div className={`text-right`}>
              {formatAmount(
                cashFlow.financing_activities.reduce((sum, item) => sum + item.amount, 0)
              )}
            </div>
          </div>
        </div>

        {/* Cash Summary */}
        <div className="p-4 bg-blue-50">
          <div className="grid grid-cols-2 gap-4 mb-2 font-bold">
            <div>Net Change In Cash</div>
            <div className={`text-right`}>
              {formatAmount(cashFlow.net_cash_increase)}
            </div>
          </div>

          {/* <div className="grid grid-cols-2 gap-4 mb-2">
            <div>Cash and Cash Equivalents at Beginning of Period</div>
            <div className="text-right">
              {formatAmount(cashFlow.cash_balances.beginning)}
            </div>
          </div> */}

          {/* <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-gray-300 font-bold">
            <div>Cash and Cash Equivalents at End of Period</div>
            <div className="text-right">
              {formatAmount(cashFlow.cash_balances.ending)}
            </div>
          </div> */}
        </div>

        <div className="p-4 text-sm text-gray-500 text-center border-t border-gray-200">
          **Amount is being displayed in your base currency
        </div>
      </div>
    </div>
  );
}

export default Cashflow;