//@ts-nocheck
import React from "react";
import Logo from "../../../assets/images/logos/ltcu.jpeg";

export class PrintableContent extends React.Component {
  render() {
    //@ts-expect-error --ignore
    const { reportName, data } = this.props;
    const today = new Date();

    const formattedDateTime = today.toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div style={{ color: "black", padding: "10px", fontSize: "16px" }}>
        <div className="flex flex-col justify-center items-center">
          <img src={Logo} alt="" className="w-20 h-18 mb-4" />
          <div className="flex flex-col justify-center items-center">
            <p className="font-bold text-2xl">
              Lake Tanganyika Co-operative Union Limited
            </p>
            <p className="font-bold text-xl">P.O BOX 251</p>
            <p className="font-bold text-xl">MPANDA-KATAVI</p>
            <p className="font-bold text-xl">www.latcu.co.tz</p>
            <p className="font-bold text-xl">TIN: 102-778-057</p>
            <p className="font-bold text-xl">Printed at {formattedDateTime}</p>
          </div>
        </div>
        <div className="flex flex-row justify-center items-center mt-8">
          <p className="font-bold text-2xl">{reportName}</p>
        </div>

        <table className="w-full">
          <thead>
            <tr>
             
            </tr>
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
      </div>
    );
  }
}
