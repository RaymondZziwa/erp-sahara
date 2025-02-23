import { useRef } from "react";
import Table from "../IncomeStatementTable"; // Adjust path if needed
import { Icon } from "@iconify/react";
import useIncomeStatement from "../../../hooks/reports/useIncomeStatement";

function IncomeStatementReport() {
  const tableRef = useRef<any>(null);
  const { data = [] } = useIncomeStatement();

  // Column definitions
  const columnDefs = [
    { headerName: "Ledger ID", field: "ledger_id" },
    { headerName: "Ledger Code", field: "ledger_code" },
    { headerName: "Ledger Name", field: "ledger_name" },
    { headerName: "Amount", field: "amount" },
  ];

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  return (
    <div className="bg-white p-3">
      <div className="flex justify-between items-center mb-4">
        <p className="font-bold text-xl">Income Statement Report</p>
        <button
          className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
          onClick={handleExportPDF}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print
        </button>
      </div>

      {/* Custom Table Component */}
      <Table
        columnDefs={columnDefs}
        data={data.flatMap((category) => [
          { sub_category_name: category.sub_category_name, isGroup: true }, // Group row
          ...category.ledgers.map((ledger) => ({
            ...ledger,
            sub_category_name: category.sub_category_name,
            isGroup: false,
          })),
          { total: category.total, isTotalRow: true }, // Subcategory total row
        ])}
        ref={tableRef}
        customHeader={
          <tr className="bg-gray-200">
            <td className="text-center font-bold py-4 px-4" colSpan={4}>
              <p className="text-center font-bold">Sample Company</p>
              <p className="text-center text-sm">31 Dec 2023</p>
            </td>
          </tr>
        }
      />
    </div>
  );
}

export default IncomeStatementReport;
