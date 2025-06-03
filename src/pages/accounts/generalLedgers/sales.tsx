import React, { useEffect, useRef, useState } from "react";
import { ColDef } from "ag-grid-community";
import AddOrModifyItem from "./AddOrModifyItem";
import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../components/table";

import BreadCrump from "../../../components/layout/bread_crump";
import { PROJECTS_ENDPOINTS } from "../../../api/projectsEndpoints";

import { Ledger } from "../../../redux/slices/types/ledgers/Ledger";
import useGeneralLedgers from "../../../hooks/reports/useGeneralLedgers";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { baseURL } from "../../../utils/api";
import axios from "axios";
import { AccountType } from "../../../redux/slices/types/accounts/accountTypes";
import { toast, ToastContainer } from "react-toastify";

const SalesTransactions: React.FC = () => {
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

  const fetchRecords = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/accounts/general-ledger/5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDt(response.data.data);
      //    if(response.success) {
      //     setDt(response.data.data)
      //    }
    } catch (error) {
      //toast.error(error);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleReverseTransaction = async (transactionId: number) => {
    try {
      await axios.delete(
        `${baseURL}/accounts/transactions/${transactionId}/delete`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Transaction reversed successfully");
      fetchRecords();
    } catch (error) {
      console.error("Reversal failed", error);
      toast.error("Failed to reverse transaction");
    }
  };

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
    {
      headerName: "Actions",
      field: "actions",
      cellRenderer: (params: any) => {
        return (
          <button
            onClick={() => handleReverseTransaction(params.data.id)}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Reverse
          </button>
        );
      },
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
      <ToastContainer />
      {dialogState.currentAction !== "" && (
        <AddOrModifyItem
          creditAccountsHeader={dialogState.creditAccountHeader}
          debitAccountsHeader={dialogState.debitAccountHeader}
          journalType={dialogState.journalType}
          endpoint={dialogState.endpoint}
          title={"Income Transaction"}
          debitAccountType={dialogState.debitAccountsType}
          creditAccountType={dialogState.creditAccountsType}
          onSave={fetchRecords}
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
      <BreadCrump name="Income Transaction" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 my-2 ml-auto">
            {/* <LedgerBtnsTypes onJournalClick={onJournalTypeClick} />
            <NCTBtnsTypes onJournalClick={onJournalTypeClick} />
            <GTBtnsTypes onJournalClick={onJournalTypeClick} /> */}
            <button
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
              onClick={() =>
                onJournalTypeClick({
                  debitAccountsType: AccountType.ASSETS,
                  creditAccountsType: AccountType.ASSETS,
                  endpoint: "/accounts/transactions/save-income",
                  journalType: "Sales journal",
                  creditAccountHeader: "Credit A/C",
                  debitAccountHeader: "Debit A/C",
                })
              }
            >
              Record Income
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

export default SalesTransactions;
