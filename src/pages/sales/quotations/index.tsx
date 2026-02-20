import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../components/table";
import BreadCrump from "../../../components/layout/bread_crump";
import AddOrModifyItem from "./AddOrModifyItem";
import useQuotations from "../../../hooks/sales/useQuotations";
import { Quotation } from "../../../redux/slices/types/sales/Quotation";
import { ToastContainer } from "react-toastify";
import { SALES_ENDPOINTS } from "../../../api/salesEndpoints";

const Quotations: React.FC = () => {
  const { data, refresh } = useQuotations();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: Quotation | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<Quotation>[] = [
    {
      headerName: "Customer",
      field: "title",
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams<Quotation>) => (
             <div>{params.data?.customer?.first_name} {params.data?.customer?.last_name}</div>
       ),
    },
    {
      headerName: "Issue Date",
      field: "issue_date",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Expiry Date",
      field: "expiry_date",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Quotation Number",
      field: "quotation_number",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      filter: true,
    },
    // {
    //   headerName: "Items",
    //   field: "id",
    //   sortable: true,
    //   filter: true,

    //   cellRenderer: (params: ICellRendererParams<Quotation>) => (
    //     <div>{params.data?.quotation_items.length}</div>
    //   ),
    // },

    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<Quotation>) => (
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
          {/* <Icon
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
          /> */}
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
        apiPath={SALES_ENDPOINTS.QUOTES.DELETE(
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
      <BreadCrump name="Qotations" pageName="Quotations" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold text-nowrap mr-2">
              Quotations
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
                Add Quotation
              </span>
            </button>
            {/* <button
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
              onClick={handleExportPDF}
            >
              <Icon icon="solar:printer-bold" fontSize={20} />
              Print
            </button> */}
          </div>
        </div>
        <Table columnDefs={columnDefinitions} data={data} ref={tableRef} />
      </div>
    </div>
  );
};

export default Quotations;
