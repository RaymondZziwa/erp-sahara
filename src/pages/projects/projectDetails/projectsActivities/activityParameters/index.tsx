import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column, ColumnProps } from "primereact/column";
import { Button } from "primereact/button";
import AddOrModifyItem from "./AddOrModifyItem";
import { ProjectActivityParameter } from "../../../../../redux/slices/types/projects/ProjectParameter";
import useProjectActivityParameters from "../../../../../hooks/projects/useProjectActivityParameters";
import { formatDate } from "../../../../../utils/dateUtils";
import ActivityPrameterResults from "../activityParameterResults";

const ActivityPrameters = ({
  projectId,
  activityId,
}: {
  projectId: string;
  activityId: string;
}) => {
  const {
    data: activityPlans,
    refresh,
    loading,
  } = useProjectActivityParameters(projectId, activityId);

  const [dialogState, setDialogState] = useState<{
    selectedItem: ProjectActivityParameter | undefined;
    currentAction: "delete" | "edit" | "add" | "" | "view";
  }>({ selectedItem: undefined, currentAction: "" });

  const columns: ColumnProps[] = [
    { field: "id", header: "ID", sortable: true, filter: true },
    { field: "name", header: "Parameter Name", sortable: true, filter: true },
    {
      field: "description",
      header: "Description",
      sortable: false,
      filter: true,
    },
    {
      field: "unit_of_measure_id",
      header: "Unit of Measure",
      sortable: true,
      filter: true,
    },
    {
      field: "created_at",
      header: "Created At",
      body: (data: ProjectActivityParameter) => (
        <div>{data.created_at ? formatDate(data.created_at) : ""}</div>
      ),
      sortable: true,
      filter: false,
    },

    {
      field: "activity.name",
      header: "Activity Name",
      sortable: true,
      filter: true,
    },
    {
      field: "activity.project.name",
      header: "Project Name",
      sortable: false,
      filter: true,
    },
    {
      field: "activity.project.location",
      header: "Location",
      sortable: false,
      filter: true,
    },
    {
      field: "activity.prioty",
      header: "Priority",
      sortable: false,
      filter: true,
    },
    {
      field: "activity.status",
      header: "Status",
      sortable: false,
      filter: true,
    },
    {
      field: "activity.start_date",
      header: "Activity Start Date",
      sortable: true,
      filter: true,
      body: (data: ProjectActivityParameter) => (
        <div>
          {data.activity.start_date ? formatDate(data.activity.start_date) : ""}
        </div>
      ),
    },
    {
      field: "activity.end_date",
      header: "Activity End Date",
      sortable: true,
      filter: true,
      body: (data: ProjectActivityParameter) => (
        <div>
          {data.activity.end_date ? formatDate(data.activity.end_date) : ""}
        </div>
      ),
    },
    {
      field: "id",
      header: "Actions",

      body: (data: ProjectActivityParameter) => (
        <div className="flex gap-1 h-max">
          <Button
            size="small"
            onClick={() =>
              setDialogState({ currentAction: "add", selectedItem: data })
            }
            icon="pi pi-pen-to-square"
            label=""
            severity="info"
          />
          <Button
            size="small"
            onClick={() =>
              setDialogState({ currentAction: "view", selectedItem: data })
            }
            icon="pi pi-eye"
            label="Results"
            severity="contrast"
          />
        </div>
      ),
    },
  ];

  const footer = (
    <div className="flex justify-content-start">
      <Button
        size="small"
        onClick={refresh}
        icon="pi pi-refresh"
        label="Reload"
        severity="warning"
        loading={loading}
      />
    </div>
  );

  const header = (
    <div className="flex justify-content-start">
      <Button
        size="small"
        icon="pi pi-plus"
        label="Add Parameter"
        severity="info"
        onClick={() =>
          setDialogState({ currentAction: "add", selectedItem: undefined })
        }
      />
    </div>
  );

  return (
    <div>
      {(dialogState.currentAction === "add" ||
        dialogState.currentAction === "edit") && (
        <AddOrModifyItem
          activityId={activityId}
          projectId={projectId}
          onSave={refresh}
          item={dialogState.selectedItem}
          visible={
            dialogState.currentAction === "add" ||
            (dialogState.currentAction === "edit" &&
              !!dialogState.selectedItem?.id)
          }
          onClose={() =>
            setDialogState({ currentAction: "", selectedItem: undefined })
          }
        />
      )}
      {dialogState.currentAction === "view" && dialogState.selectedItem && (
        <ActivityPrameterResults
          activityId={activityId}
          projectId={projectId}
          parameterId={dialogState.selectedItem?.id.toString()}
          isOpen={
            dialogState.currentAction === "view" &&
            !!dialogState.selectedItem?.id
          }
          onClose={() =>
            setDialogState({ currentAction: "", selectedItem: undefined })
          }
        />
      )}
      <DataTable
        header={header}
        footer={footer}
        value={activityPlans}
        paginator
        rows={10}
        responsiveLayout="scroll"
      >
        {columns.map((col, index) => (
          <Column
            key={index}
            field={col.field}
            header={col.header}
            body={col.body}
            sortable={col.sortable}
            filter={col.filter}
            // Additional props can be passed here if needed
          />
        ))}
      </DataTable>
    </div>
  );
};

export default ActivityPrameters;
