import React, { useEffect, useRef, useState } from "react";
import { ColDef } from "ag-grid-community";
import AddOrModifyItem from "./AddOrModifyItem";
import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../components/table";

import BreadCrump from "../../../components/layout/bread_crump";
import { PROJECTS_ENDPOINTS } from "../../../api/projectsEndpoints";

import { Ledger } from "../../../redux/slices/types/ledgers/Ledger";
import useGeneralLedgers from "../../../hooks/reports/useGeneralLedgers";
import { AccountType } from "../../../redux/slices/types/accounts/accountTypes";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RootState } from "../../../redux/store";
import { baseURL } from "../../../utils/api";

const ExpenseTransactions: React.FC = () => {
  const { refresh } = useGeneralLedgers();
  const tableRef = useRef<any>(null);
  const [dt, setDt] = useState<any[]>([]);
  const token = useSelector(
    (state: RootState) => state.userAuth.token.access_token
  );

  const [dialogState, setDialogState] = useState<{
    selectedItem: Ledger | undefined;
    currentAction: "delete" | "edit" | "add" | "";
    debitAccountsType: AccountType;
    creditAccountsType: AccountType;
    endpoint: string;
    journalType: string;
    creditAccountHeader: string;
    debitAccountHeader: string;
  }>({
    selectedItem: undefined,
    currentAction: "",
    debitAccountsType: AccountType.ASSETS,
    creditAccountsType: AccountType.ASSETS,
    endpoint: "",
    journalType: "",
    creditAccountHeader: "",
    debitAccountHeader: "",
  });

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/erp/accounts/general-ledger/4`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("resqq", response.data.data.data);
        setDt(response.data.data.data);
        //    if(response.success) {
        //     setDt(response.data.data)
        //    }
      } catch (error) {
        toast.error(error);
      }
    };

    fetchRecords();
  }, []);

  const columnDefinitions: ColDef<any>[] = [
    {
      headerName: "Date",
      field: "transaction_date",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Debit A/C",
      field: "debit_account.name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Credit A/C",
      field: "credit_account.name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Amount",
      field: "amount",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Description",
      field: "journal_transaction.description",
      sortable: true,
      filter: true,
    },
  ];

  interface JournalTypeClickParams {
    debitAccountsType: AccountType;
    creditAccountsType: AccountType;
    endpoint: string;
    journalType: string;
    creditAccountHeader: string;
    debitAccountHeader: string;
  }

  const onJournalTypeClick = ({
    debitAccountsType,
    creditAccountsType,
    endpoint,
    journalType,
    creditAccountHeader,
    debitAccountHeader,
  }: JournalTypeClickParams) => {
    setDialogState({
      selectedItem: undefined,
      currentAction: "add",
      debitAccountsType,
      creditAccountsType,
      endpoint,
      journalType,
      creditAccountHeader,
      debitAccountHeader,
    });
  };

  return (
    <div>
      {dialogState.currentAction !== "" && (
        <AddOrModifyItem
          creditAccountsHeader={dialogState.creditAccountHeader}
          debitAccountsHeader={dialogState.debitAccountHeader}
          journalType={dialogState.journalType}
          endpoint={dialogState.endpoint}
          debitAccountType={dialogState.debitAccountsType}
          creditAccountType={dialogState.creditAccountsType}
          onSave={refresh}
          item={dialogState.selectedItem}
          visible={
            dialogState.currentAction == "add" ||
            (dialogState.currentAction == "edit" &&
              !!dialogState.selectedItem?.id)
          }
          onClose={() =>
            setDialogState({
              currentAction: "",
              selectedItem: undefined,
              debitAccountsType: AccountType.ASSETS,
              creditAccountsType: AccountType.ASSETS,
              endpoint: "",
              journalType: "",
              debitAccountHeader: "",
              creditAccountHeader: "",
            })
          }
        />
      )}
      {dialogState.selectedItem && (
        <ConfirmDeleteDialog
          apiPath={PROJECTS_ENDPOINTS.SECTORS.DELETE(
            dialogState.selectedItem?.id.toString()
          )}
          onClose={() =>
            setDialogState({
              selectedItem: undefined,
              currentAction: "",
              debitAccountsType: AccountType.ASSETS,
              creditAccountsType: AccountType.ASSETS,
              endpoint: "",
              journalType: "",
              creditAccountHeader: "",
              debitAccountHeader: "",
            })
          }
          visible={
            !!dialogState.selectedItem?.id &&
            dialogState.currentAction === "delete"
          }
          onConfirm={refresh}
        />
      )}
      <BreadCrump name="Expenses Transactions" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 my-2 justify-end">
            <button
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
              onClick={() =>
                onJournalTypeClick({
                  debitAccountsType: AccountType.ASSETS,
                  creditAccountsType: AccountType.ASSETS,
                  endpoint: "/erp/accounts/transactions/save-expense",
                  journalType: "Expenses journal",
                  creditAccountHeader: "Credit A/C",
                  debitAccountHeader: "Debit A/C",
                })
              }
            >
              Save Expense
            </button>
          </div>
        </div>
        <Table
          columnDefs={columnDefinitions}
          data={dt ? dt : []}
          ref={tableRef}
        />
      </div>
    </div>
  );
};

export default ExpenseTransactions;
