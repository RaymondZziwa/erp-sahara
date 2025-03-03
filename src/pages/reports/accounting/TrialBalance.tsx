import { useRef } from "react";
import { ColDef } from "ag-grid-community";
import Table from "./../ReportTable"; // Adjust path if needed
import { Icon } from "@iconify/react";
import useTrialBalances from "../../../hooks/reports/useTrialBalances";
import { TrialBalance } from "../../../redux/slices/types/reports/TrialBalance";

function TrialBalanceReport() {
  const { data = [] } = useTrialBalances();

  const trialBalanceData: TrialBalance[] = Array.isArray(data) ? data : [];

  const tableRef = useRef<any>(null);

  const columnDefs: ColDef<TrialBalance>[] = [
    {
      headerName: "Account Name",
      field: "account_name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Account Code",
      field: "account_code",
      sortable: true,
      filter: true,
    },
    { headerName: "Debit", field: "debit", sortable: true, filter: true },
    {
      headerName: "Credit",
      field: "credit",
      sortable: true,
      filter: true,
    },
  ];

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  console.log("tbal", trialBalanceData);

  return (
    <div className="bg-white p-3">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Trial Balance</h1>
        <button
          className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
          onClick={handleExportPDF}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print
        </button>
      </div>

      {/* Pass customHeader inside the Table component */}
      {trialBalanceData.length < 1 ? (
        "No data present"
      ) : (
        <Table
          columnDefs={columnDefs}
          data={trialBalanceData}
          ref={tableRef}
          customHeader={
            <tr className="bg-gray-200">
              <td className="text-center font-bold py-4 px-4" colSpan={5}>
                <p className="text-center font-bold">Trial Balance</p>
                <p className="text-center text-sm">All Figures in UGX</p>
              </td>
            </tr>
          }
        />
      )}
    </div>
  );
}

export default TrialBalanceReport;
