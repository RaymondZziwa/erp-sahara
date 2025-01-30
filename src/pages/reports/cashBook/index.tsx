import React, { useState, useRef, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { formatCurrency } from "../../../utils/formatCurrency";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { useReactToPrint } from "react-to-print";

import useAuth from "../../../hooks/useAuth";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import { apiRequest } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";

interface CashBookEntry {
  date: string;
  description: string;
  ref: string;
  cash_in: string;
  cash_out: string;
  balance: string;
}

const CashBook: React.FC = () => {
  const [globalFilter, setGlobalFilter] = useState<string | null>(null);
  const [cashBook, setCashBook] = useState<CashBookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const printDivRef = useRef<HTMLDivElement>(null);
  const { token, isFetchingLocalToken } = useAuth();
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Default to 30 days ago
    return date;
  });
  const [endDate, setEndDate] = useState<Date | undefined>(new Date()); // Default end date to today

  const reactToPrintFn = useReactToPrint({
    contentRef: printDivRef,
  });

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<ServerResponse<CashBookEntry[]>>(
        REPORTS_ENDPOINTS.DASHBOARD.CASH_BOOK({
          start_date: startDate?.toISOString().slice(0, 10) || "",
          end_date: endDate?.toISOString().slice(0, 10) || "",
        }),
        "GET",
        token.access_token
      );
      setCashBook(response.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token, startDate, endDate]);

  const header = (
    <div className="table-header print:hidden flex justify-between items-center">
      <h1 className="text-xl font-semibold">Cash Book</h1>
      <div className="flex items-center space-x-2">
        {/* Start Date Calendar */}
        <Calendar
          value={startDate}
          onChange={(e) => setStartDate(e.value as Date)}
          showIcon
          placeholder="Start Date"
          className="mr-2 h-10 w-40"
          dateFormat="yy-mm-dd"
        />
        {/* End Date Calendar */}
        <Calendar
          value={endDate}
          onChange={(e) => setEndDate(e.value as Date)}
          showIcon
          maxDate={new Date()}
          placeholder="End Date"
          className="mr-2 h-10 w-40"
          dateFormat="yy-mm-dd"
        />
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            placeholder="Search"
            onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
              setGlobalFilter(e.target.value)
            }
          />
        </IconField>
      </div>
      <Button
        label="Print"
        icon="pi pi-print"
        className="p-button-primary"
        onClick={() => reactToPrintFn()}
      />
    </div>
  );

  const totalCashIn = cashBook.reduce(
    (sum, entry) => sum + (parseFloat(entry.cash_in.replace(/,/g, "")) || 0),
    0
  );
  const totalCashOut = cashBook.reduce(
    (sum, entry) => sum + (parseFloat(entry.cash_out.replace(/,/g, "")) || 0),
    0
  );
  const totalBalance = totalCashIn - totalCashOut;

  return (
    <div>
      <div className="print:p-2" ref={printDivRef}>
        {error && <p className="text-red-500">{error}</p>}
        <DataTable
          loading={isLoading}
          value={cashBook}
          globalFilter={globalFilter}
          scrollable
          header={header}
        >
          <Column field="date" header="Date" />
          <Column field="description" header="Description" />
          <Column field="ref" header="Reference" />
          <Column
            field="cash_in"
            header="Cash In"
            body={(rowData) => parseFloat(rowData.cash_in.replace(/,/g, ""))}
          />
          <Column
            field="cash_out"
            header="Cash Out"
            body={(rowData) => parseFloat(rowData.cash_out.replace(/,/g, ""))}
          />
          <Column
            field="balance"
            header="Balance"
            body={(rowData) => parseFloat(rowData.balance.replace(/,/g, ""))}
          />
        </DataTable>
        <div className="flex flex-col items-end mt-6 p-4 bg-white rounded-lg shadow-md border border-gray-200 space-y-3">
          <div className="flex justify-between w-full">
            <span className="text-sm font-medium text-gray-500">
              Total Cash In:
            </span>
            <strong className="text-lg text-green-600">
              {formatCurrency(totalCashIn)}
            </strong>
          </div>
          <div className="flex justify-between w-full">
            <span className="text-sm font-medium text-gray-500">
              Total Cash Out:
            </span>
            <strong className="text-lg text-red-600">
              {formatCurrency(totalCashOut)}
            </strong>
          </div>
          <div className="flex justify-between w-full">
            <span className="text-sm font-medium text-gray-500">
              Total Balance:
            </span>
            <strong
              className={`text-lg ${
                totalBalance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(totalBalance)}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashBook;
