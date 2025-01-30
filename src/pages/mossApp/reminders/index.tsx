import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import ConfirmDeleteDialog from "../../../components/dialog/mossApp/ConfirmDeleteDialog";
import Table from "../../../components/table";
import BreadCrump from "../../../components/layout/bread_crump";
import AddOrModifyItem from "./AddOrModifyItem";
import { MOSS_APP_ENDPOINTS } from "../../../api/mossAppEndpoints";

import useReminders from "../../../hooks/mossApp/useReminders";
import { Reminder } from "../../../redux/slices/types/mossApp/Reminders";

const Reminders: React.FC = () => {
  const { data, refresh } = useReminders();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: Reminder | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<Reminder>[] = [
    {
      headerName: "ID",
      field: "id",
      sortable: true,
      filter: true,
      width: 100,
    },
    {
      headerName: "User name",
      field: "id",
      sortable: true,
      filter: true,
      width: 100,
      cellRenderer: (params: ICellRendererParams<Reminder>) => (
        <div className="flex items-center gap-2">
          {params.data?.user?.first_name}
          {` `}
          {params.data?.user?.last_name}
        </div>
      ),
    },
    {
      headerName: "Drug Name",
      field: "drug_name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Prescription",
      field: "prescription",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Period",
      field: "period",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Time",
      field: "time",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Form",
      field: "form",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Frequency",
      field: "frequency",
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
      headerName: "Created At",
      field: "created_at",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },

    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<Reminder>) => (
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
      {dialogState.currentAction !== "" && (
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
      <ConfirmDeleteDialog
        apiPath={MOSS_APP_ENDPOINTS.REMINDERS.DELETE(
          dialogState.selectedItem?.id.toString() ?? ""
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
      <BreadCrump name="Reminders" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Reminders Table</h1>
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
              Add Reminder
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

export default Reminders;
