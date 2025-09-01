import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import AddOrModifyItem from "./AddOrModify";
import Table from "../../../../components/table";
import { RECRUITMENT_ENDPOINTS } from "../../../../api/recruitmentEndpoints";
import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../../components/layout/bread_crump";
import useApplicant from "../../../../hooks/recruitment/useApplicants";
import { JobApplication } from "../../../../redux/slices/types/recruitment/types";

const Applicants: React.FC = () => {
  const { data: JobApplications, refresh } = useApplicant();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedApplication: JobApplication | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedApplication: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<JobApplication>[] = [
    {
      headerName: "Job Order",
      field: "job_order.title", // Make sure job_order is populated in useApplicant
      valueGetter: (params) => params.data?.job_order?.title || "—",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Candidate",
      field: "candidate.full_name", // Make sure candidate is populated
      valueGetter: (params) => params.data?.candidate?.user?.full_name || "—",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Source",
      field: "source",
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
      headerName: "Rating",
      field: "rating",
      valueGetter: (params) => params.data?.rating?.toString() ?? "—",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Active",
      field: "is_active",
      valueGetter: (params) => (params.data?.is_active ? "Yes" : "No"),
      sortable: true,
      filter: true,
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<JobApplication>) => (
        <div className="flex items-center gap-2">
          <button
            className="bg-shade px-2 py-1 rounded text-white"
            onClick={() =>
              setDialogState({
                currentAction: "edit",
                selectedApplication: params.data,
              })
            }
          >
            Edit
          </button>
          <Icon
            onClick={() =>
              setDialogState({
                currentAction: "delete",
                selectedApplication: params.data,
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
        item={dialogState.selectedApplication}
        visible={
          dialogState.currentAction === "add" ||
          (dialogState.currentAction === "edit" && !!dialogState.selectedApplication?.id)
        }
        onClose={() =>
          setDialogState({ currentAction: "", selectedApplication: undefined })
        }
      />

      <ConfirmDeleteDialog
        apiPath={RECRUITMENT_ENDPOINTS.APPLICANTS.DELETE(
          dialogState.selectedApplication?.id?.toString() ?? ""
        )}
        onClose={() =>
          setDialogState({ selectedApplication: undefined, currentAction: "" })
        }
        visible={
          !!dialogState.selectedApplication?.id && dialogState.currentAction === "delete"
        }
        onConfirm={refresh}
      />

      <BreadCrump name="Job Applications" pageName="Job Application" />

      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-xl font-bold">Job Applications</h1>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setDialogState({
                  selectedApplication: undefined,
                  currentAction: "add",
                })
              }
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
            >
              <Icon icon="solar:add-circle-bold" fontSize={20} />
              Add Application
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

        <Table columnDefs={columnDefinitions} data={JobApplications} ref={tableRef} />
      </div>
    </div>
  );
};

export default Applicants;
