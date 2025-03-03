import React, { useState, useEffect } from "react";
import useAuth from "../../../hooks/useAuth";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import { apiRequest } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import { Icon } from "@iconify/react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ComparisonIncomeStatementData {
  income_statement: Incomestatement;
  start_date: string;
  end_date: string;
  data: [];
}

interface Ledger {
  ledger_id: number;
  ledger_name: string;
  ledger_code: string;
  amount: number;
  previous_amount: number;
  difference: number;
}

interface Incomestatement {
  sub_category_id: number;
  sub_category_name: string;
  total: number;
  ledgers: Ledger[];
}

const ComparisonIncomeStatement: React.FC = () => {
  const [incomeStatement, setIncomeStatement] = useState<Incomestatement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;
    setIsLoading(true);
    try {
      const response = await apiRequest<
        ServerResponse<ComparisonIncomeStatementData>
      >(
        REPORTS_ENDPOINTS.COMPARISON_INCOME_STATEMENT.GET_ALL,
        "GET",
        token.access_token
      );

      setIncomeStatement(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  console.log("income", incomeStatement);

  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  const handleExportPDF = (data: Incomestatement[]) => {
    const doc = new jsPDF();
    doc.setFillColor(255, 255, 255);
    doc.text("Income Statement Comparison Report", 20, 10);

    const tableBody: any[] = [];

    data.forEach((category) => {
      tableBody.push([
        {
          content: category.sub_category_name,
          colSpan: 4,
          styles: {
            fillColor: [222, 226, 230], // Light Gray Background
            fontStyle: "bold",
            halign: "left",
            cellPadding: 3,
          },
        },
      ]);

      tableBody.push([
        {
          content: "Name",
          styles: { halign: "left", fontStyle: "bold" },
        },
        {
          content: "Current Amount",
          styles: { halign: "center", fontStyle: "bold" },
        },
        {
          content: "Previous Amount",
          styles: { halign: "center", fontStyle: "bold" },
        },
        {
          content: "Difference",
          styles: { halign: "center", fontStyle: "bold" },
        },
      ]);

      category.ledgers.forEach((ledger) => {
        tableBody.push([
          ledger.ledger_name,
          {
            content: ledger.amount.toLocaleString(),
            styles: { halign: "center" },
          },
          {
            content: ledger.previous_amount.toLocaleString(),
            styles: { halign: "center" },
          },
          {
            content: ledger.difference.toLocaleString(),
            styles: { halign: "center" },
          },
        ]);
      });

      tableBody.push([
        {
          content: "SubCategory Total",
          colSpan: 3,
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
      styles: { textColor: "black", cellPadding: 2, lineWidth: 0.2 },
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

    doc.save("IncomeStatementComparison.pdf");
  };

  return (
    <div>
      <div className="bg-white p-3">
        <div className="flex justify-between items-center mb-4">
          <p className="font-bold text-2xl">Income Statement Comparison</p>
          <button
            className="bg-shade p-3 rounded text-white flex gap-2 items-center"
            onClick={() =>
              incomeStatement.length > 0 && handleExportPDF(incomeStatement)
            }
          >
            <Icon icon="solar:printer-bold" fontSize={20} />
            Print
          </button>
        </div>

        {/* Custom Table Component */}
        {isLoading ? (
          "Loading..."
        ) : (
          <table className="w-full">
            <tbody>
              {incomeStatement?.map((category) => {
                return (
                  <>
                    <tr className="font-bold bg-gray-200">
                      <td className="p-3 " colSpan={4}>
                        {category.sub_category_name}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border-gray-200 border-b">
                        Name
                      </td>
                      <td className="px-3 py-2 border-gray-200 border-b">
                        Current Amount
                      </td>
                      <td className="px-3 py-2 border-gray-200 border-b">
                        Previous Amount
                      </td>
                      <td className="px-3 py-2 border-gray-200 border-b">
                        Difference
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
                          <td className="px-3 py-2 border-gray-200 border-b">
                            {ledger.previous_amount.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 border-gray-200 border-b">
                            {ledger.difference.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="font-bold bg-gray-100">
                      <td className="p-3 " colSpan={3}>
                        SubCategory Total
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
      </div>
    </div>
  );
};

export default ComparisonIncomeStatement;
