import React, { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Chip } from "primereact/chip";
import { Menu } from "primereact/menu";
import { Toast } from "primereact/toast";
import { TabView, TabPanel } from "primereact/tabview";
import { confirmDialog } from "primereact/confirmdialog";
import BreadCrump from "../../../../components/layout/bread_crump";
import {
  CashRequisition,
} from "../../../../redux/slices/types/accounts/cash_requisitions/CashRequisition";
import useCashRequisitions from "../../../../hooks/accounts/cash_requisitions/useCashRequsitions";
import { formatDate } from "../../../../utils/dateUtils";
import useAuth from "../../../../hooks/useAuth";
import { baseURL } from "../../../../utils/api";
import axios from "axios";
import AddOrModifyRequisition from "./AddOrModifyItem";
import ConfirmDeleteDialog from "../../../../components/dialog/ConfirmDeleteDialog";
import ApproveOrReject from "./ApproveOrReject";
import { toast, ToastContainer } from "react-toastify";
import DisburseModal from "./disburse";



const CashRequisitions: React.FC = () => {
  const { data: requisitions = [], refresh } = useCashRequisitions();
  const { token } = useAuth();
  const tableRef = useRef<any>(null);
  const toastRef = useRef<Toast>(null);
  const actionMenuRef = useRef<Menu>(null);
  const [dialogState, setDialogState] = useState({
    currentAction: "",
    visible: false,
    selectedItem: undefined
  });

    const [disburseModal, setDisburseModal] = useState({
      visible: false,
      requisition: null,
    });

  const [selectedRequisition, setSelectedRequisition] =
    useState<CashRequisition | null>(null);
  
  const [deleteDialog, setDeleteDialog] = useState<{
      visible: boolean;
      item?: CashRequisition;
    }>({ visible: false });
  
  const [approvalModal, setApprovalModal] = useState<{
      visible: boolean;
      mode: "approve" | "reject";
      requisition?: CashRequisition;
  }>({ visible: false, mode: "approve" });

  // Initialize the account count by category
  const accountCountsByCategory = requisitions.reduce<{
    [key: string]: number;
  }>((acc, item) => {
    const categoryName = item.status;
    acc[categoryName] = (acc[categoryName] || 0) + 1;
    return acc;
  }, {});

    const openModal = (action: string, item?: CashRequisition) => {
        setDialogState({
          currentAction: action,
          visible: true,
          selectedItem: item,
        });
    };
      
  
    const printApprovedReq = async (id: string) => {
      try {
        const response = await axios.get(
          `${baseURL}/accounts/cash-requisitions/${id}/pdf`,
          {
            headers: {
              Authorization: `Bearer ${token.access_token}`,
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
        link.setAttribute('download', 'cash-requisition.pdf'); // set filename
        document.body.appendChild(link);
        link.click();
    
        // Cleanup
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        toast.error(error?.response?.data?.message)
      }
    }

  // Status chip template
  const statusBodyTemplate = (rowData: CashRequisition) => {
    let chipProps = {};
    switch (rowData.status.toLowerCase()) {
      case "approved":
        chipProps = {
          label: "Approved",
          className: "p-chip p-chip-approved",
          style: { backgroundColor: "#28a745", color: "#fff", fontSize: "12px" },
        };
        break;
      case "pending":
        chipProps = {
          label: "Pending",
          className: "p-chip p-chip-pending",
          style: { backgroundColor: "#ffc107", color: "#212529", fontSize: "12px" },
        };
        break;
      case "rejected":
      case "cancelled":
        chipProps = {
          label: rowData.status,
          className: "p-chip p-chip-cancelled",
          style: { backgroundColor: "#dc3545", color: "#fff", fontSize: "12px" },
        };
        break;
      case "disbursed":
        chipProps = {
          label: "Disbursed",
          className: "p-chip p-chip-disbursed",
          style: { backgroundColor: "#17a2b8", color: "#fff", fontSize: "12px" },
        };
        break;
      case "retired":
        chipProps = {
          label: "Retired",
          className: "p-chip p-chip-retired",
          style: { backgroundColor: "#6f42c1", color: "#fff", fontSize: "12px" },
        };
        break;
      default:
        chipProps = {
          label: "Unknown",
          className: "p-chip p-chip-unknown",
          style: { backgroundColor: "#6c757d", color: "#fff", fontSize: "12px" },
        };
        break;
    }
    return <Chip {...chipProps} />;
  };

  const print = async () => {
    try {
      const response = await axios.get(
        '/accounts/cash-requisitions/downloadtemplate',
        {
          headers: {
            Authorization: `Bearer ${token?.access_token}`,
          },
          params: {
            budget_id: '7b4637b8-54c4-4157-804c-cc716f7c3591',
            currency_id: '4d4e46ae-9b3d-49c9-bef7-f00d2d2d7d2d',
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
      link.setAttribute('download', 'cash-requisition-template.xlsx');
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };
  // Open details modal
  const openDetailsModal = (requisition: CashRequisition) => {
    setSelectedRequisition(requisition);
  };

  // Download PDF
  const downloadPdf = (requisition: CashRequisition) => {
    window.open(
      `${baseURL}/accounts/cash-requisitions/${requisition.id}/pdf`,
      "_blank"
    );
  };

  // Download payment voucher
  const downloadPaymentVoucher = (requisition: CashRequisition) => {
    window.open(
      `${baseURL}/accounts/cash-requisitions/${requisition.id}/payment-voucher`,
      "_blank"
    );
  };

  

  // Custom confirm dialog footer template
  const confirmDialogFooter = (
    accept: () => void,
    reject: () => void,
    acceptLabel: string,
    rejectLabel: string
  ) => {
    return (
      <div className="flex justify-end gap-2">
        <Button
          label={rejectLabel}
          icon="pi pi-times"
          onClick={reject}
          className="p-button-text p-button-sm"
        />
        <Button
          label={acceptLabel}
          icon="pi pi-check"
          onClick={accept}
          className="p-button-sm"
          autoFocus
        />
      </div>
    );
  };


  const handleDelete = async (requisition: CashRequisition) => {
    confirmDialog({
      message: "Are you sure you want to delete this requisition?",
      header: "Confirm Deletion",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      rejectClassName: "p-button-text",
      acceptLabel: "Delete",
      rejectLabel: "Cancel",
      footer: (props) =>
        confirmDialogFooter(props.accept, props.reject, "Delete", "Cancel"),
      accept: async () => {
        try {
          const response = await axios.delete(
            `${baseURL}/accounts/cash-requisitions/${requisition.id}/delete`,
            {
              headers: {
                Authorization: `Bearer ${token?.access_token}`,
              },
              data: {
                user_id: token?.user?.id,
                comment: "Deleted by user",
              },
            }
          );

          if (response.data.success) {
            toastRef.current?.show({
              severity: "success",
              summary: "Deleted",
              detail: response.data.message,
              life: 3000,
            });
            refresh();
          }
        } catch (error: any) {
          toastRef.current?.show({
            severity: "error",
            summary: "Error",
            detail:
              error.response?.data?.message || "Failed to delete requisition",
            life: 3000,
          });
        }
      },
    });
  };

  const showActionMenu = (
    event: React.MouseEvent,
    requisition: CashRequisition
  ) => {
    setSelectedRequisition(requisition);
    actionMenuRef.current?.toggle(event);
  };

    const actionBodyTemplate = (
      rowData: CashRequisition,
      openModal: (action: string, item: CashRequisition) => void
    ) => {
      const menuRef = useRef<Menu>(null);
    
      let menuItems = [];
    
      if (rowData.status === "Pending") {
        menuItems = [
          { label: "Edit", icon: "pi pi-pencil", command: () => setDialogState({currentAction: "edit", visible: true, selectedItem: rowData}) },
          { label: "Delete", icon: "pi pi-trash", command: () => setDeleteDialog({ visible: true, item: rowData }) },
          { label: "Approve", icon: "pi pi-check", command: () => setApprovalModal({ visible: true, mode: "approve", requisition: rowData }) },
          { label: "Reject", icon: "pi pi-times", command: () => setApprovalModal({ visible: true, mode: "reject", requisition: rowData }) },
        ];
      } else if (rowData.status === "Approved") {
        menuItems = [
          { label: "Print", icon: "pi pi-print", command: () => printApprovedReq(rowData.id) },
          {
            label: "Disburse",
            icon: "pi pi-wallet",
            command: () => setDisburseModal({ visible: true, requisition: rowData })
          }        
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
    <div className="p-4">
      <ToastContainer />

      <ConfirmDeleteDialog
        apiPath={`/accounts/cash-requisitions/${deleteDialog?.item?.id}/delete`}
        onClose={() => setDeleteDialog({ visible: false })}
        visible={deleteDialog.visible}
        onConfirm={() => {
          refresh();
          setDeleteDialog({ visible: false });
        }}
        />
  
      <Menu
        model={selectedRequisition ? actionItems(selectedRequisition) : []}
        popup
        ref={actionMenuRef}
      />
  
      {/* Main Content */}
      <BreadCrump name="Cash Requisitions" pageName="All" />
      <div className="bg-white px-8 py-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">
            Cash Requisitions ({requisitions.length || 0})
          </h1>
          <div className="flex gap-2">
            <Button
              label="Add Requisition"
              icon="pi pi-plus"
              onClick={() => setDialogState({
                currentAction: "add",
                visible: true,
                selectedItem: undefined
              })}
              className="p-button-sm"
            />
            <button
              className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
              onClick={print}
            >
              <Icon icon="solar:arrow-down" fontSize={20} />
              Download Template
            </button>
          </div>
        </div>
  
        {/* Tabs for statuses */}
        <TabView>
          {["Pending", "Approved", "Disbursed", "Retired", "Rejected"].map(
            (status) => (
              <TabPanel
                key={status}
                header={`${status} (${accountCountsByCategory[status] || 0})`}
              >
                <DataTable
                  scrollable
                  value={requisitions.filter(
                    (req) => req.status.toLowerCase() === status.toLowerCase()
                  )}
                  ref={tableRef}
                  paginator
                  rows={10}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  className="p-datatable-sm"
                  emptyMessage={`No ${status} requisitions found`}
                >
                  <Column
                    field="requisition_no"
                    header="Requisition No"
                    style={{ width: "150px" }}
                    // body={(rowData: CashRequisition) => (
                    //   <Link
                    //     className="text-teal-500 hover:underline"
                    //     to={`/cash-requsuitions/req/${rowData.id}`}
                    //     target="_blank"
                    //   >
                    //     {rowData.requisition_no}
                    //   </Link>
                    // )}
                  />
                  <Column field="title" header="Title" sortable filter />
                  <Column header="Status" body={statusBodyTemplate} />
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
                    body={(rowData: CashRequisition) =>
                      formatDate(rowData.created_at)
                    }
                  />
                 <Column
                    header="Actions"
                    body={(rowData: CashRequisition) => actionBodyTemplate(rowData, openModal)}
                  />

                  
                </DataTable>
              </TabPanel>
            )
          )}
        </TabView>
      </div>
      <AddOrModifyRequisition visible={dialogState.visible} onHide={() => setDialogState({ currentAction: "", visible: false, selectedItem: undefined })} item={dialogState.selectedItem} onSubmit={refresh} />
      <ApproveOrReject requisition={approvalModal?.requisition} visible={approvalModal.visible} onHide={() => setApprovalModal({ visible: false })} onCompleted={refresh} />
      <DisburseModal visible={disburseModal.visible} onHide={()=> setDisburseModal({visible: false})} requisition={disburseModal.requisition} onCompleted={refresh} />
    </div>
  );
};

export default CashRequisitions;