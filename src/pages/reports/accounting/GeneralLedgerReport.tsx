//@ts-nocheck
import React, { useEffect, useState, useRef } from "react";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import useAuth from "../../../hooks/useAuth";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import { apiRequest } from "../../../utils/api";
import { Icon } from "@iconify/react";
import { PrintableContent } from "./general_ledger_print_template";
import { useReactToPrint } from "react-to-print";
import Logo from "../../../assets/images/logos/ltcu.jpeg";
import Header from "../../../components/custom/print_header";

interface Transaction {
  balance: number;
  credit: number;
  date: string;
  debit: number;
  description: string;
  reference: string;
}

interface Account {
  account_name: string;
  opening_balance: number;
  closing_balance: number;
  transactions: Transaction[];
}

interface SubCategory {
  sub_category_name: string;
  accounts: Account[];
}

interface Props {
  data: SubCategory[];
}

const TransactionTable: React.FC<Props> = () => {
  const [data, setLedgerData] = useState<LedgerDataType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token, isFetchingLocalToken } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;
    setIsLoading(true);
    try {
      const response = await apiRequest<ServerResponse<LedgerDataType>>(
        REPORTS_ENDPOINTS.GENERAL_LEDGERS.GET_ALL,
        "GET",
        token.access_token
      );
      setLedgerData(response.data);
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
    <div className="bg-white p-3 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold"></h1>
        <button
          className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
          onClick={() => reactToPrintFn()}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print
        </button>
      </div>

      <div className="flex flex-row justify-center items-center">
        <Header title={"General Ledger Report"} />
      </div>

      {isLoading && data === null ? (
        <div className="flex justify-center items-center p-8">
          <p>Loading...</p>
        </div>
      ) : data ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead></thead>
            <tbody>
              {data.map((subCategory, subCategoryIndex) => (
                <React.Fragment key={subCategoryIndex}>
                  {/* Subcategory Heading */}
                  <tr>
                    <td
                      colSpan={6}
                      className="font-bold bg-gray-100 p-2 border-b border-gray-300"
                    >
                      {subCategory.sub_category_name}
                    </td>
                  </tr>

                  {/* Accounts */}
                  {subCategory.accounts
                    .filter(
                      (account) =>
                        account.opening_balance !== 0 ||
                        account.closing_balance !== 0
                    )
                    .map((account, accountIndex) => (
                      <React.Fragment key={accountIndex}>
                        {/* Account Name */}
                        <tr>
                          <td
                            colSpan={6}
                            className="font-semibold bg-gray-50 p-2 border-b border-gray-300"
                          >
                            {account.account_name}
                          </td>
                        </tr>

                        {/* Transactions Table */}
                        {account.transactions.length > 0 ? (
                          <>
                            <tr className="border-b border-gray-300">
                              <th className="px-6 py-3 text-left font-medium border-b border-gray-300">
                                No.
                              </th>
                              <th className="px-6 py-3 text-left font-medium border-b border-gray-300">
                                Date
                              </th>
                              <th className="px-6 py-3 text-left font-medium border-b border-gray-300">
                                Description
                              </th>
                              <th className="px-6 py-3 text-left font-medium border-b border-gray-300">
                                Debit
                              </th>
                              <th className="px-6 py-3 text-left font-medium border-b border-gray-300">
                                Credit
                              </th>
                              <th className="px-6 py-3 text-left font-medium border-b border-gray-300">
                                Balance
                              </th>
                            </tr>
                            {account.transactions.map(
                              (transaction, transIndex) => (
                                <tr
                                  key={transIndex}
                                  className="border-b border-gray-300 hover:bg-gray-50"
                                >
                                  <td className="px-6 py-2">
                                    {transIndex + 1}
                                  </td>
                                  <td className="px-6 py-2">
                                    {new Date(
                                      transaction.date
                                    ).toLocaleDateString()}
                                  </td>
                                  <td className="px-6 py-2">
                                    {transaction.description}
                                  </td>
                                  <td className="px-6 py-2">
                                    {transaction.debit.toLocaleString()}
                                  </td>
                                  <td className="px-6 py-2">
                                    {transaction.credit.toLocaleString()}
                                  </td>
                                  <td className="px-6 py-2">
                                    {transaction.balance.toLocaleString()}
                                  </td>
                                </tr>
                              )
                            )}
                          </>
                        ) : (
                          <tr>
                            <td
                              colSpan={6}
                              className="text-gray-500 p-2 text-center"
                            >
                              No transactions available.
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex justify-center items-center p-8">
          <p>No data present</p>
        </div>
      )}

      <div ref={contentRef} className="print-content">
        <PrintableContent reportName={"General Ledger Report"} data={data} />
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
};

export default TransactionTable;
