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
            // ✅ Ensure only the name is added as a string, not an object
            tableRows.push([row.subcategory_name]);
          } else if (row.isTotalRow) {
            tableRows.push([
              "Subcategory Total",
              "", // Empty column (if needed)
              "",
              row.total, // Ensure total is aligned properly
            ]);
          } else {
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
            {data.map((row, index) => (
              <tr
                key={index}
                className={row.isGroup ? "font-bold bg-gray-100" : ""}
              >
                {row.isGroup ? (
                  <td colSpan={4} className="px-3 py-2">
                    {row.subcategory_name}
                  </td>
                ) : row.isTotalRow ? (
                  <>
                    <td colSpan={2} className="px-3 py-2 font-bold">
                      Subcategory Total
                    </td>
                    <td colSpan={2} className="px-3 py-2 font-bold text-right">
                      {row.total}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-3">{row.account_id}</td>
                    <td className="px-3">{row.account_code}</td>
                    <td className="px-3">{row.account_name}</td>
                    <td className="px-3">
                      {row.balance ? row.balance : row.net_cash_flow}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);

export default Table;
