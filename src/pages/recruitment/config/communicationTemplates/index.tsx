import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../../components/table";
import BreadCrump from "../../../../components/layout/bread_crump";
import AddOrModifyItem from "./AddOrModify";
import { RECRUITMENT_ENDPOINTS } from "../../../../api/recruitmentEndpoints";
import { CommunicationTemplate } from "../../../../redux/slices/types/recruitment/types";
import useCommunicationTemplates from "../../../../hooks/recruitment/useCommunicationTemplates";

const CommunicationTemplates: React.FC = () => {
  const { data: templates, refresh } = useCommunicationTemplates();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selected: CommunicationTemplate | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selected: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<CommunicationTemplate>[] = [
    { headerName: "Name", field: "name", sortable: true, filter: true },
    { headerName: "Subject", field: "subject", sortable: true, filter: true },
    // {
    //   headerName: "Variables",
    //   field: "variables",
    //   cellRenderer: (params) => (params.data.variables || []).join(", "),
    // },
    {
      headerName: "System Template",
      field: "is_system",
      cellRenderer: (params) => (params.data.is_system ? "Yes" : "No"),
    },
    {
      headerName: "Actions",
      field: "id",
      cellRenderer: (params: ICellRendererParams<CommunicationTemplate>) => (
        <div className="flex items-center gap-2">
          <button
            className="bg-shade px-2 py-1 rounded text-white"
            onClick={() =>
              setDialogState({
                currentAction: "edit",
                selected: params.data,
              })
            }
          >
            Edit
          </button>
          <Icon
            onClick={() =>
              setDialogState({
                currentAction: "delete",
                selected: params.data,
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
      <AddOrModifyItem
        item={dialogState.selected}
        visible={
          dialogState.currentAction === "add" ||
          (dialogState.currentAction === "edit" && !!dialogState.selected?.id)
        }
        onSave={refresh}
        onClose={() =>
          setDialogState({ selected: undefined, currentAction: "" })
        }
      />

      <ConfirmDeleteDialog
        apiPath={
          RECRUITMENT_ENDPOINTS.COMMUNICATION_TEMPLATES.DELETE(
            dialogState.selected?.id ?? ""
          )
        }
        visible={
          !!dialogState.selected?.id && dialogState.currentAction === "delete"
        }
        onConfirm={refresh}
        onClose={() =>
          setDialogState({ selected: undefined, currentAction: "" })
        }
      />

      <BreadCrump name="Communication Templates" pageName="Communication Templates" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Communication Templates</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setDialogState({ selected: undefined, currentAction: "add" })
              }
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
            >
              <Icon icon="solar:add-circle-bold" fontSize={20} />
              Add Template
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
        <Table columnDefs={columnDefinitions} data={templates} ref={tableRef} />
      </div>
    </div>
  );
};

export default CommunicationTemplates;
