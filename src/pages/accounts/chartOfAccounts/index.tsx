//@ts-nocheck
import React, { useRef, useState, useEffect } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import AddOrModifyItem from "./AddOrModifyItem";
import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../components/table";
import { ChartofAccount } from "../../../redux/slices/types/accounts/ChartOfAccounts";
import useChartOfAccounts from "../../../hooks/accounts/useChartOfAccounts";
import { ACCOUNTS_ENDPOINTS } from "../../../api/accountsEndpoints";
import BreadCrump from "../../../components/layout/bread_crump";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";
import DepositBalance from "./deposit";

const ChartOfAccounts: React.FC = () => {
  const { data, refresh } = useChartOfAccounts();
  const tableRef = useRef<any>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [accountCountsByCategory, setAccountCountsByCategory] = useState<any>();
  const [dialogState, setDialogState] = useState<{
    selectedItem: ChartofAccount | undefined;
    currentAction: "delete" | "edit" | "add" | "balance" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<ChartofAccount>[] = [
    {
      headerName: "Name",
      field: "id",
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams<ChartofAccount>) => (
        <div className="flex items-center gap-2">
          <Link
            to={"/accounts/accounts/subcategories/" + params.data?.id}
            className="text-shade hover:underline"
          >
            {params.data?.name}
          </Link>
        </div>
      ),
    },
    {
      headerName: "Desc",
      field: "description",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Code",
      field: "code",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Category",
      field: "account_sub_category.account_category.name",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Sub Category",
      field: "account_sub_category.name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<ChartofAccount>) => (
        <div className="flex items-center gap-2">
          <button
            className="bg-shade px-2 py-1 rounded text-white"
            onClick={() =>
              setDialogState({
                ...dialogState,
                currentAction: "balance", // Set action to "balance"
                selectedItem: params.data,
              })
            }
          >
            Add Opening Balance
          </button>
          <button
            className="bg-shade px-2 py-1 rounded text-white"
            onClick={() =>
              setDialogState({
                ...dialogState,
                currentAction: "edit",
                selectedItem: params.data,
              })
            }
          >
            Edit
          </button>
          <Icon
            onClick={() =>
              setDialogState({
                ...dialogState,
                currentAction: "delete",
                selectedItem: params.data,
              })
            }
            icon="solar:trash-bin-trash-bold"
            className="text-red-500 cursor-pointer"
            fontSize={20}
          />
        </div>
      ),
    },
  ];

  // Initialize the account count by category
  useEffect(() => {
    if (data) {
      const accountCountsByCategory = data.reduce<{ [key: string]: number }>(
        (acc, item) => {
          const categoryName = item.account_sub_category.account_category.name;
          acc[categoryName] = (acc[categoryName] || 0) + 1;
          acc["all"] = (acc["all"] || 0) + 1;
          return acc;
        },
        { all: 0 }
      );
      setAccountCountsByCategory(accountCountsByCategory);
    }
  }, [data]);

  return (
    <div>
      <AddOrModifyItem
        onSave={refresh}
        item={dialogState.selectedItem}
        visible={
          dialogState.currentAction == "add" ||
          (dialogState.currentAction == "edit" &&
            !!dialogState.selectedItem?.id)
        }
        onClose={() =>
          setDialogState({ currentAction: "", selectedItem: undefined })
        }
      />
      <DepositBalance
        onSave={refresh}
        item={dialogState.selectedItem}
        visible={dialogState.currentAction === "balance"} // Only show for "balance" action
        onClose={() =>
          setDialogState({ currentAction: "", selectedItem: undefined })
        }
      />
      {dialogState.selectedItem && (
        <ConfirmDeleteDialog
          apiPath={ACCOUNTS_ENDPOINTS.CHART_OF_ACCOUNTS.DELETE(
            dialogState.selectedItem?.id.toString()
          )}
          onClose={() =>
            setDialogState({ selectedItem: undefined, currentAction: "" })
          }
          visible={
            !!dialogState.selectedItem?.id &&
            dialogState.currentAction === "delete"
          }
          onConfirm={refresh}
        />
      )}
      <BreadCrump name="Accounts" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Chart of Accounts</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setDialogState({
                  selectedItem: undefined,
                  currentAction: "add",
                })
              }
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
            >
              <Icon icon="solar:add-circle-bold" fontSize={20} />
              Add Account
            </button>
            <button
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
              onClick={handleExportPDF}
            >
              <Icon icon="solar:printer-bold" fontSize={20} />
              Print
            </button>
          </div>
        </div>
        <ul className="flex gap-2 my-2">
          {accountCountsByCategory &&
            Object.entries(accountCountsByCategory).map(([category, count]) => (
              <li key={category}>
                <Button
                  onClick={() => setSelectedCategory(category)}
                  outlined={category != selectedCategory}
                  size="small"
                  severity="info"
                  type="button"
                  label={category}
                  icon="pi pi-wallet"
                  className={`text-nowrap capitalize p-2 ${
                    category == selectedCategory
                      ? ""
                      : "bg-white !text-black hover:!bg-gray-300"
                  }`}
                  badge={count && count.toString()}
                  badgeClassName="p-badge-danger"
                  raised
                />
              </li>
            ))}
        </ul>
        <Table
          columnDefs={columnDefinitions}
          data={
            selectedCategory == "all"
              ? data
              : data.filter(
                  (acc) =>
                    acc.account_sub_category.account_category.name ==
                    selectedCategory
                )
          }
          ref={tableRef}
        />
      </div>
    </div>
  );
};

export default ChartOfAccounts;
