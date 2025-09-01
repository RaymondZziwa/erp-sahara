import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import Table from "../../../../components/table";
import BreadCrump from "../../../../components/layout/bread_crump";
import AddOrModifyItem from "./AddOrModify";
import useCandidateSequence from "../../../../hooks/recruitment/useCandidateSequence";

const CandidateSequences: React.FC = () => {
  const { data: candidateSequences, refresh } = useCandidateSequence();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selected: any | undefined;
    currentAction: "edit" | "";
  }>({ selected: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<any>[] = [
    { headerName: "Prefix", field: "prefix", sortable: true, filter: true },
    {
      headerName: "Use Year/Month",
      field: "use_year_month",
      cellRenderer: (params) => (params.data.use_year_month ? "Yes" : "No"),
      sortable: true,
      filter: true,
    },
    {
      headerName: "Use Branch Number",
      field: "use_branch_number",
      cellRenderer: (params) => (params.data.use_branch_number ? "Yes" : "No"),
      sortable: true,
      filter: true,
    },
    {
      headerName: "Last Sequence",
      field: "last_sequence",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Actions",
      field: "id",
      cellRenderer: (params: ICellRendererParams<any>) => (
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
        </div>
      ),
    },
  ];

  return (
    <div>
      <AddOrModifyItem
        item={dialogState.selected}
        visible={dialogState.currentAction === "edit" && !!dialogState.selected?.id}
        onSave={() => {
          refresh();
          setDialogState({ selected: undefined, currentAction: "" });
        }}
        onClose={() => setDialogState({ selected: undefined, currentAction: "" })}
      />

      <BreadCrump name="Candidate Sequences" pageName="Candidate Sequences" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="py-2">
            <h1 className="text-xl font-bold">Candidate Sequences</h1>
          </div>

          <div className="flex gap-2">
            <button
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
              onClick={handleExportPDF}
            >
              <Icon icon="solar:printer-bold" fontSize={20} />
              Print
            </button>
          </div>
        </div>

        <Table columnDefs={columnDefinitions} data={candidateSequences || []} ref={tableRef} />
      </div>
    </div>
  );
};

export default CandidateSequences;
