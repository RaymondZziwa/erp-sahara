//@ts-nocheck
import React from "react";
import Logo from "../../../assets/images/logos/ltcu.jpeg";

export class PrintableContent extends React.Component {
  render() {
    //@ts-expect-error --ignore
    const { reportName, data } = this.props;
    const { assets, equity, liabilities } = data;
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
          <tbody>
            {/* Assets Section */}
            <tr className="font-bold bg-gray-300">
              <td className="p-3" colSpan={2}>
                ASSETS
              </td>
            </tr>
            {assets?.map((item) => (
              <React.Fragment key={item.subcategory_name}>
                <tr
                  className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                >
                  <td className="p-3">{item.subcategory_name}</td>
                  <td className="p-3 text-right">
                    {item.subcategory_total.toLocaleString()}
                  </td>
                </tr>
              </React.Fragment>
            ))}
            <tr className="font-bold bg-gray-200">
              <td className="p-3">TOTAL ASSETS</td>
              <td className="p-3 text-right border-t-2 border-black">
                {assets
                  ?.reduce((acc, item) => acc + item.subcategory_total, 0)
                  .toLocaleString()}
              </td>
            </tr>

            {/* Equity Section */}
            <tr className="font-bold bg-gray-300">
              <td className="p-3" colSpan={2}>
                EQUITY
              </td>
            </tr>
            {equity?.map((item) => (
              <React.Fragment key={item.subcategory_name}>
                <tr
                  className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                >
                  <td className="p-3">{item.subcategory_name}</td>
                  <td className="p-3 text-right">
                    {item.subcategory_total.toLocaleString()}
                  </td>
                </tr>
              </React.Fragment>
            ))}
            <tr className="font-bold bg-gray-200">
              <td className="p-3">TOTAL EQUITY</td>
              <td className="p-3 text-right border-t-2 border-black">
                {equity
                  ?.reduce((acc, item) => acc + item.subcategory_total, 0)
                  .toLocaleString()}
              </td>
            </tr>

            {/* Liabilities Section */}
            <tr className="font-bold bg-gray-300">
              <td className="p-3" colSpan={2}>
                LIABILITIES
              </td>
            </tr>
            {liabilities?.map((item) => (
              <React.Fragment key={item.subcategory_name}>
                <tr
                  className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                >
                  <td className="p-3">{item.subcategory_name}</td>
                  <td className="p-3 text-right">
                    {item.subcategory_total.toLocaleString()}
                  </td>
                </tr>
              </React.Fragment>
            ))}
            <tr className="font-bold bg-gray-200">
              <td className="p-3">TOTAL LIABILITIES</td>
              <td className="p-3 text-right border-t-2 border-black">
                {liabilities
                  ?.reduce((acc, item) => acc + item.subcategory_total, 0)
                  .toLocaleString()}
              </td>
            </tr>

            {/* Profit/Loss Section */}
            <tr className="font-bold bg-gray-200">
              <td className="p-3">PROFIT/LOSS</td>
              <td className="p-3 text-right">
                {data.current_profit_or_loss
                  ? data?.current_profit_or_loss.toLocaleString()
                  : 0}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}
