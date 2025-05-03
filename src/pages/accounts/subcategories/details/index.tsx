import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner"; // Import ProgressSpinner for loading indication
import useChartOfAccountDetails from "../../../../hooks/accounts/useChartOfAccountDetails";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { RootState } from "../../../../redux/store";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { baseURL } from "../../../../utils/api";
import Header from "../../../../components/custom/print_header";
import { Icon } from "@iconify/react";
import React from "react";

const ChartOfAccountDetails = () => {
  const { id: accountId } = useParams();
  const token = useSelector((state: RootState) => state.userAuth.token.access_token)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState([])

    const getDetails = async (id: string) => {
      try {
        setIsLoading(true)
        const response = await axios.get(
          `${baseURL}/reports/accounting/general-ledger?id=${id}&start_date=2025-01-01&end_date=2025-04-28`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(response.data);
        if(response.data.success) {
          setData(response.data.data)
          setIsLoading(false);
        }
      } catch (error) {
        setIsLoading(false)
        console.log(error);
        toast.error("Failed to get account details");
      } finally{
        setIsLoading(false)
      }
    };

    useEffect(() => {
      getDetails(accountId ?? '');
    }, []);

  // Check if accountId is available
  if (!accountId) {
    return null; // You might want to handle this case differently, e.g., redirecting or showing an error message.
  }

  if (!data && !isLoading) {
    return <div>No account details</div>;
  }
  return (
    <div className="bg-white p-3 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold"></h1>
        {/* <button
          className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print
        </button> */}
      </div>

      <div className="flex flex-row justify-center items-center">
        <Header title={"Journal Ledger"} />
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
    </div>
  );
};

export default ChartOfAccountDetails;
