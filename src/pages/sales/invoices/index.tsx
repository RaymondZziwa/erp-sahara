import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../components/layout/bread_crump";
import Table from "../../../components/table";
import useInvoices from "../../../hooks/sales/useInvoices";
import { SALES_ENDPOINTS } from "../../../api/salesEndpoints";
import { ToastContainer } from "react-toastify";
import { Invoice } from "../../../redux/slices/types/sales/invoice";
import AddOrModifyItem from "./AddorModify";

const Invoices: React.FC = () => {
  const { data: invoices, refresh } = useInvoices();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: Invoice | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<Invoice>[] = [
    {
      headerName: "Invoice ID",
      field: "id",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Issue Date",
      field: "issue_date",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Due Date",
      field: "due_date",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Subtotal",
      field: "subtotal",
      sortable: true,
      filter: true,
      valueFormatter: ({ value }) => `UGX ${value?.toLocaleString()}`,
    },
    {
      headerName: "Total",
      field: "total_amount",
      sortable: true,
      filter: true,
      valueFormatter: ({ value }) => `UGX ${value?.toLocaleString()}`,
    },
    {
      headerName: "Paid",
      field: "amount_paid",
      sortable: true,
      filter: true,
      valueFormatter: ({ value }) => `UGX ${value?.toLocaleString()}`,
    },
    {
      headerName: "Actions",
      field: "id",
      cellRenderer: (params: ICellRendererParams<Invoice>) => (
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
          apiPath={SALES_ENDPOINTS.INVOICES.DELETE(dialogState.selectedItem.id)}
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
      <BreadCrump name="Sales" pageName="Invoices" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Invoices</h1>
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
              Add Invoice
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
        <Table columnDefs={columnDefinitions} data={invoices} ref={tableRef} />
      </div>
    </div>
  );
};

export default Invoices;
