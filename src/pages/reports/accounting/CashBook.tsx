import { useState, useEffect, useRef } from "react";
import { ColDef } from "ag-grid-community";
import Table from "./../ReportTable"; // Adjust path if needed
import { Icon } from "@iconify/react";
import { apiRequest } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import useAuth from "../../../hooks/useAuth";

type Transaction = {
  date: string;
  description: string;
  cash_received: number;
  cash_paid: number;
  balance: number;
};

const CashBook = () => {
  const [cashBookData, setCashBookData] = useState<Transaction[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token, isFetchingLocalToken } = useAuth();

  const tableRef = useRef<any>(null);

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;
    setIsLoading(true);
    try {
      const response = await apiRequest<ServerResponse<Transaction[]>>(
        REPORTS_ENDPOINTS.DETAILED_CASH_BOOK.GET_ALL,
        "GET",
        token.access_token
      );
      setCashBookData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  const columnDefs: ColDef<Transaction>[] = [
    { headerName: "Date", field: "date", sortable: true, filter: true },
    {
      headerName: "Cash Received",
      field: "cash_received",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Cash Paid",
      field: "cash_paid",
      sortable: true,
      filter: true,
    },
    { headerName: "Balance", field: "balance", sortable: true, filter: true },
    {
      headerName: "Description",
      field: "description",
      sortable: true,
      filter: true,
    },
  ];

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  return (
    <div className="bg-white p-3">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Cash Book</h1>
        <button
          className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
          onClick={handleExportPDF}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print
        </button>
      </div>

      {/* Pass customHeader inside the Table component */}
      {isLoading ? (
        "Loading..."
      ) : (
        <Table
          columnDefs={columnDefs}
          data={cashBookData || []}
          ref={tableRef}
          customHeader={
            <tr className="bg-gray-200">
              <td className="text-center font-bold py-4 px-4" colSpan={5}>
                <p className="text-center font-bold">Cash Book</p>
                <p className="text-center font-bold">FY Ended 31 Dec 2023</p>
                <p className="text-center text-sm">All Figures in UGX</p>
              </td>
            </tr>
          }
        />
      )}
    </div>
  );
};

export default CashBook;
