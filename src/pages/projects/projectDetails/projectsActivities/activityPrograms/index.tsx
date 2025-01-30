import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column, ColumnProps } from "primereact/column";
import { Button } from "primereact/button";
import AddOrModifyItem from "./AddOrModifyItem";
import { ActivityProgram } from "../../../../../redux/slices/types/projects/ActivityProgram";
import useProjectActivityPrograms from "../../../../../hooks/projects/useProjectActivityPrograms";
import { formatDate } from "../../../../../utils/dateUtils";

const ActivityPrograms = ({
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
  } = useProjectActivityPrograms(projectId, activityId);

  const [dialogState, setDialogState] = useState<{
    selectedItem: ActivityProgram | undefined;
    currentAction: "delete" | "edit" | "add" | "" | "view";
  }>({ selectedItem: undefined, currentAction: "" });

  // Define the columns with ColumnProps type
  const columns: ColumnProps[] = [
    { field: "id", header: "ID", sortable: true, filter: true },
    { field: "name", header: "Name", sortable: true, filter: true },
    {
      field: "description",
      header: "Description",
      sortable: false,
      filter: true,
    },
    {
      field: "start_date",
      header: "Start Date",
      body: (data: ActivityProgram) => (
        <div>{data.start_date && formatDate(data.start_date)}</div>
      ),
      sortable: true,
    },
    {
      field: "end_date",
      header: "End Date",
      body: (data: ActivityProgram) => (
        <div>{data.end_date && formatDate(data.end_date)}</div>
      ),
      sortable: true,
    },
    {
      field: "created_at",
      header: "Created At",
      body: (data: ActivityProgram) => (
        <div>{data.created_at && formatDate(data.created_at)}</div>
      ),
      sortable: false,
    },
    {
      field: "activity.name",
      header: "Activity Name",
      sortable: false,
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
    { field: "activity.cost", header: "Cost", sortable: false, filter: true },
    {
      field: "activity.status",
      header: "Status",
      sortable: false,
      filter: true,
    },
    {
      field: "activity.start_date",
      header: "Activity Start Date",
      body: (data: ActivityProgram) => (
        <div>
          {data.activity.start_date && formatDate(data.activity.start_date)}
        </div>
      ),
      sortable: false,
      filter: true,
    },
    {
      field: "activity.end_date",
      header: "Activity End Date",
      sortable: false,
      body: (data: ActivityProgram) => (
        <div>
          {data.activity.end_date && formatDate(data.activity.end_date)}
        </div>
      ),
      filter: true,
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
        label="Add Plan"
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

export default ActivityPrograms;
