import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import AddOrModifyItem from "./AddOrModifyItem";
import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../components/layout/bread_crump";
import Table from "../../../components/table";

import useFiscalYears from "../../../hooks/budgets/useFiscalYears";
import { FiscalYear } from "../../../redux/slices/types/budgets/FiscalYear";
import { BUDGETS_ENDPOINTS } from "../../../api/budgetsEndpoints";

const FiscalYears: React.FC = () => {
  const { data, refresh } = useFiscalYears();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: FiscalYear | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<FiscalYear>[] = [
    {
      headerName: "ID",
      field: "id",
      sortable: true,
      filter: true,
      width: 100,
    },
    {
      headerName: "Start Date",
      field: "start_date",
      sortable: true,
      filter: true,
    },
    {
      headerName: "End Date",
      field: "end_date",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Financial Year",
      field: "financial_year",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Remaining days",
      field: "remaining_days",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Should alert",
      field: "should_alert",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },

    // {
    //   headerName: "Actions",
    //   field: "id",
    //   sortable: false,
    //   filter: false,
    //   cellRenderer: (params: ICellRendererParams<FiscalYear>) => (
    //     <div className="flex items-center gap-2">
    //       <button
    //         className="bg-shade px-2 py-1 rounded text-white"
    //         onClick={() =>
    //           setDialogState({
    //             ...dialogState,
    //             currentAction: "edit",
    //             selectedItem: params.data,
    //           })
    //         }
    //       >
    //         Edit
    //       </button>
    //       <Icon
    //         onClick={() =>
    //           setDialogState({
    //             ...dialogState,
    //             currentAction: "delete",
    //             selectedItem: params.data,
    //           })
    //         }
    //         icon="solar:trash-bin-trash-bold"
    //         className="text-red-500 cursor-pointer"
    //         fontSize={20}
    //       />
    //     </div>
    //   ),
    // },
  ];

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
      {dialogState.selectedItem && (
        <ConfirmDeleteDialog
          apiPath={BUDGETS_ENDPOINTS.FISCAL_YEARS.DELETE(
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
      <BreadCrump name="Fiscal Years" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Fiscal Years Table</h1>
          </div>
          <div className="flex gap-2">
            {/* <button
              onClick={() =>
                setDialogState({
                  selectedItem: undefined,
                  currentAction: "add",
                })
              }
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
            >
              <Icon icon="solar:add-circle-bold" fontSize={20} />
              Add Yaer
            </button> */}
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

export default FiscalYears;
