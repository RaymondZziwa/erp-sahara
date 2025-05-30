import React, { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../components/table";
import BreadCrump from "../../../components/layout/bread_crump";
import AddOrModifyItem from "./AddOrModifyItem";
import EvaluationForm from "../bidEvaluation/AddOrModifyItem";

import { API_ENDPOINTS } from "../../../api/apiEndpoints";
import { Bid } from "../../../redux/slices/types/procurement/Bid";
import useBids from "../../../hooks/procurement/useBids";
import { formatDate } from "../../../utils/dateUtils";
import { baseURL } from "../../../utils/api";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";


const Bids: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const rfqId = searchParams.get("rfq_id");

  const { data: allBids, refresh } = useBids();
  const tableRef = useRef<any>(null);
  const { token } = useAuth();
  const axiosInstance = axios.create({
    baseURL: `${baseURL}/supplier-evaluations`,
    headers: {
      Authorization: `Bearer ${token.access_token}`, // fixed typo: access_tooken → access_token
      "Content-Type": "application/json",
    },
  });

  // Filter bids by RFQ ID if provided
  const data = rfqId ? allBids?.filter((bid) => bid.rfq_id === rfqId) : allBids;

  const rfqTitle = data?.[0]?.rfq?.title;

  // Find the bid with highest score
  const highestScoreBid = data?.reduce((max, bid) => {
    const currentScore =
      (bid.evaluation?.technical_score || 0) +
      (bid.evaluation?.commercial_score || 0);
    const maxScore =
      (max?.evaluation?.technical_score || 0) +
      (max?.evaluation?.commercial_score || 0);
    return currentScore > maxScore ? bid : max;
  }, data?.[0]);

  const [dialogState, setDialogState] = useState<{
    selectedItem: Bid | undefined;
    currentAction: "delete" | "edit" | "add" | "evaluate" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const getRowStyle = (params: any) => {
    if (params.data?.id === highestScoreBid?.id && params.data?.evaluation) {
      return { backgroundColor: "rgba(144, 238, 144, 0.3)" };
    }
    return null;
  };

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };
async function approveBid(bidId: number) {
  return await axiosInstance.post(`/${bidId}/approve`);
}

async function rejectBid(bidId: number) {
  return await axiosInstance.post(`/${bidId}/reject`);
}

  const columnDefinitions: ColDef<Bid>[] = [
    {
      headerName: "Quotation Date",
      field: "quotation_date",
      sortable: true,
      filter: true,
      valueGetter: (params) => formatDate(params.data?.quotation_date),
      cellStyle: { whiteSpace: "normal" },
      autoHeight: true,
    },
    {
      headerName: "Supplier",
      field: "supplier.supplier_name",
      sortable: true,
      filter: true,
      valueGetter: (params) =>
        params.data?.rfq_supplier?.supplier.supplier_name || "N/A",
    },
    {
      headerName: "Quotation Ref",
      field: "quotation_ref",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Technical Score",
      field: "technical_score",
      sortable: true,
      filter: true,
      valueGetter: (params) => {
        const evaluation = params.data?.quotation_evaluations?.[0];
        return evaluation ? evaluation.technical_score : "N/A";
      },
      cellStyle: (params) => {
        if (params.data?.id === highestScoreBid?.id) {
          return { fontWeight: "bold" };
        }
        return null;
      },
    },
    {
      headerName: "Commercial Score",
      field: "commercial_score",
      sortable: true,
      filter: true,
      valueGetter: (params) => {
        const evaluation = params.data?.quotation_evaluations?.[0];
        return evaluation ? evaluation.commercial_score : "N/A";
      },
      cellStyle: (params) => {
        if (params.data?.id === highestScoreBid?.id) {
          return { fontWeight: "bold" };
        }
        return null;
      },
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      filter: true,
      cellStyle: (params) => {
        if (params.value === "Approved") {
          return { color: "green", fontWeight: "bold" };
        } else if (params.value === "Rejected") {
          return { color: "red" };
        }
        return null;
      },
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<Bid>) => {
        const bid = params.data;
        if (!bid) return null;

        const hasEvaluations = bid.quotation_evaluations.length > 0;

        return (
          <div className="flex items-center gap-2">
            {!hasEvaluations ? (
              <>
                <button
                  className="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-white text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDialogState({
                      ...dialogState,
                      currentAction: "evaluate",
                      selectedItem: bid,
                    });
                  }}
                >
                  Evaluate
                </button>
                <button
                  className="bg-gray-500 hover:bg-gray-600 px-2 py-1 rounded text-white text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDialogState({
                      ...dialogState,
                      currentAction: "edit",
                      selectedItem: bid,
                    });
                  }}
                >
                  Edit
                </button>
              </>
            ) : (
              <>
                <button
                  className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-white text-sm"
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      await approveBid(bid.id);
                      toast.success("Bid approved successfully");
                      refetchBids(); // Refresh grid data
                    } catch (error) {
                      toast.error("Approval failed");
                    }
                  }}
                >
                  Approve
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-white text-sm"
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      await rejectBid(bid.id);
                      toast.success("Bid rejected successfully");
                      refetchBids(); // Refresh grid data
                    } catch (error) {
                      toast.error("Rejection failed");
                    }
                  }}
                >
                  Reject
                </button>
              </>
            )}
            <Icon
              onClick={(e) => {
                e.stopPropagation();
                setDialogState({
                  ...dialogState,
                  currentAction: "delete",
                  selectedItem: bid,
                });
              }}
              icon="solar:trash-bin-trash-bold"
              className="text-red-500 cursor-pointer hover:text-red-600"
              fontSize={20}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div>
      {dialogState.currentAction === "evaluate" && (
        <EvaluationForm
          onSave={refresh}
          item={{
            rfq_id: dialogState.selectedItem?.request_for_quotation_id,
            supplier_quotation_id: dialogState.selectedItem?.id,
          }}
          visible={!!dialogState.selectedItem}
          onClose={() =>
            setDialogState({ currentAction: "", selectedItem: undefined })
          }
        />
      )}

      {dialogState.currentAction === "add" && (
        <AddOrModifyItem
          onSave={refresh}
          visible
          onClose={() =>
            setDialogState({ currentAction: "", selectedItem: undefined })
          }
        />
      )}

      {dialogState.currentAction === "edit" && (
        <AddOrModifyItem
          onSave={refresh}
          item={dialogState.selectedItem}
          visible
          onClose={() =>
            setDialogState({ currentAction: "", selectedItem: undefined })
          }
        />
      )}

      <ConfirmDeleteDialog
        apiPath={API_ENDPOINTS.BIDS.DELETE(
          dialogState.selectedItem?.id.toString() ?? ""
        )}
        onClose={() =>
          setDialogState({ selectedItem: undefined, currentAction: "" })
        }
        visible={
          !!dialogState.selectedItem?.id &&
          dialogState.currentAction === "delete"
        }
        onConfirm={refresh}
      />

      <BreadCrump
        name={
          rfqTitle
            ? `Quotations for RFQ ${rfqTitle}`
            : "All Supplier Quotations"
        }
        pageName="Supplier Quotation"
      />

      <div className="bg-white px-8 py-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {rfqTitle
                ? `Quotations for RFQ ${rfqTitle}`
                : "All Supplier Quotations"}
            </h1>
            {highestScoreBid?.quotation_evaluation && (
              <p className="text-sm text-gray-600 mt-1">
                Highest scoring bid:{" "}
                <span className="font-semibold">
                  {highestScoreBid.quotation_ref}
                </span>{" "}
                (Score:{" "}
                {highestScoreBid.evaluation.technical_score +
                  highestScoreBid.evaluation.commercial_score}
                )
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() =>
                setDialogState({
                  selectedItem: undefined,
                  currentAction: "add",
                })
              }
              className="bg-teal-600 hover:bg-teal-700 px-3 py-2 rounded text-white flex gap-2 items-center text-sm"
            >
              <Icon icon="solar:add-circle-bold" fontSize={18} />
              Add New Quotation
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-white flex gap-2 items-center text-sm"
              onClick={handleExportPDF}
            >
              <Icon icon="solar:printer-bold" fontSize={18} />
              Export PDF
            </button>
          </div>
        </div>

        <Table
          columnDefs={columnDefinitions}
          data={data}
          ref={tableRef}
          getRowStyle={getRowStyle}
          pagination
          paginationPageSize={10}
          suppressCellFocus
          domLayout="autoHeight"
        />
      </div>
    </div>
  );
};

export default Bids;
