import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import AddOrModifyItem from "./AddOrModifyItem";
import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../components/table";

import BreadCrump from "../../../components/layout/bread_crump";
import { PROJECTS_ENDPOINTS } from "../../../api/projectsEndpoints";
import useProjects from "../../../hooks/projects/useProjects";
import { Project } from "../../../redux/slices/types/projects/Project";
import { formatCurrency } from "../../../utils/formatCurrency";
import { Link } from "react-router-dom";

const Projects: React.FC = () => {
  const { data, refresh } = useProjects();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: Project | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<Project>[] = [
    {
      headerName: "ID",
      field: "id",
      sortable: true,
      filter: true,
      width: 100,
    },
    {
      headerName: "Name",
      field: "name",
      sortable: true,
      filter: true,
      width: 200,
    },
    {
      headerName: "Category",
      field: "project_category.name",
      sortable: true,
      filter: true,
      width: 150,
    },
    {
      headerName: "Sector",
      field: "sector.sector_name",
      sortable: true,
      filter: true,
      width: 150,
    },
    {
      headerName: "Priority",
      field: "prioty",
      sortable: true,
      filter: true,
      width: 120,
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      filter: true,
      width: 130,
    },
    {
      headerName: "Cost",
      field: "cost",
      sortable: true,
      filter: true,
      width: 150,
      valueFormatter: (params) => formatCurrency(params.value), // Format as currency if required
    },
    {
      headerName: "Location",
      field: "location",
      sortable: true,
      filter: true,
      width: 200,
    },
    {
      headerName: "Start Date",
      field: "start_date",
      sortable: true,
      filter: true,
      width: 150,
    },
    {
      headerName: "End Date",
      field: "end_date",
      sortable: true,
      filter: true,
      width: 150,
    },

    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<Project>) => (
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
          <Link
            to={"/projects/management/projects/" + params.data?.id}
            className="bg-shade px-2 py-1 rounded text-white"
          >
            Details
          </Link>
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
      {(dialogState.currentAction == "add" ||
        dialogState.currentAction == "edit") && (
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
      )}
      {dialogState.selectedItem && (
        <ConfirmDeleteDialog
          apiPath={PROJECTS_ENDPOINTS.PROJECTS.DELETE(
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
      <BreadCrump name="Projects" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Projects Table</h1>
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
              Add Project
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

export default Projects;
