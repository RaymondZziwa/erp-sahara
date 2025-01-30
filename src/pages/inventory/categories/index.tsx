import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import useItemCategories from "../../../hooks/inventory/useCategories";
import { Category } from "../../../redux/slices/types/procurement/categories";
import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../components/table";
import BreadCrump from "../../../components/layout/bread_crump";
import AddOrModifyItem from "./AddOrModifyItem";
import { ItemCategory } from "../../../redux/slices/types/inventory/ItemCategory";
import { INVENTORY_ENDPOINTS } from "../../../api/inventoryEndpoints";

const ItemCategories: React.FC = () => {
  const { data: categories, refresh } = useItemCategories();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedCategory: Category | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedCategory: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<ItemCategory>[] = [
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
    },
    {
      headerName: "Description",
      field: "description",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Items Count",
      field: "items",
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams<Category>) => (
        <div>{params?.data?.items.length}</div>
      ),
      suppressSizeToFit: true,
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<Category>) => (
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
        apiPath={INVENTORY_ENDPOINTS.ITEM_CATEGORIES.DELETE(
          dialogState.selectedCategory?.id.toString() ?? ""
        )}
        onClose={() =>
          setDialogState({ selectedCategory: undefined, currentAction: "" })
        }
        visible={
          !!dialogState.selectedCategory?.id &&
          dialogState.currentAction === "delete"
        }
        onConfirm={refresh}
      />
      <BreadCrump name="Categories" pageName="Categories" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Categories Table</h1>
          </div>
          <div className="flex gap-2">
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
              Add Category
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

export default ItemCategories;
