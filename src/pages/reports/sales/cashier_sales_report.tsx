import React, { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { useReactToPrint } from "react-to-print";

import useAuth from "../../../hooks/useAuth";
import { apiRequest } from "../../../utils/api";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import { formatCurrency } from "../../../utils/formatCurrency";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import Header from "../../../components/custom/print_header";
import CustomReportHeader from "../../../components/custom/customReportHeader";

interface CashierSales {
  cashier_id: string;
  cashier_name: string;
  transactions: number;
  total_sales: string;
}

const CashierSalesReport: React.FC = () => {
  const [reportData, setReportData] = useState<CashierSales[]>([]);
  const [globalFilter, setGlobalFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const printDivRef = useRef<HTMLDivElement>(null);
  const { token, isFetchingLocalToken } = useAuth();

  const reactToPrintFn = useReactToPrint({
    contentRef: printDivRef,
  });

  const fetchReport = async () => {
    if (isFetchingLocalToken || !token.access_token) return;
    setIsLoading(true);
    try {
      const response = await apiRequest<ServerResponse<CashierSales[]>>(
        `${REPORTS_ENDPOINTS.POS_SALES.CASHIER_SALES}?start_date=2024-08-01&end_date=2029-08-24`,
        "GET",
        token.access_token
        );

      if (response.success) setReportData(response.data);
    } catch (error) {
      console.error("Error fetching cashier sales report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [isFetchingLocalToken, token.access_token]);

  const header = (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <CustomReportHeader printfn={()=> {}}/>
      <div className="flex flex-row justify-center items-center mt-20">
      <Header title="Cashier Sales Report" />
      </div>
      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText
          placeholder="Search cashier..."
          onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
            setGlobalFilter(e.target.value)
          }
        />
      </IconField>
    </div>
  );

  const footer = (
    <div className="flex bg-teal-100 p-3 font-semibold justify-between">
      <span>Total Cashiers: {reportData.length}</span>
      <span>
        Total Sales:{" "}
        {formatCurrency(
          reportData.reduce(
            (sum, c) => sum + parseFloat(c.total_sales || "0"),
            0
          )
        )}
      </span>
    </div>
  );

  return (
    <div className="p-4">
      <div ref={printDivRef}>
        <DataTable
          value={reportData}
          paginator
          rows={10}
          stripedRows
          globalFilter={globalFilter}
          header={header}
          footer={footer}
          scrollable
          emptyMessage="No sales data found"
        >
          <Column
            field="cashier_name"
            header="Cashier Name"
            sortable
            className="w-1/3"
          />
          <Column
            field="transactions"
            header="Transactions"
            sortable
            body={(row) => row.transactions.toLocaleString()}
          />
          <Column
            field="total_sales"
            header="Total Sales"
            sortable
            body={(row) => formatCurrency(parseFloat(row.total_sales))}
          />
        </DataTable>
      </div>
    </div>
  );
};

export default CashierSalesReport;
