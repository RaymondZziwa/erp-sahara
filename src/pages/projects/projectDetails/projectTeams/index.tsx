import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../../components/table";

import { PROJECTS_ENDPOINTS } from "../../../../api/projectsEndpoints";

import AddOrModifyItem from "./AddOrModifyItem";

import { ProjectTeamMember } from "../../../../redux/slices/types/projects/Team";
import useProjectTeams from "../../../../hooks/projects/useprojectTeams";

const ProjectTeams: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { data, refresh: fetchData } = useProjectTeams(projectId);
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: ProjectTeamMember | undefined;
    currentAction: "delete" | "edit" | "add" | "" | "view";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<ProjectTeamMember>[] = [
    {
      headerName: "ID",
      field: "id",
      sortable: true,
      filter: true,
    },
    {
      headerName: "User ID",
      field: "user_id",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Role Name",
      field: "project_role.name",
      sortable: true,
      filter: true,
    },

    {
      headerName: "Role Desc",
      field: "project_role.description",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Project",
      field: "project.name",
      sortable: true,
      filter: true,
    },

    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<ProjectTeamMember>) => (
        <div className="flex items-center gap-2">
          <button
            className="bg-shade px-2 py-1 rounded text-white"
            onClick={() =>
              setDialogState({
                ...dialogState,
                currentAction: "edit",
                selectedItem: params.data,
              })
            }
          >
            Edit
          </button>

          <Icon
            onClick={() =>
              setDialogState({
                ...dialogState,
                currentAction: "delete",
                selectedItem: params.data,
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
      {(dialogState.currentAction == "add" ||
        dialogState.currentAction == "edit") && (
        <AddOrModifyItem
          projectId={projectId}
          onSave={fetchData}
          item={dialogState.selectedItem}
          visible={
            dialogState.currentAction == "add" ||
            (dialogState.currentAction == "edit" &&
              !!dialogState.selectedItem?.id)
          }
          onClose={() =>
            setDialogState({ currentAction: "", selectedItem: undefined })
          }
        />
      )}

      {dialogState.selectedItem && (
        <ConfirmDeleteDialog
          apiPath={PROJECTS_ENDPOINTS.PROJECT_TEAMS.DELETE(
            projectId,
            dialogState.selectedItem?.id.toString()
          )}
          onClose={() =>
            setDialogState({ selectedItem: undefined, currentAction: "" })
          }
          visible={
            !!dialogState.selectedItem?.id &&
            dialogState.currentAction === "delete"
          }
          onConfirm={() => fetchData()}
        />
      )}

      <div className="bg-white rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Project Teams Table</h1>
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
              Add Team
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
        <Table columnDefs={columnDefinitions} data={data} ref={tableRef} />
      </div>
    </div>
  );
};

export default ProjectTeams;
