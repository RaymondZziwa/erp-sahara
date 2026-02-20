import { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import AddOrModifyRequest from "./AddOrModifyItem";
import useProductionMaterialRequests from "../../../../../hooks/manufacturing/workCenter/useProductionMaterialRequests";
import Table from "../../../../../components/table";
import BreadCrump from "../../../../../components/layout/bread_crump";
import ConfirmDeleteDialog from "../../../../../components/dialog/ConfirmDeleteDialog";
import { ProductionMaterialRequest } from "../../../../../redux/slices/types/manufacturing/materialRequest";
import { MANUFACTURING_ENDPOINTS } from "../../../../../api/manufacturingEndpoints";
import { useParams } from "react-router-dom";
import IssueRequest from "./issueRequest";

const ProductionMaterialRequests = () => {
  const { id } = useParams<{ id: string }>();
  const { data: data, refresh } = useProductionMaterialRequests({
    id,
  });

  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedItem: ProductionMaterialRequest | undefined;
    currentAction: "delete" | "edit" | "add" | "issue" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const columnDefinitions: ColDef<ProductionMaterialRequest>[] = [
    {
      headerName: "Production Order",
      field: "production_order.order_number",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Requested Quantity",
      field: "requested_quantity",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        let badgeClass = "";
        switch (params.value) {
          case "pending":
            badgeClass = "bg-orange-500 text-white";
            break;
          case "issued":
            badgeClass = "bg-green-500 text-white";
            break;
          default:
            badgeClass = "bg-gray-500 text-white";
        }
    
        return (
          <span className={`px-2 py-1 rounded-full  ${badgeClass} text-center text-sm`}>
            {params.value}
          </span>
        );
      },
    },    
    
    {
      headerName: "Request Date",
      field: "request_date",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Requested By",
      field: "requested_by",
      sortable: true,
      filter: true,
      valueGetter: (params) =>
        params.data.requested_by
          ? `${params.data.requested_by.first_name} ${params.data.requested_by.last_name}`
          : "",
    },
    {
      headerName: "Issued On",
      field: "issue_date",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Issued By",
      field: "issued_by",
      sortable: true,
      filter: true,
      valueGetter: (params) =>
        params.data.requested_by
          ? `${params.data.requested_by.first_name} ${params.data.requested_by.last_name}`
          : "",
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<ProductionMaterialRequest>) => (
        <div className="flex items-center gap-2">
          <Icon
            onClick={() =>
              setDialogState({
                ...dialogState,
                currentAction: "issue",
                selectedItem: params.data,
              })
            }
            icon="mdi:check-circle-outline"
            className="text-green-500 cursor-pointer"
            fontSize={20}
            title="Issue Request"
          />
          <button
            className="bg-shade px-2 py-1 rounded text-white"
            onClick={() =>
              setDialogState({
                ...dialogState,
                currentAction: "edit",
                selectedItem: params.data,
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
                selectedItem: params.data,
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
      <AddOrModifyRequest
        onSave={refresh}
        item={dialogState.selectedItem}
        visible={
          dialogState.currentAction == "add" ||
          (dialogState.currentAction == "edit" &&
            !!dialogState.selectedItem?.id)
        }
        onClose={() =>
          setDialogState({ currentAction: "", selectedItem: undefined })
        }
      />
      <IssueRequest visible={dialogState?.currentAction == 'issue'} onClose={() =>
          setDialogState({ currentAction: "", selectedItem: undefined })} onSave={refresh} />
      {dialogState.selectedItem && (
        <ConfirmDeleteDialog
          apiPath={MANUFACTURING_ENDPOINTS.PRODUCTION_MATERIALS_REQUESTS.DELETE(id, 
            dialogState.selectedItem?.id.toString()
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
      <BreadCrump name="Production Material Requests" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">Production Material Requests</h1>
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
              Add Material Request
            </button>
          </div>
        </div>
        <Table columnDefs={columnDefinitions} data={data} ref={tableRef} />
      </div>
    </div>
  );
};

export default ProductionMaterialRequests
