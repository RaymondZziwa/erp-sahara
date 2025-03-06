import { Icon } from "@iconify/react";
import useBalanceSheet from "../../../hooks/reports/useBalanceSheet";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
interface Account {
  account_code: string;
  account_name: string;
  balance: number;
}

interface Subcategory {
  subcategory_name: string;
  subcategory_total: number;
  accounts: Account[];
}

function BalanceSheetReport() {
  const { data } = useBalanceSheet();

  const { assets, equity, liabilities } = data;
  console.log(data);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(255, 255, 255);
    doc.text("Balance Sheet", 20, 10);

    const generateSection = (title: string, items: Subcategory[]) => {
      const tableBody: any[] = [];

      // Section header
      tableBody.push([
        {
          content: title,
          colSpan: 3,
          styles: {
            fillColor: [222, 226, 230],
            fontStyle: "bold",
            halign: "left",
            cellPadding: 3, // Adds padding
          },
        },
      ]);

      items.forEach((item) => {
        // Subcategory title
        tableBody.push([
          {
            content: item.subcategory_name,
            colSpan: 3,
            styles: {
              fillColor: [246, 249, 252],
              fontStyle: "bold",
              halign: "left",
              cellPadding: 3,
            },
          },
        ]);

        // Account details
        item.accounts.forEach((account) => {
          tableBody.push([
            account.account_code,
            account.account_name,
            {
              content: account.balance.toLocaleString(),
              styles: {
                halign: "right",
              },
            },
          ]);
        });
      });

      // Total row
      const total = items.reduce(
        (acc, item) => acc + item.subcategory_total,
        0
      );
      tableBody.push([
        {
          content: `TOTAL ${title}`,
          colSpan: 2,
          styles: {
            fontStyle: "bold",
            fillColor: [246, 249, 252],
            halign: "left",
            cellPadding: 3,
          },
        },
        {
          content: total.toLocaleString(),
          styles: { fontStyle: "bold", halign: "right" },
        },
      ]);

      autoTable(doc, {
        body: tableBody,
        theme: "grid",
        styles: {
          textColor: "black",
          cellPadding: 2,
          lineWidth: 0.2, // Ensures borders are visible
        },
        margin: { top: 5 },
        tableLineWidth: 0, // Removes outer table borders
        tableLineColor: [255, 255, 255], // Makes sure no table outline
        didParseCell: function (data) {
          if (data.section === "body") {
            data.cell.styles.lineWidth = {
              top: 0.2,
              right: 0,
              bottom: 0.2,
              left: 0,
            }; // [top, right, bottom, left]
          }
        },
      });
    };

    generateSection("ASSETS", assets);
    generateSection("EQUITY", equity);
    generateSection("LIABILITIES", liabilities);

    doc.save("BalanceSheet.pdf");
  };

  return (
    <div className="bg-white p-3">
      <div className="flex justify-between items-center mb-4">
        <p className="font-bold text-xl">Balance Sheet</p>
        <button
          className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
          onClick={handleExportPDF}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print
        </button>
      </div>
      <table className="w-full">
        <tbody>
          <tr className="font-bold bg-gray-300">
            <td className="p-3 " colSpan={3}>
              ASSETS
            </td>
          </tr>

          {assets?.map((item) => {
            return (
              <>
                <tr className="font-bold bg-gray-100">
                  <td className="p-3 " colSpan={3}>
                    {item.subcategory_name}
                  </td>
                </tr>
                {item.accounts.map((account: any) => {
                  return (
                    <tr>
                      <td className="px-3 py-2 border-gray-200 border-b w-[100px]">
                        {account.account_code}
                      </td>
                      <td className="px-3 py-2 border-gray-200 border-b">
                        {account.account_name}
                      </td>
                      <td className="px-3 py-2 border-gray-200 border-b">
                        {account.balance.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </>
            );
          })}
          <tr className="font-bold bg-gray-200">
            <td className="p-3 " colSpan={2}>
              TOTAL ASSETS
            </td>
            <td className="p-3 ">
              {assets
                ?.reduce((acc, item) => acc + item.subcategory_total, 0)
                .toLocaleString()}
            </td>
          </tr>

          <tr className="font-bold bg-gray-300">
            <td className="p-3 " colSpan={3}>
              EQUITY
            </td>
          </tr>
          {equity?.map((item) => {
            return (
              <>
                <tr className="font-bold bg-gray-100">
                  <td className="p-3 " colSpan={3}>
                    {item.subcategory_name}
                  </td>
                </tr>
                {item.accounts.map((account: any) => {
                  return (
                    <tr>
                      <td className="px-3 py-2 border-gray-200 border-b w-[100px]">
                        {account.account_code}
                      </td>
                      <td className="px-3 py-2 border-gray-200 border-b">
                        {account.account_name}
                      </td>
                      <td className="px-3 py-2 border-gray-200 border-b">
                        {account.balance.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </>
            );
          })}
          <tr className="font-bold bg-gray-200">
            <td className="p-3 " colSpan={2}>
              TOTAL EQUITY
            </td>
            <td className="p-3 ">
              {equity
                ?.reduce((acc, item) => acc + item.subcategory_total, 0)
                .toLocaleString()}
            </td>
          </tr>
          <tr className="font-bold bg-gray-300">
            <td className="p-3 " colSpan={3}>
              LIABILITIES
            </td>
          </tr>
          {liabilities?.map((item) => {
            return (
              <>
                <tr className="font-bold bg-gray-100">
                  <td className="p-3 " colSpan={3}>
                    {item.subcategory_name}
                  </td>
                </tr>
                {item.accounts.map((account: any) => {
                  return (
                    <tr>
                      <td className="px-3 py-2 border-gray-200 border-b w-[100px]">
                        {account.account_code}
                      </td>
                      <td className="px-3 py-2 border-gray-200 border-b">
                        {account.account_name}
                      </td>
                      <td className="px-3 py-2 border-gray-200 border-b">
                        {account.balance.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </>
            );
          })}
          <tr className="font-bold bg-gray-200">
            <td className="p-3 " colSpan={2}>
              TOTAL LIABILITIES
            </td>
            <td className="p-3 ">
              {liabilities
                ?.reduce((acc, item) => acc + item.subcategory_total, 0)
                .toLocaleString()}
            </td>
          </tr>
          <tr className="font-bold bg-gray-200">
            <td className="p-3 " colSpan={2}>
              PROFIT/LOSS
            </td>
            <td className="p-3 ">
              {data.current_profit_or_loss
                ? data?.current_profit_or_loss.toLocaleString()
                : 0}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default BalanceSheetReport;
