import React, { useRef, useState } from "react";
import { ColDef } from "ag-grid-community";
import { Icon } from "@iconify/react";

import AddOrModifyItem from "./AddOrModifyItem";
import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../components/table";

import BreadCrump from "../../../components/layout/bread_crump";
import { PROJECTS_ENDPOINTS } from "../../../api/projectsEndpoints";

import { Ledger } from "../../../redux/slices/types/ledgers/Ledger";
import useGeneralLedgers from "../../../hooks/reports/useGeneralLedgers";
import LedgerBtnsTypes from "./LedgerTypesBtns";
import { AccountType } from "../../../redux/slices/types/accounts/accountTypes";

const GeneralLedgers: React.FC = () => {
  const { data, refresh } = useGeneralLedgers();
  const tableRef = useRef<any>(null);

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

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<Ledger>[] = [
    {
      headerName: "ID",
      field: "id",
      sortable: true,
      filter: true,
      width: 100,
    },
    {
      headerName: "Account",
      field: "chart_of_account.name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Debit amount",
      field: "debit_sum",
      sortable: true,
      filter: true,
    },

    {
      headerName: "Credit amount",
      field: "credit_sum",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    // {
    //   headerName: "Actions",
    //   field: "chart_of_account.id",
    //   sortable: false,
    //   filter: false,
    //   cellRenderer: (params: ICellRendererParams<Ledger>) => (
    //     <div className="flex items-center gap-2">
    //       <button
    //         className="bg-shade px-2 py-1 rounded text-white"
    //         onClick={() =>
    //           setDialogState({
    //             ...dialogState,
    //             currentAction: "edit",
    //             selectedItem: params.data,
    //           })
    //         }
    //       >
    //         Edit
    //       </button>
    //       <Icon
    //         onClick={() =>
    //           setDialogState({
    //             ...dialogState,
    //             currentAction: "delete",
    //             selectedItem: params.data,
    //           })
    //         }
    //         icon="solar:trash-bin-trash-bold"
    //         className="text-red-500 cursor-pointer"
    //         fontSize={20}
    //       />
    //     </div>
    //   ),
    // },
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
      <BreadCrump name="Ledger Summaries" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">General ledgers Table</h1>
          </div>
          <div className="flex gap-2 my-2">
            <LedgerBtnsTypes onJournalClick={onJournalTypeClick} />

            <button
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
              onClick={handleExportPDF}
            >
              <Icon icon="solar:printer-bold" fontSize={20} />
              Print
            </button>
          </div>
        </div>
        <Table
          columnDefs={columnDefinitions}
          data={data?.summaries ?? []}
          ref={tableRef}
        />
      </div>
    </div>
  );
};

export default GeneralLedgers;
