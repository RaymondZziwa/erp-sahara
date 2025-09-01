import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../components/table";
import BreadCrump from "../../../components/layout/bread_crump";
import useBranches from "../../../hooks/Branches/useBranches";
import { Branch } from "../../../redux/slices/types/Branches/type";
import AddOrModifyBranch from "./AddOrModify";
import { API_ENDPOINTS } from "../../../api/apiEndpoints";

const Branches: React.FC = () => {
  const { data: branches, refresh } = useBranches();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedBranch: Branch | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedBranch: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<Branch>[] = [
    {
      headerName: "Name",
      field: "name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Code",
      field: "code",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Phone Number",
      field: "phone_number",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Postal Address",
      field: "postal_address",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Email",
      field: "email",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Country",
      field: "country.country_name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Timezone",
      field: "timezone",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<Branch>) => (
        <div className="flex items-center gap-2">
          <button
            className="bg-shade px-2 py-1 rounded text-white"
            onClick={() =>
              setDialogState({
                ...dialogState,
                currentAction: "edit",
                selectedBranch: params.data,
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
                selectedBranch: params.data,
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
      <AddOrModifyBranch
        onSave={refresh}
        branch={dialogState.selectedBranch}
        visible={
          dialogState.currentAction === "add" ||
          (dialogState.currentAction === "edit" &&
            !!dialogState.selectedBranch?.id)
        }
        onClose={() =>
          setDialogState({ currentAction: "", selectedBranch: undefined })
        }
      />
      <ConfirmDeleteDialog
        apiPath={API_ENDPOINTS.BRANCHES.DELETE(
          dialogState.selectedBranch?.id?.toString() ?? ""
        )}
        onClose={() =>
          setDialogState({ selectedBranch: undefined, currentAction: "" })
        }
        visible={
          !!dialogState.selectedBranch?.id &&
          dialogState.currentAction === "delete"
        }
        onConfirm={refresh}
      />
      <BreadCrump name="Branches" pageName="Branches" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Branches</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setDialogState({
                  selectedBranch: undefined,
                  currentAction: "add",
                })
              }
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
            >
              <Icon icon="solar:add-circle-bold" fontSize={20} />
              Add Branch
            </button>
            
          </div>
        </div>
        <Table
          columnDefs={columnDefinitions}
          data={branches}
          ref={tableRef}
        />
      </div>
    </div>
  );
};

export default Branches;
