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

interface TopProductSales {
  item_id: string;
  qty_sold: string;
  total_sales: string;
  item: {
    id: string;
    name: string;
  };
}

const TopProductSalesReport: React.FC = () => {
  const [reportData, setReportData] = useState<TopProductSales[]>([]);
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

      const response = await apiRequest<ServerResponse<TopProductSales[]>>(
        `${REPORTS_ENDPOINTS.POS_SALES.TOP_PRODUCT_SALES}?start_date=2024-08-01&end_date=2029-08-24`,
        "GET",
        token.access_token
      );

      if (response.success) setReportData(response.data);
    } catch (error) {
      console.error("Error fetching top product sales report:", error);
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

  const productNameTemplate = (rowData: TopProductSales) => {
    return rowData.item.name;
  };

  const averagePriceTemplate = (rowData: TopProductSales) => {
    const totalSales = parseFloat(rowData.total_sales);
    const quantitySold = parseInt(rowData.qty_sold);
    const averagePrice = quantitySold > 0 ? totalSales / quantitySold : 0;
    return formatCurrency(averagePrice);
  };

  const percentageOfTotalTemplate = (rowData: TopProductSales) => {
    const totalSales = reportData.reduce((sum, item) => sum + parseFloat(item.total_sales), 0);
    const itemSales = parseFloat(rowData.total_sales);
    const percentage = totalSales > 0 ? (itemSales / totalSales) * 100 : 0;
    return `${percentage.toFixed(1)}%`;
  };

  const header = (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <CustomReportHeader printfn={() => reactToPrintFn()} />
      <div className="flex flex-row justify-center items-center mt-12">
        <Header title="Top Product Sales Report" />
      </div>
    </div>
  );

  // Calculate totals for footer
  const totals = reportData.reduce(
    (acc, product) => ({
      totalQuantity: acc.totalQuantity + parseInt(product.qty_sold),
      totalSales: acc.totalSales + parseFloat(product.total_sales),
      totalProducts: acc.totalProducts + 1,
    }),
    { totalQuantity: 0, totalSales: 0, totalProducts: 0 }
  );

  const footer = (
    <div className="bg-teal-100 p-4 font-semibold">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-sm text-gray-600">Total Products</div>
          <div className="text-lg font-bold">{totals.totalProducts.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Total Quantity Sold</div>
          <div className="text-lg font-bold">{totals.totalQuantity.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Total Sales Amount</div>
          <div className="text-lg font-bold">{formatCurrency(totals.totalSales)}</div>
        </div>
      </div>
      <div className="mt-2 text-center text-gray-600 text-sm">
        Average per Product: {formatCurrency(totals.totalSales / totals.totalProducts)} | 
        Average Quantity: {(totals.totalQuantity / totals.totalProducts).toFixed(1)}
      </div>
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
          emptyMessage="No top product sales data found"
          className="p-datatable-sm"
        >
          <Column
            field="item.name"
            header="Product Name"
            sortable
            body={productNameTemplate}
            className="w-1/4"
          />
          <Column
            field="qty_sold"
            header="Quantity Sold"
            sortable
            body={(row) => parseInt(row.qty_sold).toLocaleString()}
          />
          <Column
            header="Average Price"
            body={averagePriceTemplate}
          />
          <Column
            field="total_sales"
            header="Total Sales"
            sortable
            body={(row) => formatCurrency(parseFloat(row.total_sales))}
          />
          <Column
            header="% of Total Sales"
            body={percentageOfTotalTemplate}
          />
        </DataTable>
      </div>
    </div>
  );
};

export default TopProductSalesReport;