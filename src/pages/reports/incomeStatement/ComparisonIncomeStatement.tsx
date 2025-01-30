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

interface ComparisonIncomeStatementData {
  income_statement: Incomestatement;
  start_date: string;
  end_date: string;
}

interface Incomestatement {
  revenue_accounts: Revenueaccount[];
  total_revenue: number;
  cost_of_sales: Costofsale[];
  total_cost_of_sales: number;
  other_income: Costofsale[];
  total_other_income: number;
  operating_expenses: number;
}

interface Costofsale {
  account_name: string;
  account_code: string;
  debit_sum: number;
}

interface Revenueaccount {
  account_name: string;
  account_code: string;
  credit_sum: number | string;
}

const ComparisonIncomeStatement: React.FC = () => {
  const [globalFilter, setGlobalFilter] = useState<string | null>(null);
  const [incomeStatement, setIncomeStatement] =
    useState<ComparisonIncomeStatementData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const printDivRef = useRef<HTMLDivElement>(null);
  const { token, isFetchingLocalToken } = useAuth();

  const reactToPrintFn = useReactToPrint({
    contentRef: printDivRef,
  });

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

  const header = (
    <div className="table-header print:hidden flex justify-between items-center">
      <h1 className="text-xl font-semibold">Comparison Income Statement</h1>
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
        {/* Revenue Accounts Section */}
        <h2 className="text-lg font-semibold mt-4">Revenue Accounts</h2>
        <DataTable
          loading={isLoading}
          value={incomeStatement?.income_statement.revenue_accounts || []}
          globalFilter={globalFilter}
          scrollable
          footer={
            <strong>
              Total Revenue:{" "}
              {formatCurrency(
                incomeStatement?.income_statement.total_revenue ?? 0
              )}
            </strong>
          }
          header={header}
        >
          <Column
            field="account_name"
            header="Account Name"
            className="w-1/2"
          />
          {/* <Column field="account_code" header="Account Code" /> */}
          <Column
            field="credit_sum"
            header="Credit Sum"
            body={(rowData) => formatCurrency(rowData.credit_sum)}
          />
        </DataTable>

        {/* Cost of Sales Section */}
        <h2 className="text-lg font-semibold mt-4">Cost of Sales</h2>
        <DataTable
          loading={isLoading}
          value={incomeStatement?.income_statement.cost_of_sales || []}
          scrollable
          footer={
            <strong>
              Total Cost of Sales:{" "}
              {formatCurrency(
                incomeStatement?.income_statement.total_cost_of_sales ?? 0
              )}
            </strong>
          }
        >
          <Column
            field="account_name"
            header="Account Name"
            className="w-1/2"
          />
          {/* <Column field="account_code" header="Account Code" /> */}
          <Column
            field="debit_sum"
            header="Debit Sum"
            body={(rowData) => formatCurrency(rowData.debit_sum)}
          />
        </DataTable>

        {/* Other Income Section */}
        <h2 className="text-lg font-semibold mt-4">Other Income</h2>
        <DataTable
          loading={isLoading}
          value={incomeStatement?.income_statement.other_income || []}
          scrollable
          footer={
            <strong>
              Total Other Income:{" "}
              {formatCurrency(
                incomeStatement?.income_statement.total_other_income ?? 0
              )}
            </strong>
          }
        >
          <Column
            field="account_name"
            header="Account Name"
            className="w-1/2"
          />
          {/* <Column field="account_code" header="Account Code" /> */}
          <Column
            field="debit_sum"
            header="Debit Sum"
            body={(rowData) => formatCurrency(rowData.debit_sum)}
          />
        </DataTable>

        {/* Operating Expenses and Total */}
        <div className="flex justify-end mt-4">
          <div className="grid grid-cols-1 gap-2">
            <strong>
              Operating Expenses:{" "}
              {formatCurrency(
                incomeStatement?.income_statement.operating_expenses ?? 0
              )}
            </strong>
            <strong>
              Net Income:{" "}
              {formatCurrency(
                (incomeStatement?.income_statement.total_revenue ?? 0) -
                  (incomeStatement?.income_statement.total_cost_of_sales ?? 0) -
                  (incomeStatement?.income_statement.operating_expenses ?? 0)
              )}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonIncomeStatement;
