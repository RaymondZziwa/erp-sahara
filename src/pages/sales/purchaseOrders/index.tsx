import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../components/table";
import BreadCrump from "../../../components/layout/bread_crump";
import AddOrModifyItem from "./AddOrModifyItem";

import { API_ENDPOINTS } from "../../../api/apiEndpoints";

import { CustomerOrder } from "../../../redux/slices/types/sales/CustomerOrder";
import useCustomerOrders from "../../../hooks/sales/useCustomerOrders";

const CustomerOrders: React.FC = () => {
  const { data, refresh } = useCustomerOrders();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: CustomerOrder | undefined;
    currentAction: "delete" | "edit" | "add" | "review" | "approve" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<CustomerOrder>[] = [
    {
      headerName: "ID",
      field: "id",
      sortable: true,
      filter: true,
      width: 100,
    },
    {
      headerName: "Name",
      field: "customer.organization_name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Order no",
      field: "customer_order_no",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Currency",
      field: "currency.name",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Total amount",
      field: "total_amount",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Tracking number",
      field: "tracking_number",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Quotation No",
      field: "quotation.qoutation_no",
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
      cellRenderer: (params: ICellRendererParams<CustomerOrder>) => (
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

      <BreadCrump name="Customer Orders" pageName="Items" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Customer Orders Table</h1>
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
              Add Order
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

export default CustomerOrders;
