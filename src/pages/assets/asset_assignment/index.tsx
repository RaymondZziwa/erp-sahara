import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import axios from "axios";
import { ASSETSENDPOINTS } from "../../../api/assetEndpoints";
import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../components/layout/bread_crump";
import useAuth from "../../../hooks/useAuth";
import { baseURL } from "../../../utils/api";
import Table from "../../../components/table";
import useAssetAssignments from "../../../hooks/assets/useAssetAssignment";
import AddOrModifyAssignment from "./Add0rModify";

const AssetAssignment: React.FC = () => {
  const { token } = useAuth();
  const { data: assignments, refresh } = useAssetAssignments();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: AssetAssignment | undefined;
    currentAction: "delete" | "edit" | "add" | "updateStatus" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await axios.post(
        `${baseURL}/assets/assetassignment/${id}/updatestatus`,
        {
          status: status,
          return_condition: "Good condition",
        },
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
        }
      );
      toast.success("Status updated successfully");
      refresh();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  const columnDefinitions: ColDef<AssetAssignment>[] = [
    {
      headerName: "Asset",
      field: "asset",
      sortable: true,
      filter: true,
      valueGetter: (params) =>
        params.data?.asset ? `${params.data.asset.name}` : "",
    },
    {
      headerName: "Assigned To",
      field: "assigned_to",
      sortable: true,
      filter: true,
      valueGetter: (params) =>
        params.data?.assigned_to
          ? `${params.data.assigned_to.first_name} ${params.data.assigned_to.last_name}`
          : "",
    },
    {
      headerName: "Reason",
      field: "reason_for_assignment",
      sortable: true,
      filter: true,
    },

    {
      headerName: "Start Date",
      field: "start_date",
      sortable: true,
      filter: true,
    },
    {
      headerName: "End Date",
      field: "end_date",
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
      headerName: "Actions",
      field: "id",
      width: 320,
      cellRenderer: (params: ICellRendererParams<AssetAssignment>) => (
        <div className="flex items-center gap-1">
          <button
            className="bg-shade px-2 py-1 rounded text-white"
            onClick={() =>
              setDialogState({
                currentAction: "edit",
                selectedItem: params.data,
              })
            }
          >
            Edit
          </button>
          <button
            className="bg-green-600 px-2 py-1 rounded text-white"
            onClick={() => handleUpdateStatus(params.data.id, "Returned")}
          >
            Mark Returned
          </button>
          <Icon
            onClick={() =>
              setDialogState({
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
      <AddOrModifyAssignment
        onSave={refresh}
        item={dialogState.selectedItem}
        visible={
          dialogState.currentAction === "add" ||
          (dialogState.currentAction === "edit" &&
            !!dialogState.selectedItem?.id)
        }
        onClose={() =>
          setDialogState({ currentAction: "", selectedItem: undefined })
        }
      />
      {dialogState.selectedItem && (
        <ConfirmDeleteDialog
          apiPath={ASSETSENDPOINTS.ASSETS.ASSIGNMENTS.DELETE(
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
      <BreadCrump name="Asset Assignments" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Asset Assignments</h1>
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
              Add Assignment
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
        <Table
          columnDefs={columnDefinitions}
          data={assignments}
          ref={tableRef}
        />
      </div>
    </div>
  );
};

export default AssetAssignment;
