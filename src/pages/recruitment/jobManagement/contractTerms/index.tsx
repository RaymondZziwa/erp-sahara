import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import Table from "../../../../components/table";
import BreadCrump from "../../../../components/layout/bread_crump";
import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import useContractTerms from "../../../../hooks/recruitment/useContractTerms";
import AddOrModifyContractTerms from "./AddOrModify";
import { RECRUITMENT_ENDPOINTS } from "../../../../api/recruitmentEndpoints";

interface ContractTerm {
  job_order_id: string;
  company_id: string;
  title: string;
  type: "direct-hire" | "contract" | "temp-to-perm" | "master";
  start_date: string;
  end_date: string;
  terms?: string | null;
  payment_terms?: string | null;
  termination_terms?: string | null;
  status: "draft" | "active" | "expired" | "terminated";
  signed_date: string;
  signed_by: string;
  document_path?: string | null;
}

const ContractTerms: React.FC = () => {
  const { data: terms, refresh } = useContractTerms();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedTerm: ContractTerm | undefined;
    currentAction: "add" | "edit" | "delete" | "";
  }>({ selectedTerm: undefined, currentAction: "" });

  const columnDefs: ColDef<ContractTerm>[] = [
    { headerName: "Title", field: "title" },
    { headerName: "Type", field: "type" },
    { headerName: "Start Date", field: "start_date" },
    { headerName: "End Date", field: "end_date" },
    { headerName: "Status", field: "status" },
    { headerName: "Signed Date", field: "signed_date" },
    {
      headerName: "Actions",
      field: "job_order_id",
      cellRenderer: (params: ICellRendererParams<ContractTerm>) => (
        <div className="flex gap-2">
          <button
            onClick={() =>
              setDialogState({ selectedTerm: params.data, currentAction: "edit" })
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
              setDialogState({ selectedTerm: params.data, currentAction: "delete" })
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <AddOrModifyContractTerms
        visible={dialogState.currentAction === "add" || dialogState.currentAction === "edit"}
        onClose={() => setDialogState({ selectedTerm: undefined, currentAction: "" })}
        contract={dialogState.selectedTerm}
        onSave={refresh}
      />
      <ConfirmDeleteDialog
        apiPath={RECRUITMENT_ENDPOINTS.CONTRACT_TERMS.DELETE(dialogState.selectedTerm?.id ?? "")}
        visible={dialogState.currentAction === "delete"}
        onClose={() => setDialogState({ selectedTerm: undefined, currentAction: "" })}
        onConfirm={refresh}
      />
      <BreadCrump name="Contract Terms" pageName="Contract Terms" />
      <div className="bg-white px-8 py-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Contract Terms</h2>
          <button
            className="bg-shade px-3 py-1 text-white rounded flex items-center gap-2"
            onClick={() => setDialogState({ selectedTerm: undefined, currentAction: "add" })}
          >
            <Icon icon="solar:add-circle-bold" fontSize={20} />
            Add Contract Term
          </button>
        </div>
        <Table columnDefs={columnDefs} data={terms} ref={tableRef} />
      </div>
    </div>
  );
};

export default ContractTerms;
