import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import ConfirmDeleteDialog from "../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../components/layout/bread_crump";
import AddOrModifyItem from "./AddOrModifyItem";
import { Asset } from "../../redux/slices/types/mossApp/assets/asset";
import Table from "../../components/table";
import useAssets from "../../hooks/assets/useAssets";
import { ASSETSENDPOINTS } from "../../api/assetEndpoints";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { baseURL } from "../../utils/api";
import { toast } from "react-toastify";
import useAuth from "../../hooks/useAuth";
import AddOrModifyDisposal from "./asset_disposal/AddOrModify";

const Assets: React.FC = () => {
  const { token } = useAuth();
  const { data: assets, refresh } = useAssets();
  const tableRef = useRef<any>(null);
  const navigate = useNavigate();

  const [dialogState, setDialogState] = useState<{
    selectedItem: Asset | undefined;
    currentAction: "delete" | "edit" | "add" | "dispose" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const processAppreciationOrDepreciation = async (
    asset_id: string,
    asset_type: string
  ): Promise<void> => {
    try {
      const endpoint =
        asset_type === "depreciating"
          ? `${baseURL}/assets/assetdepreciation/history/${asset_id}`
          : `${baseURL}/assets/assetappreciation/process/${asset_id}`;

      await axios.post(endpoint, null, {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      });

      toast.success("Record saved successfully");
      refresh();
    } catch (error: any) {
      console.error("Error processing:", error);
      toast.error(error?.response?.data?.message || "Failed to process asset");
    }
  };

  const columnDefinitions: ColDef<Asset>[] = [
    {
      headerName: "Name",
      field: "name",
      sortable: true,
      filter: true,
      onCellClicked: (params) => {
        navigate(`/assets/asset_details/${params?.data?.id}`);
      },
    },
    {
      headerName: "Purchase Date",
      field: "purchase_date",
      sortable: true,
      filter: true,
      valueFormatter: (params) =>
        params.value ? new Date(params.value).toLocaleDateString() : "",
    },
    {
      headerName: "Purchase Cost",
      field: "purchase_cost",
      sortable: true,
      filter: true,
      valueFormatter: (params) =>
        params.value ? `${Number(params.value).toLocaleString()}` : "",
    },
    {
      headerName: "Current Value",
      field: "current_value",
      sortable: true,
      filter: true,
      valueFormatter: (params) =>
        params.value ? `${Number(params.value).toLocaleString()}` : "",
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      filter: true,
      cellStyle: (params) => {
        if (params.value === "Disposed") return { color: "red" };
        if (params.value === "Active") return { color: "green" };
        return {};
      },
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      width: 380, // Increased width to accommodate new button
      cellRenderer: (params: ICellRendererParams<Asset>) => (
        <div className="flex items-center gap-1">
          <button
            className="bg-shade px-2 py-1 rounded text-white"
            onClick={() => navigate(`asset_details/${params.data?.id}`)}
          >
            Manage
          </button>
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
            className="bg-shade px-2 py-1 rounded text-white"
            onClick={() =>
              processAppreciationOrDepreciation(
                params.data?.id,
                params.data?.asset_type
              )
            }
          >
            {params.data?.asset_type === "appreciating"
              ? "Appreciate"
              : "Depreciate"}
          </button>
          {params.data?.status !== "Disposed" && (
            <button
              className="bg-orange-500 px-2 py-1 rounded text-white"
              onClick={() =>
                setDialogState({
                  currentAction: "dispose",
                  selectedItem: params.data,
                })
              }
            >
              Dispose
            </button>
          )}
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
      <AddOrModifyItem
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

      {/* Add/Edit Disposal Modal */}
      <AddOrModifyDisposal
        asset={dialogState.selectedItem}
        visible={
          dialogState.currentAction === "dispose" &&
          !!dialogState.selectedItem?.id
        }
        onClose={() =>
          setDialogState({ currentAction: "", selectedItem: undefined })
        }
        onSave={refresh}
      />

      {dialogState.selectedItem && (
        <ConfirmDeleteDialog
          apiPath={ASSETSENDPOINTS.ASSETS.DELETE(
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
      <BreadCrump name="Assets" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Assets</h1>
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
              Add Asset
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
        <Table columnDefs={columnDefinitions} data={assets} ref={tableRef} />
      </div>
    </div>
  );
};

export default Assets;
