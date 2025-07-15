import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import AddOrModifyItem from "./AddOrModify";
import Table from "../../../../components/table";
import { RECRUITMENT_ENDPOINTS } from "../../../../api/recruitmentEndpoints";
import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../../components/layout/bread_crump";
import useCandidates from "../../../../hooks/recruitment/useCandidates";


interface CandidateSkill {
  skill_id: string;
  proficiency_level: string;
  years_experience?: number | null;
  last_used?: string | null;
  is_primary: boolean;
}

interface CandidateQualification {
  institution: string;
  award: string;
  field_of_study: string;
  start_date?: string | null;
  end_date?: string | null;
  is_completed: boolean;
  attachment?: string | null;
}

export interface Candidate {
  id: string;
  salutation: string;
  first_name: string;
  last_name: string;
  other_name?: string | null;
  email: string;
  phone: string;
  gender: string;
  current_job_title?: string | null;
  skills: CandidateSkill[];
  qualifications: CandidateQualification[];
  // add other candidate fields as needed
}

const Candidates: React.FC = () => {
  const { data: candidates, refresh } = useCandidates();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedCandidate: Candidate | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedCandidate: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<Candidate>[] = [
    {
      headerName: "Name",
      field: "user.full_name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Email",
      field: "user.email",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Phone",
      field: "phone",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Salary Expectation",
      field: "salary_expectations",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Years Of Experience",
      field: "years_experience",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Current Job Title",
      field: "current_job_title",
      sortable: true,
      filter: true,
      cellRenderer: (params) => params.data.current_job_title || "-",
    },
    {
      headerName: "Primary Skills",
      field: "skills",
      cellRenderer: (params) => {
        const primarySkills = params.data.skills
          .filter((s) => s.is_primary)
          .map((s) => s.skill_id)
          .join(", ");
        return primarySkills || "-";
      },
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<Candidate>) => (
        <div className="flex items-center gap-2">
          <button
            className="bg-shade px-2 py-1 rounded text-white"
            onClick={() => {
              console.log("Edit candidate", params.data);
              setDialogState({
                ...dialogState,
                currentAction: "edit",
                selectedCandidate: params.data,
              })
            }
            }
          >
            Edit
          </button>
          <Icon
            onClick={() =>
              setDialogState({
                ...dialogState,
                currentAction: "delete",
                selectedCandidate: params.data,
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
        onSave={refresh}
        item={dialogState.selectedCandidate}
        visible={
          dialogState.currentAction === "add" ||
          (dialogState.currentAction === "edit" && !!dialogState.selectedCandidate?.id)
        }
        onClose={() =>
          setDialogState({ currentAction: "", selectedCandidate: undefined })
        }
      />
      <ConfirmDeleteDialog
        apiPath={RECRUITMENT_ENDPOINTS.CANDIDATES.DELETE(
          dialogState.selectedCandidate?.id?.toString() ?? ""
        )}
        onClose={() =>
          setDialogState({ selectedCandidate: undefined, currentAction: "" })
        }
        visible={
          !!dialogState.selectedCandidate?.id && dialogState.currentAction === "delete"
        }
        onConfirm={refresh}
      />
      <BreadCrump name="Candidates" pageName="Candidates" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Candidates</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setDialogState({
                  selectedCandidate: undefined,
                  currentAction: "add",
                })
              }
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
            >
              <Icon icon="solar:add-circle-bold" fontSize={20} />
              Add Candidate
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
        <Table columnDefs={columnDefinitions} data={candidates} ref={tableRef} />
      </div>
    </div>
  );
};

export default Candidates;
