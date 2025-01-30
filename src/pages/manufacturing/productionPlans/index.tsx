import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import AddOrModifyItem from "./AddOrModifyItem";

import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../components/layout/bread_crump";
import Table from "../../../components/table";
import { MANUFACTURING_ENDPOINTS } from "../../../api/manufacturingEndpoints";
import { Link } from "react-router-dom";
import useProductionPlans from "../../../hooks/manufacturing/workCenter/useProductionPlans";
import { ProductionPlan } from "../../../redux/slices/types/manufacturing/ProductionPlan";

const ProductionPlans: React.FC = () => {
  const { data, refresh } = useProductionPlans();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: ProductionPlan | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<ProductionPlan>[] = [
    {
      headerName: "ID",
      field: "id",
      sortable: true,
      filter: true,
      width: 100,
      cellRenderer: (params: ICellRendererParams<ProductionPlan>) => {
        return (
          <Link
            className="text-teal-500"
            to={`/manufacturing/workcenters/productionplans/${params.data?.id}`}
          >
            {params?.data?.id.toString()}
          </Link>
        );
      },
    },
    {
      headerName: "Name",
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams<ProductionPlan>) => {
        return (
          <Link
            className="text-teal-500"
            to={`/manufacturing/workcenters/productionplans/${params.data?.id}`}
          >
            {params?.data?.id}
          </Link>
        );
      },
    },
    {
      headerName: "Planned End",
      field: "planned_end_date",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Planned Start Date",
      field: "planned_start_date",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Status",
      field: "status",
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
      headerName: "Created",
      field: "created_at",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<ProductionPlan>) => (
        <div className="flex items-center gap-2">
          <button
            className="bg-shade px-2 py-1 rounded text-white"
            onClick={() =>
              setDialogState({
                ...dialogState,
                currentAction: "edit",
                selectedItem: params.data,
              })
            }
          >
            Edit
          </button>
          <Icon
            onClick={() =>
              setDialogState({
                ...dialogState,
                currentAction: "delete",
                selectedItem: params.data,
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
      <AddOrModifyItem
        onSave={refresh}
        item={dialogState.selectedItem}
        visible={
          dialogState.currentAction == "add" ||
          (dialogState.currentAction == "edit" &&
            !!dialogState.selectedItem?.id)
        }
        onClose={() =>
          setDialogState({ currentAction: "", selectedItem: undefined })
        }
      />
      {dialogState.selectedItem && (
        <ConfirmDeleteDialog
          apiPath={MANUFACTURING_ENDPOINTS.WORK_CENTERS.DELETE(
            dialogState.selectedItem?.id.toString()
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
      )}
      <BreadCrump name="Production Plans" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Production Plans Table</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setDialogState({
                  selectedItem: undefined,
                  currentAction: "add",
                })
              }
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
            >
              <Icon icon="solar:add-circle-bold" fontSize={20} />
              Add Center
            </button>
            <button
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
              onClick={handleExportPDF}
            >
              <Icon icon="solar:printer-bold" fontSize={20} />
              Print
            </button>
          </div>
        </div>
        <Table columnDefs={columnDefinitions} data={data} ref={tableRef} />
      </div>
    </div>
  );
};

export default ProductionPlans;
