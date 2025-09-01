import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import ConfirmDeleteDialog from "../../../components/dialog/mossApp/ConfirmDeleteDialog";
import Table from "../../../components/table";
import BreadCrump from "../../../components/layout/bread_crump";
import AddOrModifyItem from "./AddOrModifyItem";
import { MOSS_APP_ENDPOINTS } from "../../../api/mossAppEndpoints";

import { User } from "../../../redux/slices/types/mossApp/Users";
import useUsers from "../../../hooks/mossApp/useUsers";
import { SpendPointsModal } from "./spendPoints";

const Users: React.FC = () => {
  const { data, refresh } = useUsers();
  const tableRef = useRef<any>(null);
  console.log(data);

  const [dialogState, setDialogState] = useState<{
    selectedItem: User | undefined;
    currentAction: "delete" | "edit" | "add" | "" | "spend";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<User>[] = [
    {
      headerName: "ID",
      field: "id",
      sortable: true,
      filter: true,
      width: 100,
    },
    {
      headerName: "User",
      field: "display_name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Email",
      field: "email",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Gender",
      field: "gender",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Points",
      field: "points",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<User>) => (
        <div className="flex items-center gap-2">
  <button
    onClick={() =>
      setDialogState({
        ...dialogState,
        currentAction: "spend",
        selectedItem: params.data,
      })
    }
    className={`w-10 h-10 flex items-center justify-center rounded 
                ${parseInt(params.data?.points) > 0 ? "bg-yellow-100 hover:bg-yellow-200" : "invisible"}`}
  >
    <Icon icon="mdi:coin" className="text-yellow-500" fontSize={20} />
  </button>

  <button
    className="h-10 px-3 flex items-center justify-center rounded bg-shade text-white"
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

  <button
    onClick={() =>
      setDialogState({
        ...dialogState,
        currentAction: "delete",
        selectedItem: params.data,
      })
    }
    className="w-10 h-10 flex items-center justify-center rounded hover:bg-red-100"
  >
    <Icon
      icon="solar:trash-bin-trash-bold"
      className="text-red-500"
      fontSize={20}
    />
  </button>
</div>

      ),
    },
  ];

  return (
    <div>
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
      <ConfirmDeleteDialog
        apiPath={MOSS_APP_ENDPOINTS.DRUGS.DELETE(
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
      <SpendPointsModal dialogState={dialogState} setDialogState={setDialogState} />
      <BreadCrump name="Users" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Users Table</h1>
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
              Add User{" "}
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

export default Users;
