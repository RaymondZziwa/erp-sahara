import React, { useRef, useState } from "react";
import { Icon } from "@iconify/react";

import AddOrModifyItem from "./AddOrModifyItem";
import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";

import BreadCrump from "../../../components/layout/bread_crump";
import { PROJECTS_ENDPOINTS } from "../../../api/projectsEndpoints";
import { formatCurrency } from "../../../utils/formatCurrency";
import { CashRequisition } from "../../../redux/slices/types/accounts/cash_requisitions/CashRequisition";
import useCashRequisitions from "../../../hooks/accounts/cash_requisitions/useCashRequsitions";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { formatDate } from "../../../utils/dateUtils";
import ActionButtons from "./ActionButtons";
import { Chip } from "primereact/chip";
import { Link } from "react-router-dom";

const CashRequisitions: React.FC = () => {
  const { data, refresh } = useCashRequisitions();
  const tableRef = useRef<any>(null);
  const [selectedCategory, setSelectedCategory] = useState("pending");

  const [dialogState, setDialogState] = useState<{
    selectedItem: CashRequisition | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  // const columnDefinitions: ColDef<CashRequisition>[] = [
  //   {
  //     headerName: "Requisition No",
  //     field: "requisition_no",
  //     sortable: true,
  //     filter: true,
  //     width: 150,
  //   },
  //   {
  //     headerName: "Title",
  //     field: "title",
  //     sortable: true,
  //     filter: true,
  //     width: 200,
  //   },
  //   {
  //     headerName: "Total Amount",
  //     field: "total_amount",
  //     sortable: true,
  //     filter: true,
  //     width: 150,
  //     valueFormatter: (params) => formatCurrency(params.value), // Format as currency
  //   },
  //   {
  //     headerName: "Status",
  //     field: "status",
  //     sortable: true,
  //     filter: true,
  //     width: 130,
  //   },
  //   {
  //     headerName: "Date Expected",
  //     field: "date_expected",
  //     sortable: true,
  //     filter: true,
  //     width: 150,
  //   },
  //   {
  //     headerName: "Created By",
  //     field: "created_by",
  //     sortable: true,
  //     filter: true,
  //     width: 150,
  //   },
  //   {
  //     headerName: "Created At",
  //     field: "created_at",
  //     sortable: true,
  //     filter: true,
  //     width: 150,
  //   },
  //   {
  //     headerName: "Purpose",
  //     field: "purpose",
  //     sortable: true,
  //     filter: true,
  //     width: 250,
  //   },
  //   {
  //     headerName: "Actions",
  //     field: "id",
  //     sortable: false,
  //     filter: false,
  //     cellRenderer: (params: ICellRendererParams<CashRequisition>) => (
  //       <div className="flex items-center gap-2">
  //         <button
  //           disabled={params.data?.status != "pending"}
  //           className="bg-shade px-2 py-1 rounded text-white"
  //           onClick={() =>
  //             setDialogState({
  //               ...dialogState,
  //               currentAction: "edit",
  //               selectedItem: params.data,
  //             })
  //           }
  //         >
  //           Edit
  //         </button>
  //         <Link
  //           to={"/cash-requsuitions/req/" + params.data?.id}
  //           className="bg-shade px-2 py-1 rounded text-white"
  //         >
  //           Details
  //         </Link>
  //         <Icon
  //           onClick={() =>
  //             setDialogState({
  //               ...dialogState,
  //               currentAction: "delete",
  //               selectedItem: params.data,
  //             })
  //           }
  //           icon="solar:trash-bin-trash-bold"
  //           className="text-red-500 cursor-pointer"
  //           fontSize={20}
  //         />
  //       </div>
  //     ),
  //   },
  // ];

  // Initialize the account count by category
  const accountCountsByCategory = data?.reduce<{ [key: string]: number }>(
    (acc, item) => {
      const categoryName = item.status;
      // Increment or initialize the count for each category
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      // Increment the total count for 'all'
      // acc["all"] = (acc["all"] || 0) + 1;
      return acc;
    },
    {} // Initialize 'all' to 0
  );
  const statusBodyTemplate = (rowData: CashRequisition) => {
    let chipProps = {};

    switch (rowData.status) {
      case "approved":
        chipProps = {
          label: "Approved",
          className: "p-chip p-chip-approved",
          style: { backgroundColor: "#28a745", color: "#fff" },
        };
        break;
      case "pending":
        chipProps = {
          label: "Pending",
          className: "p-chip p-chip-pending",
          style: { backgroundColor: "#ffc107", color: "#212529" },
        };
        break;
      case "cancelled":
        chipProps = {
          label: "Cancelled",
          className: "p-chip p-chip-cancelled",
          style: { backgroundColor: "#dc3545", color: "#fff" },
        };
        break;
      default:
        chipProps = {
          label: "Unknown",
          className: "p-chip p-chip-unknown",
          style: { backgroundColor: "#6c757d", color: "#fff" },
        };
        break;
    }

    return <Chip {...chipProps} />;
  };
  return (
    <div>
      {(dialogState.currentAction == "add" ||
        dialogState.currentAction == "edit") && (
        <AddOrModifyItem
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
      )}
      {dialogState.selectedItem && (
        <ConfirmDeleteDialog
          apiPath={PROJECTS_ENDPOINTS.PROJECTS.DELETE(
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
      <BreadCrump name="Expense Requsitions" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">
              Expense Requisitions Table({data.length})
            </h1>
          </div>
          <div className="flex gap-2">
            {/* <button
              onClick={() =>
                setDialogState({
                  selectedItem: undefined,
                  currentAction: "add",
                })
              }
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
            >
              <Icon icon="solar:add-circle-bold" fontSize={20} />
              Add Requisition
            </button> */}
            <Link
              to={"/cash-requsuitions/req/add"}
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
            >
              <Icon icon="solar:add-circle-bold" fontSize={20} />
              Add Requisition
            </Link>
            <button
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
              onClick={handleExportPDF}
            >
              <Icon icon="solar:printer-bold" fontSize={20} />
              Print
            </button>
          </div>
        </div>
        <ul className="flex gap-2 my-2">
          {Object.entries(accountCountsByCategory).map(([category, count]) => (
            <li key={category}>
              <Button
                onClick={() => setSelectedCategory(category)}
                outlined={category != selectedCategory}
                size="small"
                severity="info"
                type="button"
                label={category}
                icon="pi pi-wallet"
                className={`text-nowrap capitalize ${
                  category == selectedCategory
                    ? ""
                    : "bg-white !text-black hover:!bg-gray-300"
                }`}
                badge={count.toString()}
                badgeClassName="p-badge-danger"
                raised
              />
            </li>
          ))}
        </ul>
        {/* <Table
          columnDefs={columnDefinitions}
          data={
            selectedCategory == "all"
              ? data
              : data.filter((acc) => acc.status == selectedCategory)
          }
          ref={tableRef}
        /> */}

        <DataTable
          scrollable
          value={
            selectedCategory === "all"
              ? data
              : data.filter((acc) => acc.status === selectedCategory)
          }
          ref={tableRef}
          paginator
          rows={10}
          className="p-datatable-sm"
        >
          <Column
            field="requisition_no"
            header="Requisition No"
            style={{ width: "150px" }}
            body={(rowData: CashRequisition) => (
              <Link
                className="text-teal-500"
                to={"/cash-requsuitions/req/" + rowData.id}
              >
                {rowData.requisition_no}
              </Link>
            )}
          />
          <Column
            field="title"
            header="Title"
            sortable
            filter
            style={{ width: "200px" }}
          />
          <Column
            field="total_amount"
            header="Total Amount"
            sortable
            filter
            style={{ width: "150px" }}
            body={(rowData: CashRequisition) =>
              formatCurrency(rowData.total_amount)
            }
          />
          <Column
            // field="status"
            header="Status"
            sortable
            filter
            body={statusBodyTemplate}
            style={{ width: "130px" }}
          />
          <Column
            field="date_expected"
            header="Date Expected"
            body={(rowData: CashRequisition) =>
              formatDate(rowData.date_expected)
            }
          />
          <Column
            field="created_at"
            header="Created At"
            body={(rowData: CashRequisition) => formatDate(rowData.created_at)}
          />
          <Column field="purpose" header="Purpose" />

          <Column
            header="Actions"
            body={(rowData: CashRequisition) => (
              <div>
                <ActionButtons
                  cashRequisition={rowData}
                  setDialogState={setDialogState}
                />
              </div>
            )}
          />
        </DataTable>
      </div>
    </div>
  );
};

export default CashRequisitions;
