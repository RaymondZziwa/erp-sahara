import React, { useRef, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import useSupplierLoans from "../../hooks/supplierLoans/useSupplierLoans";
import { SupplierLoanRequest } from "../../redux/slices/types/supplierLoans/supplierLoans";
import BreadCrump from "../../components/layout/bread_crump";
import Table from "../../components/table";
import AddOrModifySupplierLoanRequest from "./AddorModify";
import ConfirmDeleteDialog from "../../components/dialog/ConfirmDeleteDialog";
import LoanViewModal from "./viewLoan";
import { toast, ToastContainer } from "react-toastify";
import { apiRequest } from "../../utils/api";
import { SUPPLIER_LOAN_ENDPOINTS } from "../../api/supplierLoanEndpoints";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { Tooltip } from "primereact/tooltip"
import ApprovalOrRejectionModal from "./ApproveorReject";
import DisburseLoanModal from "./disburse";
import { LoanPaymentModal } from "./pay";
import { PropagateLoader } from "react-spinners";
import { Link } from "react-router-dom";

const statusTabs = [
  { id: 'active', label: 'Active', statuses: ['disbursed', 'partially_paid', 'cleared', 'defaulted'] },
  { id: 'approved', label: 'Approved', statuses: ['approved'] },
  { id: 'pending', label: 'Pending', statuses: ['pending', 'reviewed'] },
  { id: 'rejected', label: 'Rejected', statuses: ['rejected'] },
];

const SupplierLoans: React.FC = () => {
      const [modalVisible, setModalVisible] = useState(false);
      const [isDisburseOpen, setIsDisburseOpen] = useState(false);
      const [isPaymentOpen, setIsPaymentOpen] = useState(false);
      const [modalAction, setModalAction] = useState<"approve" | "reject">("approve");
      const user = useSelector((state: RootState)=> state.userAuth.user);
  const token = useSelector((state: RootState) => state.userAuth.token.access_token);
  const [activeTab, setActiveTab] = useState('active');
  const { data: allLoans, loading, error, refresh } = useSupplierLoans();
  const tableRef = useRef<any>(null);
  const [selectedLoan, setSelectedLoan] = useState<SupplierLoanRequest>();
  const [showLoanModal, setShowLoanModal] = useState(false);

  // Filter loans based on active tab
  const filteredLoans = React.useMemo(() => {
    if (!allLoans) return [];
    const activeTabConfig = statusTabs.find(tab => tab.id === activeTab);
    if (!activeTabConfig) return allLoans;
    return allLoans.filter(loan => activeTabConfig.statuses.includes(loan.status));
  }, [allLoans, activeTab]);

  const handleApprove = async (payload: any) => {
    try {
      await apiRequest(SUPPLIER_LOAN_ENDPOINTS.SUPPLIER_LOANS.APPROVE(selectedLoan?.id), "POST", token, payload);
      toast.success("Supplier loan approved successfully")
      refresh();
    } catch (error) {
      toast.error(error?.response?.data?.message || "An error occurred while approving the loan.");
      return;
    } finally {
      setShowLoanModal(false);
    }
  };

  const handleReject = async (payload: any) => {
    try {
      await apiRequest(SUPPLIER_LOAN_ENDPOINTS.SUPPLIER_LOANS.REJECT(selectedLoan.id), "POST", token, payload);
      toast.success("Supplier loan has been rejected")
      refresh();
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.message || "An error occurred while rejecting the loan.");
      return;
    } finally {
      setShowLoanModal(false);
    }
  };

  const [dialogState, setDialogState] = useState<{
    selectedSupplier: SupplierLoanRequest | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedSupplier: undefined, currentAction: "" });

  const columnDefinitions: ColDef<SupplierLoanRequest>[] = [
    {
      headerName: "Ref No.",
      field: "loan_reference",
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => (
        <Link
          to={`/loans/${params.data.id}/payments`}
          className="cursor-pointer hover:text-teal-500 hover:underline"
        >
          {params.value}
        </Link>
      ),
    },
    {
      headerName: "Supplier Name",
      field: "supplier.name",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Requested Amount",
      field: "requested_amount",
      sortable: true,
      filter: true,
      valueFormatter: (params) => `${params.value.toLocaleString()}`,
    },
    {
      headerName: "Approved Amount",
      field: "approved_amount",
      sortable: true,
      filter: true,
      valueFormatter: (params) => `${params?.value?.toLocaleString() || '-'}`,
    },
    {
      headerName: "Balance",
      field: "balance",
      sortable: true,
      filter: true,
      valueFormatter: (params) => `${params?.value?.toLocaleString() || '-'}`,
    },
    {
      headerName: "Interest Rate",
      field: "interest_rate",
      sortable: true,
      filter: true,
      valueFormatter: (params) => `${params.value}%`,
    },
    {
      headerName: "Installments",
      field: "installments",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Purpose",
      field: "purpose",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        const value = params.value?.trim().toLowerCase();
        const statusClasses = {
          rejected: 'bg-red-600',
          approved: 'bg-green-600',
          pending: 'bg-yellow-500',
          reviewed: 'bg-indigo-500',
          disbursed: 'bg-green-700',
          partially_paid: 'bg-blue-500',
          cleared: 'bg-green-500',
          defaulted: 'bg-red-800'
        };
        
        const bgColor = statusClasses[value] || 'bg-gray-500';
        return (
          <span className={`px-2 py-1 text-white rounded-2xl text-xsm capitalize ${bgColor}`}>
            {params.value?.replace('_', ' ')}
          </span>
        );
      }
    },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<SupplierLoanRequest>) => (
        <div className="flex items-center gap-1 p-2">
          <Tooltip target=".btn-view" content="View" position="top" />
          <Tooltip target=".btn-disburse" content="Disburse" position="top" />
          <Tooltip target=".btn-pay" content="Pay" position="top" />

          <button
            className="btn-view bg-teal-500 p-1 rounded text-white mx-1"
            onClick={() => {
              setSelectedLoan(params.data);
              setShowLoanModal(true);
            }}
          >
            <Icon icon="mdi:eye-outline" fontSize={18} />
          </button>
          {params?.data?.status === "approved" && (
            <button
            className="btn-disburse bg-green-500 p-1 rounded text-white mx-1"
            onClick={() => {
              setSelectedLoan(params.data);
              setIsDisburseOpen(true)
            }}
          >
            <Icon icon="mdi:cash-multiple" fontSize={18} />
          </button>
          )}
           {(params?.data?.status === "disbursed" || params?.data?.status === "partially_paid") && (
           <button
           className="btn-pay bg-green-500 p-1 rounded text-white mx-1"
           onClick={() => {
             setSelectedLoan(params.data);
             setIsPaymentOpen(true);
           }}
         >
           <Icon icon="mdi:cash-check" fontSize={18} />
         </button>         

          )}
          {params?.data?.status === "pending" && (
            <>
            <Tooltip target=".btn-reject" content="Reject" position="top" />
            <Tooltip target=".btn-approve" content="Approve" position="top" />
            <Tooltip target=".btn-edit" content="Edit" position="top" />
          
            <button
              className="btn-reject bg-red-500 p-1 rounded text-white mx-1"
                onClick={() => {
                setSelectedLoan(params.data);
                setModalAction("reject");
                setModalVisible(true);
              }}
            >
              <Icon icon="mdi:close-circle-outline" fontSize={18} />
            </button>
          
            <button
              className="btn-approve bg-green-500 p-1 rounded text-white mx-1"
                onClick={() => {
                setSelectedLoan(params.data);
                setModalAction("approve");
                setModalVisible(true);
              }}
            >
              <Icon icon="mdi:check-circle-outline" fontSize={18} />
            </button>
          
            <button
              className="btn-edit bg-blue-500 p-1 rounded text-white mx-1"
              onClick={() =>
                setDialogState({
                  ...dialogState,
                  currentAction: "edit",
                  selectedSupplier: params.data,
                })
              }
            >
              <Icon icon="mdi:pencil-outline" fontSize={18} />
            </button>
          </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <ToastContainer />
      <AddOrModifySupplierLoanRequest
        onSave={refresh}
        item={dialogState.selectedSupplier}
        visible={
          dialogState.currentAction === "add" ||
          (dialogState.currentAction === "edit" &&
            !!dialogState.selectedSupplier?.id)
        }
        onClose={() =>
          setDialogState({ currentAction: "", selectedSupplier: undefined })
        }
      />
      <ConfirmDeleteDialog
        apiPath={`/people/suppliers/${dialogState.selectedSupplier?.id}/delete`}
        onClose={() =>
          setDialogState({ selectedSupplier: undefined, currentAction: "" })
        }
        visible={
          !!dialogState.selectedSupplier?.id &&
          dialogState.currentAction === "delete"
        }
        onConfirm={refresh}
      />
      
      <BreadCrump name="Supplier Loans" pageName="Loans Management" />
      
      <div className="bg-white rounded-lg shadow p-6 mt-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Supplier Loan Requests</h1>
            <p className="text-gray-600">Manage all supplier loan applications</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setDialogState({
                  selectedSupplier: undefined,
                  currentAction: "add",
                })
              }
              className="bg-teal-500 hover:bg-teal-700 px-4 py-2 rounded text-white flex gap-2 items-center transition-colors"
            >
              <Icon icon="solar:add-circle-bold" fontSize={20} />
              Add New Loan
            </button>
          </div>
        </div>
        
        {/* Status Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200 mb-6 scrollbar-hide">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600 font-semibold'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Loading and Error States */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
             <PropagateLoader color="#007f80"/>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <Icon icon="heroicons-outline:exclamation" className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {filteredLoans.length} loans
              </p>
            </div>
            <Table 
              columnDefs={columnDefinitions} 
              data={filteredLoans} 
              ref={tableRef} 
              className="ag-theme-alpine"
            />
          </>
        )}
      </div>
      
      {selectedLoan && (
        <LoanViewModal
          visible={showLoanModal}
          onHide={() => setShowLoanModal(false)}
          loan={selectedLoan}
        />
      )}
      {selectedLoan && (
         <ApprovalOrRejectionModal
          visible={modalVisible}
          actionType={modalAction}
          onHide={() => setModalVisible(false)}
          onConfirm={modalAction === "approve" ? handleApprove : handleReject}
          loan={selectedLoan}
           />
      )}
        <DisburseLoanModal
            loanId={selectedLoan?.id}
            isVisible={isDisburseOpen}
            onClose={() => setIsDisburseOpen(false)}
            onSuccess={()=> setIsDisburseOpen(false)}
          />
          <LoanPaymentModal loanId={selectedLoan?.id} isVisible={isPaymentOpen}
            onClose={() => setIsPaymentOpen(false)}  onSuccess={() => setIsDisburseOpen(false)}/>
    </div>
  );
};

export default SupplierLoans;