import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { RootState } from "../../../../redux/store";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { baseURL } from "../../../../utils/api";
import Header from "../../../../components/custom/print_header";
import React from "react";

const ChartOfAccountDetails = () => {
  const { id: accountId } = useParams();
  const token = useSelector(
    (state: RootState) => state.userAuth.token.access_token
  );
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d.toISOString().split("T")[0];
  });

  const endDate = new Date().toISOString().split("T")[0];

  const getDetails = async (id: string, start: string) => {
    try {
      setIsLoading(true);

      const response = await axios.get(
        `${baseURL}/reports/accounting/general-ledger?id=${id}&start_date=${start}&end_date=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setData(response.data.data);
      } else {
        toast.error("Failed to get account details");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to get account details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accountId) {
      getDetails(accountId, startDate);
    }
  }, [accountId, startDate]);

  if (!accountId) return null;

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <Header title={"Journal Ledger"} />
        <div className="flex items-center gap-2">
          <label
            htmlFor="start-date"
            className="text-sm font-medium text-gray-700"
          >
            Start Date:
          </label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            max={endDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <p>Loading...</p>
        </div>
      ) : data?.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {data.map((subCategory, subCategoryIndex) => (
                <React.Fragment key={subCategoryIndex}>
                  <tr>
                    <td
                      colSpan={6}
                      className="font-bold bg-gray-100 p-2 border-b border-gray-300"
                    >
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
                            className="font-semibold bg-gray-50 p-2 border-b border-gray-300"
                          >
                            {account.account_name}
                          </td>
                        </tr>

                        {account.transactions.length > 0 ? (
                          <>
                            <tr className="bg-gray-100">
                              <th className="px-4 py-2 text-left">No.</th>
                              <th className="px-4 py-2 text-left">Date</th>
                              <th className="px-4 py-2 text-left">
                                Description
                              </th>
                              <th className="px-4 py-2 text-left">Debit</th>
                              <th className="px-4 py-2 text-left">Credit</th>
                              <th className="px-4 py-2 text-left">Balance</th>
                            </tr>
                            {account.transactions.map(
                              (transaction, transIndex) => (
                                <tr
                                  key={transIndex}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="px-4 py-2">
                                    {transIndex + 1}
                                  </td>
                                  <td className="px-4 py-2">
                                    {new Date(
                                      transaction.date
                                    ).toLocaleDateString()}
                                  </td>
                                  <td className="px-4 py-2">
                                    {transaction.description}
                                  </td>
                                  <td className="px-4 py-2">
                                    {transaction.debit.toLocaleString()}
                                  </td>
                                  <td className="px-4 py-2">
                                    {transaction.credit.toLocaleString()}
                                  </td>
                                  <td className="px-4 py-2">
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
                              className="text-center text-gray-500 py-2"
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
          <p>No account details available.</p>
        </div>
      )}
    </div>
  );
};

export default ChartOfAccountDetails;
