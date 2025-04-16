import React from "react";
import Header from "../../../components/custom/print_header";

interface PrintableContentProps {
  reportName: string;
  equityData: {
    opening_equity: number;
    capital_contributions: number;
    net_income: number;
    drawings: number;
    closing_equity: number;
  } | null;
}

export const PrintableContent: React.FC<PrintableContentProps> = ({
  reportName,
  equityData,
}) => {
  if (!equityData) return null;

  return (
    <div className="p-4">
      <div className="flex flex-row justify-center items-center">
        <Header title={reportName} />
      </div>

      <table className="min-w-full border border-gray-200">
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
          <tr>
            <td className="px-6 py-4 font-medium text-gray-900">
              Opening Equity
            </td>
            <td className="px-6 py-4 text-right text-gray-500">
              {equityData.opening_equity.toLocaleString()}
            </td>
          </tr>

          <tr>
            <td className="px-6 py-4 font-medium text-gray-900">
              Add: Capital Contributions
            </td>
            <td className="px-6 py-4 text-right text-gray-500">
              {equityData.capital_contributions.toLocaleString()}
            </td>
          </tr>

          <tr>
            <td className="px-6 py-4 font-medium text-gray-900">
              Add: Net Income
            </td>
            <td className="px-6 py-4 text-right text-gray-500">
              {equityData.net_income.toLocaleString()}
            </td>
          </tr>

          <tr>
            <td className="px-6 py-4 font-medium text-gray-900">
              Less: Drawings
            </td>
            <td className="px-6 py-4 text-right text-gray-500">
              ({equityData.drawings.toLocaleString()})
            </td>
          </tr>

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
  );
};
