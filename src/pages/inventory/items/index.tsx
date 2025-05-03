//@ts-nocheck
import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import { Button } from "primereact/button";

import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../components/table";
import BreadCrump from "../../../components/layout/bread_crump";
import AddOrModifyItem from "./AddOrModifyItem";
import useItems from "../../../hooks/inventory/useItems";
import { InventoryItem } from "../../../redux/slices/types/inventory/Items";
import { INVENTORY_ENDPOINTS } from "../../../api/inventoryEndpoints";
import { useNavigate } from "react-router-dom";
import { imageURL } from "../../../utils/api";

const ImagePreviewModal: React.FC<{
  visible: boolean;
  images: { image_url: string }[];
  onClose: () => void;
}> = ({ visible, images, onClose }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Image Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Icon icon="mdi:close" className="text-xl" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 overflow-y-auto">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={`${imageURL}/${img.image_url}`}
                alt={`Preview ${index}`}
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Items: React.FC = () => {
  const { data, refresh } = useItems();
  const tableRef = useRef<any>(null);
  const navigate = useNavigate();

  const [dialogState, setDialogState] = useState<{
    selectedItem: InventoryItem | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const [imageModal, setImageModal] = useState<{
    visible: boolean;
    images: { image_url: string }[];
  }>({ visible: false, images: [] });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<InventoryItem>[] = [
    {
      headerName: "Image",
      field: "item_images",
      sortable: true,
      filter: true,
      flex: 4,
      cellClass: "text-sm",
      cellRenderer: (params) => {
        if (!params.value || params.value.length === 0) return "-";

        const firstImage = params.value[0];
        const imageUrl = firstImage
          ? `${imageURL}/${firstImage.image_url}`
          : firstImage.image_url || firstImage.objectURL;

        return (
          <div>
            <img src={imageUrl} alt="Product" className="h-10 w-10" />
          </div>
        );
      },
      autoHeight: true, // Optional: Adjust row height to fit image
    },
    {
      headerName: "Name",
      field: "name",
      sortable: true,
      filter: true,
      flex: 4,
      cellClass: "text-sm",
      autoHeight: true,
    },
    // {
    //   headerName: "Description",
    //   field: "description",
    //   sortable: true,
    //   filter: true,
    //   flex: 1,
    //   cellClass: "text-sm",
    //   autoHeight: true,
    // },
    {
      headerName: "Cost Price",
      field: "cost_price",
      sortable: true,
      filter: true,
      width: 120,
      valueFormatter: (params) => `${Math.floor(params.value)}`,
      cellClass: "text-sm font-medium",
    },
    {
      headerName: "Selling Price",
      field: "selling_price",
      sortable: true,
      filter: true,
      width: 120,
      valueFormatter: (params) => `${Math.floor(params.value)}`,
      cellClass: "text-sm font-medium",
    },
    // {
    //   headerName: "SKU",
    //   field: "sku_unit",
    //   sortable: true,
    //   filter: true,
    //   width: 120,
    //   cellClass: "text-sm",
    // },
    // {
    //   headerName: "Stock Alert",
    //   field: "stock_alert_level",
    //   sortable: true,
    //   filter: true,
    //   width: 120,
    //   cellClass: "text-sm",
    // },
    // {
    //   headerName: "Reference",
    //   field: "reference",
    //   sortable: true,
    //   filter: true,
    //   width: 120,
    //   cellClass: "text-sm",
    // },
    // {
    //   headerName: "Shell life",
    //   field: "shell_life",
    //   sortable: true,
    //   filter: true,
    //   width: 120,
    //   cellClass: "text-sm",
    // },
    // {
    //   headerName: "Images",
    //   field: "item_images",
    //   width: 120,
    //   cellRenderer: (params: ICellRendererParams<InventoryItem>) => {
    //     const images = params.data?.item_images || [];
    //     return images.length > 0 ? (
    //       <button
    //         onClick={() => setImageModal({ visible: true, images })}
    //         className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
    //       >
    //         View ({images.length})
    //       </button>
    //     ) : (
    //       <span className="text-gray-400 text-sm">No images</span>
    //     );
    //   },
    // },
    {
      headerName: "Actions",
      field: "id",
      width: 100, // reduced width
      cellRenderer: (params: ICellRendererParams<InventoryItem>) => (
        <div className="flex items-center gap-1 pt-2">
          <Button
            icon="pi pi-pencil"
            className="p-0 h-6 w-6 text-xs p-button-rounded p-button-text p-button-secondary"
            onClick={() =>
              setDialogState({
                ...dialogState,
                currentAction: "edit",
                selectedItem: params.data,
              })
            }
            tooltip="Edit"
            tooltipOptions={{ position: "top" }}
          />
          <Button
            icon="pi pi-trash"
            className="p-0 h-6 w-6 text-xs p-button-rounded p-button-text p-button-danger"
            onClick={() =>
              setDialogState({
                ...dialogState,
                currentAction: "delete",
                selectedItem: params.data,
              })
            }
            tooltip="Delete"
            tooltipOptions={{ position: "top" }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AddOrModifyItem
        onSave={refresh}
        item={dialogState.selectedItem}
        visible={
          dialogState.currentAction === "add" ||
          (dialogState.currentAction === "edit" && !!dialogState.selectedItem)
        }
        onClose={() =>
          setDialogState({ currentAction: "", selectedItem: undefined })
        }
      />

      <ConfirmDeleteDialog
        apiPath={INVENTORY_ENDPOINTS.INVENTORIES.DELETE(
          dialogState.selectedItem?.id.toString() || ""
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

      <ImagePreviewModal
        visible={imageModal.visible}
        images={imageModal.images}
        onClose={() => setImageModal({ visible: false, images: [] })}
      />

      <BreadCrump name="Items" pageName="Inventory Management" />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Inventory Items
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your product inventory
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              label="Add Item"
              icon="pi pi-plus"
              className="p-button-primary"
              onClick={() => navigate("/inventory/inventory/items/add")}
            />
            <Button
              label="Export"
              icon="pi pi-download"
              className="p-button-outlined p-button-secondary"
              onClick={handleExportPDF}
            />
          </div>
        </div>

        <div className="p-6">
          <Table
            columnDefs={columnDefinitions}
            data={data}
            ref={tableRef}
            //@ts-ignore
            className="ag-theme-alpine-compact"
            style={{ height: "calc(100vh - 260px)" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Items;
