import React, { useRef, useState, useEffect } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Chip } from "primereact/chip";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Link } from "react-router-dom";
import { PROJECTS_ENDPOINTS } from "../../../../api/projectsEndpoints";
import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../../components/layout/bread_crump";
import { FuelRequisition } from "../../../../redux/slices/types/accounts/cash_requisitions/CashRequisition";
import useProjects from "../../../../hooks/projects/useProjects";
import useBudgets from "../../../../hooks/budgets/useBudgets";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { baseURL } from "../../../../utils/api";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import useDepartments from "../../../../hooks/hr/useDepartments";
import useTrucks from "../../../../hooks/inventory/useTrucks";
import useFuelRequisitions from "../../../../hooks/accounts/cash_requisitions/useFuelRequisitions";
import { Menu } from "primereact/menu";

const FuelRequisitions: React.FC = () => {
  const { data: requisitions, refresh } = useFuelRequisitions();
  const { data: departments } = useDepartments();
  const { data: trucks } = useTrucks();
  const { data: projects } = useProjects();
  const { data: budgets } = useBudgets();
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const token = useSelector(
    (state: RootState) => state.userAuth.token.access_token
  );

  const tableRef = useRef<any>(null);
  const [selectedCategory, setSelectedCategory] = useState("Pending");

  const [dialogState, setDialogState] = useState<{
    selectedItem: FuelRequisition | undefined;
    currentAction: "delete" | "edit" | "add" | "approve" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const initialFormData = {
    department_id: "",
    truck_id: "",
    budget_item_id: null,
    project_id: null,
    amount: 0,
    trip: "",
    total_round_kilometers: 0,
    reason: "",
    last_quantity_fuel_used: "",
    last_mileage: "",
  };

  const [formData, setFormData] = useState({
    department_id: "",
    truck_id: "",
    budget_item_id: null,
    project_id: null,
    amount: 0,
    trip: "",
    total_round_kilometers: 0,
    reason: "",
    last_quantity_fuel_used: "",
    last_mileage: "",
  });

  const [approvalData, setApprovalData] = useState({
    approved_amount: 0,
    comments: "",
  });

  useEffect(() => {
    if (dialogState.currentAction === "edit" && dialogState.selectedItem) {
      setFormData({
        department_id: dialogState.selectedItem.department_id,
        truck_id: dialogState.selectedItem.truck_id,
        budget_item_id: dialogState.selectedItem.budget_item_id,
        project_id: dialogState.selectedItem.project_id,
        amount: dialogState.selectedItem.amount || 0,
        trip: dialogState.selectedItem.trip || "",
        total_round_kilometers:
          dialogState.selectedItem.total_round_kilometers || 0,
        reason: dialogState.selectedItem.reason || "",
        last_quantity_fuel_used:
          dialogState.selectedItem.last_quantity_fuel_used || "",
        last_mileage: dialogState.selectedItem.last_mileage || "",
      });
      setSelectedBudgetId(dialogState.selectedItem.budget_id || null);
    }
  }, [dialogState]);

  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  const handlePrintRequisition = async (requisitionId: string) => {
    try {
      const response = await axios.get(
        `${baseURL}/requisitions/fuel-requisitions/${requisitionId}/pdf`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          validateStatus: () => true,
        }
      );

      const fileURL = URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", `fuel-requisition-${requisitionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error printing requisition:", error);
      toast.error("Failed to print requisition");
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleApprovalChange = (field: string, value: any) => {
    setApprovalData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      let response;
      const payload = {
        ...formData,
        budget_item_id: formData.budget_item_id || null,
        project_id: formData.project_id || null,
      };

      if (dialogState.currentAction === "add") {
        response = await axios.post(
          `${baseURL}/requisitions/fuel-requisitions`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            validateStatus: () => true,
          }
        );
      } else if (
        dialogState.currentAction === "edit" &&
        dialogState.selectedItem
      ) {
        response = await axios.put(
          `${baseURL}/requisitions/fuel-requisitions/${dialogState.selectedItem.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            validateStatus: () => true,
          }
        );
      }

      if (response?.data.success) {
        toast.success(response.data.message);
        refresh();
        setDialogState({ selectedItem: undefined, currentAction: "" });
        setFormData(initialFormData);
      } else {
        toast.error(response?.data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error submitting requisition:", error);
      toast.error("An error occurred while submitting the requisition");
    }
  };

const handleApprove = async () => {
  if (!dialogState.selectedItem) return;

  try {
    const response = await axios.post(
      `${baseURL}/requisitions/fuel-requisitions/${dialogState.selectedItem.id}/approve`,
      approvalData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        validateStatus: () => true,
      }
    );

    if (response.data.success) {
      toast.success("Requisition approved successfully");
      refresh();
      setDialogState({ selectedItem: undefined, currentAction: "" });
    } else {
      toast.error(response.data.message || "Approval failed");
    }
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Something went wrong while approving the requisition.");
    }
    console.error("Error approving requisition:", error);
  }
};


  const handleDelete = async () => {
    if (!dialogState.selectedItem) return;

    try {
      const response = await axios.post(
        `${baseURL}/requisitions/fuel-requisitions/${dialogState.selectedItem.id}/me`,
        approvalData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          validateStatus: () => true,
        }
      );

      if (response.data.success) {
        toast.success("Requisition deleted successfully");
        refresh();
        setDialogState({ selectedItem: undefined, currentAction: "" });
      } else {
        toast.error(response.data.message || "Deletion failed");
      }
    } catch (error) {
      console.error("Error deleting requisition:", error);
      toast.error("An error occurred while deleting the requisition");
    }
  };

  const statusBodyTemplate = (rowData: FuelRequisition) => {
    let chipProps = {};

    switch (rowData.status) {
      case "Approved":
        chipProps = {
          label: "Approved",
          className: "p-chip p-chip-approved",
          style: { backgroundColor: "#28a745", color: "#fff" },
        };
        break;
      case "Pending":
        chipProps = {
          label: "Pending",
          className: "p-chip p-chip-pending",
          style: { backgroundColor: "#ffc107", color: "#212529" },
        };
        break;
      case "Rejected":
        chipProps = {
          label: "Rejected",
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

  const actionBodyTemplate = (rowData: FuelRequisition) => {
    const menuRef = useRef<Menu>(null);

    const menuItems = [
      {
        label: "Edit",
        icon: "pi pi-pencil",
        command: () =>
          setDialogState({
            selectedItem: rowData,
            currentAction: "edit",
          }),
        disabled: rowData.status !== "Pending",
      },
      {
        label: "Delete",
        icon: "pi pi-trash",
        command: () =>
          setDialogState({
            selectedItem: rowData,
            currentAction: "delete",
          }),
        //onclick: { handleDelete },
        disabled: rowData.status !== "Pending",
      },
      {
        label: "Reject",
        icon: "pi pi-times",
        command: () =>
          setDialogState({
            selectedItem: rowData,
            currentAction: "reject",
          }),
        disabled: rowData.status !== "Pending",
      },
      {
        label: "Approve",
        icon: "pi pi-check",
        command: () =>
          setDialogState({
            selectedItem: rowData,
            currentAction: "approve",
          }),
        disabled: rowData.status !== "Pending",
      },
      {
        label: "Print",
        icon: "pi pi-print",
        command: () => handlePrintRequisition(rowData.id),
      },
    ];

    return (
      <div className="relative">
        <Menu model={menuItems} popup ref={menuRef} />
        <Button
          icon="pi pi-ellipsis-v"
          className="p-button-text p-button-plain"
          onClick={(e) => menuRef.current?.toggle(e)}
          aria-haspopup
          aria-controls="action_menu"
        />
      </div>
    );
  };

  // Initialize the account count by category
  const accountCountsByCategory = requisitions?.reduce<{
    [key: string]: number;
  }>((acc, item) => {
    const categoryName = item.status;
    acc[categoryName] = (acc[categoryName] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="w-full overflow-x-hidden">
      <ToastContainer />

      {/* Add/Edit Modal */}
      <Dialog
        header={
          dialogState.currentAction === "add"
            ? "Add Fuel Requisition"
            : "Edit Fuel Requisition"
        }
        visible={
          dialogState.currentAction === "add" ||
          dialogState.currentAction === "edit"
        }
        style={{ width: "90vw", maxWidth: "800px" }}
        onHide={() =>
          setDialogState({ selectedItem: undefined, currentAction: "" })
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="field">
            <label htmlFor="department">Department</label>
            <Dropdown
              id="department"
              options={
                departments?.map((d) => ({ label: d.name, value: d.id })) || []
              }
              value={formData.department_id}
              onChange={(e) => handleFormChange("department_id", e.value)}
              placeholder="Select Department"
              filter
              className="w-full"
            />
          </div>
          <div className="field">
            <label htmlFor="truck">Truck</label>
            <Dropdown
              id="truck"
              options={
                trucks?.map((t) => ({
                  label: t.license_plate,
                  value: t.id,
                })) || []
              }
              value={formData.truck_id}
              onChange={(e) => handleFormChange("truck_id", e.value)}
              placeholder="Select Truck"
              filter
              className="w-full"
            />
          </div>
          <div className="field">
            <label htmlFor="budget">Budget</label>
            <Dropdown
              id="budget"
              options={
                budgets?.map((b) => ({ label: b.name, value: b.id })) || []
              }
              value={selectedBudgetId}
              onChange={(e) => {
                setSelectedBudgetId(e.value);
                handleFormChange("budget_item_id", null);
              }}
              placeholder="Select Budget"
              filter
              className="w-full"
            />
          </div>
          <div className="field">
            <label htmlFor="project">Project (Optional)</label>
            <Dropdown
              id="project"
              options={
                projects?.map((p) => ({ label: p.name, value: p.id })) || []
              }
              value={formData.project_id}
              onChange={(e) => handleFormChange("project_id", e.value)}
              placeholder="Select Project"
              filter
              className="w-full"
            />
          </div>
          <div className="field">
            <label htmlFor="amount">Amount</label>
            <InputNumber
              id="amount"
              value={formData.amount}
              onValueChange={(e) => handleFormChange("amount", e.value)}
              className="w-full"
            />
          </div>
          <div className="field md:col-span-2">
            <label htmlFor="trip">Trip Description</label>
            <InputText
              id="trip"
              value={formData.trip}
              onChange={(e) => handleFormChange("trip", e.target.value)}
              className="w-full"
            />
          </div>
          <div className="field">
            <label htmlFor="kilometers">Total Round Kilometers</label>
            <InputNumber
              id="kilometers"
              value={formData.total_round_kilometers}
              onValueChange={(e) =>
                handleFormChange("total_round_kilometers", e.value)
              }
              suffix=" km"
              className="w-full"
            />
          </div>
          <div className="field">
            <label htmlFor="reason">Reason</label>
            <InputText
              id="reason"
              value={formData.reason}
              onChange={(e) => handleFormChange("reason", e.target.value)}
              className="w-full"
            />
          </div>
          <div className="field">
            <label htmlFor="lastFuel">Last Fuel Quantity Used</label>
            <InputText
              id="lastFuel"
              value={formData.last_quantity_fuel_used}
              onChange={(e) =>
                handleFormChange("last_quantity_fuel_used", e.target.value)
              }
              className="w-full"
            />
          </div>
          <div className="field">
            <label htmlFor="lastMileage">Last Mileage</label>
            <InputText
              id="lastMileage"
              value={formData.last_mileage}
              onChange={(e) => handleFormChange("last_mileage", e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4 md:col-span-2">
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() =>
                setDialogState({ selectedItem: undefined, currentAction: "" })
              }
            />
            <Button
              label={dialogState.currentAction === "add" ? "Create" : "Update"}
              icon="pi pi-check"
              onClick={handleSubmit}
            />
          </div>
        </div>
      </Dialog>

      {/* Approval Modal */}
      <Dialog
        header="Approve Fuel Requisition"
        visible={dialogState.currentAction === "approve"}
        style={{ width: "90vw", maxWidth: "600px" }}
        onHide={() =>
          setDialogState({ selectedItem: undefined, currentAction: "" })
        }
      >
        <div className="grid gap-4">
          <div className="field">
            <label htmlFor="approvedAmount">Approved Amount</label>
            <InputNumber
              id="approvedAmount"
              value={approvalData.approved_amount}
              onValueChange={(e) =>
                handleApprovalChange("approved_amount", e.value)
              }
              className="w-full"
            />
          </div>
          <div className="field">
            <label htmlFor="comments">Comments</label>
            <InputText
              id="comments"
              value={approvalData.comments}
              onChange={(e) => handleApprovalChange("comments", e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() =>
                setDialogState({ selectedItem: undefined, currentAction: "" })
              }
            />
            <Button
              label="Approve"
              icon="pi pi-check"
              onClick={handleApprove}
            />
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        apiPath={
          `/requisitions/fuel-requisitions/${dialogState?.selectedItem?.id}`
          }
        onClose={() =>
          setDialogState({ selectedItem: undefined, currentAction: "" })
        }
        visible={dialogState.currentAction === "delete"}
        onConfirm={refresh}
      />

      <BreadCrump name="Fuel Requisitions" pageName="All" />
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold">
              Fuel Requisitions ({requisitions.length})
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              label="Add Requisition"
              icon="pi pi-plus"
              className="p-button-success text-sm"
              onClick={() =>
                setDialogState({
                  selectedItem: undefined,
                  currentAction: "add",
                })
              }
            />
            <Button
              label="Print"
              icon="pi pi-print"
              className="p-button-secondary text-sm"
              onClick={handleExportPDF}
            />
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-2 my-4">
          {Object.entries(accountCountsByCategory || {}).map(
            ([category, count]) => (
              <Button
                key={category}
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
                    : "bg-white !text-gray-700 hover:!bg-gray-100"
                }`}
                badge={count.toString()}
                badgeClassName="p-badge-danger"
                raised
              />
            )
          )}
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto text-xsm">
          <DataTable
            scrollable
            scrollHeight="flex"
            value={
              selectedCategory === "All"
                ? requisitions
                : requisitions.filter((req) => req.status === selectedCategory)
            }
            ref={tableRef}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            className="p-datatable-sm w-full"
            tableStyle={{ minWidth: "100%" }}
          >
            <Column
              field="requisition_no"
              header="Req No"
              body={(rowData: FuelRequisition) => (
                <Link
                  className="text-teal-500 hover:underline"
                  to={`/cash-requisitions/req/${rowData.id}`}
                >
                  {rowData.requisition_no}
                </Link>
              )}
              style={{ minWidth: "50px" }}
            />
            <Column
              field="department.name"
              header="Department"
              sortable
              filter
              style={{ minWidth: "50px" }}
            />
            <Column
              field="truck.license_plate"
              header="Truck"
              sortable
              filter
              style={{ minWidth: "50px" }}
            />
            <Column
              field="total_round_kilometers"
              header="Distance (km)"
              sortable
              filter
              style={{ minWidth: "50px" }}
            />
            <Column
              field="reason"
              header="Reason"
              sortable
              filter
              style={{ minWidth: "50px" }}
            />
            <Column
              field="last_quantity_fuel_used"
              header="Fuel Used"
              sortable
              filter
              style={{ minWidth: "50px" }}
            />
            <Column
              field="last_mileage"
              header="Mileage"
              sortable
              filter
              style={{ minWidth: "50px" }}
            />
            <Column
              field="amount"
              header="Amount"
              sortable
              // body={(rowData: FuelRequisition) =>
              //   new Intl.NumberFormat("en-US", {
              //     style: "currency",
              //     currency: "UGX",
              //   }).format(rowData.amount)
              // }
              style={{ minWidth: "50px" }}
            />
            <Column
              header="Status"
              sortable
              body={statusBodyTemplate}
              style={{ minWidth: "50px" }}
            />
            <Column header="Actions" body={actionBodyTemplate} />
          </DataTable>
        </div>
      </div>
    </div>
  );
};

export default FuelRequisitions;
