
import React, { useEffect, useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";

import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../components/table";
import BreadCrump from "../../../components/layout/bread_crump";
import AddOrModifyItem from "./AddOrModifyItem";
import { Inventory } from "../../../redux/slices/types/inventory/Inventory";
import { useNavigate } from "react-router-dom";
import useInventoryRecords from "../../../hooks/inventory/useInventoryRecords";

const Inventories: React.FC = () => {
  const { data, refresh } = useInventoryRecords();
  const navigate = useNavigate()
  const tableRef = useRef<any>(null);

  const [storeId, setStoreId] = useState(1)
  const [storeData, setStoreData] = useState([])

  useEffect(()=> {
      if(!data) {
        refresh();
      }else{
        const dat = data.filter((store) => store.warehouse_id === storeId);
        setStoreData(dat[0]?.stock_movements?.stock_in)
      }
    }, [storeId])

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
      // {
      //   headerName: "ID",
      //   field: "id",
      //   sortable: true,
      //   filter: true,
      //   width: 100,
      // },
      {
        headerName: "Name",
        field: "item_name",
        sortable: true,
        filter: true,
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
    ];

  return (
    <div>
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
            <h1 className="text-xl font-bold">Inventory transactions Table</h1>
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
