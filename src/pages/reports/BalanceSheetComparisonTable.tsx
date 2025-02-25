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
            tableRows.push([row.subcategory_name]);
          } else if (row.isTotalRow) {
            tableRows.push(["Subcategory Total", "", "", row.total]);
            tableRows.push(["Previous Total", "", "", row.previous_total]);
            tableRows.push(["Difference", "", "", row.difference]);
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
                <th key={index} className="border p-2 text-left">
                  {col.headerName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <React.Fragment key={index}>
                {row.isGroup ? (
                  <tr className="font-bold bg-gray-100">
                    <td colSpan={6} className="px-3 py-2">
                      {row.subcategory_name}
                    </td>
                  </tr>
                ) : row.isTotalRow ? (
                  <>
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-2 font-bold border-b border-gray-200"
                      >
                        Subcategory Total
                      </td>
                      <td
                        colSpan={1}
                        className="px-3 py-2 font-bold text-right border-b border-gray-200"
                      >
                        {row.total}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-2 font-bold border-b border-gray-200"
                      >
                        Previous Total
                      </td>
                      <td
                        colSpan={1}
                        className="px-3 py-2 font-bold text-right border-b border-gray-200"
                      >
                        {row.previous_total}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-2 font-bold border-b border-gray-200"
                      >
                        Difference
                      </td>
                      <td
                        colSpan={1}
                        className="px-3 py-2 font-bold text-right"
                      >
                        {row.difference}
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td className="px-3 py-2 border-b border-gray-200">
                      {row.account_id}
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200">
                      {row.code}
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200">
                      {row.account_name}
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200">
                      {row.balance}
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200">
                      {row.previous_amount}
                    </td>
                    <td className="px-3 py-2 border-b border-gray-200">
                      {row.difference}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);

export default Table;
