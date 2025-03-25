//@ts-nocheck
import React from "react";
import Logo from "../../../assets/images/logos/ltcu.jpeg";

export class PrintableContent extends React.Component {
  render() {
    //@ts-expect-error --ignore
    const { reportName, incomeStatementData } = this.props;
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

        {incomeStatementData && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    colSpan={2}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {incomeStatementData[0].group_name}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Map through categories */}
                {incomeStatementData[0].categories.map((category, index) => (
                  <React.Fragment key={index}>
                    {/* Parent Category */}
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <strong>{category.category_name}</strong>
                      </td>
                    </tr>

                    {/* Map through children */}
                    {category.children.map((child, childIndex) => (
                      <React.Fragment key={childIndex}>
                        {/* Child Category */}

                        {/* Map through nested children (category.children.children) */}
                        {child.children &&
                          child.children.map(
                            (nestedChild, nestedChildIndex) => (
                              <React.Fragment key={nestedChildIndex}>
                                {/* Nested Child Category */}
                                <tr
                                  className={`${
                                    nestedChild.ledgers &&
                                    nestedChild.ledgers.length > 0
                                      ? "cursor-pointer hover:bg-gray-50 font-semibold"
                                      : "cursor-default font-semibold"
                                  }`}
                                >
                                  <td className="px-4 py-2 text-gray-700">
                                    {nestedChild.child_name}
                                  </td>
                                  <td className="px-4 py-2 text-gray-500">
                                    {nestedChild.current_total}
                                  </td>
                                </tr>
                              </React.Fragment>
                            )
                          )}
                        <tr
                          className={`${
                            child.ledgers && child.ledgers.length > 0
                              ? "cursor-pointer hover:bg-gray-50"
                              : "cursor-default"
                          }`}
                        >
                          <td className="px-10 py-4 text-gray-700">
                            Total {child.category_name}
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {child.current_total}
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                ))}

                {/* Gross Profit */}
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    Gross Profit/Loss
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-bold border-t-2 border-black">
                    {
                      "XXXXX"}
                  </td>
                </tr>
              </tbody>
            </table>
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    colSpan={2}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {incomeStatementData[1].group_name}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Map through categories */}
                {incomeStatementData[1].categories.map((category, index) => (
                  <React.Fragment key={index}>
                    {/* Parent Category */}
                    <tr>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <strong>{category.category_name}</strong>
                      </td>
                    </tr>

                    {/* Map through children */}
                    {category.children.map((child, childIndex) => (
                      <React.Fragment key={childIndex}>
                        {/* Child Category */}

                        {/* Map through nested children (category.children.children) */}
                        {child.children &&
                          child.children.map(
                            (nestedChild, nestedChildIndex) => (
                              <React.Fragment key={nestedChildIndex}>
                                {/* Nested Child Category */}
                                <tr
                                  className={`${
                                    nestedChild.ledgers &&
                                    nestedChild.ledgers.length > 0
                                      ? "cursor-pointer hover:bg-gray-50"
                                      : "cursor-default"
                                  }`}
                                >
                                  <td className="px-14 py-4 text-gray-700">
                                    {nestedChild.child_name}
                                  </td>
                                  <td className="px-6 py-4 text-gray-500">
                                    {nestedChild.current_total}
                                  </td>
                                </tr>
                              </React.Fragment>
                            )
                          )}
                        <tr
                          className={`${
                            child.ledgers && child.ledgers.length > 0
                              ? "cursor-pointer hover:bg-gray-50"
                              : "cursor-default"
                          }`}
                        >
                          <td className="px-10 py-4 text-gray-700">
                            Total {child.category_name}
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {child.current_total}
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                ))}

                {/* Gross Profit */}
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    NET Profit/Loss
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-bold border-t-2 border-black">
                    {
                      "XXXXX"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
}
