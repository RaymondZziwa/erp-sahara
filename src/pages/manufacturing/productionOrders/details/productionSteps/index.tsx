import React, { useEffect, useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import useProductionStep from "../../../../../hooks/manufacturing/workCenter/useProductionStep";
import { ProductionOrderStep } from "../../../../../redux/slices/types/manufacturing/productionOrder";
import { ToastContainer } from "react-toastify";
import ConfirmDeleteDialog from "../../../../../components/dialog/ConfirmDeleteDialog";
import { MANUFACTURING_ENDPOINTS } from "../../../../../api/manufacturingEndpoints";
import Table from "../../../../../components/table";
import BreadCrump from "../../../../../components/layout/bread_crump";
import AddOrModifyProductionStep from "./AddorModify";
import { useParams } from "react-router-dom";

const ProductionSteps: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: steps, refresh } = useProductionStep({id});
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: ProductionOrderStep | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const columnDefinitions: ColDef<ProductionOrderStep>[] = [
    {
      headerName: "Step Number",
      field: "step_number",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Description",
      field: "description",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Operator",
      field: "operator",
      sortable: true,
      filter: true,
      valueGetter: (params) => {
        const op = params.data.operator;
        return op ? `${op.first_name} ${op.last_name}` : "";
      },
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Created",
      field: "created_at",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<ProductionOrderStep>) => (
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
          {/* <Icon
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
          /> */}
        </div>
      ),
    },
  ];

  return (
    <div>
      <ToastContainer />
      <AddOrModifyProductionStep
        onSave={refresh}
        item={dialogState.selectedItem}
        visible={
          dialogState.currentAction === "add" ||
          (dialogState.currentAction === "edit" && !!dialogState.selectedItem?.id)
        }
        onClose={() =>
          setDialogState({ currentAction: "", selectedItem: undefined })
        }
      />
      {dialogState.selectedItem && (
        <ConfirmDeleteDialog
          apiPath={MANUFACTURING_ENDPOINTS.PRODUCTION_STEPS.DELETE(
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
      <BreadCrump name="Production Steps" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Production Steps</h1>
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
              Add Step
            </button>
          </div>
        </div>
        <Table columnDefs={columnDefinitions} data={steps} ref={tableRef} />
      </div>
    </div>
  );
};

export default ProductionSteps;
