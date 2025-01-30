import { useParams } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import useCurrencies from "../../../hooks/procurement/useCurrencies";
import useFiscalYears from "../../../hooks/budgets/useFiscalYears";
import useChartOfAccounts from "../../../hooks/accounts/useChartOfAccounts";
import useBudgets from "../../../hooks/budgets/useBudgets";

const BudgetDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: currencies } = useCurrencies();
  const { data: fiscalYears } = useFiscalYears();
  const { data: chartOfAccounts } = useChartOfAccounts();
  const { data: budgets } = useBudgets();
  const budget = budgets.find((budget) => budget.id.toString() === id);

  if (!budget) return <div>Loading...</div>;

  // Helper function to get the name by ID
  const getNameById = (id: number, options: { id: number; name: string }[]) => {
    const option = options.find((item) => item.id === id);
    return option ? option.name : "";
  };

  return (
    <div className="p-fluid grid grid-cols-1 gap-4">
      <div className="p-field">
        <h2 className="text-xl font-bold mb-4">Budget Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <h5 className="font-semibold">Name</h5>
            <p>{budget.name}</p>
          </div>
          <div>
            <h5 className="font-semibold">Allocated Amount</h5>
            <p>{budget.allocated_amount}</p>
          </div>
          <div>
            <h5 className="font-semibold">Spent Amount</h5>
            <p>{budget.spent_amount}</p>
          </div>
          <div>
            <h5 className="font-semibold">Remaining Amount</h5>
            <p>{budget.remaining_amount}</p>
          </div>
          <div>
            <h5 className="font-semibold">Currency</h5>
            <p>{getNameById(budget.currency_id, currencies)}</p>
          </div>
          <div>
            <h5 className="font-semibold">Fiscal Year</h5>
            <p>
              {getNameById(
                budget.fiscal_year_id,
                fiscalYears.map((item) => ({
                  id: item.id,
                  name: item.financial_year,
                }))
              )}
            </p>
          </div>
          <div>
            <h5 className="font-semibold">Description</h5>
            <p>{budget.description}</p>
          </div>
          <div>
            <h5 className="font-semibold">Parent Budget</h5>
            <p>{getNameById(budget.parent_id || 0, budgets)}</p>
          </div>
          <div>
            <h5 className="font-semibold">Project ID</h5>
            <p>{budget.project_id || "N/A"}</p>
          </div>
          <div>
            <h5 className="font-semibold">Activity ID</h5>
            <p>{budget.activity_id || "N/A"}</p>
          </div>
          <div>
            <h5 className="font-semibold">Segment ID</h5>
            <p>{budget.segment_id || "N/A"}</p>
          </div>
          <div>
            <h5 className="font-semibold">Total Revenue</h5>
            <p>{budget.totalRevenue}</p>
          </div>
          <div>
            <h5 className="font-semibold">Total Expense</h5>
            <p>{budget.totalExpense}</p>
          </div>
          <div>
            <h5 className="font-semibold">Net Income</h5>
            <p>{budget.netIncome}</p>
          </div>
          <div>
            <h5 className="font-semibold">Net Cash Flow</h5>
            <p>{budget.netCashFlow}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Budget Items</h4>
        <DataTable
          value={budget.items}
          paginator
          rows={10}
          className="p-datatable-sm"
        >
          <Column field="name" header="Name" />
          <Column
            field="type"
            header="Type"
            body={(rowData) =>
              rowData.type === "expense" ? "Expense" : "Revenue"
            }
          />
          <Column field="amount" header="Amount" />
          <Column
            field="chart_of_account_id"
            header="Chart of Account"
            body={(rowData) =>
              getNameById(rowData.chart_of_account_id, chartOfAccounts)
            }
          />
          <Column field="currency_rate" header="Currency Rate" />
          <Column
            field="amount_in_base_currency"
            header="Amount in Base Currency"
          />
          <Column field="status" header="Status" />
        </DataTable>
      </div>
    </div>
  );
};

export default BudgetDetails;
