import React, { useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import Table from "../../../components/table"; 
import { PayrollRun } from "../../../redux/slices/types/hr/salary/payrollRun";
import GrossesModal from "./grossModal";
import { useParams } from "react-router-dom";
import usePayrollPeriods from "../../../hooks/hr/usePayRollPeriods";
import { toast, ToastContainer } from "react-toastify";
import { apiRequest } from "../../../utils/api";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { HUMAN_RESOURCE_ENDPOINTS } from "../../../api/hrEndpoints";
import ViewCalculatedNet from "./viewCalculatedNet";
import ViewCalculatedNetModal from "./viewCalculatedNet";
import PayrollPayModal from "./payrollPayModal";
import RunDetailsModal from "./runDetailsModal";
import { Button } from "primereact/button";

const PayrollRuns: React.FC = () => {
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
      const [showDetails, setShowDetails] = useState(false);
    const [viewNetRunId, setViewNetRunId] = useState<string | null>(null);
  const [payRun, setPayRun] = useState<PayrollRun | null>(null);
  const { refresh } = usePayrollPeriods()
  const [isLoading, setIsLoading] = useState(false)

    const { id } = useParams<{ id: string }>();
    const [run, setRun] = useState()
  const { data } = usePayrollPeriods();
  const token = useSelector((state: RootState) => state.userAuth.token)
    
  const calculateNetPay = async (runId: string) => {
    try {
      setIsLoading(true)
      await apiRequest(
        HUMAN_RESOURCE_ENDPOINTS.PAYROLL_PERIODS.GENERATE_NET_PAYROLL(runId),
        "POST",
        token.access_token
      );
      toast.success("Net pay has been calculated");
      refresh()
      setIsLoading(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.message);
    }
  };

  const schedule = data.find((dt) => dt.id === id);
  const runs: PayrollRun[] = schedule?.payroll_run ?? [];

    const columns: ColDef<PayrollRun>[] = [
    { headerName: "Name", field: "name", sortable: true, filter: true },
    { headerName: "Run Date", field: "run_date", sortable: true, filter: true },
    { headerName: "Remarks", field: "remarks", sortable: true, filter: true },
    { headerName: "Status", field: "status", sortable: true, filter: true },
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      filter: false,
      width: 380,
      cellRenderer: (params: ICellRendererParams<PayrollRun>) => (
        <div className="flex items-center justify-center gap-2 mt-2">
          {params.data.status === "paid" ? (
        <>
          <button
            type="button"
            className="bg-teal-600 text-white text-sm px-3 py-1 rounded hover:bg-teal-700"
            onClick={(e) => {
              e.stopPropagation();
              setRun(params.data)
              setShowDetails(true);
            }}
          >
            View Details
          </button>
        </>
      ) : params.data.status === "net_calculated" ? (
        <>
          <button
            type="button"
            className="bg-teal-500 text-white text-sm px-3 py-1 rounded hover:bg-teal-600"
            onClick={(e) => {
              e.stopPropagation();
              setViewNetRunId(params.data.id);
            }}
          >
            View Net Calculation
          </button>

          <button
            type="button"
            className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700"
            onClick={(e) => {
              e.stopPropagation();
              setPayRun(params.data);
            }}
          >
            Pay
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            className="bg-teal-500 text-white text-sm px-3 py-1 rounded hover:bg-teal-600"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedRun(params.data);
            }}
          >
            Add Deductions
          </button>

          <Button
            loading={isLoading}
            type="button"
            className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700"
            onClick={(e) => {
              e.stopPropagation();
              calculateNetPay(params.data.id);
            }}
          >
            Calculate Net Pay
          </Button>
        </>
      )}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg">
      <ToastContainer />
      <h1 className="text-xl font-bold mb-4">Payroll Runs</h1>

      <Table columnDefs={columns} data={runs} rowClass="cursor-pointer" />

      {/* existing GrossesModal for Add Deductions */}
      {selectedRun && (
        <GrossesModal run={selectedRun} onClose={() => setSelectedRun(null)} />
      )}

      {/* ✅ New modal for viewing calculated net */}
      {viewNetRunId && (
        <ViewCalculatedNetModal
            runId={viewNetRunId}
            onClose={() => setViewNetRunId(null)}
        />
          )}
          
          {payRun && (
            <PayrollPayModal
                run={payRun}
                onClose={() => setPayRun(null)}
            />
      )}
      
      {(showDetails && run) && (
            <RunDetailsModal
              run={run}         // 👉 pass the whole run object
              onClose={() => setShowDetails(false)}
            />
          )}

    </div>
  );
};

export default PayrollRuns;
