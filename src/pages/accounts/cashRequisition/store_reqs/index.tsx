import React, { useRef, useState } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Chip } from "primereact/chip";
import { ToastContainer, toast } from "react-toastify";
import { TabView, TabPanel } from "primereact/tabview";
import { format } from "date-fns";
import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../../components/layout/bread_crump";
import axios from "axios";
import { baseURL } from "../../../../utils/api";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import useStoreRequisitions from "../../../../hooks/accounts/cash_requisitions/useStoreRequisitions";
import { StoreRequisition } from "../../../../redux/slices/types/accounts/cash_requisitions/CashRequisition";
import AddorModify from "./AddorModify";
import { Menu } from "primereact/menu";
import ApproveOrReject from "./ApproveOrReject";
import DisburseModal from "./disburse";

const StoreRequisitions: React.FC = () => {
  const { data: requisitions, refresh } = useStoreRequisitions();
  const token = useSelector((state: RootState) => state.userAuth.token.access_token);
  const tableRef = useRef<any>(null);

  const [disburseModal, setDisburseModal] = useState({
    visible: false,
    requisition: null,
  });

  const [selectedCategory, setSelectedCategory] = useState<"Pending" | "Approved" | "Rejected">("Pending");
  const [dialogState, setDialogState] = useState<{ selectedItem?: StoreRequisition; currentAction: "delete" | "edit" | "add" | "approve" | "reject" | ""}>({ currentAction: "" });

  const statusBodyTemplate = (rowData: StoreRequisition) => {
    const statusMap: Record<string, { label: string; bg: string; text?: string }> = {
      Pending: { label: "Pending", bg: "#ffc107", text: "#212529" },
      Reviewed: { label: "Reviewed", bg: "#274beaff" },
      Approved: { label: "Approved", bg: "#28a745" },
      Rejected: { label: "Rejected", bg: "#dc3545" },
    };
    const s = statusMap[rowData.status] || { label: "Unknown", bg: "#6c757d" };
    return <Chip label={s.label} style={{ backgroundColor: s.bg, color: s.text || "#fff", fontSize: '12px' }} size="small" />;
  };

    const [deleteDialog, setDeleteDialog] = useState<{
      visible: boolean;
      item?: StoreRequisition;
    }>({ visible: false });
  
    const [approvalModal, setApprovalModal] = useState<{
      visible: boolean;
      mode: "approve" | "reject";
      requisition?: StoreRequisition;
    }>({ visible: false, mode: "approve" });
  
  
    const openModal = (action: string, item?: StoreRequisition) => {
        setDialogState({
          currentAction: action,
          selectedItem: item,
        });
    };
      
  

  const handlePrintRequisition = async (id: string) => {
    try {
      //requisitions/store-requisitions/cd1816ae-8501-4786-af85-bab5c21d55ce/print
      const response = await axios.get(`${baseURL}/requisitions/store-requisitions/${id}/print`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `store-requisition-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error("Failed to print requisition");
    }
  };

  const actionBodyTemplate = (
    rowData: StoreRequisition,
    openModal: (action: string, item: StoreRequisition) => void
  ) => {
    const menuRef = useRef<Menu>(null);
  
    let menuItems = [];
  
    if (rowData.status === "Pending" || rowData.status === "Reviewed") {
      menuItems = [
        { label: "Edit", icon: "pi pi-pencil", command: () => openModal("edit", rowData) },
        { label: "Delete", icon: "pi pi-trash", command: () => setDeleteDialog({ visible: true, item: rowData }) },
        {
          label: "Approve",
          icon: "pi pi-check",
          command: () =>
            setDialogState({
              currentAction: "approve",
              selectedItem: rowData,
            }),
        },
        {
          label: "Reject",
          icon: "pi pi-times",
          command: () =>
            setDialogState({
              currentAction: "reject",
              selectedItem: rowData,
            }),
        },
      ];
    } else if (rowData.status === "Approved") {
      menuItems = [
        { label: "Print", icon: "pi pi-print", command: () => handlePrintRequisition(rowData.id) },
        {
          label: "Fulfill",
          icon: "pi pi-wallet",
          command: () => setDisburseModal({ visible: true, requisition: rowData })
        }        
        
      ];
    }
  
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

  const filteredRequisitions = (status: string) => requisitions.filter((req) => req.status === status);

  return (
    <div className="w-full overflow-x-hidden">
      <ToastContainer />
      <BreadCrump name="Store Requisitions" pageName="All" />

      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Store Requisitions ({requisitions.length})</h1>
          <Button label="Add Requisition" icon="pi pi-plus" className="p-button-success"  onClick={() =>
            setDialogState({ selectedItem: undefined, currentAction: "add" })
          } />
        </div>

        <TabView activeIndex={["Pending", "Reviewed", "Approved", "Rejected", "Disbursed"].indexOf(selectedCategory)} onTabChange={(e) => setSelectedCategory(["Pending", "Reviewed", "Approved", "Rejected", "Disbursed"][e.index] as any)}>
          {["Pending", "Reviewed", "Approved", "Rejected", "Disbursed"].map((status) => (
            <TabPanel header={status} key={status}>
              <DataTable
                value={filteredRequisitions(status)}
                ref={tableRef}
                paginator
                rows={10}
                className="p-datatable-sm w-full"
              >
                <Column
                  field="requisition_no"
                  header="Req No"
                  // body={
                  //   (rowData) =>
                  //     <Link to={`/cash-requisitions/req/${rowData.id}`}
                  //       className="text-teal-500 hover:underline">{rowData.requisition_no}
                  //     </Link>
                  // }
                />
                <Column field="department.name" header="Department" />
                <Column field="priority" header="Priority" />
                <Column field="status" header="Status" body={statusBodyTemplate} />
                <Column field="created_at" header="Created At" body={(rowData) => format(new Date(rowData.created_at), "dd/MM/yyyy HH:mm")} />
                 <Column
                    header="Actions"
                    body={(rowData: StoreRequisition) => actionBodyTemplate(rowData, openModal)}
                 />
              </DataTable>
            </TabPanel>
          ))}
        </TabView>
      </div>
      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        apiPath={`/requisitions/store-requisitions/${deleteDialog?.item?.id}`}
        onClose={() => setDeleteDialog({ visible: false })} 
        visible={deleteDialog.visible}
        onConfirm={() => {
          refresh();
          setDeleteDialog({ visible: false });
        }}
      />
      {dialogState.currentAction === "add" || dialogState.currentAction === "edit" ? (
        <AddorModify
          dialogState={dialogState}
          setDialogState={setDialogState}
        />
      ) : null}
       <ApproveOrReject
        dialogState={dialogState}
        setDialogState={setDialogState}
        refresh={refresh}
      />

      <DisburseModal
        visible={disburseModal.visible}
        requisition={disburseModal.requisition}
        onHide={() => setDisburseModal({ visible: false, requisition: null })}
        onSubmit={refresh}
      />
    </div>
  );
};

export default StoreRequisitions;
