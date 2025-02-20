import { useRef } from "react";
import Table from "../BalanceSheetTable";
import { Icon } from "@iconify/react";

function Cashflow() {
  const tableRef = useRef<any>(null);

  const data = {
    operating_activities: {
      Operating: [
        {
          account_id: 1,
          account_name: "Cash at Hand",
          account_code: "10003",
          net_cash_flow: 814,
        },
        {
          account_id: 47,
          account_name: "Beer Ltd",
          account_code: "9551",
          net_cash_flow: -521,
        },
        {
          account_id: 2,
          account_name: "Cash at Bank",
          account_code: "10004",
          net_cash_flow: 412,
        },
        {
          account_id: 22,
          account_name: "Hirthe-Batz",
          account_code: "9956",
          net_cash_flow: 26,
        },
      ],
    },
    investing_activities: [],
    financing_activities: [],
  };

  const columnDefs = [
    { headerName: "Account ID", field: "account_id" },
    { headerName: "Account Code", field: "account_code" },
    { headerName: "Account Name", field: "account_name" },
    { headerName: "Net Cash Flow", field: "net_cash_flow" },
  ];

  const transformedData = [
    { isGroup: true, subcategory_name: "Operating Activities" },
    ...data.operating_activities.Operating,
    { isGroup: true, subcategory_name: "Financial Activities" },
    ...data.operating_activities.Operating, // Replace with actual financing data
  ];
  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  return (
    <div className="bg-white p-3">
      <div className="flex justify-between items-center mb-4">
        <p className="font-bold text-xl">Balance Sheet Report</p>
        <button
          className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
          onClick={handleExportPDF}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print
        </button>
      </div>
      <Table ref={tableRef} columnDefs={columnDefs} data={transformedData} />
    </div>
  );
}

export default Cashflow;
