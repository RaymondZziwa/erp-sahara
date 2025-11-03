import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import { ToastContainer } from "react-toastify";
import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../../components/layout/bread_crump";
import useBanks from "../../../../hooks/accounts/bankReconciliation/useBanks";
import { Bank } from "../../../../redux/slices/types/accounts/bankReconciliation/bank";
import AddOrModifyBranch from "../../../settings/branches/AddOrModify";
import AddOrModifyBank from "./AddorModify";
import { ACCOUNTS_ENDPOINTS } from "../../../../api/accountsEndpoints";
import Table from "../../../../components/table";

const Banks: React.FC = () => {
  const { data: banks, refresh } = useBanks();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedBank: Bank | undefined;
    currentAction: "delete" | "edit" | "add" | "addBranch" | "";
  }>({ selectedBank: undefined, currentAction: "" });

  const columnDefinitions: ColDef<Bank>[] = [
    {
      headerName: "Bank Name",
      field: "name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Email",
      field: "email",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Description",
      field: "description",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Branches Count",
      field: "branches",
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams<Bank>) => (
        <div>{params?.data?.branches?.length ?? 0}</div>
      ),
      suppressSizeToFit: true,
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<Bank>) => (
        <div className="flex items-center gap-2">
          <button
            className="bg-teal-600 px-2 h-10 rounded text-white"
            onClick={() =>
              setDialogState({
                ...dialogState,
                currentAction: "edit",
                selectedBank: params.data,
              })
            }
          >
            Edit
          </button>
          <button
            className="bg-green-600 px-2 h-10 rounded text-white"
            onClick={() =>
              setDialogState({
                ...dialogState,
                currentAction: "addBranch",
                selectedBank: params.data,
              })
            }
          >
            Add Branch
          </button>
          <Icon
            onClick={() =>
              setDialogState({
                ...dialogState,
                currentAction: "delete",
                selectedBank: params.data,
              })
            }
            icon="solar:trash-bin-trash-bold"
            className="text-red-500 cursor-pointer"
            fontSize={24}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <ToastContainer />
      {/* Add/Edit Bank */}
      <AddOrModifyBank
        onSave={refresh}
        bank={dialogState.selectedBank}
        visible={
          dialogState.currentAction == "add" ||
          (dialogState.currentAction == "edit" && !!dialogState.selectedBank?.id)
        }
        onClose={() =>
          setDialogState({ currentAction: "", selectedBank: undefined })
        }
      />

      {/* Add Branch */}
      <AddOrModifyBranch
        bank={dialogState.selectedBank}
        visible={dialogState.currentAction === "addBranch"}
        onSave={refresh}
        onClose={() =>
          setDialogState({ currentAction: "", selectedBank: undefined })
        }
      />

      {/* Delete Bank */}
      <ConfirmDeleteDialog
        apiPath={ACCOUNTS_ENDPOINTS.BANKS.DELETE(
          dialogState.selectedBank?.id?.toString() ?? ""
        )}
        onClose={() =>
          setDialogState({ selectedBank: undefined, currentAction: "" })
        }
        visible={
          !!dialogState.selectedBank?.id &&
          dialogState.currentAction === "delete"
        }
        onConfirm={refresh}
      />

      <BreadCrump name="Banks" pageName="Banks" />

      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Banks</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setDialogState({
                  selectedBank: undefined,
                  currentAction: "add",
                })
              }
              className="bg-teal-600 px-2 py-1 rounded text-white flex gap-2 items-center"
            >
              <Icon icon="solar:add-circle-bold" fontSize={20} />
              Add Bank
            </button>
          </div>
        </div>

        <Table columnDefs={columnDefinitions} data={banks} ref={tableRef} />
      </div>
    </div>
  );
};

export default Banks;
