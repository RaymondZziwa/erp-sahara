import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../../components/table";
import BreadCrump from "../../../../components/layout/bread_crump";
import AddOrModifyItem from "./AddOrModify";
import { RECRUITMENT_ENDPOINTS } from "../../../../api/recruitmentEndpoints";
import { JobBoard } from "../../../../redux/slices/types/recruitment/types";
import useJobBoard from "../../../../hooks/recruitment/useJobBoard";

const JobBoards: React.FC = () => {
  const { data: jobBoards, refresh } = useJobBoard();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selected: JobBoard | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selected: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<JobBoard>[] = [
    { headerName: "Name", field: "name", sortable: true, filter: true },
    { headerName: "Type", field: "type", sortable: true, filter: true },
    { headerName: "Base URL", field: "base_url", sortable: true, filter: true },
    {
      headerName: "Actions",
      field: "id",
      cellRenderer: (params: ICellRendererParams<JobBoard>) => (
        <div className="flex items-center gap-2">
          <button
            className="bg-shade px-2 py-1 rounded text-white"
            onClick={() =>
              setDialogState({
                currentAction: "edit",
                selected: params.data,
              })
            }
          >
            Edit
          </button>
          <Icon
            onClick={() =>
              setDialogState({
                currentAction: "delete",
                selected: params.data,
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
        item={dialogState.selected}
        visible={
          dialogState.currentAction === "add" ||
          (dialogState.currentAction === "edit" && !!dialogState.selected?.id)
        }
        onSave={refresh}
        onClose={() =>
          setDialogState({ selected: undefined, currentAction: "" })
        }
      />

      <ConfirmDeleteDialog
        apiPath={RECRUITMENT_ENDPOINTS.JOB_BOARDS.DELETE(dialogState.selected?.id ?? "")}
        visible={
          !!dialogState.selected?.id && dialogState.currentAction === "delete"
        }
        onConfirm={refresh}
        onClose={() =>
          setDialogState({ selected: undefined, currentAction: "" })
        }
      />

      <BreadCrump name="Job Boards" pageName="Job Boards" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Job Boards</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setDialogState({ selected: undefined, currentAction: "add" })
              }
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
            >
              <Icon icon="solar:add-circle-bold" fontSize={20} />
              Add Job Board
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
        <Table columnDefs={columnDefinitions} data={jobBoards} ref={tableRef} />
      </div>
    </div>
  );
};

export default JobBoards;
