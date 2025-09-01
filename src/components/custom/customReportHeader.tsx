import React, { useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { SplitButton } from "primereact/splitbutton";

interface CustomReportHeaderProps {
  printfn?: () => void
}

const CustomReportHeader: React.FC<CustomReportHeaderProps> = ({printfn}) => {
  const [filterType, setFilterType] = useState("asOfDate");
  const [asOfDate, setAsOfDate] = useState(new Date());
  const [dateRange, setDateRange] = useState(null);
    const [financialYear, setFinancialYear] = useState(null);

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
      command: () => console.log("Exporting PDF..."),
    },
    {
      label: "Export as Excel",
      icon: "pi pi-file-excel",
      command: () => console.log("Exporting Excel..."),
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
        className="w-40 text-sm"
        panelClassName="text-sm"
      />
    </div>

    {filterType === "asOfDate" && (
      <div className="flex flex-col text-sm">
        <label className="mb-1 font-medium">As of Date</label>
        <Calendar
          value={asOfDate}
          onChange={(e) => setAsOfDate(e.value)}
          readOnlyInput
          showIcon
          className="w-40 text-sm"
        />
      </div>
    )}

    {filterType === "dateRange" && (
      <div className="flex flex-col text-sm">
        <label className="mb-1 font-medium">Date Range</label>
        <Calendar
          value={dateRange}
          onChange={(e) => setDateRange(e.value)}
          selectionMode="range"
          readOnlyInput
          showIcon
          className="w-64 text-sm"
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
          className="w-40 text-sm"
          panelClassName="text-sm"
        />
      </div>
              )}
             
  </div>

  {/* Right Section: Actions */}
  <div className="flex items-end gap-2">
    <div className="flex flex-col text-sm">
      <label className="mb-1 invisible">.</label> {/* fake label for alignment */}
      <Button
        label="Print"
        icon="pi pi-print"
        className="bg-teal-500 border-none hover:bg-teal-600 text-white px-4 py-2 rounded-md shadow-sm h-10"
        onClick={printfn}
      />
    </div>

    <div className="flex flex-col text-sm">
      <label className="mb-1 invisible">.</label> {/* fake label for alignment */}
      <SplitButton
        label="Export"
        icon="pi pi-download"
        model={exportItems}
        size="small"
        className="bg-teal-500 border-none hover:bg-teal-600 text-white text-sm h-10 rounded"
      />
    </div>
  </div>
</div>

  );
};

export default CustomReportHeader;
