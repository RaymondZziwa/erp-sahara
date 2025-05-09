//@ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { apiRequest, baseURL } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import useAuth from "../../../hooks/useAuth";
import { useReactToPrint } from "react-to-print";
import Header from "../../../components/custom/print_header";
import axios from "axios";

interface OwnersEquityComponents {
  opening_equity: {
    account_code: string;
    description: string;
    amount: number;
  };
  capital_additions: {
    account_code: string;
    description: string;
    amount: number;
  };
  current_earnings: {
    account_code: string;
    description: string;
    amount: number;
  };
  withdrawals: {
    account_code: string;
    description: string;
    amount: number;
  };
  closing_equity: {
    account_code: string;
    description: string;
    amount: number;
  };
}

interface OwnersEquityData {
  components: OwnersEquityComponents;
  totals: any;
  share_capital: any[];
  notes: any[];
  detailed_accounts: any;
}

function OwnersEquityReport() {
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
      console.log(response.data);
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
        `${baseURL}/reports/accounting/owners-equity-summary/pdf`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token.access_token || ""}`,
          },
        }
      );

      // Explicitly set the MIME type as PDF
      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);

      // Open the file in a new browser tab
      window.open(fileURL, "_blank");
    } catch (error) {
      console.error("Error previewing the owner's equity report:", error);
    }
  };

  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

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
          <Header title={"Owner's Equity Summary Report"} />
        </div>

        {equityData ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Opening Equity */}
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {equityData.components.opening_equity.description}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    {equityData.components.opening_equity.amount}
                  </td>
                </tr>

                {/* Capital Contributions */}
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    Add: {equityData.components.capital_additions.description}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    {equityData.components.capital_additions.amount}
                  </td>
                </tr>

                {/* Current Earnings */}
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {equityData.components.current_earnings.amount >= 0
                      ? "Add:"
                      : "Less:"}{" "}
                    {equityData.components.current_earnings.description}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    {equityData.components.current_earnings.amount}
                  </td>
                </tr>

                {/* Withdrawals */}
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    Less: {equityData.components.withdrawals.description}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    {equityData.components.withdrawals.amount}
                  </td>
                </tr>

                {/* Closing Equity */}
                <tr className="border-t-2 border-gray-300">
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {equityData.components.closing_equity.description}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    {equityData.components.closing_equity.amount}
                  </td>
                </tr>
              </tbody>
            </table>
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

export default OwnersEquityReport;
