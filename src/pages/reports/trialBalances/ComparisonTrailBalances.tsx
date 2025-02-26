import React, { useState, useRef, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { useReactToPrint } from "react-to-print";
import useAuth from "../../../hooks/useAuth";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import { apiRequest } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";

interface ComparisonTrialBalance {
  account_id: number;
  account_name: string;
  account_code: string;
  current_debit: number;
  current_credit: number;
  previous_debit: number;
  previous_credit: number;
  debit_difference: number;
  credit_difference: number;
}

const ComparisonTrialBalances: React.FC = () => {
  const [globalFilter, setGlobalFilter] = useState<string | null>(null);
  const [trialBalance, setTrialBalance] = useState<ComparisonTrialBalance[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

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
      const response = await apiRequest<
        ServerResponse<ComparisonTrialBalance[]>
      >(
        REPORTS_ENDPOINTS.COMPARISON_TRIAL_BALANCES.GET_ALL,
        "GET",
        token.access_token
      );
      setIsLoading(false);
      console.log("data", response.data);

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
          value={trialBalance}
          globalFilter={globalFilter}
          scrollable
          header={header} // Adding the search filter
        >
          <Column field="account_id" header="Account ID"></Column>
          <Column field="account_name" header="Account Name"></Column>
          <Column field="account_code" header="Account Code"></Column>
          <Column field="current_debit" header="Current Debit"></Column>
          <Column field="previous_debit" header="Previous Debit"></Column>
          <Column field="debit_difference" header="Debit difference"></Column>
          <Column field="current_credit" header="Current Credit"></Column>
          <Column field="previous_credit" header="Previous Credit"></Column>
          <Column field="credit_difference" header="Credit Difference"></Column>
        </DataTable>
      </div>
    </div>
  );
};

export default ComparisonTrialBalances;
