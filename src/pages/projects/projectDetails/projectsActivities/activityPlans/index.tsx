import { DataTable } from "primereact/datatable";
import { Column, ColumnProps } from "primereact/column";
import useProjectActivityPlans from "../../../../../hooks/projects/useProjectActivityPlans";
import { Button } from "primereact/button";
import { useState } from "react";
import { ActivityPlan } from "../../../../../redux/slices/types/projects/ActivityPlan";
import AddOrModifyItem from "./AddOrModifyItem";

const ActivitPlans = ({
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
  } = useProjectActivityPlans(projectId, activityId);

  const [dialogState, setDialogState] = useState<{
    selectedItem: ActivityPlan | undefined;
    currentAction: "delete" | "edit" | "add" | "" | "view";
  }>({ selectedItem: undefined, currentAction: "" });

  // Define the columns in an array
  const columns: ColumnProps[] = [
    { field: "id", header: "Plan ID" },
    { field: "plan_details", header: "Plan Details" },
    { field: "assigned_to", header: "Assigned To" },
    { field: "due_date", header: "Due Date" },
    { field: "activity.name", header: "Activity Name" },
    { field: "activity.project.name", header: "Project Name" },
    { field: "activity.project.location", header: "Location" },
    { field: "activity.prioty", header: "Priority" },
    { field: "activity.cost", header: "Cost" },
    { field: "activity.status", header: "Status" },
    { field: "activity.start_date", header: "Start Date" },
    { field: "activity.end_date", header: "End Date" },
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
      {(dialogState.currentAction == "add" ||
        dialogState.currentAction == "edit") && (
        <AddOrModifyItem
          activityId={activityId}
          projectId={projectId}
          onSave={refresh}
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
      <DataTable
        header={header}
        footer={footer}
        value={activityPlans}
        paginator
        rows={10}
        responsiveLayout="scroll"
      >
        {columns.map((col, index) => (
          <Column key={index} field={col.field} header={col.header} />
        ))}
      </DataTable>
    </div>
  );
};

export default ActivitPlans;
