import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import Table from "../../../../components/table";
import BreadCrump from "../../../../components/layout/bread_crump";
import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import useBillingTerms from "../../../../hooks/recruitment/useBillingTerms";
import { API_ENDPOINTS } from "../../../../api/apiEndpoints";
import AddOrModifyBillingTerm from "./AddorModify";

interface BillingTerm {
  id: number;
  billing_type: string;
  rate: number;
  currency: string;
  payment_due_days: number;
  fee_percentage: number;
  min_fee: number;
  max_fee: number;
  expenses_billable: boolean;
  expense_markup_percentage: number;
  discount_type: string;
  discount_amount: number;
  notes?: string;
}

const BillingTerms: React.FC = () => {
  const { data: terms, refresh } = useBillingTerms();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedTerm: BillingTerm | undefined;
    currentAction: "add" | "edit" | "delete" | "";
  }>({ selectedTerm: undefined, currentAction: "" });

  const columnDefs: ColDef<BillingTerm>[] = [
    { headerName: "Billing Type", field: "billing_type" },
    { headerName: "Rate", field: "rate" },
    { headerName: "Currency", field: "currency" },
    { headerName: "Due Days", field: "payment_due_days" },
    { headerName: "Fee %", field: "fee_percentage" },
    { headerName: "Min Fee", field: "min_fee" },
    { headerName: "Max Fee", field: "max_fee" },
    {
      headerName: "Actions",
      field: "id",
      cellRenderer: (params: ICellRendererParams<BillingTerm>) => (
        <div className="flex gap-2">
          <button
            onClick={() =>
              setDialogState({ selectedTerm: params.data, currentAction: "edit" })
            }
            className="bg-shade px-2 py-1 text-white rounded"
          >
            Edit
          </button>
          <Icon
            icon="solar:trash-bin-trash-bold"
            fontSize={20}
            className="text-red-500 cursor-pointer"
            onClick={() =>
              setDialogState({ selectedTerm: params.data, currentAction: "delete" })
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <AddOrModifyBillingTerm
        visible={dialogState.currentAction === "add" || dialogState.currentAction === "edit"}
        onClose={() => setDialogState({ selectedTerm: undefined, currentAction: "" })}
        term={dialogState.selectedTerm}
        onSave={refresh}
      />
      <ConfirmDeleteDialog
        apiPath={API_ENDPOINTS.BILLING_TERMS.DELETE(dialogState.selectedTerm?.id ?? 0)}
        visible={dialogState.currentAction === "delete"}
        onClose={() => setDialogState({ selectedTerm: undefined, currentAction: "" })}
        onConfirm={refresh}
      />
      <BreadCrump name="Billing Terms" pageName="Billing Terms" />
      <div className="bg-white px-8 py-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Billing Terms</h2>
          <button
            className="bg-shade px-3 py-1 text-white rounded flex items-center gap-2"
            onClick={() => setDialogState({ selectedTerm: undefined, currentAction: "add" })}
          >
            <Icon icon="solar:add-circle-bold" fontSize={20} />
            Add Billing Term
          </button>
        </div>
        <Table columnDefs={columnDefs} data={terms} ref={tableRef} />
      </div>
    </div>
  );
};

export default BillingTerms;
