import React, { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { formatCurrency } from "../../../utils/formatCurrency";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { useReactToPrint } from "react-to-print";

import useTrialBalances from "../../../hooks/reports/useTrialBalances";

const DetailedTrialBalances: React.FC = () => {
  const [globalFilter, setGlobalFilter] = useState<string | null>(null);
  const { data } = useTrialBalances();
  const totalDebit = data.trial_balance.reduce(
    (acc, item) => acc + parseFloat(item.total_debit),
    0
  );
  const totalCredit = data.trial_balance.reduce(
    (acc, item) => acc + parseFloat(item.total_credit),
    0
  );

  const printDivRef = useRef<HTMLDivElement>(null);

  // useReactToPrint setup
  const reactToPrintFn = useReactToPrint({
    contentRef: printDivRef,
  });

  // Header with search functionality
  const header = (
    <div className="table-header print:hidden flex justify-between items-center">
      <div>
        <div>
          <h1 className="text-xl font-semibold">
            Trial Balance for Financial Year{" "}
            {data.financial_year.financial_year}
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
          value={data.trial_balance}
          globalFilter={globalFilter}
          scrollable
          footer={
            <div className="flex justify-end">
              <div className="grid grid-cols-2">
                <>
                  <strong>Total Debit:</strong>{" "}
                  {formatCurrency(totalDebit.toFixed(2))}
                </>
                <>
                  <strong>Total Credit:</strong>{" "}
                  {formatCurrency(totalCredit.toFixed(2))}
                </>
              </div>
            </div>
          }
          header={header} // Adding the search filter
        >
          <Column field="account_name" header="Account Name"></Column>
          <Column field="total_debit" header="Total Debit"></Column>
          <Column field="total_credit" header="Total Credit"></Column>
        </DataTable>
      </div>
    </div>
  );
};

export default DetailedTrialBalances;
