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

interface DailyProductSales {
  item_id: string;
  total_quantity: string;
  total_sales: string;
  total_tax: string;
  total_discount: string;
  item: {
    id: string;
    name: string;
  };
}

const DailyProductSalesReport: React.FC = () => {
  const [reportData, setReportData] = useState<DailyProductSales[]>([]);
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

      const response = await apiRequest<ServerResponse<DailyProductSales[]>>(
        `${REPORTS_ENDPOINTS.POS_SALES.DAILY_PRODUCT_SUMMARY}?start_date=2024-08-01&end_date=2029-08-24`,
        "GET",
        token.access_token
      );

      if (response.success) setReportData(response.data);
    } catch (error) {
      console.error("Error fetching daily product sales report:", error);
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

  const productNameTemplate = (rowData: DailyProductSales) => {
    return rowData.item.name;
  };

  const averagePriceTemplate = (rowData: DailyProductSales) => {
    const totalSales = parseFloat(rowData.total_sales);
    const quantity = parseInt(rowData.total_quantity);
    const averagePrice = quantity > 0 ? totalSales / quantity : 0;
    return formatCurrency(averagePrice);
  };

  const discountPercentageTemplate = (rowData: DailyProductSales) => {
    const totalSales = parseFloat(rowData.total_sales);
    const discount = parseFloat(rowData.total_discount);
    const percentage = totalSales > 0 ? (discount / totalSales) * 100 : 0;
    return `${percentage.toFixed(1)}%`;
  };

  const taxPercentageTemplate = (rowData: DailyProductSales) => {
    const totalSales = parseFloat(rowData.total_sales);
    const tax = parseFloat(rowData.total_tax);
    const percentage = totalSales > 0 ? (tax / totalSales) * 100 : 0;
    return `${percentage.toFixed(1)}%`;
  };

  const netAmountTemplate = (rowData: DailyProductSales) => {
    const totalSales = parseFloat(rowData.total_sales);
    const discount = parseFloat(rowData.total_discount);
    const tax = parseFloat(rowData.total_tax);
    const netAmount = totalSales - discount + tax;
    return formatCurrency(netAmount);
  };

  const header = (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <CustomReportHeader printfn={() => reactToPrintFn()} />
      <div className="flex flex-row justify-center items-center mt-12">
        <Header title="Daily Product Sales Report" />
      </div>
    </div>
  );

  // Calculate totals for footer
  const totals = reportData.reduce(
    (acc, product) => ({
      totalQuantity: acc.totalQuantity + parseInt(product.total_quantity),
      totalSales: acc.totalSales + parseFloat(product.total_sales),
      totalTax: acc.totalTax + parseFloat(product.total_tax),
      totalDiscount: acc.totalDiscount + parseFloat(product.total_discount),
      totalProducts: acc.totalProducts + 1,
    }),
    { totalQuantity: 0, totalSales: 0, totalTax: 0, totalDiscount: 0, totalProducts: 0 }
  );

  const totalNetAmount = totals.totalSales - totals.totalDiscount + totals.totalTax;

  const footer = (
    <div className="bg-teal-100 p-4 font-semibold">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
        <div>
          <div className="text-sm text-gray-600">Total Products</div>
          <div className="text-lg font-bold">{totals.totalProducts.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Total Quantity</div>
          <div className="text-lg font-bold">{totals.totalQuantity.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Gross Sales</div>
          <div className="text-lg font-bold">{formatCurrency(totals.totalSales)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Net Amount</div>
          <div className="text-lg font-bold">{formatCurrency(totalNetAmount)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Total Products</div>
          <div className="text-lg font-bold">{totals.totalProducts.toLocaleString()}</div>
        </div>
      </div>
      {(totals.totalDiscount > 0 || totals.totalTax > 0) && (
        <div className="mt-2 text-center text-sm">
          {totals.totalDiscount > 0 && (
            <span className="text-orange-600 mr-4">
              Total Discount: {formatCurrency(totals.totalDiscount)} 
              ({(totals.totalDiscount > 0 ? (totals.totalDiscount / totals.totalSales) * 100 : 0).toFixed(1)}%)
            </span>
          )}
          {totals.totalTax > 0 && (
            <span className="text-blue-600">
              Total Tax: {formatCurrency(totals.totalTax)} 
              ({(totals.totalTax > 0 ? (totals.totalTax / totals.totalSales) * 100 : 0).toFixed(1)}%)
            </span>
          )}
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
          emptyMessage="No daily product sales data found"
          className="p-datatable-sm"
        >
          <Column
            field="item.name"
            header="Product Name"
            sortable
            body={productNameTemplate}
            className="w-1/5"
          />
          <Column
            field="total_quantity"
            header="Quantity Sold"
            sortable
            body={(row) => parseInt(row.total_quantity).toLocaleString()}
          />
          <Column
            header="Average Price"
            body={averagePriceTemplate}
          />
          <Column
            field="total_sales"
            header="Gross Sales"
            sortable
            body={(row) => formatCurrency(parseFloat(row.total_sales))}
          />
          <Column
            field="total_discount"
            header="Discount"
            sortable
            body={(row) => formatCurrency(parseFloat(row.total_discount))}
          />
          <Column
            header="Discount %"
            body={discountPercentageTemplate}
          />
          <Column
            field="total_tax"
            header="Tax"
            sortable
            body={(row) => formatCurrency(parseFloat(row.total_tax))}
          />
          <Column
            header="Tax %"
            body={taxPercentageTemplate}
          />
          <Column
            header="Net Amount"
            body={netAmountTemplate}
            className="font-semibold"
          />
        </DataTable>
      </div>
    </div>
  );
};

export default DailyProductSalesReport;