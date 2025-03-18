import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Icon } from "@iconify/react";
import { apiRequest } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import useAuth from "../../../hooks/useAuth";

type Transaction = {
  date: string;
  description: string;
  cash_received: number;
  cash_paid: number;
  balance: number;
};

const CashBook = () => {
  const [cashBookData, setCashBookData] = useState<Transaction[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;
    setIsLoading(true);
    try {
      const response = await apiRequest<ServerResponse<Transaction[]>>(
        REPORTS_ENDPOINTS.DETAILED_CASH_BOOK.GET_ALL,
        "GET",
        token.access_token
      );
      setCashBookData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  console.log("cashBookData", cashBookData);

  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  const handleExportPDF = () => {
    if (!cashBookData || cashBookData.length === 0) {
      console.error("No data to export.");
      return;
    }

    const doc = new jsPDF();
    doc.setFillColor(255, 255, 255);
    doc.text("Cash Book Report", 20, 10);

    // Table Headers
    const tableHeaders = [
      "Date",
      "Cash Received",
      "Cash Paid",
      "Balance",
      "Description",
    ];

    // Table Data
    const tableBody = cashBookData.map((item) => [
      item.date,
      item.cash_received ? item.cash_received.toLocaleString() : "",
      item.cash_paid ? item.cash_paid.toLocaleString() : "",
      item.balance ? item.balance.toLocaleString() : "",
      item.description,
    ]);

    // Generate PDF Table
    autoTable(doc, {
      head: [tableHeaders],
      body: tableBody,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: {
        fillColor: [222, 226, 230],
        textColor: "black",
        fontStyle: "bold",
      },
      columnStyles: {
        1: { halign: "right" }, // Align "Cash Received" column to the right
        2: { halign: "right" }, // Align "Cash Paid" column to the right
        3: { halign: "right" }, // Align "Balance" column to the right
      },
      margin: { top: 20 },
    });

    doc.save("CashBook.pdf");
  };

  return (
    <div className="bg-white p-3">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Cash Book</h1>
        <button
          className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
          onClick={handleExportPDF}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print
        </button>
      </div>

      {/* Pass customHeader inside the Table component */}
      {isLoading && cashBookData == null ? (
        "Loading..."
      ) : (
        <table>
          <tbody>
            <tr>
              <td className="px-5 py-2 w-[30px] border-gray-300 border-b">
                Date
              </td>
              <td className="px-5 py-2 border-gray-300 border-b">
                Cash Received
              </td>
              <td className="px-5 py-2 border-gray-300 border-b">Cash Paid</td>
              <td className="px-5 py-2 border-gray-300 border-b">Balance</td>
              <td className="px-5 py-2 border-gray-300 border-b">
                Description
              </td>
            </tr>
            {Array.isArray(cashBookData) &&
              cashBookData.map((item) => {
                return (
                  <tr>
                    <td className="px-5 py-2 border-gray-300 border-b">
                      {item.date}
                    </td>
                    <td className="px-5 py-2 border-gray-300 border-b">
                      {item.cash_received
                        ? item.cash_received.toLocaleString()
                        : ""}
                    </td>
                    <td className="px-5 py-2 border-gray-300 border-b">
                      {item.cash_paid ? item.cash_paid.toLocaleString() : ""}
                    </td>
                    <td className="px-5 py-2 border-gray-300 border-b">
                      {item.balance ? item.balance.toLocaleString() : ""}
                    </td>
                    <td className="px-5 py-2 border-gray-300 border-b">
                      {item.description}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      )}
      {!isLoading && cashBookData == null ? "No data to display" : ""}
    </div>
  );
};

export default CashBook;
