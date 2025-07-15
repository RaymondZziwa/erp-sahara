import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import { ToastContainer } from "react-toastify";
import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import Table from "../../../components/table";
import BreadCrump from "../../../components/layout/bread_crump";
import useCustomers from "../../../hooks/sales/useCustomers";
import { Customer } from "../../../redux/slices/types/inventory/Customers";
import AddOrModifyCustomer from "./AddOrModify";
import { SALES_ENDPOINTS } from "../../../api/salesEndpoints";

const Customers: React.FC = () => {
  const { data: customers, refresh } = useCustomers();
  const tableRef = useRef<any>(null);

  const [dialogState, setDialogState] = useState<{
    selectedCustomer: Customer | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedCustomer: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const columnDefinitions: ColDef<Customer>[] = [
    { headerName: "Organization", field: "organization_name", sortable: true, filter: true },
    { headerName: "First Name", field: "first_name", sortable: true, filter: true },
    { headerName: "Last Name", field: "last_name", sortable: true, filter: true },
    { headerName: "Contact", field: "phone", sortable: true, filter: true },
    { headerName: "Email", field: "email", sortable: true, filter: true },
    { headerName: "Type", field: "type", sortable: true, filter: true },
    { headerName: "Industry", field: "industry", sortable: true, filter: true },
    { headerName: "Status", field: "status", sortable: true, filter: true },
    {
      headerName: "Actions",
      field: "id",
      cellRenderer: (params: ICellRendererParams<Customer>) => (
        <div className="flex items-center gap-2">
          <button
            className="bg-shade px-2 h-10 rounded text-white"
            onClick={() =>
              setDialogState({
                currentAction: "edit",
                selectedCustomer: params.data,
              })
            }
          >
            Edit
          </button>
          <Icon
            onClick={() =>
              setDialogState({
                currentAction: "delete",
                selectedCustomer: params.data,
              })
            }
            icon="solar:trash-bin-trash-bold"
            className="text-red-500 cursor-pointer"
            fontSize={24}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <ToastContainer />
      <AddOrModifyCustomer
        visible={
          dialogState.currentAction === "add" ||
          (dialogState.currentAction === "edit" && !!dialogState.selectedCustomer)
        }
        customer={dialogState.selectedCustomer}
        onClose={() =>
          setDialogState({ selectedCustomer: undefined, currentAction: "" })
        }
        onSave={refresh}
      />
      <ConfirmDeleteDialog
        apiPath={SALES_ENDPOINTS.CUSTOMERS.DELETE(
          dialogState.selectedCustomer?.id?.toString() ?? ""
        )}
        visible={
          !!dialogState.selectedCustomer?.id &&
          dialogState.currentAction === "delete"
        }
        onClose={() =>
          setDialogState({ selectedCustomer: undefined, currentAction: "" })
        }
        onConfirm={refresh}
      />
      <BreadCrump name="Customers" pageName="Customers" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold py-2">Customers</h1>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setDialogState({ currentAction: "add", selectedCustomer: undefined })
              }
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
            >
              <Icon icon="solar:add-circle-bold" fontSize={20} />
              Add Customer
            </button>
          </div>
        </div>
        <Table
          ref={tableRef}
          columnDefs={columnDefinitions}
          data={customers}
        />
      </div>
    </div>
  );
};

export default Customers;
