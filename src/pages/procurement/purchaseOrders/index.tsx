import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../components/table";
import BreadCrump from "../../../components/layout/bread_crump";
import AddOrModifyItem from "./AddOrModifyItem";

import { API_ENDPOINTS } from "../../../api/apiEndpoints";
import { PurchaseOrder } from "../../../redux/slices/types/procurement/PurchaseOrders";
import usePurchaseOrders from "../../../hooks/procurement/usePurchaseOrders";
import ConfirmApproveDialog from "../../../components/dialog/ConfirmApproveDialog";
import { ToastContainer } from "react-toastify";

const PurchaseOrders: React.FC = () => {
  const { data, refresh } = usePurchaseOrders();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: PurchaseOrder | undefined;
    currentAction: "delete" | "edit" | "add" | "review" | "approve" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<PurchaseOrder>[] = [
    {
      headerName: "ID",
      field: "id",
      sortable: true,
      filter: true,
      width: 100,
    },
    {
      headerName: "Purchase Order No",
      field: "purchase_order_no",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Bid No",
      field: "bid.bid_no",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Currency",
      field: "currency.name",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Total Amount",
      field: "total_amount",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Items Count",
      field: "total_amount",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
      cellRenderer: (params: ICellRendererParams<PurchaseOrder>) => (
        <div>{params.data?.purchase_order_items.length}</div>
      ),
    },
    {
      headerName: "Delivery Date",
      field: "develivery_date",
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
      cellRenderer: (params: ICellRendererParams<PurchaseOrder>) => (
        <div className="flex items-center gap-2 h-10">
          {params.data?.status == "pending" ? (
            <button title="Edit">
              <Icon
                onClick={() =>
                  setDialogState({
                    ...dialogState,
                    currentAction: "edit",
                    selectedItem: params.data,
                  })
                }
                icon="solar:pen-line-duotone"
                className="text-blue-500 cursor-pointer"
                fontSize={20}
              />
            </button>
          ) : null}
          {params.data?.status == "pending" ? (
            <button title="Approve">
              <Icon
                onClick={() =>
                  setDialogState({
                    ...dialogState,
                    currentAction: "approve",
                    selectedItem: params.data,
                  })
                }
                icon="solar:check-square-bold-duotone"
                className="text-green-500 cursor-pointer"
                fontSize={20}
              />
            </button>
          ) : null}
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
      {dialogState.currentAction != "" && (
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
        apiPath={API_ENDPOINTS.PURCHASE_ORDERS.DELETE(
          dialogState?.selectedItem?.id.toString() ?? ""
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
      {dialogState.currentAction === "approve" && dialogState.selectedItem && (
        <ConfirmApproveDialog
          type="other"
          apiPath={API_ENDPOINTS.PURCHASE_ORDERS.UPDATE_STATUS(
            dialogState.selectedItem.id.toString()
          )}
          onClose={() =>
            setDialogState({ selectedItem: undefined, currentAction: "" })
          }
          visible={dialogState.currentAction === "approve"}
          onConfirm={refresh}
          method="PUT"
          body={{ status: "confirmed" }}
        />
      )}

      <BreadCrump name="Purchase Orders" pageName="Items" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Purchase Orders Table</h1>
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
              Add Purchase Order
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

export default PurchaseOrders;
