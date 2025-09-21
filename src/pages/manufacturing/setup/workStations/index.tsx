import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import AddOrModifyItem from "./AddOrModifyItem";

import { ToastContainer } from "react-toastify";
import { MANUFACTURING_ENDPOINTS } from "../../../../api/manufacturingEndpoints";
import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../../components/layout/bread_crump";
import useWorkCenters from "../../../../hooks/manufacturing/workCenter/useWorkCenters";
import { WorkCenter } from "../../../../redux/slices/types/manufacturing/WorkCenter";
import Table from "../../../../components/table";

const WorkCenters: React.FC = () => {
  const { data: categories, refresh } = useWorkCenters();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: WorkCenter | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const columnDefinitions: ColDef<WorkCenter>[] = [
    {
      headerName: "Name",
      field: "name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Process Type",
      field: "process_type",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Location",
      field: "location",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<WorkCenter>) => (
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
    }
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
          apiPath={MANUFACTURING_ENDPOINTS.WORK_CENTERS.DELETE(
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
      <BreadCrump name="Work stations" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Work stations</h1>
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
              Add Station
            </button>
          </div>
        </div>
        <Table
          columnDefs={columnDefinitions}
          data={categories}
          ref={tableRef}
        />
      </div>
    </div>
  );
};

export default WorkCenters;
