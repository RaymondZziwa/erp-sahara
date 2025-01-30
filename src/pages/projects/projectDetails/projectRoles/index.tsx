import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../../components/table";

import { PROJECTS_ENDPOINTS } from "../../../../api/projectsEndpoints";

import AddOrModifyItem from "./AddOrModifyItem";
import { ProjectRole } from "../../../../redux/slices/types/projects/ProjectRole";
import useProjectRoles from "../../../../hooks/projects/useProjectRoles";

const ProjectsRoles: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { data, refresh: fetchData } = useProjectRoles(projectId);
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: ProjectRole | undefined;
    currentAction: "delete" | "edit" | "add" | "" | "view";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<ProjectRole>[] = [
    {
      headerName: "ID",
      field: "id",
      sortable: true,
      filter: true,
      width: 100,
    },
    {
      headerName: "Name",
      field: "name",
      sortable: true,
      filter: true,
      width: 200,
    },
    {
      headerName: "Desc",
      field: "name",
      sortable: true,
      filter: true,
      width: 200,
    },

    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<ProjectRole>) => (
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
          <button
            className="bg-shade px-2 py-1 rounded text-white"
            onClick={() =>
              setDialogState({
                ...dialogState,
                currentAction: "view",
                selectedItem: params.data,
              })
            }
          >
            Details
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
          apiPath={PROJECTS_ENDPOINTS.ROLES.DELETE(
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
            <h1 className="text-xl font-bold">Project Roles Table</h1>
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
              Add Role
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

export default ProjectsRoles;
