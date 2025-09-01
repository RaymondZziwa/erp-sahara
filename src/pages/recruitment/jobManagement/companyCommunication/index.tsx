import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import Table from "../../../../components/table";
import BreadCrump from "../../../../components/layout/bread_crump";
import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import { RECRUITMENT_ENDPOINTS } from "../../../../api/recruitmentEndpoints";
import AddOrModifyCompanyCommunication from "./AddOrModify";
import useCompanyCommunication from "../../../../hooks/recruitment/useCompanyCommunication";

interface CompanyInteraction {
  company_id: string;
  company_contact_id?: string | null;
  job_order_id?: string | null;
  initiated_by?: string | null;
  type: "email" | "call" | "meeting" | "note" | "document";
  subject: string;
  content: string;
  direction: "inbound" | "outbound";
  date_time: string;
  needs_follow_up: boolean;
  follow_up_date?: string;
  follow_up_notes?: string;
  metadata?: string;
  id?: string; // Needed for delete/edit operations
}

const CompanyCommunications: React.FC = () => {
  const { data: communications, refresh } = useCompanyCommunication();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedComm: CompanyInteraction | undefined;
    currentAction: "add" | "edit" | "delete" | "";
  }>({ selectedComm: undefined, currentAction: "" });

  const columnDefs: ColDef<CompanyInteraction>[] = [
    { headerName: "Type", field: "type" },
    { headerName: "Subject", field: "subject" },
    { headerName: "Direction", field: "direction" },
    { headerName: "Date", field: "date_time" },
    { headerName: "Follow Up", field: "needs_follow_up", valueFormatter: p => (p.value ? "Yes" : "No") },
    {
      headerName: "Actions",
      field: "id",
      cellRenderer: (params: ICellRendererParams<CompanyInteraction>) => (
        <div className="flex gap-2">
          <button
            onClick={() =>
              setDialogState({ selectedComm: params.data, currentAction: "edit" })
            }
            className="bg-shade px-2 py-1 text-white rounded"
          >
            Edit
          </button>
          <Icon
            icon="solar:trash-bin-trash-bold"
            fontSize={20}
            className="text-red-500 cursor-pointer mt-3"
            onClick={() =>
              setDialogState({ selectedComm: params.data, currentAction: "delete" })
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <AddOrModifyCompanyCommunication
        visible={dialogState.currentAction === "add" || dialogState.currentAction === "edit"}
        onClose={() => setDialogState({ selectedComm: undefined, currentAction: "" })}
        interaction={dialogState.selectedComm}
        onSave={refresh}
      />
      <ConfirmDeleteDialog
        apiPath={RECRUITMENT_ENDPOINTS.COMPANY_COMMUNICATIONS.DELETE(dialogState.selectedComm?.id ?? "")}
        visible={dialogState.currentAction === "delete"}
        onClose={() => setDialogState({ selectedComm: undefined, currentAction: "" })}
        onConfirm={refresh}
      />
      <BreadCrump name="Company Communications" pageName="Company Communications" />
      <div className="bg-white px-8 py-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Company Communications</h2>
          <button
            className="bg-shade px-3 py-1 text-white rounded flex items-center gap-2"
            onClick={() => setDialogState({ selectedComm: undefined, currentAction: "add" })}
          >
            <Icon icon="solar:add-circle-bold" fontSize={20} />
            Add Communication
          </button>
        </div>
        <Table columnDefs={columnDefs} data={communications} ref={tableRef} />
      </div>
    </div>
  );
};

export default CompanyCommunications;
