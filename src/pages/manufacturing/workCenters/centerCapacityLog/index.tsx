import { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import AddOrModifyItem from "./AddOrModifyItem";
import Table from "../../../../components/table";
import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import { MANUFACTURING_ENDPOINTS } from "../../../../api/manufacturingEndpoints";
import BreadCrump from "../../../../components/layout/bread_crump";
import useCenterCapacityLogs from "../../../../hooks/manufacturing/workCenter/useCenterCapacityLogs";
import { CapapcityLog } from "../../../../redux/slices/types/manufacturing/CapacityLog";

const CenterCapacityLogs = ({ centerId }: { centerId: string }) => {
  if (!centerId) {
    return <div>No Id</div>;
  }
  const { data: data, refresh } = useCenterCapacityLogs({
    centerId,
  });
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: CapapcityLog | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<CapapcityLog>[] = [
    {
      headerName: "ID",
      field: "id",
      sortable: true,
      filter: true,
      width: 100,
    },
    {
      headerName: "Utlized Capacity",
      field: "utilized_capacity",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Center",
      field: "work_center.name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Log  date",
      field: "log_date",
      sortable: true,
      filter: true,
    },
    {
      headerName: " Desc",
      field: "description",
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
      cellRenderer: (params: ICellRendererParams<CapapcityLog>) => (
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
        centerId={centerId}
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
          apiPath={MANUFACTURING_ENDPOINTS.CENTER_CAPACITY_LOG.DELETE(
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
      <BreadCrump name="Center Capacity Logs" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Center Capacity Logs Table</h1>
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
              Add Log
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

export default CenterCapacityLogs;
