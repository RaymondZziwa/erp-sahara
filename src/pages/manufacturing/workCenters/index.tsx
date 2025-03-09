import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import AddOrModifyItem from "./AddOrModifyItem";

import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../components/layout/bread_crump";
import Table from "../../../components/table";
import useWorkCenters from "../../../hooks/manufacturing/workCenter/useWorkCenters";
import { WorkCenter } from "../../../redux/slices/types/manufacturing/WorkCenter";
import { MANUFACTURING_ENDPOINTS } from "../../../api/manufacturingEndpoints";
import { Link } from "react-router-dom";

const WorkCenters: React.FC = () => {
  const { data: categories, refresh } = useWorkCenters();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: WorkCenter | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<WorkCenter>[] = [
    {
      headerName: "ID",
      field: "id",
      sortable: true,
      filter: true,
      width: 100,
      cellRenderer: (params: ICellRendererParams<WorkCenter>) => {
        return (
          <Link
            className="text-teal-500"
            to={`/manufacturing/workcenters/centers/${params.data?.id}`}
          >
            {params?.data?.id.toString()}
          </Link>
        );
      },
    },
    {
      headerName: "Name",
      field: "name",
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams<WorkCenter>) => {
        return (
          <Link
            className="text-teal-500"
            to={`/manufacturing/workcenters/centers/${params.data?.id}`}
          >
            {params?.data?.name.toString()}
          </Link>
        );
      },
    },
    {
      headerName: "Location",
      field: "location",
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
      cellRenderer: (params: ICellRendererParams<WorkCenter>) => (
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
    }
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
      <BreadCrump name="Work centers" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Work centers</h1>
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
        <Table
          columnDefs={columnDefinitions}
          data={categories}
          ref={tableRef}
        />
      </div>
    </div>
  );
};

export default WorkCenters;
