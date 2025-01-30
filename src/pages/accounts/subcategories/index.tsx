import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import { AccountSubCategory } from "../../../redux/slices/types/accounts/subCategories";
import useAccountSubCategories from "../../../hooks/accounts/useAccountsSubCategories";
import AddOrModifyAccountSubCategory from "./AddOrModifyAccountSubCategory";
import { Link } from "react-router-dom";

// Filter template for text input
const textFilterTemplate = (options: any) => (
  <input
    type="text"
    value={options.value || ""}
    onChange={(e) => options.filterCallback(e.target.value)}
    placeholder="Search"
    className="p-inputtext p-component"
  />
);

// Columns for chart of accounts
const chartOfAccountsColumns = [
  { field: "id", header: "Account ID" },
  { field: "name", header: "Account Name" },
  { field: "code", header: "Code" },
  { field: "description", header: "Description" },
];

const AccountSubCategories = () => {
  const [dialogState, setDialogState] = useState<{
    selectedCategory: AccountSubCategory | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedCategory: undefined, currentAction: "" });

  const { data, loading, error, refresh } = useAccountSubCategories();

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Account SubCategories</h2>
      <div className="mb-4">
        <Button
          size="small"
          label="Add Account SubCategory"
          icon="pi pi-plus"
          onClick={() =>
            setDialogState({
              selectedCategory: undefined,
              currentAction: "add",
            })
          }
        />
      </div>

      {loading && <p className="text-blue-600">Loading...</p>}
      {error && <p className="text-red-600">Error loading accounts.</p>}

      <Accordion multiple>
        {data?.map((account) => (
          <AccordionTab key={account.id} header={`Account: ${account.name}`}>
            {/* Chart of Accounts Accordion */}
            <Accordion multiple>
              <AccordionTab header="Chart of Accounts">
                <DataTable
                  value={account.chart_of_accounts}
                  responsiveLayout="scroll"
                  paginator
                  rows={10}
                  className="p-datatable-striped"
                >
                  {chartOfAccountsColumns.map((col) => (
                    <Column
                      key={col.field}
                      field={col.field}
                      header={col.header}
                      filter
                      filterElement={textFilterTemplate}
                      body={
                        col.field === "id"
                          ? (rowData) => (
                              <Link
                                className="hover:underline"
                                to={`/accounts/accounts/subcategories/${rowData.id}`}
                              >
                                {rowData.id}
                              </Link>
                            )
                          : undefined
                      }
                    />
                  ))}
                </DataTable>
              </AccordionTab>
            </Accordion>
          </AccordionTab>
        ))}
      </Accordion>

      {/* Add or Modify Subcategory Account Dialog */}
      {(dialogState.currentAction === "edit" ||
        dialogState.currentAction === "add") && (
        <AddOrModifyAccountSubCategory
          onSave={refresh}
          item={dialogState.selectedCategory}
          visible={
            dialogState.currentAction === "add" ||
            (dialogState.currentAction === "edit" &&
              !!dialogState.selectedCategory?.id)
          }
          onClose={() =>
            setDialogState({ currentAction: "", selectedCategory: undefined })
          }
        />
      )}
    </div>
  );
};

export default AccountSubCategories;
