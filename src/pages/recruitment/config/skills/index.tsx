import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import useSkills from "../../../../hooks/recruitment/useSkills";
import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../../components/table";
import BreadCrump from "../../../../components/layout/bread_crump";
import AddOrModifyItem from "./AddOrModify";
import { RECRUITMENT_ENDPOINTS } from "../../../../api/recruitmentEndpoints";
import { Skill } from "../../../../redux/slices/types/recruitment/types";

const Skills: React.FC = () => {
  const { data: skills, refresh } = useSkills();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedSkill: Skill | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedSkill: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<Skill>[] = [
    {
      headerName: "Name",
      field: "name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<Skill>) => (
        <div className="flex items-center gap-2">
          <button
            className="bg-shade px-2 py-1 rounded text-white"
            onClick={() =>
              setDialogState({
                ...dialogState,
                currentAction: "edit",
                selectedSkill: params.data,
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
                selectedSkill: params.data,
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
        item={dialogState.selectedSkill}
        visible={
          dialogState.currentAction === "add" ||
          (dialogState.currentAction === "edit" && !!dialogState.selectedSkill?.id)
        }
        onClose={() =>
          setDialogState({ currentAction: "", selectedSkill: undefined })
        }
      />
      <ConfirmDeleteDialog
        apiPath={RECRUITMENT_ENDPOINTS.SKILLS.DELETE(
          dialogState.selectedSkill?.id?.toString() ?? ""
        )}
        onClose={() =>
          setDialogState({ selectedSkill: undefined, currentAction: "" })
        }
        visible={
          !!dialogState.selectedSkill?.id && dialogState.currentAction === "delete"
        }
        onConfirm={refresh}
      />
      <BreadCrump name="Skills" pageName="Skills" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Skills</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setDialogState({
                  selectedSkill: undefined,
                  currentAction: "add",
                })
              }
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
            >
              <Icon icon="solar:add-circle-bold" fontSize={20} />
              Add Skill
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
        <Table columnDefs={columnDefinitions} data={skills} ref={tableRef} />
      </div>
    </div>
  );
};

export default Skills;
