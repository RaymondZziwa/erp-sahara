function AgingRecievables() {
  return (
    <div className="bg-white p-3 ">
      <p className="font-bold text-xl mb-3">Aging Recievables Report</p>
      <div>
        <table className="bg-white p-3 w-full table-fixed">
          <tbody>
            {/* Header Row spanning across both columns */}
            <tr className="">
              <td className="text-center font-bold py-4 px-4 " colSpan={6}>
                <p className="text-center font-bold">Accounts Aging</p>
                <p className="text-center font-bold">FY Ended 31 Dec 2023</p>
                <p className="text-center text-sm">All Figures in UGX</p>
              </td>
            </tr>

            {/* Data Rows */}
            <tr className="bg-gray-200">
              <td className=" px-2 ">Client</td>
              <td className="text-center p-3 font-bold">0-30 Days</td>
              <td className="text-center p-3 font-bold">31-60 Days</td>
              <td className="text-center p-3 font-bold">61-90 Days</td>
              <td className="text-center p-3 font-bold">90+ Days</td>
              <td className="text-center p-3 font-bold">Total</td>
            </tr>
            <tr className="border-gray-500 border-b ">
              <td className=" px-2 ">Track</td>
              <td className="text-center p-3">00</td>
              <td className="text-center p-3">31</td>
              <td className="text-center p-3">90</td>
              <td className="text-center p-3">90</td>
              <td className="text-center p-3">1200</td>
            </tr>
            <tr className="border-gray-500 border-b ">
              <td className=" px-2 ">Track</td>
              <td className="text-center p-3">00</td>
              <td className="text-center p-3">31</td>
              <td className="text-center p-3">90</td>
              <td className="text-center p-3">90</td>
              <td className="text-center p-3">1200</td>
            </tr>
            <tr className="border-gray-500 border-b ">
              <td className=" px-2 ">Track</td>
              <td className="text-center p-3">00</td>
              <td className="text-center p-3">31</td>
              <td className="text-center p-3">90</td>
              <td className="text-center p-3">90</td>
              <td className="text-center p-3">1200</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AgingRecievables;
