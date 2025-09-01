import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import Table from "../../../../components/table";
import AddOrModifyJobOrder from "./AddOrModify";
import { RECRUITMENT_ENDPOINTS } from "../../../../api/recruitmentEndpoints";
import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../../components/layout/bread_crump";
import useJobOrder from "../../../../hooks/recruitment/useJobOrder";

// Interface
export interface JobPosting {
  company_id: string;
  manager_id: string;
  title: string;
  job_reference: string;
  description: string;
  requirements: string;
  employment_type: "full-time" | "part-time" | "contract" | "internship";
  priority: "low" | "medium" | "high";
  status: "open" | "closed" | "paused";
  positions: number;
  positions_filled: number;
  start_date: string;
  end_date: string;
  deadline: string;
  location_type: "onsite" | "remote" | "hybrid";
  location_details: string;
}

const JobOrders: React.FC = () => {
  const { data: jobOrders, refresh } = useJobOrder();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedJob: JobPosting | undefined;
    currentAction: "add" | "edit" | "delete" | "";
  }>({ selectedJob: undefined, currentAction: "" });

  const columnDefs: ColDef<JobPosting>[] = [
    { headerName: "Title", field: "title" },
    { headerName: "Job Ref", field: "job_order_no" },
    { headerName: "Type", field: "employment_type" },
    { headerName: "Priority", field: "priority" },
    { headerName: "Status", field: "status" },
    { headerName: "Positions", field: "positions" },
    { headerName: "Filled", field: "positions_filled" },
    { headerName: "Start Date", field: "start_date" },
    { headerName: "Deadline", field: "deadline" },
    {
      headerName: "Actions",
      field: "job_reference",
      cellRenderer: (params: ICellRendererParams<JobPosting>) => (
        <div className="flex gap-2">
          <button
            onClick={() =>
              setDialogState({ selectedJob: params.data, currentAction: "edit" })
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
              setDialogState({ selectedJob: params.data, currentAction: "delete" })
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <AddOrModifyJobOrder
        visible={dialogState.currentAction === "add" || dialogState.currentAction === "edit"}
        onClose={() => setDialogState({ selectedJob: undefined, currentAction: "" })}
        item={dialogState.selectedJob}
        onSave={refresh}
      />
      <ConfirmDeleteDialog
        apiPath={RECRUITMENT_ENDPOINTS.JOB_ORDERS.DELETE(dialogState.selectedJob?.id ?? "")}
        visible={dialogState.currentAction === "delete"}
        onClose={() => setDialogState({ selectedJob: undefined, currentAction: "" })}
        onConfirm={refresh}
      />
      <BreadCrump name="Job Orders" pageName="Job Orders" />
      <div className="bg-white px-8 py-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Job Orders</h2>
          <button
            className="bg-shade px-3 py-1 text-white rounded flex items-center gap-2"
            onClick={() => setDialogState({ selectedJob: undefined, currentAction: "add" })}
          >
            <Icon icon="solar:add-circle-bold" fontSize={20} />
            Add Job Order
          </button>
        </div>
        <Table columnDefs={columnDefs} data={jobOrders} ref={tableRef} />
      </div>
    </div>
  );
};

export default JobOrders;
