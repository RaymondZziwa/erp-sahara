import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import Table from "../../../../components/table";
import { RECRUITMENT_ENDPOINTS } from "../../../../api/recruitmentEndpoints";
import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../../components/layout/bread_crump";
import useInterview from "../../../../hooks/recruitment/useInterview";
import AddOrModify from "./AddOrModify";

export interface Interview {
  id: string;
  application_id: string;
  interviewer_id: string;
  type: string;
  status: string;
  scheduled_at: string;
  duration: number;
  location?: string;
  notes?: string;
  feedback?: {
    technical_skills: number;
    communication: number;
    comments: string;
  };
  participants: {
    employee_id: string;
    is_required: boolean;
    response_status?: string;
  }[];
}

const Interviews: React.FC = () => {
  const { data: interviews, refresh } = useInterview();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedInterview: Interview | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedInterview: undefined, currentAction: "" });

  const columnDefinitions: ColDef<Interview>[] = [
    {
      headerName: "Applicant",
      field: "type",
      sortable: true,
      filter: true,
      cellRenderer: (params) => params?.data?.application?.candidate?.user?.full_name || "-",
    },
    {
      headerName: "Interviewed By",
      field: "type",
      sortable: true,
      filter: true,
      cellRenderer: (params) => `${params?.data?.interviewer?.first_name} ${params?.data?.interviewer?.last_name}` || "-",
    },
    {
      headerName: "Type",
      field: "type",
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
      headerName: "Scheduled At",
      field: "scheduled_at",
      sortable: true,
      filter: true,
      cellRenderer: (params) => new Date(params.value).toLocaleString(),
    },
    {
      headerName: "Duration (mins)",
      field: "duration",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Location",
      field: "location",
      cellRenderer: (params) => params.value || "-",
    },
    
    {
      headerName: "Actions",
      field: "id",
      cellRenderer: (params: ICellRendererParams<Interview>) => (
        <div className="flex items-center gap-2">
          <button
            className="bg-shade px-2 py-1 rounded text-white"
            onClick={() =>
              setDialogState({
                currentAction: "edit",
                selectedInterview: params.data,
              })
            }
          >
            Edit
          </button>
          <Icon
            onClick={() =>
              setDialogState({
                currentAction: "delete",
                selectedInterview: params.data,
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
      <AddOrModify
        onSave={refresh}
        item={dialogState.selectedInterview}
        visible={
          dialogState.currentAction === "add" ||
          (dialogState.currentAction === "edit" && !!dialogState.selectedInterview?.id)
        }
        onClose={() =>
          setDialogState({ currentAction: "", selectedInterview: undefined })
        }
      />
      <ConfirmDeleteDialog
        apiPath={RECRUITMENT_ENDPOINTS.INTERVIEWS.DELETE(
          dialogState.selectedInterview?.id ?? ""
        )}
        onClose={() =>
          setDialogState({ selectedInterview: undefined, currentAction: "" })
        }
        visible={
          !!dialogState.selectedInterview?.id &&
          dialogState.currentAction === "delete"
        }
        onConfirm={refresh}
      />
      <BreadCrump name="Interviews" pageName="Interviews" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold py-2">Interviews</h1>
          <button
            onClick={() =>
              setDialogState({ selectedInterview: undefined, currentAction: "add" })
            }
            className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
          >
            <Icon icon="solar:add-circle-bold" fontSize={20} />
            Schedule Interview
          </button>
        </div>
        <Table columnDefs={columnDefinitions} data={interviews} ref={tableRef} />
      </div>
    </div>
  );
};

export default Interviews;