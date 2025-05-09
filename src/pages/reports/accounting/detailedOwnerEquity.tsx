//@ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { apiRequest, baseURL } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import useAuth from "../../../hooks/useAuth";
import { useReactToPrint } from "react-to-print";
import Header from "../../../components/custom/print_header";
import axios from "axios";

interface DetailedAccount {
  account_code: string;
  account_name: string;
  amount: number;
}

interface OwnersEquityData {
  components: any;
  totals: {
    opening_equity: number;
    capital_additions: number;
    current_earnings: number;
    withdrawals: number;
    closing_equity: number;
  };
  share_capital: any[];
  notes: any[];
  detailed_accounts: {
    owners_equity: DetailedAccount[];
    capital: DetailedAccount[];
    retained_earnings: DetailedAccount[];
    withdrawals: DetailedAccount[];
    current_earnings: number;
  };
}

function OwnersEquityDetailedReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [equityData, setEquityData] = useState<OwnersEquityData | null>(null);
  const { token, isFetchingLocalToken } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;
    setIsLoading(true);
    try {
      const response = await apiRequest<ServerResponse<OwnersEquityData>>(
        "/reports/accounting/owners-equity",
        "GET",
        token.access_token
      );
      setEquityData(response.data[0]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const print = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/reports/accounting/owners-equity/pdf`,
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
      console.error("Error previewing the owner's equity report:", error);
    }
  };

  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  const renderAccountDetails = (accounts: DetailedAccount[], title: string) => {
    if (!accounts || accounts.length === 0) return null;

    return (
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account Code
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account Name
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-4 py-2 text-gray-900">
                  {account.account_code}
                </td>
                <td className="px-4 py-2 text-gray-900">
                  {account.account_name}
                </td>
                <td className="px-4 py-2 text-right text-gray-500">
                  {account.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-white p-3">
      <div className="flex justify-end items-center mb-4">
        <button
          className="bg-shade p-3 rounded text-white flex gap-2 items-center"
          onClick={print}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print
        </button>
      </div>

      <div ref={contentRef} className="p-4">
        <div className="flex flex-row justify-center items-center">
          <Header title={"Owner's Equity Detailed Report"} />
        </div>

        {equityData ? (
          <div className="space-y-6">
            {/* Summary Totals */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-2">Summary Totals</h3>
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="px-4 py-2 font-medium text-gray-900">
                      Opening Equity
                    </td>
                    <td className="px-4 py-2 text-right text-gray-500">
                      {equityData.totals.opening_equity}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">
                      Capital Additions
                    </td>
                    <td className="px-4 py-2 text-right text-gray-500">
                      {equityData.totals.capital_additions}
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {equityData.totals.current_earnings >= 0
                        ? "Net Income"
                        : "Net Loss"}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-500">
                      {equityData.totals.current_earnings}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">
                      Withdrawals
                    </td>
                    <td className="px-4 py-2 text-right text-gray-500">
                      {equityData.totals.withdrawals}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Share Capital */}
            {equityData.share_capital &&
              equityData.share_capital.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-2">Share Capital</h3>
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {equityData.share_capital.map((item, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="px-4 py-2 text-gray-900">
                            {item.description}
                          </td>
                          <td className="px-4 py-2 text-right text-gray-500">
                            {item.amount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            {/* Detailed Accounts */}
            <div className="space-y-6">
              {renderAccountDetails(
                equityData.detailed_accounts.owners_equity,
                "Owners Equity Accounts"
              )}
              {renderAccountDetails(
                equityData.detailed_accounts.capital,
                "Capital Accounts"
              )}
              {renderAccountDetails(
                equityData.detailed_accounts.retained_earnings,
                "Retained Earnings Accounts"
              )}
              {renderAccountDetails(
                equityData.detailed_accounts.withdrawals,
                "Withdrawals Accounts"
              )}
            </div>

            {/* Current Earnings */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-2">Current Earnings</h3>
              <div className="bg-gray-50 p-4 rounded">
                <p
                  className={`text-right font-bold ${
                    equityData.detailed_accounts.current_earnings < 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {equityData.detailed_accounts.current_earnings}
                </p>
              </div>
            </div>

            {/* Closing Equity Calculations */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-2">
                Closing Equity Calculations
              </h3>
              <table className="min-w-full border border-gray-200">
                <tbody>
                  <tr className="bg-white">
                    <td className="px-4 py-2 font-medium text-gray-900">
                      Opening Equity
                    </td>
                    <td className="px-4 py-2 text-right text-gray-500">
                      {equityData.totals.opening_equity}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">
                      Add: Capital Contributions
                    </td>
                    <td className="px-4 py-2 text-right text-gray-500">
                      + {equityData.totals.capital_additions}
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {equityData.totals.current_earnings >= 0
                        ? "Add: Net Income"
                        : "Less: Net Loss"}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-500">
                      {equityData.totals.current_earnings >= 0 ? "+ " : "- "}
                      {Math.abs(equityData.totals.current_earnings)}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">
                      Less: Withdrawals
                    </td>
                    <td className="px-4 py-2 text-right text-gray-500">
                      - {equityData.totals.withdrawals}
                    </td>
                  </tr>
                  <tr className="border-t-2 border-gray-300">
                    <td className="px-4 py-2 font-bold text-gray-900">
                      Closing Equity
                    </td>
                    <td
                      className={`px-4 py-2 text-right font-bold ${
                        equityData.totals.closing_equity < 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {equityData.totals.closing_equity}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Notes */}
            {equityData.notes && equityData.notes.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-2">Notes</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {equityData.notes.map((note, index) => (
                    <li key={index} className="text-gray-700">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center items-center">
            <p>{isLoading ? "Loading report..." : "No data available"}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OwnersEquityDetailedReport;
