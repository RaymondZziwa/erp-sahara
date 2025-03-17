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
  const [data, setLedgerData] = useState<LedgerDataType | null>();
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
    <>
      <div className="flex justify-end items-center mb-4">
        <button
          className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
          onClick={() => reactToPrintFn()}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print
        </button>
      </div>
      <div className="flex flex-row justify-between items-center">
        <img src={Logo} alt="" className="w-20 h-18 mb-4" />
        <p className="font-bold text-2xl">General Ledger Report</p>
      </div>
      <table className="w-full">
        <thead>
          
        </thead>
        <tbody>
          {data &&
            data.map((subCategory, subCategoryIndex) => (
              <React.Fragment key={subCategoryIndex}>
                {/* Subcategory Heading */}
                <tr>
                  <td colSpan={5} className="font-bold bg-gray-100 p-2">
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
                          colSpan={5}
                          className="font-semibold bg-gray-50 p-2"
                        >
                          {account.account_name}
                        </td>
                      </tr>

                      {/* Transactions Table */}
                      {account.transactions.length > 0 ? (
                        <tr>
                          <td colSpan={5}>
                            <table className="w-full border-collapse border border-gray-200">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="border border-gray-200 p-2">
                                    No.
                                  </th>
                                  <th className="border border-gray-200 p-2">
                                    Date
                                  </th>
                                  <th className="border border-gray-200 p-2">
                                    Description
                                  </th>
                                  <th className="border border-gray-200 p-2">
                                    Debit
                                  </th>
                                  <th className="border border-gray-200 p-2">
                                    Credit
                                  </th>
                                  <th className="border border-gray-200 p-2">
                                    Balance
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {account.transactions.map(
                                  (transaction, transIndex) => (
                                    <tr
                                      key={transIndex}
                                      className="text-center"
                                    >
                                      <td className="border border-gray-200 p-2">
                                        {transIndex + 1}
                                      </td>
                                      <td className="border border-gray-200 p-2">
                                        {new Date(
                                          transaction.date
                                        ).toLocaleDateString()}
                                      </td>
                                      <td className="border border-gray-200 p-2">
                                        {transaction.description}
                                      </td>
                                      <td className="border border-gray-200 p-2">
                                        {transaction.debit.toLocaleString()}
                                      </td>
                                      <td className="border border-gray-200 p-2">
                                        {transaction.credit.toLocaleString()}
                                      </td>
                                      <td className="border border-gray-200 p-2">
                                        {transaction.balance.toLocaleString()}
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-gray-500 p-2">
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
    </>
  );
};

export default TransactionTable;