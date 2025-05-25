import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import axios from "axios";
import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../components/layout/bread_crump";
import useAuth from "../../../hooks/useAuth";
import { baseURL } from "../../../utils/api";
import Table from "../../../components/table";
import useAssetMaintenance from "../../../hooks/assets/useAssetMaintenance";
import AddOrModifyMaintenance from "./Add0rModify";

const AssetMaintenance: React.FC = () => {
  const { token } = useAuth();
  const { data: maintenances, refresh } = useAssetMaintenance();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: any;
    currentAction: "delete" | "edit" | "add" | "complete" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const handleCompleteMaintenance = async (id: string) => {
    const formData = new FormData();
    formData.append("actual_end_date", new Date().toISOString().split("T")[0]);
    formData.append("completion_notes", "Maintenance completed successfully");
    formData.append("cost", "250"); // update dynamically in form
    // formData.append("attachments[]", file) –– Add attachments if needed

    try {
      await axios.post(
        `${baseURL}/assets/assetmaintenance/${id}/complete`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Maintenance marked as complete");
      refresh();
    } catch (error) {
      console.error("Error completing maintenance:", error);
      toast.error("Failed to complete maintenance");
    }
  };

  const columnDefinitions: ColDef[] = [
    {
      headerName: "Asset",
      field: "asset",
      valueGetter: (params) =>
        params.data?.asset ? `${params.data.asset.name}` : "",
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
      headerName: "Type",
      field: "maintenance_type",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Priority",
      field: "priority",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Cost",
      field: "cost",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Service Provider",
      field: "service_provider",
      valueGetter: (params) => params.data?.service_provider?.name || "N/A",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Status",
      field: "maintenance_status",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Actions",
      field: "id",
      width: 300,
      cellRenderer: (params: ICellRendererParams) => (
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
            onClick={() => handleCompleteMaintenance(params.data.id)}
          >
            Complete
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
      <AddOrModifyMaintenance
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
          apiPath={`/assets/assetmaintenance/${dialogState.selectedItem.id}/delete`}
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
      <BreadCrump name="Asset Maintenance" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Asset Maintenance</h1>
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
              Add Maintenance
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
          data={maintenances}
          ref={tableRef}
        />
      </div>
    </div>
  );
};

export default AssetMaintenance;
