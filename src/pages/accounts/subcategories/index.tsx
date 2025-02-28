import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { AccountSubCategory } from "../../../redux/slices/types/accounts/subCategories";
import useAccountSubCategories from "../../../hooks/accounts/useAccountsSubCategories";
import AddOrModifyAccountSubCategory from "./AddOrModifyAccountSubCategory";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import BreadCrump from "../../../components/layout/bread_crump";

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

  const { data, loading, error, refresh, deleteSubCategory } = useAccountSubCategories();

  const handleDeleteSubCategory = async (subCategoryId: number, is_system_created: number) => {
    if (confirm("Are you sure you want to delete this subcategory?")) {
      await deleteSubCategory(subCategoryId, is_system_created);
      refresh(); // Refresh after deletion
      setDialogState({ selectedCategory: undefined, currentAction: "" });
    }
  };

  const actionBodyTemplate = (rowData: AccountSubCategory) => (
    <div className="flex items-center gap-2">
      <button
        className="bg-shade px-2 py-1 rounded text-white"
        onClick={() => setViewingChartsForAccount(rowData)}
      >
        View Charts
      </button>
      <button
        className="bg-shade px-2 py-1 rounded text-white"
        onClick={() => setDialogState({ selectedCategory: rowData, currentAction: "edit" })}
      >
        Edit
      </button>
      <Icon
        icon="solar:trash-bin-trash-bold"
        className="text-red-500 cursor-pointer"
        fontSize={20}
        onClick={() => handleDeleteSubCategory(rowData.id, rowData.is_system_created)}
      />
    </div>
  );

  return (
    <div>
      <BreadCrump name="Account SubCategories" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Account SubCategories Table</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setDialogState({ selectedCategory: undefined, currentAction: "add" })}
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
            >
              <Icon icon="solar:add-circle-bold" fontSize={20} />
              Add SubCategory
            </button>
          </div>
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
    </div>
  );
};

export default AccountSubCategories;
