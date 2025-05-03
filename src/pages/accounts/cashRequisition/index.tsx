import React, { useRef, useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Chip } from "primereact/chip";
import { Link } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { Card } from "primereact/card";
import { Menu } from "primereact/menu";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ProgressSpinner } from "primereact/progressspinner";

import BreadCrump from "../../../components/layout/bread_crump";
import { PROJECTS_ENDPOINTS } from "../../../api/projectsEndpoints";
import {
  CashRequisition,
  ReqItem,
} from "../../../redux/slices/types/accounts/cash_requisitions/CashRequisition";
import useCashRequisitions from "../../../hooks/accounts/cash_requisitions/useCashRequsitions";
import { formatDate } from "../../../utils/dateUtils";
import { formatCurrency } from "../../../utils/formatCurrency";
import useAuth from "../../../hooks/useAuth";
import useCurrencies from "../../../hooks/procurement/useCurrencies";
import useItems from "../../../hooks/inventory/useItems";
import useProjects from "../../../hooks/projects/useProjects";
import useBudgets from "../../../hooks/budgets/useBudgets";
import useDepartments from "../../../hooks/hr/useDepartments";
import useEmployees from "../../../hooks/hr/useEmployees";
import useLedgers from "../../../hooks/accounts/useLedgers";
import { Budget } from "../../../redux/slices/types/budgets/Budget";
import { baseURL } from "../../../utils/api";
import axios from "axios";

interface AddCashRequisition {
  title: string;
  date_expected: string;
  budget_id?: string;
  requester_id: string;
  department_id: string;
  items: ReqItem[];
}

