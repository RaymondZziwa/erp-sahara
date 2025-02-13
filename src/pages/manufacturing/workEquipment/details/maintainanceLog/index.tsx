import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import useEquipmentMainatainance from "../../../../../hooks/manufacturing/workCenter/useMainatananceLog";
import { useParams } from "react-router-dom";
import AddOrModifyItem from "./AddOrModifyItem";
import { MaintainanceLog } from "../../../../../redux/slices/types/manufacturing/maintainanceLog";
import Table from "../../../../../components/table";
import ConfirmDeleteDialog from "../../../../../components/dialog/ConfirmDeleteDialog";
import { MANUFACTURING_ENDPOINTS } from "../../../../../api/manufacturingEndpoints";
import BreadCrump from "../../../../../components/layout/bread_crump";

const MaintainanceLogs: React.FC = () => {
  const { id: equipmentId } = useParams();
  if (!equipmentId) {
    return <div>No Id</div>;
  }
  const { data: data, refresh } = useEquipmentMainatainance({
    equipmentId,
  });
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: MaintainanceLog | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<MaintainanceLog>[] = [
    {
      headerName: "ID",
      field: "id",
      sortable: true,
      filter: true,
      width: 100,
    },
    {
      headerName: "Equipment",
      field: "equipment.name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Maintanance Date",
      field: "maintenance_date",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Maintenance End date",
      field: "maintenance_date",
      sortable: true,
      filter: true,
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
      cellRenderer: (params: ICellRendererParams<MaintainanceLog>) => (
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
        equpmentId={equipmentId}
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
          apiPath={MANUFACTURING_ENDPOINTS.EQUIPMENT_MAINTANANCE_LOG.DELETE(
            equipmentId,
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
      <BreadCrump name="Maintanance Logs" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Maintanance Logs Table</h1>
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

export default MaintainanceLogs;
