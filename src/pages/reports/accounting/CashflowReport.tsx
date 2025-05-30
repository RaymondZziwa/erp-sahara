import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { apiRequest, baseURL } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import useAuth from "../../../hooks/useAuth";
import axios from "axios";
import Header from "../../../components/custom/print_header";

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
      style: 'currency',
      currency: 'TZS',
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
        <p>Loading......</p>
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cash Flow Statement</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white flex gap-2 items-center transition-colors"
          onClick={print}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print Report
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <Header title="Cash Flow Statement" />
        
        {/* Operating Activities */}
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="font-bold text-lg text-gray-700 mb-3">
            CASH FLOWS FROM OPERATING ACTIVITIES
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div>Net Income</div>
            <div className={`text-right font-medium ${getAmountColor(cashFlow.net_income)}`}>
              {formatAmount(cashFlow.net_income)}
            </div>
          </div>

          <div className="ml-4 mt-3">
            <div className="font-semibold text-gray-600 mb-2">
              Adjustments to reconcile net income to net cash:
            </div>
            {cashFlow.adjustments.map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 mb-1">
                <div className="pl-4">{item.description}</div>
                <div className={`text-right ${getAmountColor(item.amount)}`}>
                  {formatAmount(item.amount)}
                </div>
              </div>
            ))}
          </div>

          <div className="ml-4 mt-3">
            <div className="font-semibold text-gray-600 mb-2">
              Changes in working capital:
            </div>
            {cashFlow.working_capital_changes.map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 mb-1">
                <div className="pl-4">{item.description}</div>
                <div className={`text-right ${getAmountColor(item.amount)}`}>
                  {formatAmount(item.amount)}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-gray-200 font-bold">
            <div>Net Cash Provided by Operating Activities</div>
            <div className={`text-right ${getAmountColor(cashFlow.net_income)}`}>
              {formatAmount(cashFlow.net_income)}
            </div>
          </div>
        </div>

        {/* Investing Activities */}
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="font-bold text-lg text-gray-700 mb-3">
            CASH FLOWS FROM INVESTING ACTIVITIES
          </div>

          {cashFlow.investing_activities.length > 0 ? (
            cashFlow.investing_activities.map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 mb-1">
                <div>{item.description}</div>
                <div className={`text-right ${getAmountColor(item.amount)}`}>
                  {formatAmount(item.amount)}
                </div>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-1 text-gray-500">
              <div>No investing activities</div>
              <div className="text-right">0.00</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-gray-200 font-bold">
            <div>Net Cash Used in Investing Activities</div>
            <div className={`text-right ${getAmountColor(
              cashFlow.investing_activities.reduce((sum, item) => sum + item.amount, 0)
  )}`}>
              {formatAmount(
                cashFlow.investing_activities.reduce((sum, item) => sum + item.amount, 0)
              )}
            </div>
          </div>
        </div>

        {/* Financing Activities */}
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="font-bold text-lg text-gray-700 mb-3">
            CASH FLOWS FROM FINANCING ACTIVITIES
          </div>

          {cashFlow.financing_activities.length > 0 ? (
            cashFlow.financing_activities.map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 mb-1">
                <div>{item.description}</div>
                <div className={`text-right ${getAmountColor(item.amount)}`}>
                  {formatAmount(item.amount)}
                </div>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-1 text-gray-500">
              <div>No financing activities</div>
              <div className="text-right">0.00</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-gray-200 font-bold">
            <div>Net Cash Provided by Financing Activities</div>
            <div className={`text-right ${getAmountColor(
              cashFlow.financing_activities.reduce((sum, item) => sum + item.amount, 0)
  )}`}>
              {formatAmount(
                cashFlow.financing_activities.reduce((sum, item) => sum + item.amount, 0)
              )}
            </div>
          </div>
        </div>

        {/* Cash Summary */}
        <div className="p-4 bg-blue-50">
          <div className="grid grid-cols-2 gap-4 mb-2 font-bold">
            <div>Net Increase in Cash and Cash Equivalents</div>
            <div className={`text-right ${getAmountColor(cashFlow.net_cash_increase)}`}>
              {formatAmount(cashFlow.net_cash_increase)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-2">
            <div>Cash and Cash Equivalents at Beginning of Period</div>
            <div className="text-right">
              {formatAmount(cashFlow.cash_balances.beginning)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-gray-300 font-bold">
            <div>Cash and Cash Equivalents at End of Period</div>
            <div className="text-right">
              {formatAmount(cashFlow.cash_balances.ending)}
            </div>
          </div>
        </div>

        <div className="p-4 text-sm text-gray-500 text-center border-t border-gray-200">
          Generated on {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>
    </div>
  );
}

export default Cashflow;