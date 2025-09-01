import React, { useRef, useState, useMemo } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Icon } from "@iconify/react";
import { toast, ToastContainer } from "react-toastify";
import { InputText } from "primereact/inputtext";
import { TabView, TabPanel } from "primereact/tabview";

import BreadCrump from "../../../components/layout/bread_crump";
import useSettlements from "../../../hooks/procurement/itemPurchases/useSettlements";
import { Settlement } from "../../../redux/slices/types/itemPurchases/purchase";
import PaySettlementModal from "./settlement";
import Table from "../../../components/table";
import SettlementDetailsModal from "./assess";
import { apiRequest } from "../../../utils/api";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

const statusTabs = [
  { id: 'all', label: 'All Settlements' },
  { id: 'pending', label: 'Pending' },
  { id: 'partially_settled', label: 'Partially Settled' },
  { id: 'settled', label: 'Settled' }
];

const SettlementTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { data: settlements, loading, refresh } = useSettlements(activeTab === 'all' ? undefined : activeTab);
  const tableRef = useRef<any>(null);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const token = useSelector((state: RootState) => state.userAuth.token.access_token)
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  // Filter settlements by search term (client-side)
  const filteredSettlements = useMemo(() => {
    if (!settlements) return [];
    
    if (!searchTerm) return settlements;
    
    return settlements.filter(settlement => 
      settlement.delivery?.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [settlements, searchTerm]);

  const reject = async (id: string, remarks: string) => {
    try {
      await apiRequest(`/purchases/settlements/${id}/reject`, 'POST', token, remarks);
      toast.success('Settlement has been rejected.');
      refresh()
      setIsAssessmentModalOpen(false)
    } catch (error) {
      toast.error(error?.response?.data?.message)
    }
  }
  
  const approve = async (id: string, remarks: string) => {
    try {
      await apiRequest(`/purchases/settlements/${id}/approve`, 'POST', token, remarks);
      toast.success('Settlement approved successfully')
      refresh()
      setIsAssessmentModalOpen(false)
    } catch (error) {
      toast.error(error?.response?.data?.message)
    }
  }

  // Columns for settlements table
  const columnDefinitions: ColDef<Settlement>[] = [
    {
      headerName: "Supplier",
      valueGetter: (params) => params.data.delivery?.supplier?.name || '',
      sortable: true,
      filter: true,
    },
    {
      headerName: "Item",
      valueGetter: (params) => params.data.delivery?.item?.name || '',
      sortable: true,
      filter: true,
    },      
    {
      headerName: "Delivery Date",
      field: "delivery.delivery_date",
      sortable: true,
      filter: "agDateColumnFilter",
      valueFormatter: (params) =>
        new Date(params.value).toLocaleDateString() || "N/A",
    },
    {
      headerName: "Total Payable",
      field: "total_payable",
      sortable: true,
      filter: true,
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      filter: true,
      cellRenderer: (params) => {
        const status = params.value;
        let bgColor = '';
        switch(status) {
          case 'pending': bgColor = 'bg-yellow-500'; break;
          case 'partially_settled': bgColor = 'bg-blue-500'; break;
          case 'settled': bgColor = 'bg-green-500'; break;
          default: bgColor = 'bg-gray-500';
        }
        return (
          <span className={`px-2 py-1 rounded text-white text-xs capitalize ${bgColor}`}>
            {status.replace('_', ' ')}
          </span>
        );
      }
    },
    {
      headerName: "Actions",
      field: "id",
      cellRenderer: (params: ICellRendererParams<Settlement>) => {
        const settlement = params.data;
        if (!settlement) return null;

        return (
          <div className="flex items-center gap-2 mt-2">
          <button
            className={`p-1 rounded text-white text-xs ${
              settlement.status === 'settled'
                ? 'bg-gray-400 cursor-not-allowed'
                : settlement.status === 'approved'
                ? 'bg-green-600 hover:bg-green-700'
                : 'hidden'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (settlement.status === 'approved') {
                setSelectedSettlement(settlement);
                setIsPayModalOpen(true);
              }
            }}
            title={
              settlement.status === 'settled'
                ? 'Already settled'
                : settlement.status === 'approved'
                ? 'Pay Settlement'
                : ''
            }
            aria-label="Pay Settlement"
            disabled={settlement.status === 'settled'}
          >
            <Icon icon="mdi:cash-multiple" fontSize={16} />
            </button>
            {settlement.status === 'pending' && (
    <button
      className="p-1 rounded text-white text-xs bg-blue-600 hover:bg-blue-700"
      onClick={(e) => {
        e.stopPropagation();
        setSelectedSettlement(settlement);
        setIsAssessmentModalOpen(true);
      }}
      title="Assess Settlement"
      aria-label="Assess Settlement"
    >
      <Icon icon="mdi:clipboard-text-search-outline" fontSize={16} />
    </button>
  )}
        </div>
        
        );
      },
      minWidth: 120,
    },
  ];

  return (
    <div>
      <ToastContainer />
      <BreadCrump name="Settlements" pageName="Settlement Payments" />

      <div className="bg-white px-8 py-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Supplier Payments</h1>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Icon icon="mdi:magnify" className="text-gray-400" />
            </span>
            <InputText
              placeholder="Search by supplier..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <TabView
          activeIndex={statusTabs.findIndex(tab => tab.id === activeTab)}
          onTabChange={(e) => {
            setActiveTab(statusTabs[e.index].id);
            setSearchTerm('');
          }}
          className="mb-4"
        >
          {statusTabs.map((tab) => (
            <TabPanel key={tab.id} header={tab.label}>
              <Table
                ref={tableRef}
                columnDefs={columnDefinitions}
                data={filteredSettlements}
                pagination
                paginationPageSize={10}
                suppressCellFocus
                domLayout="autoHeight"
                loading={loading}
              />
            </TabPanel>
          ))}
        </TabView>
      </div>

      {isPayModalOpen && selectedSettlement && (
        <PaySettlementModal
          settlement={selectedSettlement}
          onClose={() => setIsPayModalOpen(false)}
          onSave={() => {
            refresh();
            setIsPayModalOpen(false);
          }}
        />
      )}

      <SettlementDetailsModal
        settlement={selectedSettlement}
        visible={isAssessmentModalOpen}
        onHide={() => setIsAssessmentModalOpen(false)}
        onApprove={approve}
        onReject={reject}
      />
    </div>
  );
};

export default SettlementTable;