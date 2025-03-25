import React, { useEffect, useRef, useState } from "react";
import { ColDef } from "ag-grid-community";
import { Icon } from "@iconify/react";
import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../components/table";
import BreadCrump from "../../../components/layout/bread_crump";
import AddOrModifyItem from "./AddOrModifyItem";
import { Inventory } from "../../../redux/slices/types/inventory/Inventory";
import useInventoryRecords from "../../../hooks/inventory/useInventoryRecords";
import useWarehouses from "../../../hooks/inventory/useWarehouses";
import { Dropdown } from "primereact/dropdown";
import ConfirmModal from "./confirm_modal";
import { useNavigate } from "react-router-dom";
import { INVENTORY_ENDPOINTS } from "../../../api/inventoryEndpoints";
import { createRequest } from "../../../utils/api";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

const Inventories: React.FC = () => {
  const { data, refresh } = useInventoryRecords();
  const tableRef = useRef<any>(null);
  const navigate = useNavigate()
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const token = useSelector((state: RootState)=> state.userAuth.token);
  const [storeId, setStoreId] = useState(1);
  const [storeData, setStoreData] = useState([]);
  const [selectedStore, setSelectedStore] = useState(0);
  const [recordId, setRecordId] = useState(0)

  const { data: warehousesd } = useWarehouses();
  const warehouses =
    warehousesd?.map((warehouse) => ({
      label: warehouse.name,
      value: warehouse.id,
    })) || [];

  useEffect(() => {
    if (!data) {
      refresh();
    } else {
      const dat = data && data.filter((store) => store.warehouse_id === storeId);
      setStoreData(dat[0]?.stock_movements?.stock_in.transactions);
    }
  }, [storeId, data]);

  const [dialogState, setDialogState] = useState<{
    selectedItem: Inventory | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const reverseTransaction = async (id: number) => {
    try {
      console.log("Reversing transaction for ID:", id); // Debugging log

      await createRequest(
        INVENTORY_ENDPOINTS.INVENTORIES.REVERSE,
        token.access_token,
        { unique_id: id },
        refresh,
        "POST"
      );

      refresh();
    } catch (error) {
      console.log("Failed to reverse transaction", error);
    }
  };


  const columnDefinitions: ColDef<any>[] = [
    {
      headerName: "Name",
      field: "item.name",
      sortable: true,
      filter: true,
      cellClass: "cursor-pointer hover:underline",
      onCellClicked: (event) => {
        navigate(
          `/inventory/item/${event.data.item_id}/${event.data.item_name}`
        );
      },
    },
    {
      headerName: "Quantity",
      field: "quantity",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
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
      headerName: "Action",
      cellClass: "flex justify-center space-x-2",
      //@ts-expect-error --ignore
      cellRenderer: (params) => {
        const status = params.data.status;

        return (
          <div className="flex gap-2">
            {/* Confirm Button - Only visible when status is 'pending' */}
            {status === "pending" && (
              <button
                onClick={() => {
                  setSelectedStore(params.data.warehouse_id);
                  setIsConfirmModalOpen(true);
                  setRecordId(params.data.id);
                }}
                className="rounded-md text-white bg-orange-500 h-8 w-20 flex items-center justify-center"
              >
                Confirm
              </button>
            )}

            {/* Reverse Transaction Button - Always Visible */}
            <button
              onClick={() => {
                // Handle reverse transaction logic
                setRecordId(params.data.id);
                //setIsReverseModalOpen(true);
              }}
              className="rounded-md text-white bg-red-500 pb-2 pr-2 pl-2 flex items-center justify-center"
              onClickCapture={() => reverseTransaction(params.data.id)}
            >
              Undo
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <ConfirmModal
        record_id={recordId} // Example record ID
        warehouse_id={selectedStore} // Pass selectedStore directly
        onClose={() => setIsConfirmModalOpen(false)}
        visible={isConfirmModalOpen}
        onSave={refresh}
        refresh={refresh}
      />
      <AddOrModifyItem
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
        apiPath={`/erp/procurement/items/${dialogState.selectedItem?.id}/delete`}
        onClose={() =>
          setDialogState({ selectedItem: undefined, currentAction: "" })
        }
        visible={
          !!dialogState.selectedItem?.id &&
          dialogState.currentAction === "delete"
        }
        onConfirm={refresh}
      />
      <BreadCrump name="Inventory" pageName="Items" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Inventory transactions</h1>
          </div>
          <div className="flex gap-2 h-[50px] mb-10 mt-4">
            <div className="p-field">
              <Dropdown
                required
                name="type"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                options={warehouses}
                optionLabel="label"
                optionValue="value"
                placeholder="Select type"
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
              New Stock
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
        <Table columnDefs={columnDefinitions} data={storeData ? storeData : []} ref={tableRef} />
      </div>
    </div>
  );
};

export default Inventories;