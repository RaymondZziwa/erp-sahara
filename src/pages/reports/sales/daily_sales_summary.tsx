import React, { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useReactToPrint } from "react-to-print";

import useAuth from "../../../hooks/useAuth";
import { apiRequest } from "../../../utils/api";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import { formatCurrency } from "../../../utils/formatCurrency";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import Header from "../../../components/custom/print_header";
import CustomReportHeader from "../../../components/custom/customReportHeader";

interface DailySalesSummary {
  report_date: string;
  total_sales: number;
  gross_amount: string;
  total_discounts: string;
  net_amount: string;
}

const DailySalesSummaryReport: React.FC = () => {
  const [reportData, setReportData] = useState<DailySalesSummary[]>([]);
  const [globalFilter, setGlobalFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const printDivRef = useRef<HTMLDivElement>(null);
  const { token, isFetchingLocalToken } = useAuth();

  const reactToPrintFn = useReactToPrint({
    contentRef: printDivRef,
  });

  const fetchReport = async () => {
    if (isFetchingLocalToken || !token.access_token) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) {
        params.append('start_date', startDate.toISOString().split('T')[0]);
      }
      if (endDate) {
        params.append('end_date', endDate.toISOString().split('T')[0]);
      }

      const response = await apiRequest<ServerResponse<DailySalesSummary[]>>(
        `${REPORTS_ENDPOINTS.POS_SALES.DAILY_SALES}?start_date=2024-08-01&end_date=2029-08-24`,
        "GET",
        token.access_token
      );

      if (response.success) setReportData(response.data);
    } catch (error) {
      console.error("Error fetching daily sales summary report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [isFetchingLocalToken, token.access_token]);

  const handleDateFilter = () => {
    fetchReport();
  };

  const clearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
    fetchReport();
  };

  const dateTemplate = (rowData: DailySalesSummary) => {
    return new Date(rowData.report_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const discountPercentageTemplate = (rowData: DailySalesSummary) => {
    const gross = parseFloat(rowData.gross_amount);
    const discounts = parseFloat(rowData.total_discounts);
    const percentage = gross > 0 ? (discounts / gross) * 100 : 0;
    return `${percentage.toFixed(1)}%`;
  };

  const header = (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <CustomReportHeader printfn={() => reactToPrintFn()} />
      <div className="flex flex-row justify-center items-center mt-12">
        <Header title="Daily Sales Summary Report" />
      </div>
    </div>
  );

  // Calculate totals for footer
  const totals = reportData.reduce(
    (acc, day) => ({
      totalSales: acc.totalSales + day.total_sales,
      grossAmount: acc.grossAmount + parseFloat(day.gross_amount),
      totalDiscounts: acc.totalDiscounts + parseFloat(day.total_discounts),
      netAmount: acc.netAmount + parseFloat(day.net_amount),
    }),
    { totalSales: 0, grossAmount: 0, totalDiscounts: 0, netAmount: 0 }
  );

  const footer = (
    <div className="bg-teal-100 p-4 font-semibold">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-sm text-gray-600">Total Days</div>
          <div className="text-lg font-bold">{reportData.length}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Total Sales</div>
          <div className="text-lg font-bold">{totals.totalSales.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Gross Amount</div>
          <div className="text-lg font-bold">{formatCurrency(totals.grossAmount)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Net Amount</div>
          <div className="text-lg font-bold">{formatCurrency(totals.netAmount)}</div>
        </div>
      </div>
      {totals.totalDiscounts > 0 && (
        <div className="mt-2 text-center text-orange-600 text-sm">
          Total Discounts: {formatCurrency(totals.totalDiscounts)} 
          ({((totals.totalDiscounts / totals.grossAmount) * 100).toFixed(1)}% of gross)
        </div>
      )}
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
          emptyMessage="No daily sales data found"
          className="p-datatable-sm"
        >
          <Column
            field="report_date"
            header="Date"
            sortable
            body={dateTemplate}
            className="w-1/4"
          />
          <Column
            field="total_sales"
            header="Sales Count"
            sortable
            body={(row) => row.total_sales.toLocaleString()}

          />
          <Column
            field="gross_amount"
            header="Gross Amount"
            sortable
            body={(row) => formatCurrency(parseFloat(row.gross_amount))}

          />
          <Column
            field="total_discounts"
            header="Discounts"
            sortable
            body={(row) => formatCurrency(parseFloat(row.total_discounts))}

          />
          <Column
            header="Discount %"
            body={discountPercentageTemplate}

          />
          <Column
            field="net_amount"
            header="Net Amount"
            sortable
            body={(row) => formatCurrency(parseFloat(row.net_amount))}
            className=" font-semibold"
          />
        </DataTable>
      </div>
    </div>
  );
};

export default DailySalesSummaryReport;