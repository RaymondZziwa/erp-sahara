import React, { useState, useRef, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { formatCurrency } from "../../../utils/formatCurrency";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { useReactToPrint } from "react-to-print";

import useAuth from "../../../hooks/useAuth";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import { apiRequest } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";

interface ComparisonBalanceSheet {
  balance_sheet: Balancesheet;
  totals: Totals;
  subcategory_totals: SubcategoryTotals;
  current_fiscal_year: CurrentFiscalYear;
  previous_fiscal_year: null; // If there are no fields, you can define this as null or create an interface if needed.
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
  current_balance: string; // If this is a string, otherwise, change to number.
  previous_balance: number; // Assuming equity also has previous balance.
}

const ComparisonBalanceSheet: React.FC = () => {
  const [globalFilter, setGlobalFilter] = useState<string | null>(null);
  const [incomeStatement, setIncomeStatement] =
    useState<ComparisonBalanceSheet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const printDivRef = useRef<HTMLDivElement>(null);
  const { token, isFetchingLocalToken } = useAuth();

  const reactToPrintFn = useReactToPrint({ contentRef: printDivRef });

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;
    setIsLoading(true);
    try {
      const response = await apiRequest<ServerResponse<ComparisonBalanceSheet>>(
        REPORTS_ENDPOINTS.COMPARISON_BALANCE_SHEET.GET_ALL,
        "GET",
        token.access_token
      );
      setIncomeStatement(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  // Helper functions to calculate totals
  const calculateTotal = (data: Array<Asset | Equity>, field: keyof Asset) => {
    return data.reduce(
      (sum, item) => sum + parseFloat(String(item[field]) || "0"),
      0
    );
  };

  const header = (
    <div className="table-header print:hidden flex justify-between items-center">
      <h1 className="text-xl font-semibold">Comparison Balance Sheet</h1>
      <IconField iconPosition="left">
        <InputIcon className="pi pi-search"></InputIcon>
        <InputText
          placeholder="Search"
          onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
            setGlobalFilter(e.target.value)
          }
        />
      </IconField>
      <Button
        label="Print"
        icon="pi pi-print"
        className="p-button-primary"
        onClick={() => reactToPrintFn()}
      />
    </div>
  );

  return (
    <div>
      <div className="print:p-2" ref={printDivRef}>
        {/* Assets Section */}
        <h2 className="text-lg font-semibold mt-4">Assets</h2>
        <DataTable
          loading={isLoading}
          value={incomeStatement?.balance_sheet.assets || []}
          globalFilter={globalFilter}
          scrollable
          footer={
            <div className="flex bg-teal-200 p-2">
              <strong className="w-1/3">Total Assets </strong>
              <div className="w-1/3">
                {formatCurrency(
                  calculateTotal(
                    incomeStatement?.balance_sheet.assets || [],
                    "current_balance"
                  )
                )}
              </div>
              <div>
                {formatCurrency(
                  calculateTotal(
                    incomeStatement?.balance_sheet.assets || [],
                    "previous_balance"
                  )
                )}
              </div>
            </div>
          }
          header={header}
        >
          <Column
            className="w-1/3"
            field="account_name"
            header="Account Name"
          />
          <Column
            className="w-1/3"
            field="current_balance"
            header="Current Balance"
            body={(rowData) => parseFloat(rowData.current_balance)}
          />
          <Column
            field="previous_balance"
            header="Previous Balance"
            body={(rowData: Asset) => rowData.previous_balance}
          />
        </DataTable>

        {/* Liabilities Section */}
        <h2 className="text-lg font-semibold mt-4">Liabilities</h2>
        <DataTable
          loading={isLoading}
          value={incomeStatement?.balance_sheet.liabilities || []}
          scrollable
          footer={
            <div className="flex bg-teal-200 p-2">
              <strong className="w-1/3">Total Liabilities</strong>
              <div className="w-1/3">
                {formatCurrency(
                  calculateTotal(
                    incomeStatement?.balance_sheet.liabilities || [],
                    "current_balance"
                  )
                )}
              </div>
              <div>
                {formatCurrency(
                  calculateTotal(
                    incomeStatement?.balance_sheet.liabilities || [],
                    "previous_balance"
                  )
                )}
              </div>
            </div>
          }
        >
          <Column
            className="w-1/3"
            field="account_name"
            header="Account Name"
          />
          <Column
            field="current_balance"
            header="Current Balance"
            body={(rowData) => parseFloat(rowData.current_balance)}
          />
          <Column
            field="previous_balance"
            header="Previous Balance"
            body={(rowData: Equity) => rowData.previous_balance}
          />
        </DataTable>

        {/* Equity Section */}
        <h2 className="text-lg font-semibold mt-4">Equity</h2>
        <DataTable
          loading={isLoading}
          value={incomeStatement?.balance_sheet.equity || []}
          scrollable
          footer={
            <div className="flex bg-teal-200 p-2">
              <strong className="w-1/3">Total Equity</strong>
              <div className="w-1/3">
                {formatCurrency(
                  calculateTotal(
                    incomeStatement?.balance_sheet.equity || [],
                    "current_balance"
                  )
                )}
              </div>
              <div>
                {formatCurrency(
                  calculateTotal(
                    incomeStatement?.balance_sheet.equity || [],
                    "previous_balance"
                  )
                )}
              </div>
            </div>
          }
        >
          <Column
            className="w-1/3"
            field="account_name"
            header="Account Name"
          />
          <Column
            field="current_balance"
            header="Current Balance"
            body={(rowData) =>
              formatCurrency(parseFloat(rowData.current_balance))
            }
          />
          <Column
            field="previous_balance"
            header="Previous Balance"
            body={(rowData) => formatCurrency(rowData.previous_balance)}
          />
        </DataTable>

        {/* Additional Calculations and Totals */}
        <div className="flex justify-end mt-4">
          <div className="grid grid-cols-1 gap-2">
            <strong>
              Grand Total:{" "}
              {formatCurrency(
                (incomeStatement?.totals.total_assets ?? 0) +
                  (incomeStatement?.totals.total_liabilities ?? 0) +
                  (incomeStatement?.totals.total_equity ?? 0)
              )}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonBalanceSheet;
