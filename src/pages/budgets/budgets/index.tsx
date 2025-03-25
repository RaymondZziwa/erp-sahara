//@ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import AddOrModifyItem from "./AddOrModifyItem";
import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../components/layout/bread_crump";
import Table from "../../../components/table";

import { BUDGETS_ENDPOINTS } from "../../../api/budgetsEndpoints";
import useBudgets from "../../../hooks/budgets/useBudgets";
import { Budget } from "../../../redux/slices/types/budgets/Budget";
import { formatDate } from "../../../utils/dateUtils";
import { formatCurrency } from "../../../utils/formatCurrency";
import { Link, useNavigate } from "react-router-dom";

const Budgets: React.FC = () => {
  const { data, refresh } = useBudgets();
  const tableRef = useRef<any>(null);
  const navigate = useNavigate()
  const [dialogState, setDialogState] = useState<{
    selectedItem: Budget | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  useEffect(()=>{
    console.log('budgets', data)
  },[data])

  const columnDefinitions: ColDef<Budget>[] = [
    {
      headerName: "Name",
      field: "name",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
      cellClass: "cursor-pointer hover:underline",
      onCellClicked: (event) => {
        navigate(`budget-details/${event?.data.id}`);
      },
    },
    {
      headerName: "Allocated Amount",
      field: "allocated_amount",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
      valueFormatter: (params) => formatCurrency(params.value), // Format as currency if required
    },

    {
      headerName: "Fiscal Year",
      field: "fiscal_year.financial_year",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Description",
      field: "description",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Created At",
      field: "created_at",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
      valueFormatter: (params) => formatDate(params.value), // Format as date
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<Budget>) => (
        <div className="flex items-center gap-2">
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
          <Link
            to={`budget-details/${params.data?.id.toString()}`}
            className="bg-shade px-2 py-1 rounded text-white"
          >
            Details
          </Link>
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

  return (
    <div>
      {dialogState.currentAction !== "" && (
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
      )}
      {dialogState.selectedItem && (
        <ConfirmDeleteDialog
          apiPath={BUDGETS_ENDPOINTS.BUDGETS.DELETE(
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
      <BreadCrump name="Budgets" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Budgets</h1>
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
              Add Budget
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
        <Table columnDefs={columnDefinitions} data={data} ref={tableRef} />
      </div>
    </div>
  );
};

export default Budgets;
