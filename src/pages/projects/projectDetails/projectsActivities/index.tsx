import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import AddOrModifyItem from "./AddOrModifyItem";
import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../../components/table";

import { PROJECTS_ENDPOINTS } from "../../../../api/projectsEndpoints";

import { formatCurrency } from "../../../../utils/formatCurrency";

import useProjectActivities from "../../../../hooks/projects/useProjectActivities";
import { Activity } from "../../../../redux/slices/types/projects/Activity";
import ActivityTabsView from "./ActivityTabsView";

const ProjectsActivities: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { data, refresh: fetchData } = useProjectActivities(projectId);
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: Activity | undefined;
    currentAction: "delete" | "edit" | "add" | "" | "view";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<Activity>[] = [
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
      headerName: "Methodology",
      field: "activity_methodology",
      sortable: true,
      filter: true,
      width: 150,
    },
    {
      headerName: "Desc",
      field: "description",
      sortable: true,
      filter: true,
      width: 150,
    },
    {
      headerName: "Priority",
      field: "prioty",
      sortable: true,
      filter: true,
      width: 120,
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      filter: true,
      width: 130,
    },
    {
      headerName: "Cost",
      field: "cost",
      sortable: true,
      filter: true,
      width: 150,
      valueFormatter: (params) => formatCurrency(params.value), // Format as currency if required
    },
    {
      headerName: "Objectives",
      field: "objectives",
      sortable: true,
      filter: true,
      width: 200,
    },
    {
      headerName: "Start Date",
      field: "start_date",
      sortable: true,
      filter: true,
      width: 150,
    },
    {
      headerName: "End Date",
      field: "end_date",
      sortable: true,
      filter: true,
      width: 150,
    },

    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<Activity>) => (
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
          onSave={() => fetchData(projectId)}
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
      {dialogState.currentAction == "view" && dialogState.selectedItem && (
        <ActivityTabsView
          projectId={projectId}
          activityId={dialogState.selectedItem?.id.toString()}
          onClose={() =>
            setDialogState({ currentAction: "", selectedItem: undefined })
          }
          isOpen={
            dialogState.currentAction == "view" &&
            !!dialogState.selectedItem?.id
          }
        />
      )}
      {dialogState.selectedItem && (
        <ConfirmDeleteDialog
          apiPath={PROJECTS_ENDPOINTS.PROJECT_ACTIVITIES.DELETE(
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
          onConfirm={() => fetchData(projectId)}
        />
      )}
      <div className="bg-white rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Project Activities Table</h1>
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
              Add Activity
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

export default ProjectsActivities;
