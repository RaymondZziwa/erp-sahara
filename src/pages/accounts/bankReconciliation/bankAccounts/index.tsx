import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import { ToastContainer } from "react-toastify";
import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../../components/layout/bread_crump";
import useBankAccounts from "../../../../hooks/accounts/bankReconciliation/useBankAccounts";
import { BankAccount } from "../../../../redux/slices/types/accounts/bankReconciliation/bank";
import { ACCOUNTS_ENDPOINTS } from "../../../../api/accountsEndpoints";
import Table from "../../../../components/table";
import AddOrModifyBankAccount from "./AddorModify";

const BankAccounts: React.FC = () => {
  const { data: bankAccounts, refresh } = useBankAccounts();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedAccount: BankAccount | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedAccount: undefined, currentAction: "" });

  const columnDefinitions: ColDef<BankAccount>[] = [
    {
      headerName: "Account Name",
      field: "name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Account No",
      field: "account_no",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Bank",
      field: "bank.name",
      sortable: true,
      filter: true,
      valueGetter: (params) => params.data?.bank?.name ?? "—",
    },
    {
      headerName: "Currency",
      field: "currency.name",
      sortable: true,
      filter: true,
      valueGetter: (params) => params.data?.currency?.name ?? "—",
    },
    {
      headerName: "Branch Code",
      field: "branch_code",
      sortable: true,
      filter: true,
      valueGetter: (params) => params.data?.branch_code ?? "—",
    },
    {
      headerName: "Swift Code",
      field: "swift_code",
      sortable: true,
      filter: true,
      valueGetter: (params) => params.data?.swift_code ?? "—",
    },
    {
      headerName: "Description",
      field: "description",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<BankAccount>) => (
        <div className="flex items-center gap-2">
          <button
            className="bg-teal-600 px-2 h-9 rounded text-white"
            onClick={() =>
              setDialogState({
                currentAction: "edit",
                selectedAccount: params.data,
              })
            }
          >
            Edit
          </button>
          <Icon
            onClick={() =>
              setDialogState({
                currentAction: "delete",
                selectedAccount: params.data,
              })
            }
            icon="solar:trash-bin-trash-bold"
            className="text-red-500 cursor-pointer"
            fontSize={22}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <ToastContainer />

      {/* Add/Edit Bank Account */}
      <AddOrModifyBankAccount
        onSave={refresh}
        bankAccount={dialogState.selectedAccount}
        visible={
          dialogState.currentAction === "add" ||
          (dialogState.currentAction === "edit" && !!dialogState.selectedAccount?.id)
        }
        onClose={() =>
          setDialogState({ currentAction: "", selectedAccount: undefined })
        }
      />

      {/* Delete Confirmation */}
      <ConfirmDeleteDialog
        apiPath={ACCOUNTS_ENDPOINTS.BANKACCOUNTS.DELETE(
          dialogState.selectedAccount?.id?.toString() ?? ""
        )}
        onClose={() =>
          setDialogState({ selectedAccount: undefined, currentAction: "" })
        }
        visible={
          !!dialogState.selectedAccount?.id &&
          dialogState.currentAction === "delete"
        }
        onConfirm={refresh}
      />

      <BreadCrump name="Bank Accounts" pageName="Bank Accounts" />

      <div className="bg-white px-8 py-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Bank Accounts</h1>
          <button
            onClick={() =>
              setDialogState({
                selectedAccount: undefined,
                currentAction: "add",
              })
            }
            className="bg-teal-600 px-3 py-2 rounded text-white flex gap-2 items-center"
          >
            <Icon icon="solar:add-circle-bold" fontSize={20} />
            Add Account
          </button>
        </div>

        <Table columnDefs={columnDefinitions} data={bankAccounts} ref={tableRef} />
      </div>
    </div>
  );
};

export default BankAccounts;
