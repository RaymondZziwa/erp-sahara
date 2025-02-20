import { useRef } from "react";
import Table from "../BalanceSheetTable"; // Adjust path if needed
import { Icon } from "@iconify/react";

function BalanceSheetReport() {
  const tableRef = useRef<any>(null);

  const assets = [
    {
      subcategory_name: "Goodwill",
      accounts: [
        {
          account_id: 21,
          account_name: "Gleason, Pollich and Quitzon",
          account_code: "3444",
          balance: 105,
        },
      ],
      subcategory_total: 105,
    },
    {
      subcategory_name: "Security Deposits",
      accounts: [
        {
          account_id: 19,
          account_name: "Howell, Sauer and Sawayn",
          account_code: "5682",
          balance: 636,
        },
      ],
      subcategory_total: 636,
    },
  ];

  const liabilities = [
    {
      subcategory_name: "Short-term Debt",
      accounts: [
        {
          account_id: 56,
          account_name: "Klein Group",
          account_code: "5899",
          balance: 3244,
        },
        {
          account_id: 18,
          account_name: "Koepp-Schneider",
          account_code: "3881",
          balance: 1612,
        },
      ],
      subcategory_total: 4856,
    },
    {
      subcategory_name: "Dividends Payable",
      accounts: [
        {
          account_id: 9,
          account_name: "Olson Group",
          account_code: "8882",
          balance: 5160,
        },
        {
          account_id: 27,
          account_name: "Towne-Yost",
          account_code: "1441",
          balance: 482,
        },
        {
          account_id: 48,
          account_name: "Schaefer, Wehner and Reynolds",
          account_code: "7016",
          balance: 2449,
        },
      ],
      subcategory_total: 8091,
    },
  ];

  // Column definitions
  const columnDefs = [
    { headerName: "Account ID", field: "account_id" },
    { headerName: "Account Code", field: "account_code" },
    { headerName: "Account Name", field: "account_name" },
    { headerName: "Balance", field: "balance" },
  ];

  // Combine assets and liabilities into a flat table structure
  const tableData = [...assets, ...liabilities].flatMap((category) => [
    {
      subcategory_name: category.subcategory_name,
      isGroup: true, // Ensure it's recognized as a group row
    },
    ...category.accounts.map((account) => ({
      ...account,
      subcategory_name: category.subcategory_name, // Ensure name is carried down
      isGroup: false,
    })),
    {
      total: category.subcategory_total,
      isTotalRow: true, // Ensure the total row is recognized
    },
  ]);

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
    </div>
  );
}

export default BalanceSheetReport;
