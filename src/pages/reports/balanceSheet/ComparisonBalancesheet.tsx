//@ts-nocheck
import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useReactToPrint } from "react-to-print";
import Header from "../../../components/custom/print_header";
import useBalanceSheetComparison from "../../../hooks/reports/useBalanceSheetComparison";

interface Account {
  account_code: string;
  account_name: string;
  balance: number;
}

function ComparisonBalanceSheet() {
  const { data, refresh } = useBalanceSheetComparison();
  const [openModalData, setOpenModalData] = useState<Account[] | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  // Function to open the modal
  const handleRowClick = (accounts: Account[]) => {
    setOpenModalData(accounts);
  };

  useEffect(()=> {
  if(!data || data.length === 0) {
    refresh()
  }
    console.log('dts', data)
  }, [])

  // Function to close the modal
  const closeModal = () => {
    setOpenModalData(null);
  };

  return (
    <div className="bg-white p-3">
      <div className="flex justify-end items-center mb-4">
        <button
          className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
          onClick={() => reactToPrintFn()}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print
        </button>
      </div>
      <div ref={contentRef} className="p-4">
        <div className="flex flex-row justify-centeritems-center">
          <Header title={"Balance Sheet Comparison Report"} />
        </div>
        <table className="w-full">
          <tbody>
            {/* Assets Section */}
            <tr className="font-bold bg-gray-300">
              <td className="p-3" colSpan={4}>
                ASSETS
              </td>
            </tr>
            {data[0].assets?.map((item) => (
              <React.Fragment key={item.subcategory_name}>
                <tr
                  className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleRowClick(item.accounts)}
                >
                  <td className="p-3">{item.subcategory_name}</td>
                  <td className="p-3 text-right">{item.total}</td>
                  <td className="p-3 text-right">{item.previous_total}</td>
                </tr>
              </React.Fragment>
            ))}
            <tr className="font-bold bg-gray-400">
              <td className="p-3">TOTAL ASSETS</td>
              <td className="p-3 text-right border-t-2 border-black">
                {data[0].assets
                  ?.reduce((acc, item) => acc + item.total, 0)
                  .toLocaleString()}
              </td>
              <td className="p-3 text-right border-t-2 border-black">
                {data[0].assets
                  ?.reduce((acc, item) => acc + item.previous_total, 0)
                  .toLocaleString()}
              </td>
            </tr>

            {/* Equity Section */}
            <tr className="font-bold bg-gray-300">
              <td className="p-3" colSpan={4}>
                EQUITY
              </td>
            </tr>
            {data[0].equity?.map((item) => (
              <React.Fragment key={item.subcategory_name}>
                <tr
                  className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleRowClick(item.accounts)}
                >
                  <td className="p-3">{item.subcategory_name}</td>
                  <td className="p-3 text-right">{item.total}</td>
                  <td className="p-3 text-right">{item.previous_total}</td>
                </tr>
              </React.Fragment>
            ))}
            <tr className="font-bold bg-gray-200">
              <td className="p-3">TOTAL EQUITY</td>
              <td className="p-3 text-right border-t-2 border-black">
                {data[0].equity
                  ?.reduce((acc, item) => acc + item.total, 0)
                  .toLocaleString()}
              </td>
              <td className="p-3 text-right border-t-2 border-black">
                {data[0].equity
                  ?.reduce((acc, item) => acc + item.previous_total, 0)
                  .toLocaleString()}
              </td>
            </tr>

            {/* Liabilities Section */}
            <tr className="font-bold bg-gray-300">
              <td className="p-3" colSpan={4}>
                LIABILITIES
              </td>
            </tr>
            {data[0].liabilities?.map((item) => (
              <React.Fragment key={item.subcategory_name}>
                <tr
                  className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleRowClick(item.accounts)}
                >
                  <td className="p-3">{item.subcategory_name}</td>
                  <td className="p-3 text-right">{item.total}</td>
                  <td className="p-3 text-right">{item.previous_total}</td>
                </tr>
              </React.Fragment>
            ))}
            <tr className="font-bold bg-gray-200">
              <td className="p-3">TOTAL LIABILITIES</td>
              <td className="p-3 text-right border-t-2 border-black">
                {data[0].liabilities
                  ?.reduce((acc, item) => acc + item.total, 0)
                  .toLocaleString()}
              </td>
              <td className="p-3 text-right border-t-2 border-black">
                {data[0].liabilities
                  ?.reduce((acc, item) => acc + item.previous_total, 0)
                  .toLocaleString()}
              </td>
            </tr>

            {/* Profit/Loss Section */}
            <tr className="font-bold bg-gray-200">
              <td className="p-3 ">PROFIT/LOSS</td>
              <td className="p-3 text-right border-t-2 border-black">0</td>
              <td className="p-3 text-right border-t-2 border-black">0</td>
            </tr>
            {/* <tr className="font-bold bg-gray-400 border-b border-white">
            <td className="p-3 " colSpan={2}>
              TOTAL ASSETS
            </td>
            <td className="p-3 ">
              {assets
                ?.reduce((acc, item) => acc + item.subcategory_total, 0)
                .toLocaleString()}
            </td>
          </tr> */}

            <tr className="font-bold bg-gray-400">
              <td className="p-3 ">
                TOTAL LIABILITIES AND SHAREHOLDER'S EQUITY
              </td>
              <td className="p-3 text-right border-t-2 border-black">
                {data[0].liabilities?.reduce(
                  (acc, item) => acc + item.total,
                  0
                ) +
                  data[0].equity?.reduce((acc, item) => acc + item.total, 0) +
                  data[0].current_profit_or_loss || 0}
              </td>
              <td className="p-3 text-right border-t-2 border-black">
                {data[0].liabilities?.reduce(
                  (acc, item) => acc + item.previous_total,
                  0
                ) +
                  data[0].equity?.reduce(
                    (acc, item) => acc + item.previous_total,
                    0
                  ) +
                  data[0].current_profit_or_loss || 0}
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
                        {account.balance.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {account.previous_amount.toLocaleString()}
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
