import React, { useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { SplitButton } from "primereact/splitbutton";

interface CustomReportHeaderProps {
  printfn?: () => void;
  searchfn?: (startDate: string, endDate: string) => void;
  exportPdf?: (startDate: string, endDate: string) => void;
  exportExcel?: (startDate: string, endDate: string) => void;
  loading?: boolean
}

const CustomReportHeader: React.FC<CustomReportHeaderProps> = ({
  printfn,
  searchfn,
  exportExcel,
  exportPdf,
  loading
}) => {
  const [filterType, setFilterType] = useState("asOfDate");
  const [asOfDate, setAsOfDate] = useState<Date | null>(new Date());
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [financialYear, setFinancialYear] = useState<string | null>(null);
  
  const filter = async () => {
    if (!searchfn) return;

    let startDate: string, endDate: string;

    if (filterType === "asOfDate" && asOfDate) {
      // For "As of Date", show data from beginning of time to the selected date
      startDate = new Date(2000, 0, 1).toISOString().split("T")[0]; // Very early date
      endDate = asOfDate.toISOString().split("T")[0];
    } else if (filterType === "dateRange" && dateRange && dateRange[0] && dateRange[1]) {
      // For date range
      startDate = dateRange[0].toISOString().split("T")[0];
      endDate = dateRange[1].toISOString().split("T")[0];
    } else if (filterType === "financialYear" && financialYear) {
      // For financial year (example implementation)
      const year = parseInt(financialYear.split("-")[0]);
      startDate = new Date(year, 6, 1).toISOString().split("T")[0]; // July 1st
      endDate = new Date(year + 1, 5, 30).toISOString().split("T")[0]; // June 30th next year
    } else {
      // Default to current month if no valid selection
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      startDate = startOfMonth.toISOString().split("T")[0];
      endDate = endOfMonth.toISOString().split("T")[0];
    }

    console.log('tr', startDate, endDate)
    searchfn(startDate, endDate);
  };

  const handleExportPdf = () => {
    if (!exportPdf) return;
    
    // Get dates based on current filter selection
    let startDate: string, endDate: string;

    if (filterType === "asOfDate" && asOfDate) {
      startDate = new Date(2000, 0, 1).toISOString().split("T")[0];
      endDate = asOfDate.toISOString().split("T")[0];
    } else if (filterType === "dateRange" && dateRange && dateRange[0] && dateRange[1]) {
      startDate = dateRange[0].toISOString().split("T")[0];
      endDate = dateRange[1].toISOString().split("T")[0];
    } else {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      startDate = startOfMonth.toISOString().split("T")[0];
      endDate = endOfMonth.toISOString().split("T")[0];
    }
    
    exportPdf(startDate, endDate);
  };

  const handleExportExcel = () => {
    if (!exportExcel) return;
    
    // Get dates based on current filter selection
    let startDate: string, endDate: string;
    
    if (filterType === "asOfDate" && asOfDate) {
      startDate = new Date(2000, 0, 1).toISOString().split("T")[0];
      endDate = asOfDate.toISOString().split("T")[0];
    } else if (filterType === "dateRange" && dateRange && dateRange[0] && dateRange[1]) {
      startDate = dateRange[0].toISOString().split("T")[0];
      endDate = dateRange[1].toISOString().split("T")[0];
    } else {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      startDate = startOfMonth.toISOString().split("T")[0];
      endDate = endOfMonth.toISOString().split("T")[0];
    }
    
    exportExcel(startDate, endDate);
  };

  const filterTypeOptions = [
    { label: "As of Date", value: "asOfDate" },
    { label: "Date Range", value: "dateRange" },
    { label: "Financial Year", value: "financialYear" },
  ];

  const financialYears = [
    { label: "2022/2023", value: "2022-2023" },
    { label: "2023/2024", value: "2023-2024" },
    { label: "2024/2025", value: "2024-2025" },
  ];

  const exportItems = [
    {
      label: "Export as PDF",
      icon: "pi pi-file-pdf",
      command: handleExportPdf,
    },
    {
      label: "Export as Excel",
      icon: "pi pi-file-excel",
      command: handleExportExcel,
    },
  ];

  return (
    <div className="flex justify-between items-end bg-white p-1 shadow rounded-md">
      {/* Left Section: Filters */}
      <div className="flex items-end gap-4">
        <div className="flex flex-col text-sm">
          <label className="mb-1 font-medium">Filter Type</label>
          <Dropdown
            value={filterType}
            options={filterTypeOptions}
            onChange={(e) => setFilterType(e.value)}
            placeholder="Select"
            className="w-40 text-sm h-10"
            panelClassName="text-sm"
          />
        </div>

        {filterType === "asOfDate" && (
          <div className="flex flex-col text-sm">
            <label className="mb-1 font-medium">As of Date</label>
            <Calendar
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.value as Date)}
              readOnlyInput
              showIcon
              className="w-40 text-sm h-10"
            />
          </div>
        )}

        {filterType === "dateRange" && (
          <div className="flex flex-col text-sm">
            <label className="mb-1 font-medium">Date Range</label>
            <Calendar
              value={dateRange as any}
              onChange={(e) => setDateRange(e.value as [Date, Date])}
              selectionMode="range"
              readOnlyInput
              showIcon
              className="w-64 text-sm h-10"
            />
          </div>
        )}

        {filterType === "financialYear" && (
          <div className="flex flex-col text-sm">
            <label className="mb-1 font-medium">Financial Year</label>
            <Dropdown
              value={financialYear}
              options={financialYears}
              onChange={(e) => setFinancialYear(e.value)}
              placeholder="Select Year"
              className="w-40 text-sm h-10"
              panelClassName="text-sm"
            />
          </div>
        )}
        
        <div className="flex flex-col text-sm">
          <label className="mb-1 invisible">.</label>
          <Button
            label="Filter"
            icon="pi pi-magnifying-glass"
            className="bg-teal-500 border-none hover:bg-teal-600 text-white px-4 py-2 rounded-md shadow-sm h-10"
            onClick={filter}
          />
        </div>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-end gap-2">
        <div className="flex flex-col text-sm">
          <label className="mb-1 invisible">.</label>
          <Button
            label="Print"
            icon="pi pi-print"
            loading={loading ? loading : false}
            className="bg-teal-500 border-none hover:bg-teal-600 text-white px-4 py-2 rounded-md shadow-sm h-10"
            onClick={printfn}
            disabled={!printfn}
          />
        </div>

        <div className="flex flex-col text-sm">
          <label className="mb-1 invisible">.</label>
          <SplitButton
            label="Export"
            icon="pi pi-download"
            model={exportItems}
            className="bg-teal-500 border-none hover:bg-teal-600 text-white text-sm h-10 rounded"
            disabled={!exportPdf && !exportExcel}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomReportHeader;