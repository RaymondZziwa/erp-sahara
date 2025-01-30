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

interface ComparisonTrialBalance {
  trial_balance_comparison: Trialbalancecomparison[];
  financial_year: Financialyear;
  previous_financial_year: null;
}

interface Financialyear {
  id: number;
  financial_year: string;
  start_date: string;
  end_date: string;
  organisation_id: number;
  status: number;
  remaining_days: number;
  should_alert: boolean;
}

interface Trialbalancecomparison {
  account_id: number;
  account_name: string;
  account_code: string;
  current_total_credit: string;
  current_total_debit: string;
  previous_total_credit: number;
  previous_total_debit: number;
}
const ComparisonTrialBalances: React.FC = () => {
  const [globalFilter, setGlobalFilter] = useState<string | null>(null);
  const [trialBalance, setTrialBalance] = useState<ComparisonTrialBalance>();
  const [isLoading, setIsLoading] = useState(false);
  const totalDebit = trialBalance?.trial_balance_comparison.reduce(
    (acc, item) => acc + parseFloat(item.current_total_debit),
    0
  );
  const totalCredit = trialBalance?.trial_balance_comparison.reduce(
    (acc, item) => acc + parseFloat(item.current_total_credit),
    0
  );

  const printDivRef = useRef<HTMLDivElement>(null);

  // useReactToPrint setup
  const reactToPrintFn = useReactToPrint({
    contentRef: printDivRef,
  });

  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiRequest<ServerResponse<ComparisonTrialBalance>>(
        REPORTS_ENDPOINTS.COMPARISON_TRIAL_BALANCES.GET_ALL,
        "GET",
        token.access_token
      );
      setIsLoading(false);
      setTrialBalance(response.data); // Dispatch action with fetched data on success
    } catch (error) {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  // Header with search functionality
  const header = (
    <div className="table-header print:hidden flex justify-between items-center">
      <div>
        <div>
          <h1 className="text-xl font-semibold">
            Comparison Trial Balance for Financial Year{" "}
            {trialBalance?.financial_year.financial_year}
          </h1>
        </div>
        <div>
          <IconField iconPosition="left">
            <InputIcon className="pi pi-search"></InputIcon>
            <InputText
              placeholder="Search"
              onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
                setGlobalFilter(e.target.value)
              }
            />
          </IconField>
        </div>
      </div>{" "}
      <Button
        label="Print"
        icon="pi pi-print"
        className="p-button-primary"
        onClick={() => reactToPrintFn()} // Trigger printing on click
      />
    </div>
  );

  return (
    <div>
      {/* Trial Balance section to print, wrapped in ref */}
      <div ref={printDivRef}>
        <DataTable
          loading={isLoading}
          value={trialBalance?.trial_balance_comparison}
          globalFilter={globalFilter}
          scrollable
          footer={
            <div className="flex justify-end">
              <div className="grid grid-cols-2">
                <>
                  <strong>Total Debit:</strong>{" "}
                  {formatCurrency(totalDebit?.toFixed(2) ?? 0)}
                </>
                <>
                  <strong>Total Credit:</strong>{" "}
                  {formatCurrency(totalCredit?.toFixed(2) ?? 0)}
                </>
              </div>
            </div>
          }
          header={header} // Adding the search filter
        >
          <Column field="account_name" header="Account Name"></Column>
          <Column
            field="current_total_debit"
            header="curr. Total Debit"
          ></Column>
          <Column
            field="previous_total_credit"
            header="Prev. Total Credit"
          ></Column>
          <Column
            field="current_total_debit"
            header="Curr. Total Debit"
          ></Column>
          <Column
            field="previous_total_credit"
            header="Prev. Total Credit"
          ></Column>
        </DataTable>
      </div>
    </div>
  );
};

export default ComparisonTrialBalances;
