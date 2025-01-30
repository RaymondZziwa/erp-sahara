import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../components/table";
import BreadCrump from "../../../components/layout/bread_crump";
import AddOrModifyItem from "./AddOrModifyItem";

import { API_ENDPOINTS } from "../../../api/apiEndpoints";
import { Bid } from "../../../redux/slices/types/procurement/Bid";
import useBids from "../../../hooks/procurement/useBids";

const Bids: React.FC = () => {
  const { data, refresh } = useBids();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: Bid | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<Bid>[] = [
    {
      headerName: "ID",
      field: "id",
      sortable: true,
      filter: true,
      width: 100,
    },
    {
      headerName: "Bid Number",
      field: "bid_no",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Doc",
      field: "bid_document",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Budget",
      field: "request_for_quotation.budget",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Items",
      field: "id",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
      cellRenderer: (params: ICellRendererParams<Bid>) => (
        <div className="flex items-center gap-2">
          {params.data?.bid_items.length}
        </div>
      ),
    },
    {
      headerName: "Supplier date",
      field: "supplier.supplier_name",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
      cellRenderer: (params: ICellRendererParams<Bid>) => (
        <div className="flex items-center gap-2">
          {params.data?.supplier.supplier_name}
        </div>
      ),
    },
    {
      headerName: "Delivery date",
      field: "delivery_time",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<Bid>) => (
        <div className="flex items-center gap-2">
          <button
            className="bg-shade px-2 py-1 rounded text-white"
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
      {dialogState.currentAction !== "" && (
        <AddOrModifyItem
          onSave={refresh}
          item={dialogState.selectedItem}
          visible={
            dialogState.currentAction == "add" ||
            (dialogState.currentAction == "edit" && !!dialogState.selectedItem)
          }
          onClose={() =>
            setDialogState({ currentAction: "", selectedItem: undefined })
          }
        />
      )}
      <ConfirmDeleteDialog
        apiPath={API_ENDPOINTS.BIDS.DELETE(
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
      <BreadCrump name="Bids" pageName="Bids" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Bids Table</h1>
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
              Add Bid
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

export default Bids;
