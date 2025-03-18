import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../components/table";
import BreadCrump from "../../../components/layout/bread_crump";
import AddOrModifyItem from "./AddOrModifyItem";

import { API_ENDPOINTS } from "../../../api/apiEndpoints";
import { PurchaseRequest } from "../../../redux/slices/types/procurement/PurchaseRequests";
import usePurchaseRequests from "../../../hooks/procurement/usePurchaseRequests";
import ReviewOrApprovePurchaseRequest from "./ReviewOrApprovePurchaseRequest";

const PurchaseRequests: React.FC = () => {
  const { data, refresh } = usePurchaseRequests();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: PurchaseRequest | undefined;
    currentAction:
      | "delete"
      | "edit"
      | "add"
      | "review"
      | "approve"
      | ""
      | "view";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<PurchaseRequest>[] = [
    {
      headerName: "ID",
      field: "id",
      sortable: true,
      filter: true,
      width: 100,
    },
    {
      headerName: "Name",
      field: "name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Requested By",
      field: "rejected_by",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
      cellRenderer: (params: ICellRendererParams<PurchaseRequest>) => (
        <div className="flex items-center gap-2 h-10">
          {params.data?.requested_by ?? "N/A"}
        </div>
      ),
    },
    {
      headerName: "Purchase request No",
      field: "purchase_request_no",
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
      cellRenderer: (params: ICellRendererParams<PurchaseRequest>) => (
        <div className="flex items-center gap-2 h-10">
          {params.data?.status == "pending" && (
            <div title="Review">
              <Icon
                onClick={() =>
                  setDialogState({
                    ...dialogState,
                    currentAction: "review",
                    selectedItem: params.data,
                  })
                }
                icon="solar:weigher-line-duotone"
                className="text-blue-500 cursor-pointer"
                fontSize={20}
              />
            </div>
          )}
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
          {params.data?.status == "reviewed" ? (
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
          ) : (
            <button title="View">
              <Icon
                onClick={() =>
                  setDialogState({
                    ...dialogState,
                    currentAction: "view",
                    selectedItem: params.data,
                  })
                }
                icon="solar:eye-line-duotone"
                className="text-blue-500 cursor-pointer"
                fontSize={20}
              />
            </button>
          )}
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
          // item={dialogState.selectedItem}
          purchaseRequest={{
            id: dialogState.selectedItem?.id,
            items: dialogState.selectedItem?.purchase_request_items.map(
              (item) => ({
                item_id: item.item_id,
                quantity: item.quantity ?? "0", // Ensure quantity is provided
                specification: item.specification ?? "",
                purpose: item.purpose ?? "",
                cost_estimate: item.cost_estimate ?? 0,
                currency: item.currency ?? "",
              })
            ),
            name: dialogState.selectedItem?.name,
            request_comment: dialogState.selectedItem?.request_comment,
          }}
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
        apiPath={API_ENDPOINTS.PURCHASE_REQUESTS.DELETE(
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
      {dialogState.currentAction !== "" && (
        <ReviewOrApprovePurchaseRequest
          action={dialogState.currentAction as "review" | "approve" | "view"}
          onRefresh={refresh}
          onClose={() =>
            setDialogState({ currentAction: "", selectedItem: undefined })
          }
          purchaseRequest={
            dialogState.currentAction == "review" ||
            dialogState.currentAction == "view" ||
            dialogState.currentAction == "approve"
              ? dialogState.selectedItem
              : undefined
          }
        />
      )}
      <BreadCrump name="Purchase Requests" pageName="Items" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Purchase Requests Table</h1>
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
              Add Purchase Request
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

export default PurchaseRequests;
