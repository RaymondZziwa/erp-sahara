import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import AddOrModifyItem from "./AddOrModifyItem";
import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../components/layout/bread_crump";
import Table from "../../../components/table";

import { HUMAN_RESOURCE_ENDPOINTS } from "../../../api/hrEndpoints";
import { Attendence } from "../../../redux/slices/types/hr/Attendence";
import useAttendencies from "../../../hooks/hr/useAttendencies";

const Attendencies: React.FC = () => {
  const { data, refresh } = useAttendencies();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: Attendence | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<Attendence>[] = [
    {
      headerName: "First Name",
      field: "employee.first_name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Last Name",
      field: "employee.last_name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Address",
      field: "employee.address",
      sortable: true,
      filter: true,
    },
    {
      headerName: "CheckIn",
      field: "check_in_time",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Checkout",
      field: "check_out_time",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },

    {
      headerName: "Created",
      field: "created_at",
      sortable: true,
      filter: true,
      // wrapText: true,
      cellRenderer: (params: ICellRendererParams<Attendence>) => (
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
      cellRenderer: (params: ICellRendererParams<Attendence>) => (
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
      {(dialogState.currentAction == "add" ||
        dialogState.currentAction == "edit") && (
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
      )}
      {dialogState.selectedItem && (
        <ConfirmDeleteDialog
          apiPath={HUMAN_RESOURCE_ENDPOINTS.ATTENDENCIES.DELETE(
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
      <BreadCrump name="Attendance" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Attendance</h1>
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
              Add Attendance
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

export default Attendencies;
