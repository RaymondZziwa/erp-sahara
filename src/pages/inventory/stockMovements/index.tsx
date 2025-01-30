import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import { Calendar } from "primereact/calendar";

import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../components/table";
import BreadCrump from "../../../components/layout/bread_crump";
import AddOrModifyItem from "./AddOrModifyItem";
import { INVENTORY_ENDPOINTS } from "../../../api/inventoryEndpoints";
import { StockMovement } from "../../../redux/slices/types/inventory/StockMovement";
import useStockMovements from "../../../hooks/inventory/useStockMovementss";
import { Nullable } from "primereact/ts-helpers";

interface StockData {
  item_name: string;
  stock_purchased: number;
  stock_sold: number;
  stock_manufactured: number;
  stock_written_off: number;
  stock_returned: number;
  stock_transferred_out: number;
  stock_transferred_in: number;
  closing_stock: number;
}

interface StoreData {
  [itemId: string]: StockData;
}

interface Data {
  [storeName: string]: StoreData;
}

const StockMovements: React.FC = () => {
  // Calculate default start and end dates
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

  // Initialize state with default values
  const [startDate, setStartDate] = useState<Nullable<Date> | null>(
    oneMonthAgo
  );
  const [endDate, setEndDate] = useState<Nullable<Date> | null>(today);

  const { data: rawData, refresh } = useStockMovements({
    startDate: new Date(startDate ?? new Date()).toISOString().slice(0, 10),
    endDate: new Date(endDate ?? new Date()).toISOString().slice(0, 10),
  });
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedCategory: StockMovement | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedCategory: undefined, currentAction: "" });

  const processData = (data: Data): Array<any> => {
    const result: Array<any> = [];
    Object.entries(data).forEach(([storeName, storeData]) => {
      Object.entries(storeData).forEach(([itemId, stockData]) => {
        result.push({
          id: itemId,
          store: storeName,
          ...stockData,
        });
      });
    });
    return result;
  };
  //@ts-ignore
  const processedData = processData(rawData || {});

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef[] = [
    {
      headerName: "Store",
      field: "store",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Item Name",
      field: "item_name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Stock Purchased",
      field: "stock_purchased",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Stock Sold",
      field: "stock_sold",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Closing Stock",
      field: "closing_stock",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams) => (
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
          dialogState.currentAction === "add" ||
          (dialogState.currentAction === "edit" &&
            !!dialogState.selectedCategory?.id)
        }
        onClose={() =>
          setDialogState({ currentAction: "", selectedCategory: undefined })
        }
      />
      <ConfirmDeleteDialog
        apiPath={INVENTORY_ENDPOINTS.STOCK_MOVEMENTS.DELETE(
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
      <BreadCrump name="Stock movements" pageName="Stock movements" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-sm font-medium">Start Date:</label>
              <Calendar
                value={startDate}
                onChange={(e) => setStartDate(e.value)}
                className="border rounded px-2 py-1"
                dateFormat="yy-mm-dd"
                placeholder="Select Start Date"
                showIcon
              />
            </div>
            <div>
              <label className="block text-sm font-medium">End Date:</label>
              <Calendar
                value={endDate}
                onChange={(e) => setEndDate(e.value)}
                className="border rounded px-2 py-1"
                dateFormat="yy-mm-dd"
                placeholder="Select End Date"
                showIcon
              />
            </div>
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
              Move Stock
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
          data={processedData}
          ref={tableRef}
        />
      </div>
    </div>
  );
};

export default StockMovements;
