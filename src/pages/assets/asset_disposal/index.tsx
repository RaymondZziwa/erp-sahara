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
import useAssetDisposal from "../../../hooks/assets/useAssetDisposal";
import AddOrModifyDisposal from "./AddOrModify";

const AssetDisposal: React.FC = () => {
  const { token } = useAuth();
  const { data: disposals, refresh } = useAssetDisposal();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: any;
    currentAction: "delete" | "edit" | "add" | "restore" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const handleRestoreDisposal = async (id: string) => {
    try {
      await axios.post(
        `${baseURL}/assets/assetdisposal/${id}/restore`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
        }
      );
      toast.success("Disposal restored successfully");
      refresh();
    } catch (error) {
      console.error("Error restoring disposal:", error);
      toast.error("Failed to restore disposal");
    }
  };

  const columnDefinitions: ColDef[] = [
    {
      headerName: "Asset",
      field: "asset",
      valueGetter: (params) => params.data?.asset?.name || "",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Disposal Date",
      field: "disposal_date",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Type",
      field: "disposal_type",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Value",
      field: "disposal_value",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Book Value",
      field: "book_value",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Reference",
      field: "reference",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Reason",
      field: "reason",
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
      width: 300,
      cellRenderer: (params: ICellRendererParams) => {
        const isDisposed = params.data?.status === "disposed";
        return (
          <div className="flex items-center gap-2">
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
            <Icon
              icon="solar:trash-bin-trash-bold"
              className="text-red-500 cursor-pointer"
              fontSize={20}
              onClick={() =>
                setDialogState({
                  currentAction: "delete",
                  selectedItem: params.data,
                })
              }
            />
            {isDisposed && (
              <button
                className="bg-green-600 px-2 py-1 rounded text-white"
                onClick={() => handleRestoreDisposal(params.data.id)}
              >
                Restore
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <AddOrModifyDisposal
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
          apiPath={`/assets/assetdisposal/${dialogState.selectedItem.id}/delete`}
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
      <BreadCrump name="Asset Disposal" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Asset Disposal</h1>
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
              Add Disposal
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
        <Table columnDefs={columnDefinitions} data={disposals} ref={tableRef} />
      </div>
    </div>
  );
};

export default AssetDisposal;
