import { useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import AddOrModifyItem from "./AddOrModifyItem";
import useProjectActivityParameterResults from "../../../../../hooks/projects/useProjectActivityParametersResults";
import { ActivityParamenterResult } from "../../../../../redux/slices/types/projects/ParameterResults";

const ActivityPrameterResults = ({
  projectId,
  activityId,
  parameterId,
  isOpen,
  onClose,
}: {
  projectId: string;
  activityId: string;
  parameterId: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const {
    data: parameterResults,
    refresh,
    loading,
  } = useProjectActivityParameterResults(projectId, activityId, parameterId);

  const [dialogState, setDialogState] = useState<{
    selectedItem: ActivityParamenterResult | undefined;
    currentAction: "delete" | "edit" | "add" | "" | "view";
  }>({ selectedItem: undefined, currentAction: "" });

  // Function to format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
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
        label="Add Parameter Result"
        severity="info"
        onClick={() =>
          setDialogState({ currentAction: "add", selectedItem: undefined })
        }
      />
    </div>
  );
  return (
    <Dialog visible={isOpen} onHide={onClose} header={"Prameter Results"}>
      {(dialogState.currentAction === "add" ||
        dialogState.currentAction === "edit") && (
        <AddOrModifyItem
          parameterId={parameterId}
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

      {/* DataTable to display results */}
      <DataTable
        header={header}
        footer={footer}
        value={parameterResults || []}
        loading={loading}
        paginator
        rows={10}
        className="mt-4"
      >
        <Column field="id" header="ID" sortable />
        <Column field="result" header="Result" />
        <Column
          field="activity_parameter.name"
          header="Parameter Name"
          sortable
        />
        <Column
          field="activity_parameter.description"
          header="Parameter Description"
        />
        <Column
          field="created_at"
          header="Created At"
          body={(rowData: ActivityParamenterResult) =>
            formatDate(rowData.created_at)
          }
        />
      </DataTable>
    </Dialog>
  );
};

export default ActivityPrameterResults;
