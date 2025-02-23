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

const Inventories: React.FC = () => {
  const { data, refresh } = useInventoryRecords();
  const tableRef = useRef<any>(null);
  const navigate = useNavigate()
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

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
      const dat = data.filter((store) => store.warehouse_id === storeId);
      setStoreData(dat[0]?.stock_movements?.stock_in);
    }
  }, [storeId]);

  const [dialogState, setDialogState] = useState<{
    selectedItem: Inventory | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<any>[] = [
    {
      headerName: "Name",
      field: "item_name",
      sortable: true,
      filter: true,
      cellClass: 'cursor-pointer hover:underline',
      onCellClicked: (event) => {
        navigate(`/inventory/item/${event.data.item_id}/${event.data.item_name}`);
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
      cellClass: "flex justify-center",
      //@ts-expect-error --ignore
      cellRenderer: (params) => {
        const status = params.data.status;
        return status === "pending" ? (
          <button
            onClick={() => {
              setSelectedStore(params.data.warehouse_id); // Use params.data.warehouse_id
              setIsConfirmModalOpen(true);
              setRecordId(params.data.id)
            }}
            className="rounded-md text-white bg-orange-500 h-8 w-16 -p-5 flex ite"
          >
            Confirm
          </button>
        ) : null;
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
        onSave={() => {}}
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
        <Table columnDefs={columnDefinitions} data={storeData} ref={tableRef} />
      </div>
    </div>
  );
};

export default Inventories;