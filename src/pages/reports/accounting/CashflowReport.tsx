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
          responseType: "pdf",
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

  const formatAmount = (amount: number) => {
    return amount.toFixed(2);
  };

  return (
    <div className="bg-white p-3">
      <div className="flex justify-between items-center mb-4">
        <div className="text-center">
          <h1 className="text-xl font-bold">SAHARA</h1>
          <p className="text-sm">mplat84@gmail.com</p>
          <h2 className="text-lg font-bold mt-2">STATEMENT OF CASH FLOWS</h2>
          <p className="text-sm">
            As of May 7, 2025 | Currency: UGX
            <br />
            For the Period from Apr 1, 2025 to Mar 31, 2026
          </p>
        </div>
        <button
          className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
          onClick={print}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print
        </button>
      </div>

      {isLoading ? (
        "Loading..."
      ) : (
        <div className="font-mono text-sm">
          {/* Operating Activities */}
          <div className="mb-6">
            <div className="font-bold border-b border-black mb-2">
              CASH FLOWS FROM OPERATING ACTIVITIES
            </div>

            <div className="flex justify-between">
              <div>Net Income</div>
              <div
                className={
                  cashFlow?.net_income < 0 ? "text-red-600" : "text-green-600"
                }
              >
                {formatAmount(cashFlow?.net_income || 0)}
              </div>
            </div>

            <div className="ml-4 mt-2">
              <div className="font-semibold">
                Adjustments to reconcile net income to net cash:
              </div>
              {cashFlow?.adjustments.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <div>{item.description}</div>
                  <div>{formatAmount(item.amount)}</div>
                </div>
              ))}
            </div>

            <div className="ml-4 mt-2">
              <div className="font-semibold">Changes in working capital:</div>
              {cashFlow?.working_capital_changes.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <div>{item.description}</div>
                  <div>{formatAmount(item.amount)}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-bold border-t border-black mt-2">
              <div>Net Cash Provided by Operating Activities</div>
              <div>{formatAmount(cashFlow?.net_income || 0)}</div>
            </div>
          </div>

          {/* Investing Activities */}
          <div className="mb-6">
            <div className="font-bold border-b border-black mb-2">
              CASH FLOWS FROM INVESTING ACTIVITIES
            </div>

            {cashFlow?.investing_activities.map((item, index) => (
              <div key={index} className="flex justify-between">
                <div>{item.description}</div>
                <div>{formatAmount(item.amount)}</div>
              </div>
            ))}

            <div className="flex justify-between font-bold border-t border-black mt-2">
              <div>Net Cash Used in Investing Activities</div>
              <div>
                {formatAmount(
                  cashFlow?.investing_activities.reduce(
                    (sum, item) => sum + item.amount,
                    0
                  ) || 0
                )}
              </div>
            </div>
          </div>

          {/* Financing Activities */}
          <div className="mb-6">
            <div className="font-bold border-b border-black mb-2">
              CASH FLOWS FROM FINANCING ACTIVITIES
            </div>

            {cashFlow?.financing_activities.length ? (
              cashFlow.financing_activities.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <div>{item.description}</div>
                  <div>{formatAmount(item.amount)}</div>
                </div>
              ))
            ) : (
              <div className="flex justify-between">
                <div>No financing activities</div>
                <div>0.00</div>
              </div>
            )}

            <div className="flex justify-between font-bold border-t border-black mt-2">
              <div>Net Cash Provided by Financing Activities</div>
              <div>
                {formatAmount(
                  cashFlow?.financing_activities.reduce(
                    (sum, item) => sum + item.amount,
                    0
                  ) || 0
                )}
              </div>
            </div>
          </div>

          {/* Cash Summary */}
          <div className="mb-6">
            <div className="flex justify-between font-bold">
              <div>Net Increase in Cash and Cash Equivalents</div>
              <div>{formatAmount(cashFlow?.net_cash_increase || 0)}</div>
            </div>

            <div className="flex justify-between">
              <div>Cash and Cash Equivalents at Beginning of Period</div>
              <div>{formatAmount(cashFlow?.cash_balances.beginning || 0)}</div>
            </div>

            <div className="flex justify-between font-bold border-t border-black mt-2">
              <div>Cash and Cash Equivalents at End of Period</div>
              <div>{formatAmount(cashFlow?.cash_balances.ending || 0)}</div>
            </div>
          </div>

          <div className="text-xs mt-4">Generated on May 7, 2025</div>
        </div>
      )}
    </div>
  );
}

export default Cashflow;
