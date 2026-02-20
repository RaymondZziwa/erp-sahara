import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../components/layout/bread_crump";
import Table from "../../../components/table";
import { SALES_ENDPOINTS } from "../../../api/salesEndpoints";
import { ToastContainer } from "react-toastify";
import useDeliveryNotes from "../../../hooks/sales/useDeliveryNotes";
import { DeliveryNote } from "../../../redux/slices/types/sales/deliveryNotes";
import AddOrModifyItem from "./AddorModify";
import UpdateDeliveryStatus from "./updateStatus";
import GRNAttachment from "./grnAttachment";
import GRNPreview from "./preview";

const DeliveryNotes: React.FC = () => {
  const { data: notes, refresh } = useDeliveryNotes();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: DeliveryNote | undefined;
    currentAction: "delete" | "edit" | "add" | "update-status" | "attach-grn" | "preview-grn" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const columnDefinitions: ColDef<DeliveryNote>[] = [
    {
      headerName: "Delivery Number",
      field: "delivery_number",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Order Number",
      cellRenderer: (params) => params.data?.order?.so_number || "N/A",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Customer",
      cellRenderer: (params) => {
        const customer = params.data?.order?.customer;
        return customer 
          ? customer.organization_name || `${customer.first_name} ${customer.last_name}`
          : "N/A";
      },
      sortable: true,
      filter: true,
    },
    {
      headerName: "Delivery Method",
      field: "delivery_method",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Delivery Date",
      field: "delivery_date",
      sortable: true,
      filter: true,
      cellRenderer: (params) => {
        if (!params.value) return "N/A";
        const date = new Date(params.value);
        return date.toLocaleDateString();
      },
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      filter: true,
      cellRenderer: (params) => {
        const status = params.value;
        const statusColors = {
          draft: "bg-gray-100 text-gray-800",
          ready_for_pickup: "bg-blue-100 text-blue-800",
          shipped: "bg-yellow-100 text-yellow-800",
          in_transit: "bg-orange-100 text-orange-800",
          delivered: "bg-green-100 text-green-800",
          returned: "bg-red-100 text-red-800",
          confirmed: "bg-teal-100 text-teal-800",
          disputed: "bg-pink-100 text-pink-800",
          failed: "bg-red-100 text-red-800",
          canceled: "bg-gray-100 text-gray-800",
        };
        const colorClass = statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            {status?.replace(/_/g, ' ').toUpperCase() || "N/A"}
          </span>
        );
      },
    },
    {
      headerName: "Tracking Number",
      field: "tracking_number",
      sortable: true,
      filter: true,
      cellRenderer: (params) => params.value || "N/A",
    },
    {
      headerName: "Items Delivered",
      cellRenderer: (params) => {
        const lines = params.data?.delivery_lines || [];
        const totalDelivered = lines.reduce((sum, line) => sum + parseFloat(line.quantity_delivered || 0), 0);
        const totalReturned = lines.reduce((sum, line) => sum + parseFloat(line.quantity_returned || 0), 0);
        
        return (
          <div className="text-sm">
            <div>Delivered: {totalDelivered}</div>
            {totalReturned > 0 && (
              <div className="text-red-600">Returned: {totalReturned}</div>
            )}
          </div>
        );
      },
      sortable: false,
      filter: false,
    },
    {
      headerName: "GRN",
      cellRenderer: (params) => {
        const hasGRN = params.data?.grn_note !== null;
        return hasGRN ? (
          <div className="flex items-center gap-2">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              ATTACHED
            </span>
            <button
              onClick={() =>
                setDialogState({
                  currentAction: "preview-grn",
                  selectedItem: params.data,
                })
              }
              className="text-blue-600 hover:text-blue-800"
              title="Preview GRN"
            >
              <Icon icon="solar:eye-bold" fontSize={16} />
            </button>
          </div>
        ) : (
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
            PENDING
          </span>
        );
      },
      sortable: true,
      filter: true,
    },
    {
      headerName: "Warehouse",
      cellRenderer: (params) => params.data?.warehouse?.name || "N/A",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Created At",
      field: "created_at",
      sortable: true,
      filter: true,
      cellRenderer: (params) => {
        if (!params.value) return "N/A";
        const date = new Date(params.value);
        return date.toLocaleDateString();
      },
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      width: 420,
      cellRenderer: (params: ICellRendererParams<DeliveryNote>) => (
        <div className="flex items-center gap-2">
          <button
            className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-white text-sm flex items-center gap-1"
            onClick={() =>
              setDialogState({
                currentAction: "edit",
                selectedItem: params.data,
              })
            }
          >
            <Icon icon="solar:pen-line-duotone" fontSize={16} />
            Edit
          </button>
          <button
            className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-white text-sm flex items-center gap-1"
            onClick={() =>
              setDialogState({
                currentAction: "update-status",
                selectedItem: params.data,
              })
            }
          >
            <Icon icon="solar:check-square-bold-duotone" fontSize={16} />
            Status
          </button>
          {!params.data?.grn_note ? (
            <button
              className="bg-purple-500 hover:bg-purple-600 px-3 py-1 rounded text-white text-sm flex items-center gap-1"
              onClick={() =>
                setDialogState({
                  currentAction: "attach-grn",
                  selectedItem: params.data,
                })
              }
            >
              <Icon icon="solar:document-add-bold-duotone" fontSize={16} />
              GRN
            </button>
          ) : (
            <button
              className="bg-teal-500 hover:bg-teal-600 px-3 py-1 rounded text-white text-sm flex items-center gap-1"
              onClick={() =>
                setDialogState({
                  currentAction: "preview-grn",
                  selectedItem: params.data,
                })
              }
            >
              <Icon icon="solar:eye-bold" fontSize={16} />
              View GRN
            </button>
          )}
          <button
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white text-sm flex items-center gap-1"
            onClick={() =>
              setDialogState({
                currentAction: "delete",
                selectedItem: params.data,
              })
            }
          >
            <Icon icon="solar:trash-bin-trash-bold" fontSize={16} />
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <ToastContainer />
      
      {/* Add/Edit Dialog */}
      <AddOrModifyItem
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

      {/* Update Status Dialog */}
      {dialogState.selectedItem && (
        <UpdateDeliveryStatus
          deliveryNote={dialogState.selectedItem}
          visible={dialogState.currentAction === "update-status"}
          onClose={() =>
            setDialogState({ selectedItem: undefined, currentAction: "" })
          }
          onSave={refresh}
        />
      )}

      {/* GRN Attachment Dialog */}
      {dialogState.selectedItem && (
        <GRNAttachment
          deliveryNote={dialogState.selectedItem}
          visible={dialogState.currentAction === "attach-grn"}
          onClose={() =>
            setDialogState({ selectedItem: undefined, currentAction: "" })
          }
          onSave={refresh}
        />
      )}

      {/* GRN Preview Dialog */}
      {dialogState.selectedItem && (
        <GRNPreview
          deliveryNote={dialogState.selectedItem}
          visible={dialogState.currentAction === "preview-grn"}
          onClose={() =>
            setDialogState({ selectedItem: undefined, currentAction: "" })
          }
        />
      )}

      {/* Delete Dialog */}
      {dialogState.selectedItem && (
        <ConfirmDeleteDialog
          apiPath={SALES_ENDPOINTS.DELIVERY_NOTES.DELETE(
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

      <BreadCrump name="Sales" pageName="Delivery Notes" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Delivery Notes</h1>
            <p className="text-gray-600 text-sm">
              Manage and track all delivery notes and shipments
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setDialogState({
                  selectedItem: undefined,
                  currentAction: "add",
                })
              }
              className="bg-shade hover:bg-shade-dark px-4 py-2 rounded text-white flex gap-2 items-center transition-colors"
            >
              <Icon icon="solar:add-circle-bold" fontSize={20} />
              Add Delivery Note
            </button>
          </div>
        </div>
        <div className="mb-4">
          <div className="grid grid-cols-5 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-blue-600 font-semibold">Total Deliveries</div>
              <div className="text-2xl font-bold text-blue-700">{notes?.length || 0}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-green-600 font-semibold">Delivered</div>
              <div className="text-2xl font-bold text-green-700">
                {notes?.filter(note => note.status === 'delivered').length || 0}
              </div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-yellow-600 font-semibold">In Transit</div>
              <div className="text-2xl font-bold text-yellow-700">
                {notes?.filter(note => note.status === 'in_transit').length || 0}
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-purple-600 font-semibold">GRN Attached</div>
              <div className="text-2xl font-bold text-purple-700">
                {notes?.filter(note => note.grn_note !== null).length || 0}
              </div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-red-600 font-semibold">Returned</div>
              <div className="text-2xl font-bold text-red-700">
                {notes?.filter(note => note.status === 'returned').length || 0}
              </div>
            </div>
          </div>
        </div>
        <Table columnDefs={columnDefinitions} data={notes} ref={tableRef} />
      </div>
    </div>
  );
};

export default DeliveryNotes;