import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../components/layout/bread_crump";
import Table from "../../../components/table";
import { ToastContainer } from "react-toastify";
import { MANUFACTURING_ENDPOINTS } from "../../../api/manufacturingEndpoints";
import useProductionBatches from "../../../hooks/manufacturing/workCenter/useProductionBatches";
import AddOrModifyBatch from "./AddorModify";

export interface ProductionInput {
  material_request_id: string;
  quantity: number;
}

export type ProductionStatus = "planned" | "in_progress" | "completed";

export interface ProductionBatch {
  production_schedule_id: string;
  status: ProductionStatus;
  inputs: ProductionInput[];
}

const Batches: React.FC = () => {

  const { data: batches, refresh } = useProductionBatches(); 
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedBatch: ProductionBatch | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedBatch: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) tableRef.current.exportPDF();
  };

  const columnDefinitions: ColDef<ProductionBatch>[] = [
    {
      headerName: "Schedule ID",
      field: "production_schedule_id",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams<ProductionBatch>) => {
        const statusColor =
          params.data?.status === "planned"
            ? "text-yellow-500"
            : params.data?.status === "in_progress"
            ? "text-blue-500"
            : "text-green-500";
        return <span className={statusColor}>{params.data?.status}</span>;
      },
    },
    {
      headerName: "Inputs",
      field: "inputs",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<ProductionBatch>) => (
        <ul className="list-disc ml-4">
          {params.data?.inputs.map((input) => (
            <li key={input.material_request_id}>
              {input.material_request_id} — {input.quantity}
            </li>
          ))}
        </ul>
      ),
    },
    {
      headerName: "Actions",
      field: "production_schedule_id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<ProductionBatch>) => (
        <div className="flex items-center gap-2">
          <button
            className="bg-teal-600 px-2 py-1 rounded text-white"
            onClick={() =>
              setDialogState({
                currentAction: "edit",
                selectedBatch: params.data,
              })
            }
          >
            Edit
          </button>
          <Icon
            onClick={() =>
              setDialogState({
                currentAction: "delete",
                selectedBatch: params.data,
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
      <ToastContainer />
      <AddOrModifyBatch
        onSave={refresh}
        batch={dialogState.selectedBatch}
        visible={
          dialogState.currentAction === "add" ||
          (dialogState.currentAction === "edit" && !!dialogState.selectedBatch)
        }
        onClose={() =>
          setDialogState({ currentAction: "", selectedBatch: undefined })
        }
      />
      {dialogState.selectedBatch && (
        <ConfirmDeleteDialog
          apiPath={MANUFACTURING_ENDPOINTS.PRODUCTION_BATCHES.DELETE(
            dialogState.selectedBatch.production_schedule_id
          )}
          onClose={() =>
            setDialogState({ selectedBatch: undefined, currentAction: "" })
          }
          visible={
            !!dialogState.selectedBatch?.production_schedule_id &&
            dialogState.currentAction === "delete"
          }
          onConfirm={refresh}
        />
      )}
      <BreadCrump name="Production Batches" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center py-2">
          <h1 className="text-xl font-bold">Production Batches</h1>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setDialogState({ selectedBatch: undefined, currentAction: "add" })
              }
              className="bg-teal-600 px-2 py-1 rounded text-white flex items-center gap-2"
            >
              <Icon icon="solar:add-circle-bold" fontSize={20} />
              Add Batch
            </button>
            
          </div>
        </div>
        <Table columnDefs={columnDefinitions} data={batches} ref={tableRef} />
      </div>
    </div>
  );
};

export default Batches;
