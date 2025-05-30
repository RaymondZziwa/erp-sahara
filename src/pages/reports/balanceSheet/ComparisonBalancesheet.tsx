import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useReactToPrint } from "react-to-print";
import Header from "../../../components/custom/print_header";
import useBalanceSheetComparison from "../../../hooks/reports/useBalanceSheetComparison";
import axios from "axios";
import { baseURL } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { BarLoader } from "react-spinners";
interface Account {
  account_code: string;
  account_name: string;
  balance: number;
  previous_amount: number;
  code?: string;
}

interface SubCategoryItem {
  subcategory_name: string;
  current_amount: number;
  previous_amount: number;
  total?: number;
  previous_total?: number;
  accounts: Account[];
}

function ComparisonBalanceSheet() {
  const { data, refresh, isLoading } = useBalanceSheetComparison();
  const { token } = useAuth();
  const [openModalData, setOpenModalData] = useState<Account[] | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const handleRowClick = (accounts: Account[]) => {
    setOpenModalData(accounts);
  };

  useEffect(() => {
    refresh();
  }, []);

  const closeModal = () => {
    setOpenModalData(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <BarLoader />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">No data available</p>
          <button
            onClick={refresh}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentAssetsTotal =
    data[0].assets?.reduce(
      (acc, item) => acc + (item.current_amount || item.total || 0),
      0
    ) || 0;
  const previousAssetsTotal =
    data[0].assets?.reduce(
      (acc, item) => acc + (item.previous_amount || item.previous_total || 0),
      0
    ) || 0;

  const currentEquityTotal =
    data[0].equity?.reduce(
      (acc, item) => acc + (item.current_amount || item.total || 0),
      0
    ) || 0;
  const previousEquityTotal =
    data[0].equity?.reduce(
      (acc, item) => acc + (item.previous_amount || item.previous_total || 0),
      0
    ) || 0;

  const currentLiabilitiesTotal =
    data[0].liabilities?.reduce(
      (acc, item) => acc + (item.current_amount || item.total || 0),
      0
    ) || 0;
  const previousLiabilitiesTotal =
    data[0].liabilities?.reduce(
      (acc, item) => acc + (item.previous_amount || item.previous_total || 0),
      0
    ) || 0;

  const currentProfitLoss = data[0].current_profit_or_loss || 0;
  const previousProfitLoss = data[0].previous_profit_or_loss || 0;

  const currentTotal =
    currentLiabilitiesTotal + currentEquityTotal + currentProfitLoss;
  const previousTotal =
    previousLiabilitiesTotal + previousEquityTotal + previousProfitLoss;

  const print = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/reports/accounting/balance-sheet-comparison/pdf`,
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
      console.error("Error previewing the balance sheet report:", error);
    }
  };

  return (
    <div className="bg-white p-3">
      <div className="flex justify-end items-center mb-4">
        <button
          className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
          onClick={print}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print
        </button>
      </div>
      <div ref={contentRef} className="p-4">
        <div className="flex flex-row justify-center items-center">
          <Header title={"Balance Sheet Comparison Report"} />
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="font-bold border-b border-gray-300">
              <th className="text-left p-2 w-1/2">Description</th>
              <th className="text-right p-2 w-1/4">Current Period</th>
              <th className="text-right p-2 w-1/4">Previous Period</th>
            </tr>
          </thead>
          <tbody>
            {/* Assets Section */}
            <tr className="font-bold bg-gray-100">
              <td className="p-2 pl-3" colSpan={3}>
                ASSETS
              </td>
            </tr>

            {data[0].assets?.map((item: SubCategoryItem) => (
              <tr
                key={item.subcategory_name}
                className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(item.accounts)}
              >
                <td className="p-2 pl-6">{item.subcategory_name}</td>
                <td className="p-2 text-right">
                  {(item.current_amount || item.total || 0).toLocaleString()}
                </td>
                <td className="p-2 text-right">
                  {(
                    item.previous_amount ||
                    item.previous_total ||
                    0
                  ).toLocaleString()}
                </td>
              </tr>
            ))}

            <tr className="font-bold bg-gray-100 border-t-2 border-gray-400">
              <td className="p-2 pl-3">TOTAL ASSETS</td>
              <td className="p-2 text-right">
                {currentAssetsTotal.toLocaleString()}
              </td>
              <td className="p-2 text-right">
                {previousAssetsTotal.toLocaleString()}
              </td>
            </tr>

            {/* Liabilities Section */}
            <tr className="font-bold bg-gray-100">
              <td className="p-2 pl-3" colSpan={3}>
                LIABILITIES
              </td>
            </tr>

            {data[0].liabilities?.map((item: SubCategoryItem) => (
              <tr
                key={item.subcategory_name}
                className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(item.accounts)}
              >
                <td className="p-2 pl-6">{item.subcategory_name}</td>
                <td className="p-2 text-right">
                  {(item.current_amount || item.total || 0).toLocaleString()}
                </td>
                <td className="p-2 text-right">
                  {(
                    item.previous_amount ||
                    item.previous_total ||
                    0
                  ).toLocaleString()}
                </td>
              </tr>
            ))}

            <tr className="font-bold bg-gray-100">
              <td className="p-2 pl-3">TOTAL LIABILITIES</td>
              <td className="p-2 text-right">
                {currentLiabilitiesTotal.toLocaleString()}
              </td>
              <td className="p-2 text-right">
                {previousLiabilitiesTotal.toLocaleString()}
              </td>
            </tr>

            {/* Equity Section */}
            <tr className="font-bold bg-gray-100">
              <td className="p-2 pl-3" colSpan={3}>
                EQUITY
              </td>
            </tr>

            {data[0].equity?.map((item: SubCategoryItem) => (
              <tr
                key={item.subcategory_name}
                className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(item.accounts)}
              >
                <td className="p-2 pl-6">{item.subcategory_name}</td>
                <td className="p-2 text-right">
                  {(item.current_amount || item.total || 0).toLocaleString()}
                </td>
                <td className="p-2 text-right">
                  {(
                    item.previous_amount ||
                    item.previous_total ||
                    0
                  ).toLocaleString()}
                </td>
              </tr>
            ))}

            <tr className="font-bold bg-gray-100">
              <td className="p-2 pl-3">TOTAL EQUITY</td>
              <td className="p-2 text-right">
                {currentEquityTotal.toLocaleString()}
              </td>
              <td className="p-2 text-right">
                {previousEquityTotal.toLocaleString()}
              </td>
            </tr>

            {/* Profit/Loss Section */}
            <tr className="font-bold bg-gray-100">
              <td className="p-2 pl-3">PROFIT/LOSS</td>
              <td className="p-2 text-right">
                {currentProfitLoss.toLocaleString()}
              </td>
              <td className="p-2 text-right">
                {previousProfitLoss.toLocaleString()}
              </td>
            </tr>

            {/* Grand Total */}
            <tr className="font-bold bg-gray-200 border-t-2 border-gray-600">
              <td className="p-2 pl-3">TOTAL LIABILITIES AND EQUITY</td>
              <td className="p-2 text-right">
                {currentTotal.toLocaleString()}
              </td>
              <td className="p-2 text-right">
                {previousTotal.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Modal for Accounts */}
      {openModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900">Accounts</h2>
              <table className="min-w-full mt-4">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Previous Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {openModalData.map((account) => (
                    <tr key={account.account_code}>
                      <td className="px-6 py-4 text-gray-700">
                        {account.code}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {account.account_name}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {account.balance?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {account.previous_amount?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end p-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
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

export default ComparisonBalanceSheet;
