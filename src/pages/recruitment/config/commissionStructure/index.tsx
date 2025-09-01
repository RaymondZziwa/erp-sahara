import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../../components/table";
import BreadCrump from "../../../../components/layout/bread_crump";
import AddOrModifyItem from "./AddOrModify";
import { RECRUITMENT_ENDPOINTS } from "../../../../api/recruitmentEndpoints";
import { CommissionStructure } from "../../../../redux/slices/types/recruitment/types";
import useCommissionStructure from "../../../../hooks/recruitment/useCommissionStructure";

const CommissionStructures: React.FC = () => {
  const { data: commissions, refresh } = useCommissionStructure();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selected: CommissionStructure | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selected: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<CommissionStructure>[] = [
    { headerName: "Name", field: "name", sortable: true, filter: true },
    {
      headerName: "Commission Type",
      field: "commission_type",
      sortable: true,
      filter: true,
    },
    { headerName: "Type", field: "type", sortable: true, filter: true },
    {
      headerName: "Amount",
      field: "amount",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Basis",
      field: "calculation_basis",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Actions",
      field: "id",
      cellRenderer: (params: ICellRendererParams<CommissionStructure>) => (
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
        onSave={refresh}
        item={dialogState.selected}
        visible={
          dialogState.currentAction === "add" ||
          (dialogState.currentAction === "edit" && !!dialogState.selected?.id)
        }
        onClose={() => setDialogState({ currentAction: "", selected: undefined })}
      />

      <ConfirmDeleteDialog
        apiPath={RECRUITMENT_ENDPOINTS.COMMISSION_STRUCTURES.DELETE(
          dialogState.selected?.id ?? ""
        )}
        visible={
          !!dialogState.selected?.id && dialogState.currentAction === "delete"
        }
        onClose={() => setDialogState({ currentAction: "", selected: undefined })}
        onConfirm={refresh}
      />

      <BreadCrump name="Commission Structures" pageName="Commission Structures" />

      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Commission Structures</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setDialogState({ selected: undefined, currentAction: "add" })
              }
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
            >
              <Icon icon="solar:add-circle-bold" fontSize={20} />
              Add Commission
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

        <Table columnDefs={columnDefinitions} data={commissions} ref={tableRef} />
      </div>
    </div>
  );
};

export default CommissionStructures;
