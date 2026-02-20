import { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import AddOrModifyItem from "./AddOrModifyItem";
import { MANUFACTURING_ENDPOINTS } from "../../../../../api/manufacturingEndpoints";
import ConfirmDeleteDialog from "../../../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../../../components/layout/bread_crump";
import useProductionPlanSchedule from "../../../../../hooks/manufacturing/workCenter/useProductionPlanSchedules";
import { ProductionPlanSchedule } from "../../../../../redux/slices/types/manufacturing/ProductionPlanSchedule";
import Table from "../../../../../components/table";
import { useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";

const ProductionSchedules = () => {
  const { id } = useParams<{ id: string }>();
  const { data: data, refresh } = useProductionPlanSchedule({
    id,
  });

  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: ProductionPlanSchedule | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });


  const columnDefinitions: ColDef<ProductionPlanSchedule>[] = [
    {
      headerName: "Production Order Number",
      field: "production_order.order_number",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Operator",
      field: "operator",
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        const operator = params.data?.operator;
        return operator ? `${operator.first_name} ${operator.last_name}` : "-";
      },
    },    
    {
      headerName: "Shift",
      field: "shift",
      sortable: true,
      filter: true,
    },
    // {
    //   headerName: "Quantity",
    //   field: "production_plan.status",
    //   sortable: true,
    //   filter: true,
    // },
    {
      headerName: "Start Time",
      field: "start_time",
      sortable: true,
      filter: true,
      valueFormatter: (params: any) => {
        if (!params.value) return "-";
        const date = new Date(params.value);
        return date.toLocaleString();
      },
    },
    {
      headerName: "End Time",
      field: "end_time",
      sortable: true,
      filter: true,
      valueFormatter: (params: any) => {
        if (!params.value) return "-";
        const date = new Date(params.value);
        return date.toLocaleString();
      },
    },
    
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<ProductionPlanSchedule>) => (
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
          apiPath={MANUFACTURING_ENDPOINTS.PRODUCTION_SCHEDULES.DELETE(
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
      <BreadCrump name="Production Schedule" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">
              Production Schedule
            </h1>
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
              Add Schedule
            </button>
            
          </div>
        </div>
        <Table columnDefs={columnDefinitions} data={data} ref={tableRef} />
      </div>
    </div>
  );
};

export default ProductionSchedules;
