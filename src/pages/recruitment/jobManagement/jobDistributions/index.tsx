import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import AddOrModifyJobDistribution from "./AddOrModify";
import useJobDistribution from "../../../../hooks/recruitment/useJobDistribution";
import { RECRUITMENT_ENDPOINTS } from "../../../../api/recruitmentEndpoints";
import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../../components/layout/bread_crump";
import Table from "../../../../components/table";

// Interface
export interface JobDistribution {
  job_order_id: string;
  job_board_id: string;
  distributed_by: string;
  external_reference_id?: string | null;
  status: "pending" | "active";
  posted_at?: string | null;
  removed_at?: string | null;
  distribution_metadata?: string | null;
  notes?: string | null;
}

const JobDistributions: React.FC = () => {
  const { data: distributions, refresh } = useJobDistribution();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selected: JobDistribution | undefined;
    currentAction: "add" | "edit" | "delete" | "";
  }>({ selected: undefined, currentAction: "" });

  const columnDefs: ColDef<JobDistribution>[] = [
    { headerName: "Job Order", field: "job_order.title" },
    { headerName: "Job Board", field: "job_board.name" },
    {
      headerName: "Distributed By",
      valueGetter: (params) =>
        `${params?.data.distributed_by?.first_name ?? ""} ${params?.data.distributed_by?.last_name ?? ""}`,
    },
    { headerName: "External Ref", field: "external_reference_id" },
    { headerName: "Status", field: "status" },
    { headerName: "Posted At", field: "posted_at" },
    { headerName: "Removed At", field: "removed_at" },
    {
      headerName: "Actions",
      field: "job_order_id",
      cellRenderer: (params: ICellRendererParams<JobDistribution>) => (
        <div className="flex gap-2">
          <button
            onClick={() =>
              setDialogState({ selected: params.data, currentAction: "edit" })
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
              setDialogState({ selected: params.data, currentAction: "delete" })
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <AddOrModifyJobDistribution
        visible={dialogState.currentAction === "add" || dialogState.currentAction === "edit"}
        onClose={() => setDialogState({ selected: undefined, currentAction: "" })}
        distribution={dialogState.selected}
        onSave={refresh}
      />
      <ConfirmDeleteDialog
        apiPath={RECRUITMENT_ENDPOINTS.JOB_DISTRIBUTION.DELETE(dialogState.selected?.id ?? "")}
        visible={dialogState.currentAction === "delete"}
        onClose={() => setDialogState({ selected: undefined, currentAction: "" })}
        onConfirm={refresh}
      />
      <BreadCrump name="Job Distributions" pageName="Job Distributions" />
      <div className="bg-white px-8 py-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Job Distributions</h2>
          <button
            className="bg-shade px-3 py-1 text-white rounded flex items-center gap-2"
            onClick={() => setDialogState({ selected: undefined, currentAction: "add" })}
          >
            <Icon icon="solar:add-circle-bold" fontSize={20} />
            Add Distribution
          </button>
        </div>
        <Table columnDefs={columnDefs} data={distributions} ref={tableRef} />
      </div>
    </div>
  );
};

export default JobDistributions;
