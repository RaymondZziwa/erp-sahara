import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { AccountSubCategory } from "../../../redux/slices/types/accounts/subCategories";
import useAccountSubCategories from "../../../hooks/accounts/useAccountsSubCategories";
import AddOrModifyAccountSubCategory from "./AddOrModifyAccountSubCategory";
import { Link } from "react-router-dom";

const textFilterTemplate = (options: any) => (
  <input
    type="text"
    value={options.value || ""}
    onChange={(e) => options.filterCallback(e.target.value)}
    placeholder="Search"
    className="p-inputtext p-component"
  />
);

const chartOfAccountsColumns = [
  { field: "id", header: "Account ID" },
  { field: "name", header: "Account Name" },
  { field: "code", header: "Code" },
  { field: "description", header: "Description" },
];

const AccountSubCategories = () => {
  const [viewingChartsForAccount, setViewingChartsForAccount] = useState<AccountSubCategory | null>(null);
  const [dialogState, setDialogState] = useState<{
    selectedCategory: AccountSubCategory | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedCategory: undefined, currentAction: "" });

  const { data, loading, error, refresh } = useAccountSubCategories();

  const actionBodyTemplate = (rowData: AccountSubCategory) => (
    <div className="flex items-center space-x-2">
      <Button
        icon="pi pi-eye"
        className="p-button-rounded p-button-info"
        onClick={() => setViewingChartsForAccount(rowData)}
        tooltip="View Chart of Accounts"
        tooltipOptions={{ position: "top" }}
      />
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-success"
        onClick={() => setDialogState({ selectedCategory: rowData, currentAction: "edit" })}
        tooltip="Edit"
        tooltipOptions={{ position: "top" }}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger"
        onClick={() => setDialogState({ selectedCategory: rowData, currentAction: "delete" })}
        tooltip="Delete"
        tooltipOptions={{ position: "top" }}
      />
    </div>
  );
  

  const chartAccountsActionTemplate = (rowData: any) => (
    <div className="flex items-center space-x-2">
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-success mr-2"
        tooltip="Edit"
        onClick={() => handleEditChartAccount(rowData)}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger"
        tooltip="Delete"
        onClick={() => handleDeleteChartAccount(rowData)}
      />
    </div>
  );

  const handleEditChartAccount = (chartAccount: any) => {
    // Implement edit functionality
    console.log("Edit chart account:", chartAccount);
  };

  const handleDeleteChartAccount = (chartAccount: any) => {
    if (confirm("Are you sure you want to delete this chart account?")) {
      // Implement delete functionality
      console.log("Delete chart account:", chartAccount);
      refresh();
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Account SubCategories</h2>
      <div className="mb-4">
        <Button
          size="small"
          label="Add Account SubCategory"
          icon="pi pi-plus"
          onClick={() => setDialogState({ selectedCategory: undefined, currentAction: "add" })}
        />
      </div>

      {loading && <p className="text-blue-600">Loading...</p>}
      {error && <p className="text-red-600">Error loading accounts.</p>}

      <DataTable
        value={data}
        responsiveLayout="scroll"
        paginator
        rows={10}
        className="p-datatable-striped mb-4"
      >
        <Column field="name" header="Name" />
        <Column field="code" header="Code" />
        <Column field="description" header="Description" />
        <Column body={actionBodyTemplate} header="Actions" style={{ minWidth: "12rem" }} />
      </DataTable>

      {/* Charts of Accounts Dialog */}
      <Dialog
        header={`Chart of Accounts - ${viewingChartsForAccount?.name || ''}`}
        visible={!!viewingChartsForAccount}
        style={{ width: '80vw' }}
        onHide={() => setViewingChartsForAccount(null)}
      >
        {viewingChartsForAccount && (
          <DataTable
            value={viewingChartsForAccount.chart_of_accounts}
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
            <Column 
              body={chartAccountsActionTemplate} 
              header="Actions" 
              style={{ minWidth: "8rem" }} 
            />
          </DataTable>
        )}
      </Dialog>

      {/* Add/Edit SubCategory Dialog */}
      {(dialogState.currentAction === "edit" || dialogState.currentAction === "add") && (
        <AddOrModifyAccountSubCategory
          onSave={refresh}
          item={dialogState.selectedCategory}
          visible={dialogState.currentAction === "add" || !!dialogState.selectedCategory?.id}
          onClose={() => setDialogState({ currentAction: "", selectedCategory: undefined })}
        />
      )}
    </div>
  );
};

export default AccountSubCategories;