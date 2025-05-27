import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Icon } from "@iconify/react";
import BreadCrump from "../../../components/layout/bread_crump";
import useAccounts from "../../../hooks/accounts/useAccounts";
import AddOrModifyAccount from "./AddOrModifyAccount";
const textFilterTemplate = (options: any) => (
  <input
    type="text"
    value={options.value || ""}
    onChange={(e) => options.filterCallback(e.target.value)}
    placeholder="Search"
    className="p-inputtext p-component"
  />
);

const Accounts = () => {
  const [dialogState, setDialogState] = useState<{
    selectedCategory: any | undefined;
    currentAction: "edit" | "";
  }>({ selectedCategory: undefined, currentAction: "" });
  const [searchQuery, setSearchQuery] = useState("");

  const { data, loading, refresh } = useAccounts();

  // Filter data based on search query
  const filteredData = data?.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const actionBodyTemplate = (rowData: any) => (
    <div className="flex items-center gap-2">
      <button
        className="bg-shade px-2 py-1 rounded text-white"
        onClick={() =>
          setDialogState({ selectedCategory: rowData, currentAction: "edit" })
        }
      >
        Modify
      </button>
    </div>
  );

  return (
    <div>
      <BreadCrump name="Account Categories" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Account Categories</h1>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <span className="p-input-icon-left">
            <Icon icon="solar:magnifer-linear" className="text-gray-400 pl-2" />
            <InputText
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories by name or description"
              className="w-[400px] pl-2"
            />
          </span>
        </div>

        <DataTable
          value={filteredData}
          responsiveLayout="scroll"
          paginator
          rows={10}
          className="p-datatable-striped mb-4"
          loading={loading}
        >
          <Column
            field="name"
            header="Name"
            filter
            filterElement={textFilterTemplate}
            sortable
          />
          <Column
            field="code"
            header="Code"
            filter
            filterElement={textFilterTemplate}
            sortable
          />
          <Column
            field="description"
            header="Description"
            filter
            filterElement={textFilterTemplate}
            sortable
          />
          <Column
            body={actionBodyTemplate}
            header="Actions"
            style={{ minWidth: "8rem" }}
          />
        </DataTable>

        {/* Edit Category Dialog */}
        {dialogState.currentAction === "edit" && (
          <AddOrModifyAccount
            onSave={refresh} // Refresh the page after save
            item={dialogState.selectedCategory}
            visible={!!dialogState.selectedCategory?.id}
            onClose={() =>
              setDialogState({ currentAction: "", selectedCategory: undefined })
            }
          />
        )}
      </div>
    </div>
  );
};

export default Accounts;
