import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import useAuth from "../../../hooks/useAuth";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import { apiRequest } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import Table from "../BalanceSheetComparisonTable";

interface ComparisonBalanceSheet {
  balance_sheet: Balancesheet;
  totals: Totals;
  subcategory_totals: SubcategoryTotals;
  current_fiscal_year: CurrentFiscalYear;
  previous_fiscal_year: null;
  data: {};
  assets: [];
  equity: [];
  liabilities: [];
}

interface CurrentFiscalYear {
  id: number;
  financial_year: string;
  start_date: string;
  end_date: string;
  organisation_id: number;
  status: number;
  remaining_days: number;
  should_alert: boolean;
}

interface SubcategoryTotals {
  assets: { [key: string]: SubcategoryDetail };
  liabilities: { [key: string]: SubcategoryDetail };
  equity: SubcategoryDetail[];
}

interface SubcategoryDetail {
  subcategory_name: string;
  current_total: number;
  previous_total: number;
}

interface Totals {
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
}

interface Balancesheet {
  assets: Asset[];
  liabilities: Asset[];
  equity: Equity[];
}

interface Asset {
  account_id: number;
  account_name: string;
  account_code: string;
  current_balance: string;
  previous_balance: number;
}

interface Equity {
  account_id: number;
  account_name: string;
  account_code: string;
  current_balance: string;
  previous_balance: number;
}

const ComparisonBalanceSheet: React.FC = () => {
  const [incomeStatement, setIncomeStatement] =
    useState<ComparisonBalanceSheet | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;
    setIsLoading(true);
    try {
      const response = await apiRequest<ServerResponse<ComparisonBalanceSheet>>(
        REPORTS_ENDPOINTS.COMPARISON_BALANCE_SHEET.GET_ALL,
        "GET",
        token.access_token
      );
      console.log("resp", response.data);

      setIncomeStatement(response.data.data as ComparisonBalanceSheet);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  console.log("is", incomeStatement);
  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  const tableRef = useRef<any>(null);

  const { assets, equity, liabilities } = incomeStatement || {
    assets: [],
    equity: [],
    liabilities: [],
  };
  interface ColumnDef {
    headerName: string;
    field: string;
    valueFormatter?: (params: { value: any }) => any;
  }

  const columnDefs: ColumnDef[] = [
    { headerName: "Account ID", field: "account_id" },
    { headerName: "Account Code", field: "code" },
    { headerName: "Account Name", field: "account_name" },
    { headerName: "Balance", field: "balance" },
    { headerName: "Previous Balance", field: "previous_amount" },
    {
      headerName: "Difference",
      field: "difference",
      valueFormatter: (params) =>
        params.value !== undefined ? params.value : 0,
    },
  ];

  const tableData = [...assets, ...equity, ...liabilities].flatMap(
    (category: {
      subcategory_name: string;
      total: number;
      previous_total: number;
      difference: number;
      accounts: any[];
    }) => [
      {
        subcategory_name: category.subcategory_name,
        isGroup: true,
      },
      ...category.accounts.map((account) => ({
        account_id: account.account_id,
        account_name: account.account_name,
        account_code: account.code,
        balance: account.balance,
        previous_amount: account.previous_amount ?? 0,
        difference: account.difference ?? 0,
        subcategory_name: category.subcategory_name,
        isGroup: false,
      })),
      {
        subcategory_name: `${category.subcategory_name} - Total`,
        total: category.total,
        previous_amount: category.previous_total ?? 0,
        difference: category.difference ?? 0,
        isTotalRow: true,
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
        <p className="font-bold text-xl">Balance Comparison Sheet Report</p>
        <button
          className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
          onClick={handleExportPDF}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print
        </button>
      </div>

      {/* Custom Table Component */}

      {isLoading ? (
        "Loading ..."
      ) : (
        <Table
          columnDefs={columnDefs}
          data={tableData}
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
      {incomeStatement === null && !isLoading ? "No data Present" : ""}
    </div>
  );
};

export default ComparisonBalanceSheet;
