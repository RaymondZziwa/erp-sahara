import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import AddOrModifyItem from "./AddOrModifyItem";

import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../components/layout/bread_crump";
import { INVENTORY_ENDPOINTS } from "../../../api/inventoryEndpoints";
import Table from "../../../components/table";
import useDrivers from "../../../hooks/inventory/useDrivers";
import { Driver } from "../../../redux/slices/types/inventory/Driver";

const Drivers: React.FC = () => {
  const { data: categories, refresh } = useDrivers();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: Driver | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<Driver>[] = [
    {
      headerName: "ID",
      field: "id",
      sortable: true,
      filter: true,
      width: 100,
    },
    {
      headerName: "Licence Number",
      field: "license_number",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Staff ID",
      field: "employee_id",
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
      cellRenderer: (params: ICellRendererParams<Driver>) => (
        <div className="flex items-center gap-2">
          {params.data?.status == 1 ? "Available" : "Not available"}
        </div>
      ),
    },

    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<Driver>) => (
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
          apiPath={INVENTORY_ENDPOINTS.DRIVERS.DELETE(
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
      <BreadCrump name="Drivers" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Drivers</h1>
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
              Add driver
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

export default Drivers;
