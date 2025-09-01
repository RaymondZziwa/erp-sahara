import React, { useEffect, useRef, useState } from "react";
import { ColDef } from "ag-grid-community";
import { Icon } from "@iconify/react";
import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../components/table";
import BreadCrump from "../../../components/layout/bread_crump";
import { Inventory } from "../../../redux/slices/types/inventory/Inventory";
import TransferStock from "./transfer_stock_modal";
import useInventoryRecords from "../../../hooks/inventory/useInventoryRecords";
import { Dropdown } from "primereact/dropdown";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

const StockOut: React.FC = () => {
  const { data, refresh } = useInventoryRecords();
  const tableRef = useRef<any>(null);
  const [storeId, setStoreId] = useState<number | 'all'>('all');
  const [storeData, setStoreData] = useState<any[]>([]);
  const stores = useSelector((state: RootState) => state.warehouses.data);
  const navigate = useNavigate();
  
  const warehouses = [
    { label: "All Stores", value: "all" },
    ...(stores?.map(warehouse => ({
      label: warehouse.name, 
      value: warehouse.id, 
    })) || [])
  ];

  const [dialogState, setDialogState] = useState<{
    selectedItem: Inventory | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  useEffect(() => {
    if (!data) {
      refresh();
    } else {
      if (storeId === 'all') {
        // Combine all stock out transactions from all warehouses
        const allTransactions = data.flatMap(store => 
          store.stock_movements?.stock_out.transactions || []
        );
        setStoreData(allTransactions);
      } else {
        // Filter for specific warehouse
        const warehouseData = data.find(store => store.warehouse_id === storeId);
        setStoreData(warehouseData?.stock_movements?.stock_out.transactions || []);
      }
    }
  }, [storeId, data, refresh]);

  const columnDefinitions: ColDef<any>[] = [
    {
      headerName: "Name",
      field: "item.name",
      sortable: true,
      filter: true,
      cellClass: 'cursor-pointer hover:underline',
      onCellClicked: (event) => {
        console.log(event.data.item_id)
        navigate(`/inventory/item/${event.data.item_id}/${event.data.item_name}`);
      },
    },
    {
      headerName: "Transaction type",
      field: "transaction_type",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Quantity",
      field: "quantity",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Quantity In Store",
      field: "quantity",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Warehouse",
      field: "warehouse.name",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
      valueGetter: (params) => params.data.warehouse?.name || 'N/A',
    },
    {
      headerName: "Date",
      field: "movement_date",
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
      headerName: "Remarks",
      field: "remarks",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Picked by",
      field: "status",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
  ];

  return (
    <div>
      <ToastContainer />
      <TransferStock
        onSave={refresh}
        item={dialogState.selectedItem}
        visible={
          dialogState.currentAction == "add" ||
          (dialogState.currentAction == "edit" && !!dialogState.selectedItem)
        }
        onClose={() =>
          setDialogState({ currentAction: "", selectedItem: undefined })
        }
      />
      <ConfirmDeleteDialog
        apiPath={`/procurement/items/${dialogState.selectedItem?.id}/delete`}
        onClose={() =>
          setDialogState({ selectedItem: undefined, currentAction: "" })
        }
        visible={
          !!dialogState.selectedItem?.id &&
          dialogState.currentAction === "delete"
        }
        onConfirm={refresh}
      />
      <BreadCrump name="Inventory" pageName="Stock Out" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Stock Out transactions</h1>
          </div>
          <div className="flex gap-2 h-[50px] mb-10 mt-4">
            <div className="p-field">
              <Dropdown
                required
                name="type"
                value={storeId}
                onChange={(e) => setStoreId(e.value)}
                options={warehouses}
                optionLabel="label"
                placeholder="Select warehouse"
                filter
                className="w-full md:w-14rem"
              />
            </div>
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
              Stock Out
            </button>
            {/* <button
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
              onClick={handleExportPDF}
            >
              <Icon icon="solar:printer-bold" fontSize={20} />
              Print
            </button> */}
          </div>
        </div>
        <Table columnDefs={columnDefinitions} data={storeData} ref={tableRef} />
      </div>
    </div>
  );
};

export default StockOut;