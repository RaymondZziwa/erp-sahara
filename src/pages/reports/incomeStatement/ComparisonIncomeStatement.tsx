import React, { useState, useRef, useEffect } from "react";
import useAuth from "../../../hooks/useAuth";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import { apiRequest } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import Table from "../IncomeStatementTable";
import { Icon } from "@iconify/react";

interface ComparisonIncomeStatementData {
  income_statement: Incomestatement;
  start_date: string;
  end_date: string;
  data: [];
}

interface Ledger {
  ledger_id: number;
  ledger_name: string;
  ledger_code: string;
  amount: number;
  previous_amount: number;
  difference: number;
}

interface Incomestatement {
  sub_category_id: number;
  sub_category_name: string;
  total: number;
  ledgers: Ledger[];
}

const ComparisonIncomeStatement: React.FC = () => {
  const [incomeStatement, setIncomeStatement] = useState<Incomestatement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;
    setIsLoading(true);
    try {
      const response = await apiRequest<
        ServerResponse<ComparisonIncomeStatementData>
      >(
        REPORTS_ENDPOINTS.COMPARISON_INCOME_STATEMENT.GET_ALL,
        "GET",
        token.access_token
      );

      setIncomeStatement(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  console.log("income", incomeStatement);

  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  const tableRef = useRef<any>(null);

  const columnDefs = [
    { headerName: "Ledger ID", field: "ledger_id" },
    { headerName: "Ledger Code", field: "ledger_code" },
    { headerName: "Ledger Name", field: "ledger_name" },
    { headerName: "Amount", field: "amount" },
    { headerName: "Previous Amount", field: "previous_amount" },
    { headerName: "Difference", field: "difference" },
  ];

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  return (
    <div>
      <div className="bg-white p-3">
        <div className="flex justify-between items-center mb-4">
          <p className="font-bold text-2xl">
            Income Statement Comparison Report
          </p>
          <button
            className="bg-shade p-3 rounded text-white flex gap-2 items-center"
            onClick={handleExportPDF}
          >
            <Icon icon="solar:printer-bold" fontSize={20} />
            Print
          </button>
        </div>

        {/* Custom Table Component */}
        {isLoading ? (
          "Loading..."
        ) : (
          <Table
            columnDefs={columnDefs}
            data={incomeStatement?.flatMap((category) => [
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
                <td className="text-center font-bold py-4 px-4" colSpan={6}>
                  <p className="text-center font-bold">Sample Company</p>
                  <p className="text-center text-sm">31 Dec 2023</p>
                </td>
              </tr>
            }
          />
        )}
      </div>
    </div>
  );
};

export default ComparisonIncomeStatement;
