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
import useAuth from "../../../hooks/useAuth";
import { ToastContainer } from "react-toastify";

const PurchaseRequests: React.FC = () => {
  const { data, refresh } = usePurchaseRequests();
  const tableRef = useRef<any>(null);
  const { user } = useAuth();

  const [dialogState, setDialogState] = useState<{
    selectedItem: PurchaseRequest | undefined;
    currentAction:
      | "delete"
      | "edit"
      | "add"
      | "review"
      | "approve"
      | "reject"
      | ""
      | "view";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  // Check if current user is an approver for the request
  const isCurrentUserApprover = (request: PurchaseRequest) => {
    if (!request.approval_level?.approvers || !user?.id) return false;
    return request.approval_level.approvers.some(
      (approver) => approver.approver_id === user.id
    );
  };

  const columnDefinitions: ColDef<PurchaseRequest>[] = [
    {
      headerName: "Title",
      field: "title",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Requested By",
      valueGetter: (params) => {
        const requester = params.data.requester;
        return requester
          ? `${requester.first_name} ${requester.last_name}`
          : "";
      },
      sortable: true,
      filter: true,
    },
    {
      headerName: "Department",
      field: "department.name",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Purchase request No",
      field: "request_no",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Priority",
      field: "priority",
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
          {params.data?.status.toLowerCase() === "pending" && (
            <>
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

              {/* Show approve/reject buttons only if user is an approver */}
              {isCurrentUserApprover(params.data) && (
                <>
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
                  <button title="Reject">
                    <Icon
                      onClick={() =>
                        setDialogState({
                          ...dialogState,
                          currentAction: "reject",
                          selectedItem: params.data,
                        })
                      }
                      icon="solar:close-circle-bold"
                      className="text-red-500 cursor-pointer"
                      fontSize={20}
                    />
                  </button>
                </>
              )}
            </>
          )}

          {/* View button for non-pending requests */}
          {params.data?.status !== "pending" && (
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
      <ToastContainer />
      {dialogState.currentAction !== "" && (
        <AddOrModifyItem
          onSave={refresh}
          initialData={
            dialogState.selectedItem
              ? {
                  id: dialogState.selectedItem.id ?? null,
                  title: dialogState.selectedItem.title || "",
                  type: dialogState.selectedItem.procurement_type_id || "",
                  description: dialogState.selectedItem.description || "",
                  budget_id: dialogState.selectedItem.budget_id ?? null,
                  employee_id: dialogState.selectedItem.employee_id ?? null,
                  department_id: dialogState.selectedItem.department_id || 0,
                  status: dialogState.selectedItem.status || "Pending",
                  priority: dialogState.selectedItem.priority || "Medium",
                  items:
                    dialogState.selectedItem.items?.map((item) => ({
                      item_id: item.item_id || 0,
                      quantity: item.quantity || 1,
                      budget_item_id: item.budget_item_id ?? null,
                      uom: item.uom || "",
                      specifications: item.specifications || "",
                      description: item.purpose || "",
                      estimated_unit_price: item.estimated_unit_price || 0,
                      currency_id: item.currency_id || 0,
                      item_type: item.type || "None",
                      custom_name: item.specification || "",
                    })) || [],
                  request_comment:
                    dialogState.selectedItem.request_comment ?? null,
                }
              : null
          }
          visible={
            dialogState.currentAction === "add" ||
            (dialogState.currentAction === "edit" && !!dialogState.selectedItem)
          }
          onClose={() =>
            setDialogState({ currentAction: "", selectedItem: undefined })
          }
        />
      )}

      <ConfirmDeleteDialog
        apiPath={API_ENDPOINTS.PURCHASE_REQUESTS.DELETE(
          dialogState?.selectedItem?.id?.toString() ?? ""
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
          action={
            dialogState.currentAction as
              | "review"
              | "approve"
              | "reject"
              | "view"
          }
          onRefresh={refresh}
          onClose={() =>
            setDialogState({ currentAction: "", selectedItem: undefined })
          }
          purchaseRequest={
            dialogState.currentAction === "review" ||
            dialogState.currentAction === "view" ||
            dialogState.currentAction === "approve" ||
            dialogState.currentAction === "reject"
              ? dialogState.selectedItem
              : undefined
          }
        />
      )}

      <BreadCrump name="Purchase Requests" pageName="Items" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Purchase Requests</h1>
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
        <Table
          columnDefs={columnDefinitions}
          data={data || []}
          ref={tableRef}
        />
      </div>
    </div>
  );
};

export default PurchaseRequests;
