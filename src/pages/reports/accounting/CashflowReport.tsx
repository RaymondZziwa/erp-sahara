import { useEffect, useRef, useState } from "react";
import Table from "../BalanceSheetTable";
import { Icon } from "@iconify/react";
import { apiRequest } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import useAuth from "../../../hooks/useAuth";

interface cashFlowData {
  operating_activities: {
    Operating: cashFlowDetails[];
  };
  investing_activities: {
    Investing: cashFlowDetails[];
  };
  financing_activities: {
    Financing: cashFlowDetails[];
  };
}
interface cashFlowDetails {
  account_id: number;
  account_name: string;
  account_code: string;
  net_cash_flow: number;
}
function Cashflow() {
  const [cashFlow, setCashFlow] = useState<cashFlowData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token, isFetchingLocalToken } = useAuth();
  const tableRef = useRef<any>(null);

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;
    setIsLoading(true);
    try {
      const response = await apiRequest<ServerResponse<cashFlowData>>(
        REPORTS_ENDPOINTS.CASH_FLOW_STATEMENT.GET_ALL,
        "GET",
        token.access_token
      );
      setCashFlow(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  const columnDefs = [
    { headerName: "Account ID", field: "account_id" },
    { headerName: "Account Code", field: "account_code" },
    { headerName: "Account Name", field: "account_name" },
    { headerName: "Net Cash Flow", field: "net_cash_flow" },
  ];

  const transformedData = [
    { isGroup: true, subcategory_name: "Operating Activities" },
    ...(cashFlow?.operating_activities?.Operating || []),
    { isGroup: true, subcategory_name: "Investing Activities" },
    ...(cashFlow?.investing_activities?.Investing || []),
    { isGroup: true, subcategory_name: "Financial Activities" },
    ...(cashFlow?.financing_activities?.Financing || []),
  ];
  const handleExportPDF = () => {
    if (tableRef.current) {
      tableRef.current.exportPDF();
    }
  };

  return (
    <div className="bg-white p-3">
      <div className="flex justify-between items-center mb-4">
        <p className="font-bold text-xl">Cash Flow Report</p>
        <button
          className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
          onClick={handleExportPDF}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print
        </button>
      </div>
      {isLoading ? (
        "Loading..."
      ) : (
        <Table ref={tableRef} columnDefs={columnDefs} data={transformedData} />
      )}
    </div>
  );
}

export default Cashflow;
