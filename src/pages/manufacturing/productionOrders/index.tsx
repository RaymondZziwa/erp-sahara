import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../components/layout/bread_crump";
import Table from "../../../components/table";
import { MANUFACTURING_ENDPOINTS } from "../../../api/manufacturingEndpoints";
import useProductionOrder from "../../../hooks/manufacturing/workCenter/useProductionOrder";
import { ProductionOrder } from "../../../redux/slices/types/manufacturing/productionOrder";
import AddOrModifyProductionOrder from "./AddorModify";
import { Link } from "react-router-dom";
import { Menu } from "primereact/menu";
import { Button } from "primereact/button";


const ProductionOrders: React.FC = () => {
  const { data, refresh } = useProductionOrder();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: ProductionOrder | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const columnDefinitions: ColDef<ProductionOrder>[] = [
    {
      headerName: "Order Number",
      field: "order_number",
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => (
        <Link
          to={`/product_orders/${params.data.id}`}
          className="text-inherit cursor-pointer hover:text-teal-600 hover:underline"
        >
          {params.value}
        </Link>
      ),
    },
    {
        headerName: "Work Order Number",
        field: "work_order.order_no",
        sortable: true,
        filter: true,
    },
    {
      headerName: "Quantity",
      field: "quantity",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Start Date",
      field: "start_date",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Expected Completion",
      field: "expected_completion_date",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Priority",
      field: "priority",
      sortable: true,
      filter: true,
    },
    {
        headerName: "Created by",
        field: "created_by", // optional, not strictly needed
        sortable: true,
        filter: true,
        valueGetter: (params) => {
          const creator = params.data.created_by;
          return creator ? `${creator.first_name} ${creator.last_name}` : "";
        },
      },      
      {
        headerName: "Actions",
        field: "work_order_id",
        sortable: false,
        filter: false,
        cellRenderer: (params: ICellRendererParams<ProductionOrder>) => {
          const menuRef = useRef<any>(null);
      
          const items = [
            {
              label: (
                <Link to={`/manufacturing/production_order/production_steps/${params?.data?.id}`}>
                  Production Steps
                </Link>
              ),
            },
            {
              label: (
                <Link to={`/manufacturing/production_order/production_schedules/${params.data.id}`}>
                  Schedules
                </Link>
              ),
            },
            {
              label: (
                <Link to={`/manufacturing/production_order/material_requests/${params.data.id}`}>
                  Material Request
                </Link>
              ),
            },
            {
              label: (
                <Link to={`/manufacturing/production_order/batches/${params.data.id}`}>
                  Batches
                </Link>
              ),
            },
            // {
            //   label: (
            //     <Link to={`/output/${params.data.work_order_id}`}>
            //       Output
            //     </Link>
            //   ),
            // },
            // {
            //   label: (
            //     <Link to={`/quality-control/${params.data.work_order_id}`}>
            //       Quality Control
            //     </Link>
            //   ),
            // },
            { separator: true },
            {
              label: "Edit",
              command: () =>
                setDialogState({
                  ...dialogState,
                  currentAction: "edit",
                  selectedItem: params.data,
                }),
            },
            {
              label: "Delete",
              command: () =>
                setDialogState({
                  ...dialogState,
                  currentAction: "delete",
                  selectedItem: params.data,
                }),
            },
          ];
      
          return (
            <div className="flex ">
              <Menu model={items} popup ref={menuRef} />
              <Button
                icon="pi pi-ellipsis-v"
                className="p-button-text p-button-plain -mt-4 !bg-transparent hover:!bg-transparent focus:!shadow-none !text-gray-500"
                onClick={(event) => menuRef.current.toggle(event)}
              />
            </div> 
          );
        },
      }
  ];

  return (
    <div>
      <AddOrModifyProductionOrder
        onSave={refresh}
        item={dialogState.selectedItem}
        visible={
          dialogState.currentAction === "add" ||
          (dialogState.currentAction === "edit" && !!dialogState.selectedItem?.id)
        }
        onClose={() =>
          setDialogState({ currentAction: "", selectedItem: undefined })
        }
      />
      {dialogState.selectedItem && (
        <ConfirmDeleteDialog
          apiPath={MANUFACTURING_ENDPOINTS.PRODUCTION_ORDERS.DELETE(
            dialogState.selectedItem.id
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
      )}
      <BreadCrump name="Production Orders" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Production Orders</h1>
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
              Add Production Order
            </button>
          </div>
        </div>
        <Table columnDefs={columnDefinitions} data={data} ref={tableRef} />
      </div>
    </div>
  );
};

export default ProductionOrders;
