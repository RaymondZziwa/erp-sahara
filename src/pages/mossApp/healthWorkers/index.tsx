import React, { useRef, useState, useCallback, useMemo } from "react";
import { Icon } from "@iconify/react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Chip } from "primereact/chip";
import { Link } from "react-router-dom";
import useHealthWorkers from "../../../hooks/mossApp/useHealthWorkers";
import { User } from "../../../redux/slices/types/mossApp/Users";
import { MOSS_APP_ENDPOINTS } from "../../../api/mossAppEndpoints";
import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import ConfirmApproveDialog from "../../../components/dialog/ConfirmApproveDialog";
import BreadCrump from "../../../components/layout/bread_crump";
import { formatDate } from "../../../utils/dateUtils";

const HealthWorkers: React.FC = () => {
  const { data, refresh, loading } = useHealthWorkers();
  const tableRef = useRef<any>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [dialogState, setDialogState] = useState<{
    selectedItem: User | undefined;
    currentAction: "delete" | "edit" | "add" | "" | "approve";
  }>({ selectedItem: undefined, currentAction: "" });

  // Export PDF callback to prevent recreation on each render
  const handleExportPDF = useCallback(() => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  }, []);

  // Memoize account counts by category to avoid recalculation on each render
  const accountCountsByCategory = useMemo(
    () =>
      data?.reduce<{ [key: string]: number }>(
        (acc, item) => {
          const categoryName = item.account_status;
          acc[categoryName] = (acc[categoryName] || 0) + 1;
          acc["all"] = (acc["all"] || 0) + 1;
          return acc;
        },
        { all: 0 }
      ),
    [data]
  );

  // Status chip renderer function
  const statusBodyTemplate = (rowData: User) => {
    const chipProps = {
      Active: {
        label: "Active",
        style: { backgroundColor: "#28a745", color: "#fff" },
      },
      Pending: {
        label: "Pending",
        style: { backgroundColor: "#ffc107", color: "#212529" },
      },
      cancelled: {
        label: "Cancelled",
        style: { backgroundColor: "#dc3545", color: "#fff" },
      },
    }[rowData.account_status] || {
      label: "Unknown",
      style: { backgroundColor: "#6c757d", color: "#fff" },
    };

    return <Chip label={chipProps.label} style={chipProps.style} />;
  };

  const healthWorkers =
    selectedCategory === "all"
      ? data
      : data.filter((acc) => acc?.account_status === selectedCategory);

  // Dialog helpers
  const closeDialog = () =>
    setDialogState({ currentAction: "", selectedItem: undefined });

  const openApproveDialog = (item: User) =>
    setDialogState({ currentAction: "approve", selectedItem: item });

  return (
    <div>
      {dialogState.currentAction === "delete" && dialogState.selectedItem && (
        <ConfirmDeleteDialog
          apiPath={MOSS_APP_ENDPOINTS.HEALTH_WORKERS.DELETE(
            dialogState.selectedItem.id.toString()
          )}
          onClose={closeDialog}
          visible={dialogState.currentAction === "delete"}
          onConfirm={refresh}
        />
      )}
      {dialogState.currentAction === "approve" && dialogState.selectedItem && (
        <ConfirmApproveDialog
          type="moss"
          apiPath={MOSS_APP_ENDPOINTS.HEALTH_WORKERS.APPROVE}
          onClose={closeDialog}
          visible={dialogState.currentAction === "approve"}
          onConfirm={refresh}
          body={{ user_id: dialogState.selectedItem.id }}
        />
      )}

      <BreadCrump name="Expense Requisitions" pageName="All" />
      <div className="bg-white px-8 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="py-2">
            <h1 className="text-xl font-bold">
              Health Workers Table({data.length})
            </h1>
          </div>
          <div className="flex gap-2">
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
                outlined={category !== selectedCategory}
                size="small"
                severity="info"
                type="button"
                label={category}
                icon="pi pi-wallet"
                className={`text-nowrap capitalize ${
                  category === selectedCategory
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

        <DataTable
          loading={loading}
          scrollable
          value={healthWorkers}
          ref={tableRef}
          paginator
          rows={10}
          className="p-datatable-sm"
        >
          <Column
            field="id_number"
            header="Requisition No"
            style={{ width: "150px" }}
            body={(rowData: User) => (
              <Link
                className="text-teal-500"
                to={"/mossapp/settings/health-workers/" + rowData.id}
              >
                {rowData.id}
              </Link>
            )}
          />
          <Column
            field="account_type"
            header="Names"
            sortable
            filter
            style={{ width: "150px" }}
            body={(rowData: User) =>
              `${rowData.first_name} ${rowData.last_name}`
            }
          />
          <Column
            field="display_name"
            header="Display Name"
            sortable
            filter
            style={{ width: "200px" }}
          />
          <Column
            field="email"
            header="Email"
            sortable
            filter
            style={{ width: "200px" }}
          />
          <Column
            field="dob"
            header="D.O.B"
            sortable
            filter
            style={{ width: "200px" }}
          />
          <Column
            field="account_type"
            header="Account Type"
            sortable
            filter
            style={{ width: "150px" }}
          />
          <Column
            header="Status"
            sortable
            filter
            body={statusBodyTemplate}
            style={{ width: "130px" }}
          />
          <Column
            field="created_at"
            header="Joining Date"
            body={(rowData: User) => formatDate(rowData.joining_date)}
          />
          <Column
            header="Actions"
            body={(rowData: User) => (
              <div>
                <Button onClick={() => openApproveDialog(rowData)}>
                  Approve
                </Button>
              </div>
            )}
          />
        </DataTable>
      </div>
    </div>
  );
};

export default HealthWorkers;
