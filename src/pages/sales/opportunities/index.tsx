import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import { ToastContainer } from "react-toastify";
import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../components/table";
import BreadCrump from "../../../components/layout/bread_crump";

import useOpportunities from "../../../hooks/sales/useOpportunities";
import { SALES_ENDPOINTS } from "../../../api/salesEndpoints";
import { Opportunity } from "../../../redux/slices/types/sales/Opportunities";
import AddOrModifyOpportunity from "./AddOrModify";
const Opportunities: React.FC = () => {
  const { data: opportunities, refresh } = useOpportunities();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedOpportunity: Opportunity & { id?: number | string } | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedOpportunity: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<Opportunity>[] = [
    { headerName: "Title", field: "title", sortable: true, filter: true },
    { headerName: "Stage", field: "stage", sortable: true, filter: true },
    { headerName: "Value", field: "value", sortable: true, filter: true },
    {
      headerName: "Expected Close",
      field: "expected_close_date",
      sortable: true,
      filter: true,
      valueFormatter: (params) => params.value || "—",
    },
    {
      headerName: "Assigned To",
      field: "assigned_to",
      sortable: true,
      filter: true,
      valueFormatter: (params) => `${params.data?.assigned_to.first_name} ${params.data?.assigned_to.last_name}` || "—",
    },
    {
      headerName: "Actions",
      field: "id",
      cellRenderer: (params: ICellRendererParams<Opportunity>) => (
        <div className="flex items-center gap-2">
          <button
            className="bg-shade px-2 h-10 rounded text-white"
            onClick={() =>
              setDialogState({
                currentAction: "edit",
                selectedOpportunity: params.data,
              })
            }
          >
            Edit
          </button>
          <Icon
            onClick={() =>
              setDialogState({
                currentAction: "delete",
                selectedOpportunity: params.data,
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
      <AddOrModifyOpportunity
        visible={
          dialogState.currentAction === "add" ||
          (dialogState.currentAction === "edit" && !!dialogState.selectedOpportunity)
        }
        opportunity={dialogState.selectedOpportunity}
        onClose={() =>
          setDialogState({ selectedOpportunity: undefined, currentAction: "" })
        }
        onSave={refresh}
      />
      <ConfirmDeleteDialog
        apiPath={SALES_ENDPOINTS.OPPORTUNITIES.DELETE(
          dialogState.selectedOpportunity?.id?.toString() ?? ""
        )}
        visible={
          !!dialogState.selectedOpportunity?.id &&
          dialogState.currentAction === "delete"
        }
        onClose={() =>
          setDialogState({ selectedOpportunity: undefined, currentAction: "" })
        }
        onConfirm={refresh}
      />
      <BreadCrump name="Opportunities" pageName="Opportunities" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold py-2">Opportunities</h1>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setDialogState({
                  currentAction: "add",
                  selectedOpportunity: undefined,
                })
              }
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
            >
              <Icon icon="solar:add-circle-bold" fontSize={20} />
              Add Opportunity
            </button>
          </div>
        </div>
        <Table
          ref={tableRef}
          columnDefs={columnDefinitions}
          data={opportunities}
        />
      </div>
    </div>
  );
};

export default Opportunities;
