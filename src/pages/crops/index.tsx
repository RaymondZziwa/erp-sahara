import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import AddOrModifyCrop from "./AddOrModifyItem";
import ConfirmDeleteDialog from "../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../components/layout/bread_crump";
import Table from "../../components/table";
import useCrops from "../../hooks/crops/useCrops";
import { Crop } from "../../redux/slices/types/crops/Crop";
import { CROPS_ENDPOINTS } from "../../api/cropsEndpoints";

const Crops: React.FC = () => {
  const { data: crops, refresh } = useCrops();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: Crop | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<Crop>[] = [
    {
      headerName: "ID",
      field: "id",
      sortable: true,
      filter: true,
      width: 100,
      sort: "asc", 
    },
    {
      headerName: "Crop Name",
      field: "name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Growth Period",
      field: "growth_period",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Crop Type",
      field: "crop_type",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Description",
      field: "description",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<Crop>) => (
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
      <AddOrModifyCrop
        onSave={refresh}
        item={dialogState.selectedItem}
        visible={
          dialogState.currentAction === "add" ||
          (dialogState.currentAction === "edit" && !!dialogState.selectedItem?.id)
        }
        onClose={() => setDialogState({ currentAction: "", selectedItem: undefined })}
      />

      {dialogState.selectedItem && (
        <ConfirmDeleteDialog
          apiPath={CROPS_ENDPOINTS.CROPS.DELETE(dialogState.selectedItem?.id.toString())}
          onClose={() => setDialogState({ selectedItem: undefined, currentAction: "" })}
          visible={!!dialogState.selectedItem?.id && dialogState.currentAction === "delete"}
          onConfirm={refresh}
        />
      )}

      <BreadCrump name="Crops" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Crops Table</h1>
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
              Add Crop
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
        <Table columnDefs={columnDefinitions} data={crops} ref={tableRef} />
      </div>
    </div>
  );
};

export default Crops;
