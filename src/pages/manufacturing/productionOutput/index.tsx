import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import { ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";

import AddOrModifyItem from "./AddOrModify";
import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../components/layout/bread_crump";
import Table from "../../../components/table";
import { MANUFACTURING_ENDPOINTS } from "../../../api/manufacturingEndpoints";
import useProductionOutput from "../../../hooks/manufacturing/useProductionOutput";
import { ProductionOutput as IProductionOutput } from "../../../redux/slices/types/manufacturing/ProductionLine";
import { formatDate } from "../../../utils/dateUtils";

const ProductionOutput: React.FC = () => {
  const { data: outputs, refresh } = useProductionOutput();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: IProductionOutput| undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<IProductionOutput>[] = [
    {
        headerName: "Schedule",
        valueGetter: (params) => {
          const schedule = params.data?.schedule;
          if (!schedule) return "";
          const start = formatDate(schedule.start_time)
          const end = formatDate(schedule.end_time)
          return `${start} - ${end}`;
        },
    },
      
    {
      headerName: "Item",
      field: "item.name",
      valueGetter: (params) => params.data?.item?.name,
    },
    {
      headerName: "Quantity",
      field: "quantity",
    },
    {
      headerName: "Produced At",
      field: "produced_at",
    },
    {
      headerName: "Output Type",
      field: "output_type",
    },
    {
      headerName: "Warehouse",
      field: "warehouse.name",
      valueGetter: (params) => params.data?.warehouse?.name,
    },
    {
      headerName: "UOM",
      field: "uom.name",
      valueGetter: (params) => params.data?.unit_of_measure?.name,
    },
    {
      headerName: "Actions",
      field: "id",
      cellRenderer: (params: ICellRendererParams<IProductionOutput>) => (
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
      <ToastContainer />
      <AddOrModifyItem
        onSave={refresh}
        item={dialogState.selectedItem}
        visible={
          dialogState.currentAction === "add" ||
          (dialogState.currentAction === "edit" && !!dialogState.selectedItem)
        }
        onClose={() =>
          setDialogState({ selectedItem: undefined, currentAction: "" })
        }
      />

      {dialogState.selectedItem && (
        <ConfirmDeleteDialog
          apiPath={MANUFACTURING_ENDPOINTS.PRODUCTION_OUTPUT.DELETE(
            dialogState.selectedItem.id
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

      <BreadCrump name="Production Output" pageName="All" />

      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Production Output</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setDialogState({ selectedItem: undefined, currentAction: "add" })
              }
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
            >
              <Icon icon="solar:add-circle-bold" fontSize={20} />
              Add Output
            </button>
            <button
              onClick={handleExportPDF}
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
            >
              <Icon icon="solar:printer-bold" fontSize={20} />
              Print
            </button>
          </div>
        </div>

        <Table columnDefs={columnDefinitions} data={outputs} ref={tableRef} />
      </div>
    </div>
  );
};

export default ProductionOutput;
