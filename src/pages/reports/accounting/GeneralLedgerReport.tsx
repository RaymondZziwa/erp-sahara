import React, { useEffect, useState, useRef } from "react";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import useAuth from "../../../hooks/useAuth";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import { apiRequest } from "../../../utils/api";
import { useReactToPrint } from "react-to-print";
import Header from "../../../components/custom/print_header";
import CustomReportHeader from "../../../components/custom/customReportHeader";
import { PropagateLoader } from "react-spinners";
import { Card } from 'primereact/card';
import TableFooter from "../../../components/custom/customFooter";

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

interface LedgerDataType extends Array<SubCategory> {}

const TransactionTable: React.FC = () => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const [entries, setEntries] = useState(10);

  const [filters, setFilters] = useState({
    start_date: startOfMonth.toISOString().split("T")[0],
    end_date: endOfMonth.toISOString().split("T")[0],
  });

  const [data, setLedgerData] = useState<LedgerDataType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token, isFetchingLocalToken } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.start_date)
        queryParams.append("start_date", filters.start_date);
      if (filters.end_date) queryParams.append("end_date", filters.end_date);

      const endpoint = `${REPORTS_ENDPOINTS.GENERAL_LEDGERS.GET_ALL(
        filters.start_date,
        filters.end_date
      )}?${queryParams.toString()}`;

      const response = await apiRequest<ServerResponse<LedgerDataType>>(
        // endpoint,
        "/reports/accounting/general-ledger",
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
      <CustomReportHeader />

      <div className="flex flex-row justify-center items-center mt-20">
        <Header title={"General Ledger"} />
      </div>

      {(filters.start_date || filters.end_date) && (
        <div className="text-center mb-4 text-sm text-gray-600">
          Showing data from {filters.start_date || "the beginning"} to{" "}
          {filters.end_date || "now"}
        </div>
      )}

      {isLoading && data === null ? (
        <div className="flex justify-center items-center p-8">
           <PropagateLoader color="#007f80"/>
        </div>
      ) : data ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead></thead>
            <tbody>
              {data.map((subCategory, subCategoryIndex) => (
                <React.Fragment key={subCategoryIndex}>
                  <tr>
                    <td
                      colSpan={6}
                      className="bg-gray-100 p-2 border-b border-gray-300"
                    ><span className="font-bold">Sub Category: </span>
                      {subCategory.sub_category_name}
                    </td>
                  </tr>
                  {subCategory.accounts
                    .filter(
                      (account) =>
                        account.opening_balance !== 0 ||
                        account.closing_balance !== 0
                    )
                    .map((account, accountIndex) => (
                      <React.Fragment key={accountIndex}>
                        <tr>
                          <td
                            colSpan={6}
                            className="bg-gray-50 p-2 border-b border-gray-300"
                          >
                            <span className="font-bold">Account:</span> {account.account_name}
                          </td>
                        </tr>
                        {account.transactions.length > 0 ? (
                          <>
                            <tr className="border-b border-gray-300 bg-teal-500 text-white">
                              <th className="px-6 py-3 text-left font-medium border-b border-gray-300">
                                Description
                              </th>
                              <th className="px-6 py-3 text-left font-medium border-b border-gray-300">
                                Debit
                              </th>
                              <th className="px-6 py-3 text-left font-medium border-b border-gray-300">
                                Credit
                              </th>
                              {/* <th className="px-6 py-3 text-left font-medium border-b border-gray-300">
                                Balance
                              </th> */}
                            </tr>
                            {account.transactions
                              .slice(0, entries) // limit to the number of entries
                              .map((transaction, transIndex) => (
                                <tr
                                  key={transIndex}
                                  className="border-b border-gray-300 hover:bg-gray-50"
                                >
                                  <td className="px-6 py-2">{transaction.description}</td>
                                  <td className="px-6 py-2">{transaction.debit.toLocaleString()}</td>
                                  <td className="px-6 py-2">{transaction.credit.toLocaleString()}</td>
                                  {/* <td className="px-6 py-2">{transaction.balance.toLocaleString()}</td> */}
                                </tr>
                              ))}

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
        <Card className="flex flex-col items-center justify-center p-6 shadow-sm">
        <i className="pi pi-database text-4xl mb-3 text-gray-400"></i>
        <p className="text-sm font-medium text-gray-600">No data available</p>
        <span className="text-xs text-gray-400">Try adjusting your filters or adding new records</span>
      </Card>

      )}


      <TableFooter setEntries={setEntries} entries={entries} />
    </div>
  );
};

export default TransactionTable;
