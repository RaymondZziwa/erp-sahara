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
import { formatDate } from "date-fns";
import { PROJECTS_ENDPOINTS } from "../../../../api/projectsEndpoints";
import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../../components/layout/bread_crump";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { baseURL } from "../../../../utils/api";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import useDepartments from "../../../../hooks/hr/useDepartments";
import useItems from "../../../../hooks/inventory/useItems";
import useWarehouses from "../../../../hooks/inventory/useWarehouses";
import useEmployees from "../../../../hooks/hr/useEmployees";
import useStoreRequisitions from "../../../../hooks/accounts/cash_requisitions/useStoreRequisitions";
import { StoreRequisition } from "../../../../redux/slices/types/accounts/cash_requisitions/CashRequisition";
import useUnitsOfMeasurement from "../../../../hooks/inventory/useUnitsOfMeasurement";

interface StoreRequisitionForm {
  department_id: string;
  requested_by: string;
  priority: string;
  items: {
    item_id: string;
    uom_id: string | null;
    requested_quantity: number;
    warehouse_id: string | null;
    specification: string;
    purpose: string;
  }[];
}

interface ApprovalForm {
  requisition_id: string;
  remarks: string;
  items: {
    store_requisition_item_id: string;
    approved_quantity: number;
    comments: string | null;
    action: "approve" | "reject";
  }[];
}

