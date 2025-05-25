import React, { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../components/table";
import BreadCrump from "../../../components/layout/bread_crump";
import AddOrModifyItem from "./AddOrModifyItem";
import EvaluationForm  from "../bidEvaluation/AddOrModifyItem";

import { API_ENDPOINTS } from "../../../api/apiEndpoints";
import { Bid } from "../../../redux/slices/types/procurement/Bid";
import useBids from "../../../hooks/procurement/useBids";

const Bids: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const rfqId = searchParams.get("rfq_id");

  const { data: allBids, refresh } = useBids();
  const tableRef = useRef<any>(null);

  // Filter bids by RFQ ID if provided
  const data = rfqId
    ? allBids?.filter((bid) => bid.rfq_id === rfqId)
    : allBids;

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

  // Custom cell style for highlighting the best bid
  const getRowStyle = (params: any) => {
    if (params.data?.id === highestScoreBid?.id && params.data?.evaluation) {
      return { backgroundColor: "rgba(144, 238, 144, 0.3)" }; // Light green background
    }
    return null;
  };

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<Bid>[] = [
    {
      headerName: "Quotation Date",
      field: "quotation_date",
      sortable: true,
      filter: true,
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
      valueGetter: (params) =>
        params.data?.quotation_evaluations[0].technical_score || "N/A",
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
      valueGetter: (params) =>
        params.data?.quotation_evaluations[0].commercial_score || "N/A",
      cellStyle: (params) => {
        if (params.data?.id === highestScoreBid?.id) {
          return { fontWeight: "bold" };
        }
        return null;
      },
    },
    // {
    //   headerName: "Total Score",
    //   field: "total_score",
    //   sortable: true,
    //   filter: true,
    //   valueGetter: (params) => {
    //     const eval = params.data?.evaluation;
    //     return eval ? eval.technical_score + eval.commercial_score : "N/A";
    //   },
    //   cellStyle: (params) => {
    //     if (params.data?.id === highestScoreBid?.id) {
    //       return { fontWeight: "bold" };
    //     }
    //     return null;
    //   },
    // },
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
      cellRenderer: (params: ICellRendererParams<Bid>) => (
        <div className="flex items-center gap-2">
          {!params.data?.quotation_evaluations === 0 && (
            <>
              <button
                className="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-white text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setDialogState({
                    ...dialogState,
                    currentAction: "evaluate",
                    selectedItem: params.data,
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
                    selectedItem: params.data,
                  });
                }}
              >
                Edit
              </button>
            </>
          )}
          <Icon
            onClick={(e) => {
              e.stopPropagation();
              setDialogState({
                ...dialogState,
                currentAction: "delete",
                selectedItem: params.data,
              });
            }}
            icon="solar:trash-bin-trash-bold"
            className="text-red-500 cursor-pointer hover:text-red-600"
            fontSize={20}
          />
        </div>
      ),
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
          visible={dialogState.currentAction === "add"}
          onClose={() =>
            setDialogState({ currentAction: "", selectedItem: undefined })
          }
        />
      )}

      {dialogState.currentAction === "edit" && (
        <AddOrModifyItem
          onSave={refresh}
          item={dialogState.selectedItem}
          visible={!!dialogState.selectedItem}
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
          data.rfq_number
            ? `Quotations for RFQ ${data.rfq_number}`
            : "All Supplier Quotations"
        }
        pageName="Supplier Quotation"
      />

      <div className="bg-white px-8 py-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {data.rfq_number
                ? `Quotations for RFQ ${data.rfq_number}`
                : "All Supplier Quotations"}
            </h1>
            {highestScoreBid?.evaluation && (
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
          pagination={true}
          paginationPageSize={10}
          suppressCellFocus={true}
          domLayout="autoHeight"
        />
      </div>
    </div>
  );
};

export default Bids;
