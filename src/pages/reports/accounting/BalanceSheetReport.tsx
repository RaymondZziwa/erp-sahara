import { useRef } from "react";
import Table from "../BalanceSheetTable"; // Adjust path if needed
import { Icon } from "@iconify/react";
import useBalanceSheet from "../../../hooks/reports/useBalanceSheet";

function BalanceSheetReport() {
  const { data } = useBalanceSheet();

  const tableRef = useRef<any>(null);

  const { assets, equity, liabilities } = data;

  // Column definitions
  const columnDefs = [
    { headerName: "Account ID", field: "account_id" },
    { headerName: "Account Code", field: "account_code" },
    { headerName: "Account Name", field: "account_name" },
    { headerName: "Balance", field: "balance" },
  ];

  // Combine assets and liabilities into a flat table structure
  const tableData = [...assets, ...equity, ...liabilities].flatMap(
    (category) => [
      {
        subcategory_name: category.subcategory_name,
        isGroup: true, // Ensure it's recognized as a group row
      },
      ...category.accounts.map((account: {}) => ({
        ...account,
        subcategory_name: category.subcategory_name, // Ensure name is carried down
        isGroup: false,
      })),
      {
        total: category.subcategory_total,
        isTotalRow: true, // Ensure the total row is recognized
      },
    ]
  );

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

      {/* Custom Table Component */}
      {tableData.length < 1 ? (
        "No data present"
      ) : (
        <Table
          columnDefs={columnDefs}
          data={tableData}
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
      )}
    </div>
  );
}

export default BalanceSheetReport;
