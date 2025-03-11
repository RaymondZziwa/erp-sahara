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
        const tableColumn = columnDefs.map((col) => col.headerName);
        const tableRows: any[] = [];

        data.forEach((row) => {
          if (row.isGroup) {
            // ✅ Add subcategory name as a separate row in bold
            tableRows.push([
              {
                content: row.sub_category_name,
                styles: { fontStyle: "bold", halign: "left" },
              },
            ]);
          } else if (row.isTotalRow) {
            // ✅ Add total row in bold
            tableRows.push([
              {
                content: "Subcategory Total",
                colSpan: columnDefs.length - 1,
                styles: { fontStyle: "bold", halign: "left" },
              },
              {
                content: row.total,
                styles: { fontStyle: "bold", halign: "right" },
              },
            ]);
          } else {
            // ✅ Normal data row
            tableRows.push(columnDefs.map((col) => row[col.field] || ""));
          }
        });

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          theme: "grid",
        });

        doc.save("table.pdf");
      },
    }));

    return (
      <div className="w-full">
        <table ref={tableRef} className="w-full border-collapse">
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
            {data.map((row, rowIndex) => {
              // ✅ Subcategory Group Row
              if (row.isGroup) {
                return (
                  <tr key={rowIndex} className="bg-gray-100 font-bold">
                    <td colSpan={columnDefs.length} className="p-3">
                      {row.sub_category_name}
                    </td>
                  </tr>
                );
              }

              // ✅ Subcategory Total Row
              if (row.isTotalRow) {
                return (
                  <tr
                    key={rowIndex}
                    className="border-t border-black font-bold"
                  >
                    <td colSpan={columnDefs.length - 1} className="p-3">
                      {row.sub_category_name} Total
                    </td>
                    <td className="p-3 text-right">{row.total}</td>
                  </tr>
                );
              }

              // ✅ Normal Data Rows
              return (
                <tr key={rowIndex}>
                  {columnDefs.map((col, colIndex) => (
                    <td key={colIndex} className="border p-2">
                      {row[col.field]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
);

export default Table;
