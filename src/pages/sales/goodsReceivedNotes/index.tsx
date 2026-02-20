import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../components/layout/bread_crump";
import Table from "../../../components/table";
import { SALES_ENDPOINTS } from "../../../api/salesEndpoints";
import { ToastContainer } from "react-toastify";
import useGoodsReceivedNotes from "../../../hooks/sales/useGoodsReceivedNotes";
import { GoodsReceivedNote } from "../../../redux/slices/types/sales/goodsReceived";
import AddOrModifyGRN from "./AddorModify";

const GoodsReceivedNotes: React.FC = () => {
  const { data: notes, refresh } = useGoodsReceivedNotes();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: GoodsReceivedNote | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const columnDefinitions: ColDef<GoodsReceivedNote>[] = [
    {
      headerName: "GRN Number",
      field: "buyer_grn_number",
      sortable: true,
      filter: true,
    },
    {
      headerName: "GRN Date",
      field: "buyer_grn_date",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Received",
      field: "is_grn_received",
      sortable: true,
      filter: true,
      valueFormatter: ({ value }) => (value ? "Yes" : "No"),
    },
    {
      headerName: "Remarks",
      field: "grn_remarks",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Received By",
      field: "received_by",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Attachment",
      field: "grn_attachment",
      cellRenderer: (params) =>
        params.value ? (
          <a
            href={params.value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View
          </a>
        ) : (
          "No Attachment"
        ),
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<GoodsReceivedNote>) => (
        <div className="flex items-center gap-2">
          <button
            className="bg-shade px-2 h-10 rounded text-white"
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
            onClick={() =>
              setDialogState({
                currentAction: "delete",
                selectedItem: params.data,
              })
            }
            icon="solar:trash-bin-trash-bold"
            className="text-red-500 cursor-pointer"
            fontSize={24}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <ToastContainer />

      <AddOrModifyGRN
        onSave={refresh}
        item={dialogState.selectedItem}
        visible={
          dialogState.currentAction == "add" ||
          (dialogState.currentAction == "edit" && !!dialogState.selectedItem?.id)
        }
        onClose={() =>
          setDialogState({ currentAction: "", selectedItem: undefined })
        }
      />

      {dialogState.selectedItem && (
        <ConfirmDeleteDialog
          apiPath={SALES_ENDPOINTS.GRN.DELETE(
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

      <BreadCrump name="Sales" pageName="Goods Received Notes" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Goods Received Notes</h1>
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
              Add GRN
            </button>
          </div>
        </div>
        <Table columnDefs={columnDefinitions} data={notes} ref={tableRef} />
      </div>
    </div>
  );
};

export default GoodsReceivedNotes;
