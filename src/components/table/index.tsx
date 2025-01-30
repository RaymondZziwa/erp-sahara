import React, {
  useImperativeHandle,
  forwardRef,
  useRef,
  useEffect,
} from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ColDef, GridOptions } from "ag-grid-community";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface TableProps<T> {
  data: T[];
  columnDefs: ColDef[];
  gridOptions?: GridOptions<T>;
}

const Table = forwardRef(
  <T,>(
    { data, columnDefs, gridOptions }: TableProps<T>,
    ref: React.Ref<any>
  ) => {
    const gridRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      exportPDF: () => {
        if (gridRef.current) {
          const doc = new jsPDF();
          const tableColumn = columnDefs
            .filter((col) => col.headerName?.toLocaleLowerCase() !== "actions")
            .map((col) => col.headerName);
          const tableRows = data.map((row) =>
            columnDefs.map((col) => {
              const field = col.field as keyof T;
              return row[field];
            })
          );
          // @ts-expect-error --ignore
          doc?.autoTable({
            head: [tableColumn],
            body: tableRows,
          });

          doc.save("table.pdf");
        }
      },
    }));

    // Automatically resize columns to fit the grid width
    useEffect(() => {
      // Define the media query for big screens
      // const isBigScreen = window.matchMedia("(min-width: 768px)").matches;
      // If the screen is big and the gridRef is defined, size columns to fit
      // if (isBigScreen && gridRef.current) {
      //   gridRef?.current?.api?.sizeColumnsToFit();
      // }
    }, [data]);

    return (
      <div
        className="ag-theme-quartz w-full overflow-auto"
        style={{
          height: "640px",
        }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={data}
          columnDefs={columnDefs}
          gridOptions={{
            pagination: true,
            paginationPageSize: 100,
            paginationPageSizeSelector: [10, 20, 50, 100, 500],
            domLayout: "autoHeight",
            suppressHorizontalScroll: false,
            ...gridOptions,
          }}
        />
      </div>
    );
  }
);

export default Table;
