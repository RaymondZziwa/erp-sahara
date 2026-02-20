import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import AddOrModifyItem from "./AddOrModifyItem";
import { Link } from "react-router-dom";
import { MANUFACTURING_ENDPOINTS } from "../../../../api/manufacturingEndpoints";
import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../../components/layout/bread_crump";
import useEquipment from "../../../../hooks/manufacturing/workCenter/useEquipment";
import { Equipment } from "../../../../redux/slices/types/manufacturing/Equipment";
import Table from "../../../../components/table";
import UpdateMachineStatus from "./updateStatus";
import { ToastContainer } from "react-toastify";

const Machines: React.FC = () => {
  const { data: categories, refresh } = useEquipment();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: Equipment | undefined;
    currentAction: "delete" | "edit" | "add" | "updateStatus" | "";
  }>({ selectedItem: undefined, currentAction: "" });


  const columnDefinitions: ColDef<Equipment>[] = [
   
    {
      headerName: "Name",
      field: "name",
      sortable: true,
      filter: true,
      cellClass: "hover:underline",
      cellRenderer: (params: ICellRendererParams<Equipment>) => {
        return (
          <Link
            className="text-teal-500"
            to={`/manufacturing/workstations/machines/${params.data?.id}`}
          >
            {params?.data?.name.toString()}
          </Link>
        );
      },
    },
    {
      headerName: "Work station",
      field: "work_station.name",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Code",
      field: "code",
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
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<Equipment>) => (
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
          <div>
          <Icon
            icon="mdi:update"
            className="action-icon text-green-500 cursor-pointer hover:text-green-700"
            fontSize={20}
            onClick={() =>
              setDialogState({
                ...dialogState,
                currentAction: "updateStatus",
                selectedItem: params.data,
              })
            }
            data-pr-tooltip="Update Status"
          />
          </div>


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
       <UpdateMachineStatus
        onSave={refresh}
        item={dialogState.selectedItem}
        visible={dialogState.currentAction == "updateStatus"}
        onClose={() =>
          setDialogState({ currentAction: "", selectedItem: undefined })
        }
      />
      {dialogState.selectedItem && (
        <ConfirmDeleteDialog
          apiPath={MANUFACTURING_ENDPOINTS.EQUIPMENT.DELETE(
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
      <BreadCrump name="Machine" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Machine</h1>
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
              Add Machine
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

export default Machines;
