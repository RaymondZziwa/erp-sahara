import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../../components/layout/bread_crump";
import useAuth from "../../../../hooks/useAuth";
import { apiRequest } from "../../../../utils/api";
import Table from "../../../../components/table";
import useItemPurchases from "../../../../hooks/procurement/itemPurchases/useItemPurchases";
import AddOrModifyItemPurchase from "./AddorModify";
import EditAssessmentModal from "./assess";
import ViewAssessmentModal from "./viewAssessment";
import useUserPermissions from "../../../../hooks/users/useUserPermissions";

interface ItemPurchase {
  id: string;
  supplier_id: string;
  supplier_name?: string;
  item_id: string;
  item_name?: string;
  delivery_date: string;
  quantity: number;
  uom_id: string;
  uom_name?: string;
  warehouse_id: string;
  warehouse_name?: string;
  notes?: string;
  assessment?: any;
}

const ItemPurchases: React.FC = () => {
  const {data: purchases, refresh} = useItemPurchases();
    const [loading, setLoading] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [assessment, setAssessment] = useState<any>(null);
  const [purchase, setPurchase] = useState<any>(null);
  const canAddPurchase = useUserPermissions("add_purchase");
  const canAssess = useUserPermissions("add_quality_results");
  const [dialogState, setDialogState] = useState<{
    selectedItem?: ItemPurchase;
    currentAction: "add" | "edit" | "delete" | "";
  }>({ currentAction: "" });

  const tableRef = useRef<any>(null);
  const { token } = useAuth();

  const handleApprove = async (remarks: string) => {
    try {
      const payload = {
        remarks,
      };
      const res = await apiRequest(`/purchases/qa/${assessment?.id}/approve`, "POST", token.access_token, payload);
      if(res.success) {
        toast.success("Assessment approved successfully");
        refresh();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to approve assessment");
    }
    setIsOpen(false);
  };

  const handleReject = async (remarks: string) => {
    try {
      const res = await apiRequest(`/purchases/${purchase?.id}/qa/${assessment?.id}/reject`, "POST", token.access_token, remarks);
      if(res.success) {
        toast.success("Assessment approved successfully");
        refresh();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reject assessment");
    }
    setIsOpen(false);
  };

  // Columns for the item purchases table
  const columnDefinitions: ColDef<ItemPurchase>[] = [
    {
      headerName: "Supplier",
      field: "supplier.name",
      sortable: true,
      filter: true,

    },
    {
      headerName: "Item",
      field: "item.name",
      sortable: true,
      filter: true,

    },
    {
      headerName: "Delivery Date",
      field: "delivery_date",
      sortable: true,
      filter: "agDateColumnFilter",
      valueFormatter: (params) =>
        new Date(params.value).toLocaleDateString() || "N/A",

    },
    {
      headerName: "Quantity",
      field: "quantity",
      sortable: true,
      filter: true,

    },
    {
      headerName: "UOM",
      field: "uom.name",
      sortable: true,
      filter: true,

    },
    {
      headerName: "Warehouse",
      field: "warehouse.name",
      sortable: true,
      filter: true,

    },
    {
      headerName: "Actions",
      field: "id",
      cellRenderer: (params: ICellRendererParams<ItemPurchase>) => {
        const purchase = params.data;
        if (!purchase) return null;

        return (
          <div className="flex items-center gap-2 mt-2">
            {purchase?.assessment && (
              <button
                className="bg-blue-600 hover:bg-blue-700 p-1 rounded text-white text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setDialogState({ currentAction: "viewAssessments", selectedItem: purchase });
                  setIsOpen(true);
                  setAssessment(purchase.assessment);
                  setPurchase(purchase);
                }}
                title="View Assessments"
                aria-label="View Assessments"
              >
                <Icon icon="fe:eye" fontSize={16} />
              </button>
            )}

            {(!purchase?.assessment && canAssess) && (
              <button
              className="bg-teal-600 hover:bg-teal-700 p-1 rounded text-white text-xs"
              onClick={(e) => {
              e.stopPropagation();
              setDialogState({ currentAction: "addAssessment", selectedItem: purchase });
              }}
              title="Add Assessment"
              aria-label="Add Assessment"
              >
                  Record Results
              </button>
            )}

            {!purchase?.assessment && (
                <button
                  className="bg-gray-500 hover:bg-gray-600 p-1 rounded text-white text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDialogState({ currentAction: "edit", selectedItem: purchase });
                  }}
                  title="Edit"
                  aria-label="Edit"
                >
                  <Icon icon="mdi:pencil" fontSize={16} />
                </button>
              )
            }

  <button
    className="bg-red-600 hover:bg-red-700 p-1 rounded text-white text-xs"
    onClick={(e) => {
      e.stopPropagation();
      setDialogState({ currentAction: "delete", selectedItem: purchase });
    }}
    title="Delete"
    aria-label="Delete"
  >
    <Icon icon="mdi:delete-outline" fontSize={16} />
  </button>
          </div>
          
        );
      },
      minWidth: 150,
    },
  ];

  return (
    <div>
          <ToastContainer />
          {dialogState.currentAction === "addAssessment" && (
        <EditAssessmentModal
                  visible={true}
                  onClose={() => setDialogState({ currentAction: "", selectedItem: undefined })}
                  onSave={() => {
                      refresh();
                      setDialogState({ currentAction: "", selectedItem: undefined });
                  } }  purchaseId={dialogState?.selectedItem?.id}        />
      )}
      {dialogState.currentAction === "add" && (
        <AddOrModifyItemPurchase
          visible={true}
          onClose={() => setDialogState({ currentAction: "", selectedItem: undefined })}
          onSave={() => {
            refresh();
            setDialogState({ currentAction: "", selectedItem: undefined });
          }}
        />
      )}

      {dialogState.currentAction === "edit" && dialogState.selectedItem && (
        <AddOrModifyItemPurchase
          visible={true}
          itemPurchase={dialogState.selectedItem}
          onClose={() => setDialogState({ currentAction: "", selectedItem: undefined })}
          onSave={() => {
            refresh();
            setDialogState({ currentAction: "", selectedItem: undefined });
          }}
        />
      )}

      {dialogState.currentAction === "delete" && dialogState.selectedItem && (
        <ConfirmDeleteDialog
          apiPath={`/purchases/itemdelivery/${dialogState.selectedItem.id}/delete`}
          visible={true}
          onClose={() => setDialogState({ currentAction: "", selectedItem: undefined })}
          onConfirm={async () => {
            if (dialogState.selectedItem) {
              // await apiRequest(``, 'DELETE', token.access_token)
              refresh()
            }
            setDialogState({ currentAction: "", selectedItem: undefined });
          }}
          title="Confirm Delete"
          message="Are you sure you want to delete this item purchase?"
        />
      )}

      <BreadCrump name="Item Purchases" pageName="Item Purchase" />

      <div className="bg-white px-8 py-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Item Purchases</h1>

          {
            canAddPurchase && 
            <button
            onClick={() => setDialogState({ currentAction: "add" })}
            className="bg-teal-600 hover:bg-teal-700 px-3 py-2 rounded text-white flex gap-2 items-center text-sm"
          >
            <Icon icon="solar:add-circle-bold" fontSize={18} />
            Add New Purchase
          </button>
          }
        </div>

        <Table
          ref={tableRef}
          columnDefs={columnDefinitions}
          data={purchases}
          pagination
          paginationPageSize={10}
          suppressCellFocus
          domLayout="autoHeight"
          loading={loading}
        />
      </div>
      
      <ViewAssessmentModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        assessment={assessment}
        onApprove={handleApprove}
        purchase={purchase}
        onReject={handleReject}
      />
    </div>
  );
};

export default ItemPurchases;
