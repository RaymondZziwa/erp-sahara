import { useRef } from "react";
import Table from "../IncomeStatementTable";
import { Icon } from "@iconify/react";

const GeneralLedgerReport = () => {
  const tableRef = useRef<any>(null);

  // Define table columns
  const columnDefs = [
    { headerName: "NO.", field: "id" },
    { headerName: "DATE", field: "date" },
    { headerName: "DESCRIPTION", field: "description" },
    { headerName: "INCOME", field: "income" },
    { headerName: "EXPENSE", field: "expense" },
  ];

  // Define table data
  const data = [
    {
      id: 1,
      date: "14/02/2024",
      description: "Your record from sales transactions",
      income: "5,000",
      expense: "6,000",
    },
    {
      id: 2,
      date: "14/02/2024",
      description: "Your record from sales transactions",
      income: "5,000",
      expense: "6,000",
    },
    {
      id: 3,
      date: "14/02/2024",
      description: "Your record from sales transactions",
      income: "5,000",
      expense: "6,000",
    },
    { isTotalRow: true, total: "5,000", sub_category_name: "Totals" },
    { isTotalRow: true, total: "5,000", sub_category_name: "Balances" },
  ];
  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };
  return (
    <div className="bg-white p-3">
      <div className="flex justify-between items-center mb-4">
        <p className="font-bold text-xl">General Ledger Report</p>
        <button
          className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
          onClick={handleExportPDF}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print
        </button>
      </div>

      <Table ref={tableRef} columnDefs={columnDefs} data={data} />
    </div>
  );
};

export default GeneralLedgerReport;