const StoreRequisitions: React.FC = () => {
  const { data: requisitions, refresh } = useStoreRequisitions();
  const { data: departments } = useDepartments();
  const { data: items } = useItems();
  const { data: warehouses } = useWarehouses();
  const { data: uoms } = useUnitsOfMeasurement();
  const { data: employees } = useEmployees();
  const token = useSelector(
    (state: RootState) => state.userAuth.token.access_token
  );

  const tableRef = useRef<any>(null);
  const [selectedCategory, setSelectedCategory] = useState("pending");

  const [dialogState, setDialogState] = useState<{
    selectedItem: StoreRequisition | undefined;
    currentAction: "delete" | "edit" | "add" | "approve" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const [formData, setFormData] = useState<StoreRequisitionForm>({
    department_id: "",
    requested_by: "",
    priority: "medium",
    items: [],
  });

  const [approvalData, setApprovalData] = useState<ApprovalForm>({
    requisition_id: "",
    remarks: "",
    items: [],
  });

  const priorityOptions = [
    { label: "High", value: "high" },
    { label: "Medium", value: "medium" },
    { label: "Low", value: "low" },
  ];

  useEffect(() => {
    if (dialogState.currentAction === "edit" && dialogState.selectedItem) {
      setFormData({
        department_id: dialogState.selectedItem.department_id,
        requested_by: dialogState.selectedItem.requested_by,
        priority: dialogState.selectedItem.priority,
        items: dialogState.selectedItem.items.map((item) => ({
          item_id: item.item_id,
          uom_id: item.uom_id,
          requested_quantity: item.requested_quantity,
          warehouse_id: item.warehouse_id,
          specification: item.specification,
          purpose: item.purpose,
        })),
      });
    }

    if (dialogState.currentAction === "approve" && dialogState.selectedItem) {
      setApprovalData({
        requisition_id: dialogState.selectedItem.id,
        remarks: "",
        items: dialogState.selectedItem.items.map((item) => ({
          store_requisition_item_id: item.id,
          approved_quantity: item.requested_quantity,
          comments: null,
          action: "approve",
        })),
      });
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
        `${baseURL}/requisitions/store-requisitions/${requisitionId}/pdf`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          
        }
      );

      const fileURL = URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", `store-requisition-${requisitionId}.pdf`);
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

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleApprovalItemChange = (
    index: number,
    field: string,
    value: any
  ) => {
    const updatedItems = [...approvalData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setApprovalData((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleApprovalChange = (field: string, value: any) => {
    setApprovalData((prev) => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item_id: "",
          uom_id: null,
          requested_quantity: 1,
          warehouse_id: null,
          specification: "",
          purpose: "",
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleSubmit = async () => {
    try {
      let response;
      const endpoint = `${baseURL}/requisitions/store-requisitions`;

      if (dialogState.currentAction === "add") {
        response = await axios.post(endpoint, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          validateStatus: () => true,
        });
      } else if (
        dialogState.currentAction === "edit" &&
        dialogState.selectedItem
      ) {
        response = await axios.put(
          `${endpoint}/${dialogState.selectedItem.id}/update`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      if (response?.data.success) {
        toast.success(response.data.message);
        refresh();
        setDialogState({ selectedItem: undefined, currentAction: "" });
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
        `${baseURL}/requisitions/store-requisitions/${dialogState.selectedItem.id}/approve`,
        approvalData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Requisition approved successfully");
        refresh();
        setDialogState({ selectedItem: undefined, currentAction: "" });
      } else {
        toast.error(response.data.message || "Approval failed");
      }
    } catch (error) {
      console.error("Error approving requisition:", error);
      toast.error("An error occurred while approving the requisition");
    }
  };

  const handleDelete = async () => {
    if (!dialogState.selectedItem) return;

    try {
      const response = await axios.delete(
        `${baseURL}/requisitions/store-requisitions/${dialogState.selectedItem.id}/delete`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Requisition deleted successfully");
        refresh();
        setDialogState({ selectedItem: undefined, currentAction: "" });
      } else {
        toast.error("Failed to delete requisition");
      }
    } catch (error) {
      console.error("Error deleting requisition:", error);
      toast.error("An error occurred while deleting the requisition");
    }
  };

  const statusBodyTemplate = (rowData: StoreRequisition) => {
    let chipProps = {};

    switch (rowData.status.toLowerCase()) {
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
      case "rejected":
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

  const actionBodyTemplate = (rowData: StoreRequisition) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-button-text"
          onClick={() =>
            setDialogState({
              selectedItem: rowData,
              currentAction: "edit",
            })
          }
          disabled={rowData.status !== "Pending"}
          tooltip="Edit"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-text"
          onClick={() =>
            setDialogState({
              selectedItem: rowData,
              currentAction: "delete",
            })
          }
          disabled={rowData.status !== "Pending"}
          tooltip="Delete"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-check"
          className="p-button-rounded p-button-info p-button-text"
          onClick={() =>
            setDialogState({
              selectedItem: rowData,
              currentAction: "approve",
            })
          }
          disabled={rowData.status !== "Pending"}
          tooltip="Approve"
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-print"
          className="p-button-rounded p-button-secondary p-button-text"
          onClick={() => handlePrintRequisition(rowData.id)}
          tooltip="Print"
          tooltipOptions={{ position: "top" }}
        />
      </div>
    );
  };

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
            ? "Add Store Requisition"
            : "Edit Store Requisition"
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
            <label htmlFor="department">Department*</label>
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
              required
            />
          </div>
          <div className="field">
            <label htmlFor="requested_by">Requested By*</label>
            <Dropdown
              id="requested_by"
              options={
                employees?.map((e) => ({
                  label: `${e.first_name} ${e.last_name}`,
                  value: e.id,
                })) || []
              }
              value={formData.requested_by}
              onChange={(e) => handleFormChange("requested_by", e.value)}
              placeholder="Select Employee"
              filter
              className="w-full"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="priority">Priority*</label>
            <Dropdown
              id="priority"
              options={priorityOptions}
              value={formData.priority}
              onChange={(e) => handleFormChange("priority", e.value)}
              placeholder="Select Priority"
              className="w-full"
              required
            />
          </div>

          <div className="md:col-span-2">
            <h4 className="text-lg font-semibold mb-2">Items</h4>
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="field">
                      <label htmlFor={`item-${index}`}>Item*</label>
                      <Dropdown
                        id={`item-${index}`}
                        options={
                          items?.map((i) => ({ label: i.name, value: i.id })) ||
                          []
                        }
                        value={item.item_id}
                        onChange={(e) =>
                          handleItemChange(index, "item_id", e.value)
                        }
                        placeholder="Select Item"
                        filter
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="field">
                      <label htmlFor={`uom-${index}`}>Unit of Measure</label>
                      <Dropdown
                        id={`uom-${index}`}
                        options={
                          uoms?.map((u) => ({ label: u.name, value: u.id })) ||
                          []
                        }
                        value={item.uom_id}
                        onChange={(e) =>
                          handleItemChange(index, "uom_id", e.value)
                        }
                        placeholder="Select UOM"
                        filter
                        className="w-full"
                      />
                    </div>
                    <div className="field">
                      <label htmlFor={`quantity-${index}`}>Quantity*</label>
                      <InputNumber
                        id={`quantity-${index}`}
                        value={item.requested_quantity}
                        onValueChange={(e) =>
                          handleItemChange(
                            index,
                            "requested_quantity",
                            e.value || 1
                          )
                        }
                        min={1}
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="field">
                      <label htmlFor={`warehouse-${index}`}>
                        Preferred Warehouse
                      </label>
                      <Dropdown
                        id={`warehouse-${index}`}
                        options={
                          warehouses?.map((w) => ({
                            label: w.name,
                            value: w.id,
                          })) || []
                        }
                        value={item.warehouse_id}
                        onChange={(e) =>
                          handleItemChange(index, "warehouse_id", e.value)
                        }
                        placeholder="Select Warehouse"
                        filter
                        className="w-full"
                      />
                    </div>
                    <div className="field md:col-span-2">
                      <label htmlFor={`specification-${index}`}>
                        Specification
                      </label>
                      <InputText
                        id={`specification-${index}`}
                        value={item.specification}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "specification",
                            e.target.value
                          )
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="field md:col-span-2">
                      <label htmlFor={`purpose-${index}`}>Purpose*</label>
                      <InputText
                        id={`purpose-${index}`}
                        value={item.purpose}
                        onChange={(e) =>
                          handleItemChange(index, "purpose", e.target.value)
                        }
                        className="w-full"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button
                      icon="pi pi-trash"
                      className="p-button-danger p-button-text"
                      onClick={() => removeItem(index)}
                      tooltip="Remove Item"
                    />
                  </div>
                </div>
              ))}
              <Button
                icon="pi pi-plus"
                label="Add Item"
                onClick={addItem}
                className="p-button-outlined w-full"
              />
            </div>
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
        header="Approve Store Requisition"
        visible={dialogState.currentAction === "approve"}
        style={{ width: "90vw", maxWidth: "800px" }}
        onHide={() =>
          setDialogState({ selectedItem: undefined, currentAction: "" })
        }
      >
        <div className="grid gap-4">
          <div className="field">
            <label htmlFor="remarks">Remarks</label>
            <InputText
              id="remarks"
              value={approvalData.remarks}
              onChange={(e) => handleApprovalChange("remarks", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Items Approval</h4>
            {approvalData.items.map((item, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="field">
                    <label>Item Name</label>
                    <InputText
                      value={
                        dialogState.selectedItem?.items.find(
                          (i) => i.id === item.store_requisition_item_id
                        )?.item_name || ""
                      }
                      readOnly
                      className="w-full"
                    />
                  </div>
                  <div className="field">
                    <label>Requested Quantity</label>
                    <InputNumber
                      value={
                        dialogState.selectedItem?.items.find(
                          (i) => i.id === item.store_requisition_item_id
                        )?.requested_quantity || 0
                      }
                      readOnly
                      className="w-full"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`approved_quantity-${index}`}>
                      Approved Quantity*
                    </label>
                    <InputNumber
                      id={`approved_quantity-${index}`}
                      value={item.approved_quantity}
                      onValueChange={(e) =>
                        handleApprovalItemChange(
                          index,
                          "approved_quantity",
                          e.value || 0
                        )
                      }
                      min={0}
                      className="w-full"
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`action-${index}`}>Action*</label>
                    <Dropdown
                      id={`action-${index}`}
                      options={[
                        { label: "Approve", value: "approve" },
                        { label: "Reject", value: "reject" },
                      ]}
                      value={item.action}
                      onChange={(e) =>
                        handleApprovalItemChange(index, "action", e.value)
                      }
                      placeholder="Select Action"
                      className="w-full"
                      required
                    />
                  </div>
                  <div className="field md:col-span-2">
                    <label htmlFor={`comments-${index}`}>Comments</label>
                    <InputText
                      id={`comments-${index}`}
                      value={item.comments || ""}
                      onChange={(e) =>
                        handleApprovalItemChange(
                          index,
                          "comments",
                          e.target.value || null
                        )
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            ))}
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
        apiPath={PROJECTS_ENDPOINTS.PROJECTS.DELETE(
          dialogState.selectedItem?.id.toString() || ""
        )}
        onClose={() =>
          setDialogState({ selectedItem: undefined, currentAction: "" })
        }
        visible={dialogState.currentAction === "delete"}
        onConfirm={handleDelete}
      />

      <BreadCrump name="Store Requisitions" pageName="All" />
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold">
              Store Requisitions ({requisitions.length})
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              label="Add Requisition"
              icon="pi pi-plus"
              className="p-button-success"
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
              className="p-button-secondary"
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
        <div className="overflow-x-auto">
          <DataTable
            scrollable
            scrollHeight="flex"
            value={
              selectedCategory === "all"
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
              body={(rowData: StoreRequisition) => (
                <Link
                  className="text-teal-500 hover:underline"
                  to={`/cash-requsuitions/req/${rowData.id}`}
                >
                  {rowData.requisition_no}
                </Link>
              )}
              style={{ minWidth: "120px" }}
            />
            <Column
              field="department.name"
              header="Department"
              sortable
              filter
              style={{ minWidth: "180px" }}
            />
            <Column
              field="requested_by_name"
              header="Requested By"
              sortable
              filter
              style={{ minWidth: "180px" }}
            />
            <Column
              field="priority"
              header="Priority"
              sortable
              filter
              style={{ minWidth: "120px" }}
            />
            <Column
              field="status"
              header="Status"
              sortable
              body={statusBodyTemplate}
              style={{ minWidth: "120px" }}
            />
            <Column
              field="created_at"
              header="Created At"
              body={(rowData: StoreRequisition) =>
                formatDate(rowData.created_at)
              }
              style={{ minWidth: "150px" }}
            />
            <Column
              header="Actions"
              body={actionBodyTemplate}
              style={{ minWidth: "200px" }}
            />
          </DataTable>
        </div>
      </div>
    </div>
  );
};

export default StoreRequisitions;
