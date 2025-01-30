import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import ConfirmDeleteDialog from "../../../components/dialog/mossApp/ConfirmDeleteDialog";
import Table from "../../../components/table";
import BreadCrump from "../../../components/layout/bread_crump";
import AddOrModifyItem from "./AddOrModifyItem";

import useSliders from "../../../hooks/mossApp/useSliders";
import { SliderItem } from "../../../redux/slices/types/mossApp/Slider";
import SliderGallery from "./SliderGallery";

import { MOSS_APP_ENDPOINTS } from "../../../api/mossAppEndpoints";

const Sliders: React.FC = () => {
  const { data: categories, refresh } = useSliders();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedCategory: SliderItem | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedCategory: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<SliderItem>[] = [
    {
      headerName: "ID",
      field: "id",
      sortable: true,
      filter: true,
      width: 100,
    },
    {
      headerName: "Name",
      field: "title",
      sortable: true,
      filter: true,
    },
    {
      headerName: "URL",
      field: "url",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Type",
      field: "type",
      sortable: true,
      filter: true,
    },

    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<SliderItem>) => (
        <div className="flex items-center gap-2">
          {typeof params.data?.image == "string" && (
            <img
              className="h-10 w-20 rounded cursor-pointer"
              src={params.data?.image}
              alt={params.data?.title}
            />
          )}
        </div>
      ),
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<SliderItem>) => (
        <div className="flex items-center gap-2">
          <button
            className="bg-shade px-2 py-1 rounded text-white"
            onClick={() =>
              setDialogState({
                ...dialogState,
                currentAction: "edit",
                selectedCategory: params.data,
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
                selectedCategory: params.data,
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
        item={dialogState.selectedCategory}
        visible={
          dialogState.currentAction == "add" ||
          (dialogState.currentAction == "edit" &&
            !!dialogState.selectedCategory?.id)
        }
        onClose={() =>
          setDialogState({ currentAction: "", selectedCategory: undefined })
        }
      />
      <ConfirmDeleteDialog
        apiPath={MOSS_APP_ENDPOINTS.SLIDERS.DELETE(
          dialogState.selectedCategory?.id.toString() ?? ""
        )}
        onClose={() =>
          setDialogState({ selectedCategory: undefined, currentAction: "" })
        }
        visible={
          !!dialogState.selectedCategory?.id &&
          dialogState.currentAction === "delete"
        }
        onConfirm={() => {
          refresh();
        }}
      />
      <BreadCrump name="Slider" pageName="Slider" />

      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Slider Table</h1>
          </div>
          <div className="flex gap-2 my-3">
            <button
              onClick={() =>
                setDialogState({
                  selectedCategory: undefined,
                  currentAction: "add",
                })
              }
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
            >
              <Icon icon="solar:add-circle-bold" fontSize={20} />
              Add Slider
            </button>
            <SliderGallery
              images={categories.map((item) => ({
                ...item,
                image: item.image,
              }))}
            />
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

export default Sliders;
