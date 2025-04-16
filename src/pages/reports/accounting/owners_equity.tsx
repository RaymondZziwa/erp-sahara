//@ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { apiRequest } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import useAuth from "../../../hooks/useAuth";
import { useReactToPrint } from "react-to-print";
import { PrintableContent } from "./OE_print_template";
import Header from "../../../components/custom/print_header";

interface OwnersEquityData {
  opening_equity: number;
  capital_contributions: number;
  net_income: number;
  drawings: number;
  closing_equity: number;
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
        "/erp/reports/accounting/ownersequity",
        "GET",
        token.access_token
      );
      setEquityData(response.data); // Access the data property
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
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
          onClick={() => reactToPrintFn()}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print
        </button>
      </div>

      <div ref={contentRef} className="p-4">
        <div className="flex flex-row justify-center items-center">
          <Header title={"Owner's Equity Report"} />
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
                    Opening Equity
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    {equityData.opening_equity.toLocaleString()}
                  </td>
                </tr>

                {/* Capital Contributions */}
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    Add: Capital Contributions
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    {equityData.capital_contributions.toLocaleString()}
                  </td>
                </tr>

                {/* Net Income */}
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    Add: Net Income
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    {equityData.net_income.toLocaleString()}
                  </td>
                </tr>

                {/* Drawings */}
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    Less: Drawings
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    ({equityData.drawings.toLocaleString()})
                  </td>
                </tr>

                {/* Closing Equity */}
                <tr className="border-t-2 border-gray-300">
                  <td className="px-6 py-4 font-bold text-gray-900">
                    Closing Equity
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    {equityData.closing_equity.toLocaleString()}
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

      <div ref={contentRef} className="print-content">
        <PrintableContent
          reportName={"Owner's Equity Report"}
          equityData={equityData}
        />
        <style>
          {`
             @media print {
                .print-content {
                  display: block !important;
                }
              }
              .print-content {
                display: none;
              }
          `}
        </style>
      </div>
    </div>
  );
}

export default OwnersEquityReport;
