// components/services/Services.tsx
import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../components/table";
import BreadCrump from "../../../components/layout/bread_crump";
import { API_ENDPOINTS } from "../../../api/apiEndpoints";
import { ToastContainer } from "react-toastify";
import AddOrModifyItem from "./AddOrModify";
import { Service } from "../../../redux/slices/types/procurement/ProcurementTypes";
import useServices from "../../../hooks/procurement/useServices";


const Services: React.FC = () => {
  const { data, refresh } = useServices();
  const tableRef = useRef<any>(null);
  const [dialogState, setDialogState] = useState<{
    selectedItem: Service | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<Service>[] = [
    { headerName: "Name", field: "name", sortable: true, filter: true },
    { headerName: "Amount", field: "amount", sortable: true, filter: true },
    {
      headerName: "Description",
      field: "description",
      sortable: false,
      filter: false,
      flex: 1,
    },
    {
      headerName: "Actions",
      field: "id",
      cellRenderer: (params: ICellRendererParams<Service>) => (
        <div className="flex items-center gap-2 h-10">
          <button title="Edit">
            <Icon
              onClick={() =>
                setDialogState({
                  currentAction: "edit",
                  selectedItem: params.data,
                })
              }
              icon="solar:pen-line-duotone"
              className="text-blue-500 cursor-pointer"
              fontSize={20}
            />
          </button>
          <button title="Delete">
            <Icon
              onClick={() =>
                setDialogState({
                  currentAction: "delete",
                  selectedItem: params.data,
                })
              }
              icon="solar:trash-bin-trash-bold"
              className="text-red-500 cursor-pointer"
              fontSize={20}
            />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <ToastContainer />
      {dialogState.currentAction !== "" && (
        <AddOrModifyItem
          visible={
            dialogState.currentAction === "add" ||
            (dialogState.currentAction === "edit" && !!dialogState.selectedItem)
          }
          item={dialogState.selectedItem}
          onClose={() =>
            setDialogState({ currentAction: "", selectedItem: undefined })
          }
          onSave={refresh}
        />
      )}

      <ConfirmDeleteDialog
        apiPath={API_ENDPOINTS.SERVICES.DELETE(
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

      <BreadCrump name="Services" pageName="Manage Services" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Services</h1>
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
              Add Service
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

export default Services;
