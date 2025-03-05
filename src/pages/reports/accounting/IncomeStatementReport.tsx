import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

import { apiRequest } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import useAuth from "../../../hooks/useAuth";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import { IncomeStatement } from "../../../redux/slices/types/reports/IncomeStatement.ts";

function IncomeStatementReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [incomeStatementData, setIncomeStatementData] =
    useState<IncomeStatement | null>(null);
  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;
    setIsLoading(true);
    try {
      const response = await apiRequest<ServerResponse<IncomeStatement>>(
        REPORTS_ENDPOINTS.DETAILED_INCOME_STATEMENT.GET_ALL,
        "GET",
        token.access_token
      );
      setIncomeStatementData(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  const handleExportPDF = (data: any[]) => {
    const doc = new jsPDF();
    doc.setFillColor(255, 255, 255);
    doc.text("Income Statement Report", 20, 10);

    const tableBody: any[] = [];

    data.forEach((category) => {
      // Section Header (Category)
      tableBody.push([
        {
          content: category.sub_category_name,
          colSpan: 2,
          styles: {
            fillColor: [222, 226, 230], // Light Gray Background
            fontStyle: "bold",
            halign: "left",
            cellPadding: 3,
          },
        },
      ]);

      // Ledger Items
      category.ledgers.forEach((ledger: any) => {
        tableBody.push([
          ledger.ledger_name,
          {
            content: ledger.amount.toLocaleString(),
            styles: { halign: "right" },
          },
        ]);
      });

      // SubCategory Total
      tableBody.push([
        {
          content: "SubCategory Total",
          styles: {
            fontStyle: "bold",
            fillColor: [246, 249, 252],
            halign: "left",
          },
        },
        {
          content: category.total.toLocaleString(),
          styles: { fontStyle: "bold", halign: "right" },
        },
      ]);
    });

    autoTable(doc, {
      body: tableBody,
      theme: "grid",
      styles: {
        textColor: "black",
        cellPadding: 2,
        lineWidth: 0.2, // Ensures borders are visible
      },
      margin: { top: 20 },
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

    doc.save("IncomeStatement.pdf");
  };

  const emptyData: any[] = [];
  return (
    <div className="bg-white p-3">
      <div className="flex justify-between items-center mb-4">
        <p className="font-bold text-2xl">Income Statement Report</p>

        <button
          className="bg-shade p-3 rounded text-white flex gap-2 items-center"
          onClick={() =>
            incomeStatementData &&
            handleExportPDF(
              Array.isArray(incomeStatementData)
                ? incomeStatementData
                : emptyData
            )
          }
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print
        </button>
      </div>

      {/* Custom Table Component */}

      {isLoading && incomeStatementData === null ? (
        "Loading..."
      ) : (
        <table className="w-full">
          <tbody>
            {Array.isArray(incomeStatementData) &&
              incomeStatementData.map((category) => {
                return (
                  <>
                    <tr className="font-bold bg-gray-200">
                      <td className="p-3 " colSpan={3}>
                        {category.sub_category_name}
                      </td>
                    </tr>
                    {category.ledgers.map((ledger: any) => {
                      return (
                        <tr>
                          <td className="px-3 py-2 border-gray-200 border-b">
                            {ledger.ledger_name}
                          </td>
                          <td className="px-3 py-2 border-gray-200 border-b">
                            {ledger.amount.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="font-bold bg-gray-100">
                      <td className="p-3 ">
                        {category.sub_category_name} Total
                      </td>
                      <td className="p-3 ">
                        {category.total.toLocaleString()}
                      </td>
                    </tr>
                  </>
                );
              })}
          </tbody>
        </table>
      )}
      {!isLoading && incomeStatementData === null && "No data present"}
    </div>
  );
}

export default IncomeStatementReport;
