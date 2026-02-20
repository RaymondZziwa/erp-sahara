import React, { useRef, useState } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Chip } from "primereact/chip";
import { Link } from "react-router-dom";
import { TabView, TabPanel } from "primereact/tabview";
import { Menu } from "primereact/menu";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import BreadCrump from "../../../../components/layout/bread_crump";
import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import { FuelRequisition } from "../../../../redux/slices/types/accounts/cash_requisitions/CashRequisition";
import useFuelRequisitions from "../../../../hooks/accounts/cash_requisitions/useFuelRequisitions";
import { toast, ToastContainer } from "react-toastify";
import AddorModify from "./AddorModify";
import ApprovalModal from "./approve";
import { baseURL } from "../../../../utils/api";
import axios from "axios";

const FuelRequisitions: React.FC = () => {
  const { data: requisitions, refresh } = useFuelRequisitions();
  const [deleteDialog, setDeleteDialog] = useState<{
    visible: boolean;
    item?: FuelRequisition;
  }>({ visible: false });

  const [approvalModal, setApprovalModal] = useState<{
    visible: boolean;
    mode: "approve" | "reject";
    requisition?: FuelRequisition;
  }>({ visible: false, mode: "approve" });
  

    const [dialogState, setDialogState] = useState<{
      currentAction: "" | "add" | "edit";
      selectedItem?: any;
    }>({ currentAction: "" });
  
  const openModal = (action: string, item?: FuelRequisition) => {
      setDialogState({
        currentAction: action,
        selectedItem: item,
      });
  };
    
  
  const token = useSelector(
    (state: RootState) => state.userAuth.token.access_token
  );

  const printApprovedReq = async (id: string) => {
    try {
      const response = await axios.get(
        `${baseURL}/requisitions/fuel-requisitions/${id}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );
  
      // Create a blob from the response
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
  
      // Create a link and click it to start download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'fuel-requisition.pdf'); // set filename
      document.body.appendChild(link);
      link.click();
  
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error?.response?.data?.message)
    }
  }

  const tableRef = useRef<any>(null);
  const [selectedCategory, setSelectedCategory] = useState("Pending");

  const statusBodyTemplate = (rowData: FuelRequisition) => {
    const statusColors: Record<string, any> = {
      Approved: { label: "Approved", color: "#28a745" },
      Reviewed: { label: "Reviewed", color: "#0777ffff", text: "#ffffffff" },
      Pending: { label: "Pending", color: "#ffc107", text: "#212529" },
      Rejected: { label: "Rejected", color: "#dc3545" },
    };
    const status = statusColors[rowData.status] || {
      label: "Unknown",
      color: "#6c757d",
    };
  
    return (
      <Chip
        label={status.label}
        size="small"           // makes the chip smaller
        style={{
          backgroundColor: status.color,
          color: status.text || "#fff",
          fontSize: "0.75rem",  // optional smaller font
          padding: "1px 1ox",
        }}
      />
    );
  };
  
  const actionBodyTemplate = (
    rowData: FuelRequisition,
    openModal: (action: string, item: FuelRequisition) => void
  ) => {
    const menuRef = useRef<Menu>(null);
  
    let menuItems = [];
  
    if (rowData.status === "Pending" || rowData.status === "Reviewed") {
      menuItems = [
        { label: "Edit", icon: "pi pi-pencil", command: () => openModal("edit", rowData) },
        { label: "Delete", icon: "pi pi-trash", command: () => setDeleteDialog({ visible: true, item: rowData }) },
        { label: "Approve", icon: "pi pi-check", command: () => setApprovalModal({ visible: true, mode: "approve", requisition: rowData }) },
        { label: "Reject", icon: "pi pi-times", command: () => setApprovalModal({ visible: true, mode: "reject", requisition: rowData }) },
      ];
    } else if (rowData.status === "Approved") {
      menuItems = [
        { label: "Print", icon: "pi pi-print", command: () => printApprovedReq(rowData.id) },
      ];
    } // rejected -> empty menu
  
    return menuItems.length > 0 ? (
      <div className="relative">
        <Menu model={menuItems} popup ref={menuRef} />
        <i
          className="pi pi-ellipsis-v cursor-pointer text-lg"
          onClick={(e) => menuRef.current?.toggle(e)}
          aria-haspopup="true"
        />
      </div>
    ) : null;
  };
  

  return (
    <div className="w-full overflow-x-hidden">
      <ToastContainer />

      <ConfirmDeleteDialog
        apiPath={`/requisitions/fuel-requisitions/${deleteDialog?.item?.id}`}
        onClose={() => setDeleteDialog({ visible: false })} // ✅ wrap in arrow function
        visible={deleteDialog.visible}
        onConfirm={() => {
          refresh(); // refresh after deletion
          setDeleteDialog({ visible: false }); // close dialog
        }}
      />


      <BreadCrump name="Fuel Requisitions" pageName="All" />

      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h1 className="text-xl font-bold">
            Fuel Requisitions ({requisitions.length})
          </h1>
          <Button
            label="Add Requisition"
            icon="pi pi-plus"
            className="p-button-success text-sm"
            onClick={() =>
              setDialogState({ currentAction: "add", selectedItem: undefined })
            }
          />
        </div>

        {/* ✅ Tab View Wrapper */}
        <TabView
          activeIndex={["Pending", "Reviewed", "Approved", "Rejected"].indexOf(
            selectedCategory
          )}
          onTabChange={(e) =>
            setSelectedCategory(["Pending", "Reviewed", "Approved", "Rejected"][e.index])
          }
        >
          <TabPanel header={`Pending`}>
            <DataTable
              scrollable
              scrollHeight="flex"
              value={requisitions.filter((req) => req.status === "Pending")}
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
                // body={(rowData: FuelRequisition) => (
                //   <Link
                //     className="text-teal-500 hover:underline"
                //     to={`/cash-requisitions/req/${rowData.id}`}
                //   >
                //     {rowData.requisition_no}
                //   </Link>
                // )}
              />
              <Column field="department.name" header="Department" sortable />
              <Column field="truck.license_plate" header="Truck" sortable />
              <Column
                field="total_round_kilometers"
                header="Distance (km)"
                sortable
              />
              <Column field="reason" header="Reason" sortable />
              <Column
                field="last_quantity_fuel_used"
                header="Fuel Used"
                sortable
              />
              <Column field="last_mileage" header="Mileage" sortable />
              <Column field="amount" header="Amount" sortable />
              <Column header="Status" body={statusBodyTemplate} sortable />
              <Column
                header="Actions"
                body={(rowData: FuelRequisition) => actionBodyTemplate(rowData, openModal)}
              />
            </DataTable>
          </TabPanel>

          <TabPanel header={`Reviewed`}>
            <DataTable
              scrollable
              scrollHeight="flex"
              value={requisitions.filter((req) => req.status === "Reviewed")}
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
                // body={(rowData: FuelRequisition) => (
                //   <Link
                //     className="text-teal-500 hover:underline"
                //     to={`/cash-requisitions/req/${rowData.id}`}
                //   >
                //     {rowData.requisition_no}
                //   </Link>
                // )}
              />
              <Column field="department.name" header="Department" sortable />
              <Column field="truck.license_plate" header="Truck" sortable />
              <Column
                field="total_round_kilometers"
                header="Distance (km)"
                sortable
              />
              <Column field="reason" header="Reason" sortable />
              <Column
                field="last_quantity_fuel_used"
                header="Fuel Used"
                sortable
              />
              <Column field="last_mileage" header="Mileage" sortable />
              <Column field="amount" header="Amount" sortable />
              <Column header="Status" body={statusBodyTemplate} sortable />
              <Column
                header="Actions"
                body={(rowData: FuelRequisition) => actionBodyTemplate(rowData, openModal)}
              />
            </DataTable>
          </TabPanel>

          <TabPanel header={`Approved`}>
            <DataTable
              value={requisitions.filter((req) => req.status === "Approved")}
              paginator
              rows={10}
              className="p-datatable-sm w-full"
            >
              <Column field="requisition_no" header="Req No" />
              <Column field="department.name" header="Department" sortable />
              <Column field="truck.license_plate" header="Truck" sortable />
              <Column
                field="total_round_kilometers"
                header="Distance (km)"
                sortable
              />
              <Column field="reason" header="Reason" sortable />
              <Column
                field="last_quantity_fuel_used"
                header="Fuel Used"
                sortable
              />
              <Column field="last_mileage" header="Mileage" sortable />
              <Column field="amount" header="Amount" sortable />
              <Column header="Status" body={statusBodyTemplate} sortable />
              <Column
                header="Actions"
                body={(rowData: FuelRequisition) => actionBodyTemplate(rowData, openModal)}
              />
            </DataTable>
          </TabPanel>

          <TabPanel header={`Rejected`}>
            <DataTable
              value={requisitions.filter((req) => req.status === "Rejected")}
              paginator
              rows={10}
              className="p-datatable-sm w-full"
            >
               <Column field="department.name" header="Department" sortable />
              <Column field="truck.license_plate" header="Truck" sortable />
              <Column
                field="total_round_kilometers"
                header="Distance (km)"
                sortable
              />
              <Column field="reason" header="Reason" sortable />
              <Column
                field="last_quantity_fuel_used"
                header="Fuel Used"
                sortable
              />
              <Column field="last_mileage" header="Mileage" sortable />
              <Column field="amount" header="Amount" sortable />
              <Column header="Status" body={statusBodyTemplate} sortable />
              <Column
                header="Actions"
                body={(rowData: FuelRequisition) => actionBodyTemplate(rowData, openModal)}
              />
            </DataTable>
          </TabPanel>
        </TabView>
      </div>
      {/* Add/Edit Dialog */}
      {dialogState.currentAction && (
        <AddorModify
          dialogState={dialogState}
          setDialogState={setDialogState}
        />
      )}

      <ApprovalModal
        visible={approvalModal.visible}
        mode={approvalModal.mode}
        requisition={approvalModal.requisition || null}
        onHide={() => setApprovalModal({ ...approvalModal, visible: false })}
        onCompleted={refresh}
        token={token}
      />
    </div>
  );
};

export default FuelRequisitions;
