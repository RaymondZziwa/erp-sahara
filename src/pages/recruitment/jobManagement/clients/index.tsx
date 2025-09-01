import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import Table from "../../../../components/table";
import BreadCrump from "../../../../components/layout/bread_crump";
import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import useCompany from "../../../../hooks/recruitment/useCompany";
import AddOrModifyCompany from "./AddOrModify";
import { RECRUITMENT_ENDPOINTS } from "../../../../api/recruitmentEndpoints";

interface Company {
  id: number;
  name: string;
  legal_name: string;
  tax_id: string;
  website: string;
  industry: string;
  company_size: string;
  description: string;
}

const Companies: React.FC = () => {
  const { data: companies, refresh } = useCompany();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedCompany: Company | undefined;
    currentAction: "add" | "edit" | "delete" | "";
  }>({ selectedCompany: undefined, currentAction: "" });

  const columnDefs: ColDef<Company>[] = [
    { headerName: "Name", field: "name" },
    { headerName: "Legal Name", field: "legal_name" },
    { headerName: "Tax ID", field: "tax_id" },
    { headerName: "Website", field: "website" },
    { headerName: "Industry", field: "industry" },
    { headerName: "Size", field: "company_size" },
    {
      headerName: "Actions",
      field: "id",
      cellRenderer: (params: ICellRendererParams<Company>) => (
        <div className="flex gap-2">
          <button
            onClick={() =>
              setDialogState({ selectedCompany: params.data, currentAction: "edit" })
            }
            className="bg-shade px-2 text-white rounded"
          >
            Edit
          </button>
          <Icon
            icon="solar:trash-bin-trash-bold"
            fontSize={20}
            className="text-red-500 cursor-pointer mt-3"
            onClick={() =>
              setDialogState({ selectedCompany: params.data, currentAction: "delete" })
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <AddOrModifyCompany
        visible={dialogState.currentAction === "add" || dialogState.currentAction === "edit"}
        onClose={() => setDialogState({ selectedCompany: undefined, currentAction: "" })}
        item={dialogState.selectedCompany}
        onSave={refresh}
      />
      <ConfirmDeleteDialog
        apiPath={RECRUITMENT_ENDPOINTS.COMPANY.DELETE(dialogState.selectedCompany?.id ?? 0)}
        visible={dialogState.currentAction === "delete"}
        onClose={() => setDialogState({ selectedCompany: undefined, currentAction: "" })}
        onConfirm={refresh}
      />
      <BreadCrump name="Companies" pageName="Companies" />
      <div className="bg-white px-8 py-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Companies</h2>
          <button
            className="bg-shade px-3 py-1 text-white rounded flex items-center gap-2"
            onClick={() => setDialogState({ selectedCompany: undefined, currentAction: "add" })}
          >
            <Icon icon="solar:add-circle-bold" fontSize={20} />
            Add Company
          </button>
        </div>
        <Table columnDefs={columnDefs} data={companies} ref={tableRef} />
      </div>
    </div>
  );
};

export default Companies;
