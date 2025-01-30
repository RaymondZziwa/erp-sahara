import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner"; // Import ProgressSpinner for loading indication
import useChartOfAccountDetails from "../../../../hooks/accounts/useChartOfAccountDetails";
import { useParams } from "react-router-dom";

const ChartOfAccountDetails = () => {
  const { id: accountId } = useParams();

  // Check if accountId is available
  if (!accountId) {
    return null; // You might want to handle this case differently, e.g., redirecting or showing an error message.
  }

  // Fetch account details using the custom hook
  const { data: accountDetails, loading } = useChartOfAccountDetails(
    +accountId
  );

  // Define the header for the DataTable
  const header = (
    <div className="table-header">
      <h2>
        {accountDetails?.name} (Code: {accountDetails?.code})
      </h2>
      <p>{accountDetails?.description}</p>
    </div>
  );
  if (!accountDetails && !loading) {
    return <div>No account details</div>;
  }
  return (
    <div className="p-grid p-dir-col my-2">
      <Card title={accountDetails?.name}>
        {/* Show loading spinner while data is being fetched */}
        {loading ? (
          <div className="flex justify-content-center align-items-center min-h-dvh">
            <ProgressSpinner
              style={{ width: "50px", height: "50px" }}
              strokeWidth="4"
              fill="var(--surface-ground)"
              animationDuration=".8s"
            />
          </div>
        ) : (
          <>
            {/* DataTable for Journal Line Transactions */}
            <DataTable
              value={accountDetails?.journal_line_transactions}
              header={header}
              responsiveLayout="scroll"
              className="p-mt-4"
            >
              <Column field="chart_of_account.name" header="Account Name" />
              <Column field="debit_amount" header="Debit Amount" />
              <Column field="credit_amount" header="Credit Amount" />
              <Column
                field="base_currency_amount"
                header="Base Currency Amount"
              />
              <Column field="currency_rate" header="Currency Rate" />
              <Column field="created_at" header="Date" />
            </DataTable>

            {/* Display Ledger Total */}
            <div className="p-mt-3">
              <h3>
                Total Ledger: {accountDetails?.journal_line_transactions.length}
              </h3>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ChartOfAccountDetails;
