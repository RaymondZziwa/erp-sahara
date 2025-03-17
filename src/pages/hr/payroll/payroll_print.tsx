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

       </div>
    );
  }
}
