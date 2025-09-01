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


const DeliveryNotes: React.FC = () => {
  const { data: notes, refresh } = useDeliveryNotes();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: DeliveryNote | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const columnDefinitions: ColDef<DeliveryNote>[] = [
    {
      headerName: "Delivery Type",
      field: "delivery_type",
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
      suppressSizeToFit: true,
    },
    {
      headerName: "Delivered By",
      field: "delivered_by",
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
      headerName: "Tracking Number",
      field: "tracking_number",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Service Technician",
      field: "service_technician",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<DeliveryNote>) => (
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
              Add Delivery Note
            </button>
          </div>
        </div>
        <Table columnDefs={columnDefinitions} data={notes} ref={tableRef} />
      </div>
    </div>
  );
};

export default DeliveryNotes;
