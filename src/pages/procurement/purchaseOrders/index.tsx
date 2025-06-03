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
import AcknowledgeModal from "./acknowledgeModal";
import UpdateStatusModal from "./updateStatusModal";
import axios from "axios";
import { baseURL } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";

const PurchaseOrders: React.FC = () => {
  const { data, refresh } = usePurchaseOrders();
  const tableRef = useRef<any>(null);
  const {token} = useAuth()

  const [dialogState, setDialogState] = useState<{
    selectedItem: PurchaseOrder | undefined;
    currentAction: "delete" | "edit" | "add" | "review" | "approve" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  type DialogAction =
    | "edit"
    | "approve"
    | "delete"
    | "updateStatus"
    | "acknowledge"
    | null;
  const [newStatus, setNewStatus] = useState("");

  const handleClose = () =>
    setDialogState({ currentAction: null, selectedItem: null });

  const handleStatusUpdate = async () => {
    if (!dialogState.selectedItem || !newStatus) return;
    await axios.post(
      `${baseURL}/procurement/purchase_orders/${dialogState.selectedItem.id}/updatestatus`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token.access_token}` } }
    );
    handleClose();
    // Optionally refresh data
  };

  const handleAcknowledge = async () => {
    if (!dialogState.selectedItem) return;
    await axios.post(
      `${baseURL}/procurement/purchase_orders/${dialogState.selectedItem.id}/acknowledge`,
      {},
      { headers: { Authorization: `Bearer ${token.access_token}` } }
    );
    handleClose();
    // Optionally refresh data
  };

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<PurchaseOrder>[] = [
    {
      headerName: "Source",
      field: "source",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Purchase Order No",
      field: "purchase_order_no",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Payment Terms",
      field: "payment_terms",
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
      field: "total_price",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Tax Amount",
      field: "tax_amount",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Order Date",
      field: "order_date",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Delivery Date",
      field: "expected_delivery_date",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Supplier",
      field: "supplier.supplier_name",
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
          {/* Edit */}
          {params.data?.status.toLowerCase() === "draft" && (
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
          )}

          {/* Approve */}
          {params.data?.status.toLowerCase() === "pending" && (
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
          )}

          {/* Update Status */}
          <button title="Update Status">
            <Icon
              onClick={() =>
                setDialogState({
                  ...dialogState,
                  currentAction: "updateStatus",
                  selectedItem: params.data,
                })
              }
              icon="solar:refresh-circle-bold-duotone"
              className="text-yellow-500 cursor-pointer"
              fontSize={20}
            />
          </button>

          {/* Acknowledge */}
          <button title="Acknowledge">
            <Icon
              onClick={() =>
                setDialogState({
                  ...dialogState,
                  currentAction: "acknowledge",
                  selectedItem: params.data,
                })
              }
              icon="solar:check-circle-bold-duotone"
              className="text-purple-500 cursor-pointer"
              fontSize={20}
            />
          </button>

          {/* Delete */}
          <button title="Delete">
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
          </button>
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
            <h1 className="text-xl font-bold">Purchase Orders</h1>
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
      <AcknowledgeModal
        visible={dialogState.currentAction === "acknowledge"}
        onClose={handleClose}
        onAcknowledge={handleAcknowledge}
      />

      <UpdateStatusModal
        visible={dialogState.currentAction === "updateStatus"}
        onClose={handleClose}
        onUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default PurchaseOrders;
