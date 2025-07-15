import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import Table from "../../../../components/table";
import { RECRUITMENT_ENDPOINTS } from "../../../../api/recruitmentEndpoints";
import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../../components/layout/bread_crump";
import useOffers from "../../../../hooks/recruitment/useOffers";
import AddOrModifyOffer from "./AddOrModify";

export interface JobOffer {
  id: string;
  application_id: string;
  offer_number: string;
  salary: number;
  currency_id: string;
  pay_frequency: "monthly" | "annual" | "weekly";
  start_date: string;
  benefits: string;
  notes: string;
  status: "draft" | "sent" | "accepted" | "rejected";
  document_path: string;
  application?: {
    candidate?: {
      user?: {
        full_name: string;
      };
    };
  };
}

const Offers: React.FC = () => {
  const { data: offers, refresh } = useOffers();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedOffer: JobOffer | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedOffer: undefined, currentAction: "" });

  const columnDefinitions: ColDef<JobOffer>[] = [
    {
      headerName: "Candidate",
      field: "application.candidate.user.full_name",
      valueGetter: (params) => params.data?.application?.candidate?.user?.full_name || "-",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Offer #",
      field: "offer_number",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Salary",
      field: "salary",
      valueGetter: (params) => `${params.data?.salary}`,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Pay Frequency",
      field: "pay_frequency",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Start Date",
      field: "start_date",
      valueGetter: (params) => new Date(params.data?.start_date).toLocaleDateString(),
      sortable: true,
      filter: true,
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Document",
      field: "document_path",
      cellRenderer: (params) =>
        params.value ? (
          <a
            href={params.value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            View PDF
          </a>
        ) : (
          "-"
        ),
    },
    {
      headerName: "Actions",
      field: "id",
      cellRenderer: (params: ICellRendererParams<JobOffer>) => (
        <div className="flex items-center gap-2">
          <button
            className="bg-shade px-2 py-1 rounded text-white"
            onClick={() =>
              setDialogState({
                currentAction: "edit",
                selectedOffer: params.data,
              })
            }
          >
            Edit
          </button>
          <Icon
            onClick={() =>
              setDialogState({
                currentAction: "delete",
                selectedOffer: params.data,
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
      <AddOrModifyOffer
        onSave={refresh}
        item={dialogState.selectedOffer}
        visible={
          dialogState.currentAction === "add" ||
          (dialogState.currentAction === "edit" && !!dialogState.selectedOffer?.id)
        }
        onClose={() =>
          setDialogState({ currentAction: "", selectedOffer: undefined })
        }
      />

      <ConfirmDeleteDialog
        apiPath={RECRUITMENT_ENDPOINTS.OFFER.DELETE(
          dialogState.selectedOffer?.id ?? ""
        )}
        onClose={() =>
          setDialogState({ selectedOffer: undefined, currentAction: "" })
        }
        visible={
          !!dialogState.selectedOffer?.id &&
          dialogState.currentAction === "delete"
        }
        onConfirm={refresh}
      />

      <BreadCrump name="Offers" pageName="Job Offers" />

      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-xl font-bold">Job Offers</h1>
          <button
            onClick={() =>
              setDialogState({ selectedOffer: undefined, currentAction: "add" })
            }
            className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
          >
            <Icon icon="solar:add-circle-bold" fontSize={20} />
            Add Offer
          </button>
        </div>
        <Table columnDefs={columnDefinitions} data={offers} ref={tableRef} />
      </div>
    </div>
  );
};

export default Offers;
