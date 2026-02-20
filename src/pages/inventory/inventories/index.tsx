import React, { useEffect, useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
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
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { ToastContainer } from "react-toastify";

const Inventories: React.FC = () => {
  const { data, refresh } = useInventoryRecords();
  const tableRef = useRef<any>(null);
  const navigate = useNavigate();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isReverseModalOpen, setIsReverseModalOpen] = useState(false);
  const [reversalReason, setReversalReason] = useState("");
  const [record, setRecord] = useState()

  const token = useSelector((state: RootState) => state.userAuth.token);
  const [storeId, setStoreId] = useState<number | 'all'>('all');
  const [storeData, setStoreData] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState(0);
  const [recordId, setRecordId] = useState(0);
  const [reversalId, setReversalId] = useState(0);

  const { data: warehousesd } = useWarehouses();
  
  // Add 'All Stores' option to the dropdown
  const warehouses = [
    { label: "All Stores", value: "all" },
    ...(warehousesd?.map((warehouse) => ({
      label: warehouse.name,
      value: warehouse.id,
    })) || [])
  ];

  // Fix date formatting function
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "N/A";
    
    try {
      // Handle different date formats that might come from API
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn("Invalid date:", dateString);
        return "Invalid Date";
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "Invalid Date";
    }
  };

  // Fix the infinite loop by adding proper dependencies
  useEffect(() => {
    if (!data) {
      refresh();
    } else {
      let processedData;
      if (storeId === 'all') {
        // Combine all stock in transactions from all warehouses
        processedData = data.flatMap(store => 
          store.stock_movements?.stock_in.transactions || []
        );
      } else {
        // Filter for specific warehouse
        const warehouseData = data.find(store => store.warehouse_id === storeId);
        processedData = warehouseData?.stock_movements?.stock_in.transactions || [];
      }

      // Process dates before setting state to avoid warnings
      const processedDataWithFormattedDates = processedData.map(item => ({
        ...item,
        // Create a display date field to avoid AG-Grid date parsing issues
        display_date: formatDateForDisplay(item.movement_date),
        // Ensure the original field is in correct format if needed for sorting/filtering
        movement_date: item.movement_date ? new Date(item.movement_date).toISOString().split('T')[0] : item.movement_date
      }));

      setStoreData(processedDataWithFormattedDates);
    }
  }, [storeId, data]); // Removed refresh from dependencies to prevent infinite loops

  const [dialogState, setDialogState] = useState<{
    selectedItem: Inventory | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleReverseTransaction = () => {
    setIsReverseModalOpen(true);
  };

  const reverseTransaction = async () => {
    try {
      await createRequest(
        INVENTORY_ENDPOINTS.INVENTORIES.REVERSE,
        token.access_token,
        {
          unique_id: reversalId,
          reason: reversalReason,
        },
        refresh,
        "POST"
      );

      refresh();
      setIsReverseModalOpen(false);
      setReversalReason("");
    } catch (error) {
      console.log("Failed to reverse transaction", error);
    }
  };

  const handleConfirm = (e: React.MouseEvent, data: any) => {
    e.stopPropagation();
    setRecord(data);
    console.log('fd', data)
    setSelectedStore(data.warehouse_id);
    setIsConfirmModalOpen(true);
    setRecordId(data.id);
  };

  const handleUndo = (e: React.MouseEvent, data: any) => {
    e.stopPropagation();
    setRecord(data);
    setReversalId(data.unique_id);
    handleReverseTransaction();
  };

  const columnDefinitions: ColDef<any>[] = [
   {
      headerName: "Type",
      field: "type",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Name",
      field: "item_name",
      filter: true,
      cellClass: "cursor-pointer hover:underline",
      onCellClicked: (event) => {
        console.log("clicked");
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
      headerName: "Remaining Qty",
      field: "remaining_stock",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Store",
      field: "warehouse_name",
      sortable: true,
      filter: true,
      valueGetter: (params) => params.data.warehouse_name || "N/A",
    },
    {
      headerName: "Date",
      field: "display_date", // Use the formatted date field instead of movement_date
      sortable: true,
      filter: true,
      comparator: (valueA, valueB, nodeA, nodeB, isInverted) => {
        // Use the original movement_date for sorting
        const dateA = new Date(nodeA.data.movement_date).getTime();
        const dateB = new Date(nodeB.data.movement_date).getTime();
        return dateA - dateB;
      },
    },
     {
      headerName: "Remarks",
      field: "remarks",
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams<any>) => {
        const status = params.value;
        const getStatusStyle = (status: string) => {
          switch (status?.toLowerCase()) {
            case 'pending':
              return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
            case 'completed':
              return 'bg-green-100 text-green-800';
            case 'reversed':
              return 'bg-red-100 text-red-800';
            default:
              return 'bg-gray-100 text-gray-800';
          }
        };
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(status)}`}>
            {status || 'N/A'}
          </span>
        );
      },
    },
    {
      headerName: "Action",
      autoHeight: true,
      cellRenderer: (params: ICellRendererParams<any>) => (
        <div className="flex items-center gap-2">
          {params.data.status === "pending" && (
            <button
              onClick={(e: React.MouseEvent) => handleConfirm(e, params.data)}
              className="rounded-md text-white bg-orange-500 h-10 px-2 hover:bg-orange-600 transition-colors"
            >
              Confirm
            </button>
          )}

          {params.data.status !== "reversed" && (
            <button
              onClick={(e: React.MouseEvent) => handleUndo(e, params.data)}
              className="rounded-md text-white bg-red-500 h-10 px-2 hover:bg-red-600 transition-colors"
            >
              Undo
            </button>
          )}
        </div>
      ),
    },
  ];

  const reverseModalFooter = (
    <div>
      <button
        onClick={() => {
          setIsReverseModalOpen(false);
          setReversalReason("");
        }}
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mr-2 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={reverseTransaction}
        className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={!reversalReason.trim()}
      >
        Confirm Reversal
      </button>
    </div>
  );

  return (
    <div>
      <ToastContainer />
      {/* Reverse Transaction Modal */}
      <Dialog
        header="Reverse Transaction"
        visible={isReverseModalOpen}
        style={{ width: "50vw" }}
        onHide={() => {
          setIsReverseModalOpen(false);
          setReversalReason("");
        }}
        footer={reverseModalFooter}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Reversal
            </label>
            <InputText
              id="reason"
              value={reversalReason}
              onChange={(e) => setReversalReason(e.target.value)}
              placeholder="Enter reason for reversal"
              className="w-full"
            />
          </div>
        </div>
      </Dialog>

      <ConfirmModal
        record_id={recordId}
        warehouse_id={selectedStore}
        onClose={() => setIsConfirmModalOpen(false)}
        visible={isConfirmModalOpen}
        onSave={refresh}
        refresh={refresh}
        record={record}
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
      
      <BreadCrump name="Inventory" pageName="Stock In" />
      
      <div className="bg-white px-8 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stock In Transactions</h1>
            <p className="text-gray-600 mt-1">Manage inventory stock movements</p>
          </div>
          <div className="flex gap-3 items-center">
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
                className="w-full md:w-64"
              />
            </div>
            <button
              onClick={() =>
                setDialogState({
                  selectedItem: undefined,
                  currentAction: "add",
                })
              }
              className="bg-teal-600 px-4 py-2 rounded text-white flex gap-2 items-center hover:bg-teal-700 transition-colors"
            >
              <Icon icon="solar:add-circle-bold" fontSize={20} />
              New Stock
            </button>
          </div>
        </div>
        
        <div className="pb-6">
          <Table
            columnDefs={columnDefinitions}
            data={storeData}
            ref={tableRef}
          />
        </div>
      </div>
    </div>
  );
};

export default Inventories;