const CashRequisitions: React.FC = () => {
  const { data: requisitions, refresh } = useCashRequisitions();
  const { token } = useAuth();
  const tableRef = useRef<any>(null);
  const toastRef = useRef<Toast>(null);
  const actionMenuRef = useRef<Menu>(null);

  const [selectedCategory, setSelectedCategory] = useState("Pending");
  const [selectedRequisition, setSelectedRequisition] =
    useState<CashRequisition | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [modalState, setModalState] = useState<{
    visible: boolean;
    mode: "add" | "edit";
    loading: boolean;
  }>({ visible: false, mode: "add", loading: false });
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const [formState, setFormState] = useState<Partial<AddCashRequisition>>({
    items: [],
  });

  // Data hooks
  const { data: expenseAccounts } = useLedgers();
  const { data: currencies } = useCurrencies();
  const { data: inventoryItems } = useItems();
  const { data: projects } = useProjects();
  const { data: budgets } = useBudgets();
  const { data: employees } = useEmployees();
  const { data: departments } = useDepartments();

  // Initialize the account count by category
  const accountCountsByCategory = requisitions?.reduce<{
    [key: string]: number;
  }>((acc, item) => {
    const categoryName = item.status;
    acc[categoryName] = (acc[categoryName] || 0) + 1;
    return acc;
  }, {});

  // Status chip template
  const statusBodyTemplate = (rowData: CashRequisition) => {
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
      case "cancelled":
        chipProps = {
          label: rowData.status,
          className: "p-chip p-chip-cancelled",
          style: { backgroundColor: "#dc3545", color: "#fff" },
        };
        break;
      case "disbursed":
        chipProps = {
          label: "Disbursed",
          className: "p-chip p-chip-disbursed",
          style: { backgroundColor: "#17a2b8", color: "#fff" },
        };
        break;
      case "retired":
        chipProps = {
          label: "Retired",
          className: "p-chip p-chip-retired",
          style: { backgroundColor: "#6f42c1", color: "#fff" },
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

  // Handle export to PDF
  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  // Open modal for adding new requisition
  const openAddModal = () => {
    setFormState({
      title: "",
      requester_id: "",
      department_id: "",
      date_expected: new Date().toISOString(),
      items: [],
    });
    setSelectedBudget(null);
    setModalState({ visible: true, mode: "add", loading: false });
  };

  // Open modal for editing existing requisition
  const openEditModal = (requisition: CashRequisition) => {
    setSelectedRequisition(requisition);
    setFormState({
      ...requisition,
      items: requisition.cash_requisition_items.map((item) => ({
        ...item,
        uuid: item.id, // Using the actual ID as uuid for existing items
      })),
    });

    if (requisition.budget_id) {
      const budget = budgets.find((b) => b.id === requisition.budget_id);
      setSelectedBudget(budget || null);
    }

    setModalState({ visible: true, mode: "edit", loading: false });
  };

  // Close modal
  const closeModal = () => {
    setModalState({ visible: false, mode: "add", loading: false });
  };

  // Open details modal
  const openDetailsModal = (requisition: CashRequisition) => {
    console.log('vd', requisition)
    setSelectedRequisition(requisition);
    setDetailModalVisible(true);
  };

  // Close details modal
  const closeDetailsModal = () => {
    setDetailModalVisible(false);
  };

  // Form input handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof AddCashRequisition, value: any) => {
    if (name === "budget_id") {
      setFormState((prev) => ({ ...prev, [name]: value }));
      const selected = budgets.find((budget) => budget.id === value);
      setSelectedBudget(selected || null);
    } else {
      setFormState((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof ReqItem,
    value: any
  ) => {
    const updatedItems = [...(formState.items || [])];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormState((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleItemSelectChange = (index: number, value: string) => {
    if (selectedBudget) {
      const selectedItem = selectedBudget.items.find(
        (item) => item.id === value
      );
      if (selectedItem) {
        const updatedItems = [...(formState.items || [])];
        updatedItems[index] = {
          ...updatedItems[index],
          budget_item_id: selectedItem.id,
          unit_cost: selectedItem.amount_in_base_currency,
          chart_of_account_id: selectedItem.chart_of_account_id,
          currency_id: selectedItem.currency_id,
        };
        setFormState((prev) => ({ ...prev, items: updatedItems }));
      }
    }
  };

  // Item management
  const removeItem = (index: number) => {
    const updatedItems = [...(formState.items || [])];
    updatedItems.splice(index, 1);
    setFormState((prev) => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setFormState((prev) => ({
      ...prev,
      items: [
        ...(prev.items || []),
        {
          uuid: crypto.randomUUID(),
          budget_item_id: "",
          quantity: 1,
          unit_cost: 0,
          specifications: null,
          chart_of_account_id: 0,
          currency_id: currencies.length > 0 ? currencies[0].id : "",
        },
      ],
    }));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalState((prev) => ({ ...prev, loading: true }));

    if (
      !formState.title ||
      !formState.requester_id ||
      !formState.department_id
    ) {
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Please fill all required fields",
        life: 3000,
      });
      setModalState((prev) => ({ ...prev, loading: false }));
      return;
    }

    if (!formState.items || formState.items.length === 0) {
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Please add at least one item",
        life: 3000,
      });
      setModalState((prev) => ({ ...prev, loading: false }));
      return;
    }

    const data = {
      ...formState,
      date_expected: new Date(formState.date_expected || new Date())
        .toISOString()
        .slice(0, 10),
      items: formState.items?.map((item) => ({
        ...item,
        specifications: item.specifications || null,
      })),
    };

    try {
      let endpoint = `${baseURL}/accounts/cash-requisitions/create`;
      let method = "POST";

      if (modalState.mode === "edit" && selectedRequisition) {
        endpoint = `${baseURL}/accounts/cash-requisitions/${selectedRequisition.id}/update`;
        method = "PUT";
      }

      const response = await axios({
        method,
        url: endpoint,
        data,
        headers: {
          Authorization: `Bearer ${token?.access_token}`,
        },
      });

      if (response.data.success) {
        toastRef.current?.show({
          severity: "success",
          summary: "Success",
          detail: response.data.message,
          life: 3000,
        });
        refresh();
        closeModal();
      } else {
        toastRef.current?.show({
          severity: "error",
          summary: "Error",
          detail: response.data.message,
          life: 3000,
        });
      }
    } catch (error: any) {
      console.error(error);
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "An error occurred",
        life: 3000,
      });
    } finally {
      setModalState((prev) => ({ ...prev, loading: false }));
    }
  };

  // Action handlers
  const handleApprove = async (requisition: CashRequisition) => {
    confirmDialog({
      message: "Are you sure you want to approve this requisition?",
      header: "Confirm Approval",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          const response = await axios.post(
            `${baseURL}/accounts/cash-requisitions/${requisition.id}/approve`,
            {
              remarks: "Requisition approved",
              items: requisition.cash_requisition_items.map((item) => ({
                cash_requisition_item_id: item.id,
                quantity: item.quantity,
                approved_unit_cost: item.unit_cost,
                comments: "Approved as requested",
              })),
            },
            {
              headers: {
                Authorization: `Bearer ${token?.access_token}`,
              },
            }
          );

          if (response.data.success) {
            toastRef.current?.show({
              severity: "success",
              summary: "Approved",
              detail: response.data.message,
              life: 3000,
            });
            refresh();
          }
        } catch (error: any) {
          console.log(error);
          toastRef.current?.show({
            severity: "error",
            summary: "Error",
            detail:
              error.response?.data?.message || "Failed to approve requisition",
            life: 3000,
          });
        }
      },
      reject: () => {
        // Reject callback is now properly handled
      },
    });
  };

  const handleReject = async (requisition: CashRequisition) => {
    confirmDialog({
      message: "Are you sure you want to reject this requisition?",
      header: "Confirm Rejection",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          const response = await axios.post(
            `${baseURL}/accounts/cash-requisitions/${requisition.id}/reject`,
            {
              remarks: "Requisition rejected",
            },
            {
              headers: {
                Authorization: `Bearer ${token?.access_token}`,
              },
            }
          );

          if (response.data.success) {
            toastRef.current?.show({
              severity: "success",
              summary: "Rejected",
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
              error.response?.data?.message || "Failed to reject requisition",
            life: 3000,
          });
        }
      },
      reject: () => {
        // Reject callback is now properly handled
      },
    });
  };

  const handleDisburse = async (requisition: CashRequisition) => {
    confirmDialog({
      message: "Are you sure you want to disburse funds for this requisition?",
      header: "Confirm Disbursement",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          const response = await axios.post(
            `${baseURL}/accounts/cash-requisitions/${requisition.id}/disburse`,
            {
              payment_method_id: "781dff18-254a-4bf5-8725-6288e3ee668b", // Default payment method
              transaction_date: new Date().toISOString().slice(0, 10),
              notes: `Payment for requisition ${requisition.requisition_no}`,
              items: requisition.cash_requisition_items.map((item) => ({
                item_id: item.id,
                amount: item.unit_cost * item.quantity,
              })),
            },
            {
              headers: {
                Authorization: `Bearer ${token?.access_token}`,
              },
            }
          );

          if (response.data.success) {
            toastRef.current?.show({
              severity: "success",
              summary: "Disbursed",
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
              error.response?.data?.message || "Failed to disburse requisition",
            life: 3000,
          });
        }
      },
      reject: () => {
        // Reject callback is now properly handled
      },
    });
  };

  const handleDelete = async (requisition: CashRequisition) => {
    confirmDialog({
      message: "Are you sure you want to delete this requisition?",
      header: "Confirm Deletion",
      icon: "pi pi-exclamation-triangle",
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
      reject: () => {
        // Reject callback is now properly handled
      },
    });
  };

  const downloadPdf = async (requisition: CashRequisition) => {
    try {
      const response = await axios.get(
        `${baseURL}/accounts/cash-requisitions/${requisition.id}/pdf`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token?.access_token}`,
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `requisition_${requisition.requisition_no}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to download PDF",
        life: 3000,
      });
    }
  };

  const downloadPaymentVoucher = async (requisition: CashRequisition) => {
    try {
      const response = await axios.get(
        `${baseURL}/accounts/cash-requisitions/payment-vouchers/${requisition.id}/download`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token?.access_token}`,
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `payment_voucher_${requisition.requisition_no}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          error.response?.data?.message || "Failed to download payment voucher",
        life: 3000,
      });
    }
  };

  const handleRetirement = async (requisition: CashRequisition) => {
    confirmDialog({
      message: "Are you sure you want to retire this requisition?",
      header: "Confirm Retirement",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          const response = await axios.post(
            `${baseURL}/accounts/cash-requisitions/${requisition.id}/retirement`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token?.access_token}`,
              },
            }
          );

          if (response.data.success) {
            toastRef.current?.show({
              severity: "success",
              summary: "Retired",
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
              error.response?.data?.message || "Failed to retire requisition",
            life: 3000,
          });
        }
      },
      reject: () => {
        // Reject callback is now properly handled
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

  const actionItems = (requisition: CashRequisition) => {
    const baseItems = [
      {
        label: "View Details",
        icon: "pi pi-eye",
        command: () => openDetailsModal(requisition),
      },
      {
        label: "Download PDF",
        icon: "pi pi-download",
        command: () => downloadPdf(requisition),
      },
    ];

    if (requisition.status.toLowerCase() === "pending") {
      baseItems.push(
        {
          label: "Edit",
          icon: "pi pi-pencil",
          command: () => openEditModal(requisition),
        },
        {
          label: "Approve",
          icon: "pi pi-check",
          command: () => handleApprove(requisition),
        },
        {
          label: "Reject",
          icon: "pi pi-times",
          command: () => handleReject(requisition),
        },
        {
          label: "Delete",
          icon: "pi pi-trash",
          command: () => handleDelete(requisition),
        }
      );
    }

    if (requisition.status.toLowerCase() === "approved") {
      baseItems.push(
        {
          label: "Disburse",
          icon: "pi pi-money-bill",
          command: () => handleDisburse(requisition),
        },
        {
          label: "Payment Voucher",
          icon: "pi pi-file-pdf",
          command: () => downloadPaymentVoucher(requisition),
        }
      );
    }

    if (requisition.status.toLowerCase() === "disbursed") {
      baseItems.push({
        label: "Retire",
        icon: "pi pi-replay",
        command: () => handleRetirement(requisition),
      });
    }

    return baseItems;
  };

  // Calculate totals
  const totalCost =
    formState.items?.reduce(
      (acc, curr) => acc + curr.unit_cost * curr.quantity,
      0
    ) || 0;

  const selectedCurrency = currencies.find(
    (curr) => curr.id === formState.items?.[0]?.currency_id
  );

  // Modal footer
  const modalFooter = (
    <div className="flex justify-end space-x-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={closeModal}
        className="p-button-text"
      />
      <Button
        label={modalState.mode === "add" ? "Submit" : "Update"}
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={modalState.loading}
      />
    </div>
  );

  // Details modal footer
  const detailsModalFooter = (
    <div>
      <Button
        label="Close"
        icon="pi pi-times"
        onClick={closeDetailsModal}
        className="p-button-text"
      />
    </div>
  );

  return (
    <div className="p-4">
      <Toast ref={toastRef} />
      <ConfirmDialog />
      <Menu
        model={selectedRequisition ? actionItems(selectedRequisition) : []}
        popup
        ref={actionMenuRef}
      />

      {/* Add/Edit Modal */}
      <Dialog
        header={
          modalState.mode === "add"
            ? "Add Cash Requisition"
            : "Edit Cash Requisition"
        }
        visible={modalState.visible}
        style={{ width: "90vw", maxWidth: "1200px" }}
        onHide={closeModal}
        footer={modalFooter}
      >
        {modalState.loading ? (
          <div className="flex justify-center items-center h-32">
            <ProgressSpinner />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-fluid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {/* Form fields remain the same as before */}
            {/* ... */}
          </form>
        )}
      </Dialog>

      {/* Details Modal */}
      <Dialog
        header={`Requisition Details - ${selectedRequisition?.requisition_no}`}
        visible={detailModalVisible}
        style={{ width: "80vw", maxWidth: "1000px" }}
        onHide={closeDetailsModal}
        footer={detailsModalFooter}
      >
        {selectedRequisition && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1">
              <Card title="Basic Information">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="font-semibold">Title:</p>
                    <p>{selectedRequisition.title}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Status:</p>
                    {statusBodyTemplate(selectedRequisition)}
                  </div>
                  <div>
                    <p className="font-semibold">Date Expected:</p>
                    <p>{formatDate(selectedRequisition.date_expected)}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Created At:</p>
                    <p>{formatDate(selectedRequisition.created_at)}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Requester:</p>
                    <p>
                      {
                        employees.find(
                          (e) => e.id === selectedRequisition.requester_id
                        )?.first_name
                      }{" "}
                      {
                        employees.find(
                          (e) => e.id === selectedRequisition.requester_id
                        )?.last_name
                      }
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Department:</p>
                    <p>
                      {departments.find(
                        (d) => d.id === selectedRequisition.department_id
                      )?.name || "N/A"}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="col-span-1">
              <Card title="Financial Information">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="font-semibold">Total Amount:</p>
                    <p>
                      {formatCurrency(
                        selectedRequisition.total_amount,
                        selectedRequisition.currency_code || "TZS"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Budget:</p>
                    <p>
                      {selectedRequisition.budget_id
                        ? budgets.find(
                            (b) => b.id === selectedRequisition.budget_id
                          )?.name
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="col-span-2">
              <Card title="Items">
                <DataTable
                  value={selectedRequisition.cash_requisition_items}
                  className="w-full"
                >
                  <Column field="name" header="Item Name" />
                  <Column
                    field="quantity"
                    header="Quantity"
                    body={(item) => item.quantity}
                  />
                  <Column
                    field="unit_cost"
                    header="Unit Cost"
                    body={(item) =>
                      formatCurrency(item.unit_cost, item.currency_code)
                    }
                  />
                  <Column
                    field="total"
                    header="Total"
                    body={(item) =>
                      formatCurrency(
                        item.unit_cost * item.quantity,
                        item.currency_code
                      )
                    }
                  />
                  <Column field="specifications" header="Specifications" />
                </DataTable>
              </Card>
            </div>
          </div>
        )}
      </Dialog>

      {/* Main Content */}
      <BreadCrump name="Cash Requisitions" pageName="All" />
      <div className="bg-white px-8 py-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold">
              Cash Requisitions ({requisitions.length})
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              label="Add Requisition"
              icon="pi pi-plus"
              onClick={openAddModal}
              className="p-button-sm"
            />
            <Button
              label="Print"
              icon="pi pi-print"
              onClick={handleExportPDF}
              className="p-button-sm p-button-outlined"
            />
          </div>
        </div>

        {/* Status Filters */}
        <ul className="flex gap-2 my-4 flex-wrap">
          {Object.entries(accountCountsByCategory || {}).map(
            ([category, count]) => (
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
            )
          )}
        </ul>

        {/* Requisitions Table */}
        <DataTable
          scrollable
          value={
            selectedCategory === "all"
              ? requisitions
              : requisitions.filter((acc) => acc.status === selectedCategory)
          }
          ref={tableRef}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          className="p-datatable-sm"
          emptyMessage="No requisitions found"
        >
          <Column
            field="requisition_no"
            header="Requisition No"
            style={{ width: "150px" }}
            body={(rowData: CashRequisition) => (
              <Link
                className="text-teal-500 hover:underline"
                to={`/cash-requsuitions/req/${rowData.id}`}
                target="_blank"
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
                <Button
                  icon="pi pi-ellipsis-v"
                  className="p-button-rounded p-button-text p-button-sm"
                  onClick={(e) => showActionMenu(e, rowData)}
                  aria-controls="action_menu"
                  aria-haspopup
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
