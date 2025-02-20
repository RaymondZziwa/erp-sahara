import React, { forwardRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface TableProps {
  columnDefs: any[];
  data: any[];
  customHeader?: React.ReactNode;
}

const Table = forwardRef(
  ({ columnDefs, data, customHeader }: TableProps, ref) => {
    const tableRef = React.useRef<HTMLTableElement>(null);

    React.useImperativeHandle(ref, () => ({
      exportPDF: () => {
        const doc = new jsPDF();
        const tableColumn = columnDefs
          .filter((col) => col.headerName?.toLocaleLowerCase() !== "actions")
          .map((col) => col.headerName);
        const tableRows = data.map((row) =>
          columnDefs.map((col) => row[col.field])
        );

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
        });

        doc.save("table.pdf");
      },
    }));

    return (
      <div className="w-full">
        <table
          ref={tableRef}
          className="w-full"
          style={{ borderCollapse: "collapse" }}
        >
          <thead>
            {customHeader && <>{customHeader}</>}
            <tr>
              {columnDefs.map((col, index) => (
                <th key={index} className="border p-2">
                  {col.headerName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columnDefs.map((col, colIndex) => (
                  <td key={colIndex} className="border p-2">
                    {row[col.field]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);

export default Table;
