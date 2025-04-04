import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import AddOrModifyItem from "./AddOrModifyItem";
import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../../components/layout/bread_crump";

import Table from "../../../../components/table";

import { HUMAN_RESOURCE_ENDPOINTS } from "../../../../api/hrEndpoints";

import useAllowances from "../../../../hooks/hr/salary/useAllowances";
import { Allowance } from "../../../../redux/slices/types/hr/salary/Allowances";

const Allowances: React.FC = () => {
  const { data, refresh } = useAllowances();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: Allowance | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<Allowance>[] = [
    {
      headerName: "ID",
      field: "id",
      sortable: true,
      filter: true,
      width: 100,
    },
    {
      headerName: "Allowance Type",
      field: "allowance_type.name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Amount",
      field: "amount",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Start Date",
      field: "start_date",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "End Date",
      field: "end_date",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Frequency",
      field: "frequency",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Employee",
      field: "employee.first_name",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
      cellRenderer: (params: ICellRendererParams<Allowance>) =>
        `${params.data?.employee.first_name} ${params.data?.employee.last_name}`,
    },

    {
      headerName: "Created",
      field: "created_at",
      sortable: true,
      filter: true,
      // wrapText: true,
      cellRenderer: (params: ICellRendererParams<Allowance>) => (
        <div>
          {new Date(params.data?.created_at ?? new Date()).toLocaleString()}
        </div>
      ),
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<Allowance>) => (
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
          apiPath={HUMAN_RESOURCE_ENDPOINTS.ALLOWANCES.DELETE(
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
      <BreadCrump name="Allowances" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Allowances Table</h1>
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
              Add Allowance
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

export default Allowances;
