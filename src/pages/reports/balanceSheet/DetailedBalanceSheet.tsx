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
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import { apiRequest } from "../../../utils/api";

interface DetailedBalanceSheetData {
  balance_sheet: Balancesheet;
  totals: Totals;
  subcategory_totals: SubcategoryTotals;
  current_fiscal_year: CurrentFiscalYear;
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
  equity: any[]; // Update type as necessary
}

interface SubcategoryDetail {
  subcategory_name: string;
  current_total: number;
}

interface Totals {
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
}

interface Balancesheet {
  assets: Asset[];
  liabilities: Asset[];
  equity: any[]; // Update type as necessary
}

interface Asset {
  account_id: number;
  account_name: string;
  account_code: string;
  current_balance: string;
}

const DetailedBalanceSheet: React.FC = () => {
  const [balanceSheet, setBalanceSheet] =
    useState<DetailedBalanceSheetData | null>(null);
  const [globalFilter, setGlobalFilter] = useState<string | null>(null);
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
        ServerResponse<DetailedBalanceSheetData>
      >(
        REPORTS_ENDPOINTS.DETAILED_BALANCE_SHEET.GET_ALL, // Ensure this endpoint is correct
        "GET",
        token.access_token
      );
      setBalanceSheet(response.data);
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
      <h1 className="text-xl font-semibold">Detailed Balance Sheet</h1>
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
      {/* Current Fiscal Year Details */}
      <h2 className="text-lg font-semibold mt-4">Current Fiscal Year</h2>
      <div className="grid md:grid-cols-4">
        <strong>Financial Year:</strong>{" "}
        {balanceSheet?.current_fiscal_year.financial_year}
        <br />
        <strong>Start Date:</strong>{" "}
        {balanceSheet?.current_fiscal_year.start_date}
        <br />
        <strong>End Date:</strong> {balanceSheet?.current_fiscal_year.end_date}
        <br />
        <strong>Remaining Days:</strong>{" "}
        {balanceSheet?.current_fiscal_year.remaining_days.toFixed(0)} days
        <br />
      </div>
      <div ref={printDivRef}>
        {/* Assets Section */}
        <h2 className="text-lg font-semibold mt-4">Assets</h2>
        <DataTable
          loading={isLoading}
          value={balanceSheet?.balance_sheet.assets || []}
          globalFilter={globalFilter}
          scrollable
          footer={
            <div className="flex bg-teal-200 p-2">
              <strong className="w-1/2">Total Assets </strong>
              <div>
                {formatCurrency(balanceSheet?.totals.total_assets ?? 0)}
              </div>
            </div>
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
            field="current_balance"
            header="Current Balance"
            body={(rowData) => parseFloat(rowData.current_balance)}
          />
        </DataTable>

        {/* Liabilities Section */}
        <h2 className="text-lg font-semibold mt-4">Liabilities</h2>
        <DataTable
          loading={isLoading}
          value={balanceSheet?.balance_sheet.liabilities || []}
          globalFilter={globalFilter}
          scrollable
          footer={
            <div className="flex bg-teal-200 p-2">
              <strong className="w-1/2">Total Liabilities </strong>
              <div>
                {formatCurrency(balanceSheet?.totals.total_liabilities ?? 0)}
              </div>
            </div>
          }
        >
          <Column
            field="account_name"
            header="Account Name"
            className="w-1/2"
          />
          {/* <Column field="account_code" header="Account Code" /> */}
          <Column
            field="current_balance"
            header="Current Balance"
            body={(rowData) => parseFloat(rowData.current_balance)}
          />
        </DataTable>

        {/* Equity Section */}
        <h2 className="text-lg font-semibold mt-4">Equity</h2>
        <DataTable
          loading={isLoading}
          value={balanceSheet?.balance_sheet.equity || []}
          globalFilter={globalFilter}
          scrollable
          footer={
            <div className="flex bg-teal-200 p-2">
              <strong className="w-1/2">Total Equity </strong>
              <div>
                {formatCurrency(balanceSheet?.totals.total_equity ?? 0)}
              </div>
            </div>
          }
        >
          <Column
            field="account_name"
            header="Account Name"
            className="w-1/2"
          />
          {/* <Column field="account_code" header="Account Code" /> */}
          <Column
            field="current_balance"
            header="Current Balance"
            body={(rowData) =>
              formatCurrency(parseFloat(rowData.current_balance))
            }
          />
        </DataTable>

        {/* Subcategory Totals */}
        <h2 className="text-lg font-semibold mt-4">Subcategory Totals</h2>
        <div className="flex flex-col items-end">
          <h3>Assets</h3>
          {Object.entries(balanceSheet?.subcategory_totals.assets || {}).map(
            ([key, subcategory]) => (
              <div key={key}>
                <strong>{subcategory.subcategory_name}: </strong>
                {formatCurrency(subcategory.current_total)}
              </div>
            )
          )}
          <h3>Liabilities</h3>
          {Object.entries(
            balanceSheet?.subcategory_totals.liabilities || {}
          ).map(([key, subcategory]) => (
            <div key={key}>
              <strong>{subcategory.subcategory_name}: </strong>
              {formatCurrency(subcategory.current_total)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetailedBalanceSheet;
