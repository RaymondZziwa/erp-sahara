import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../components/table";
import BreadCrump from "../../../components/layout/bread_crump";
import AddOrModifyItem from "./AddOrModifyItem";

import useRequestForQuotation from "../../../hooks/procurement/useRequestForQuotation";
import { RequestForQuotation } from "../../../redux/slices/types/procurement/RequestForQuotation";
import { API_ENDPOINTS } from "../../../api/apiEndpoints";

const RequestForQuotationItems: React.FC = () => {
  const { data, refresh } = useRequestForQuotation();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: RequestForQuotation | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<RequestForQuotation>[] = [
    {
      headerName: "ID",
      field: "id",
      sortable: true,
      filter: true,
      width: 100,
    },
    {
      headerName: "Title",
      field: "title",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Budget",
      field: "budget",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Submission Deadline",
      field: "submission_deadline",
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
      cellRenderer: (params: ICellRendererParams<RequestForQuotation>) => (
        <div>{params.data?.rfq_items.length}</div>
      ),
    },

    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<RequestForQuotation>) => (
        <div className="flex items-center gap-2 h-10">
          <Icon
            onClick={() =>
              setDialogState({
                ...dialogState,
                currentAction: "edit",
                selectedItem: params.data,
              })
            }
            icon="solar:pen-new-round-line-duotone"
            className="text-blue-500 cursor-pointer"
            fontSize={20}
          />
          <Icon
            onClick={() =>
              setDialogState({
                ...dialogState,
                currentAction: "edit",
                selectedItem: params.data,
              })
            }
            icon="solar:check-square-line-duotone"
            className="text-green-500 cursor-pointer"
            fontSize={20}
          />
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
        apiPath={API_ENDPOINTS.REQUEST_FOR_QUOTATION.DELETE(
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
      <BreadCrump name="Qotation Requests" pageName="Items" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold text-nowrap mr-2">
              Quotation Requests Table
            </h1>
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
              <span className="text-sm md:text-base text-nowrap">
                Add Request For Quotation
              </span>
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

export default RequestForQuotationItems;
