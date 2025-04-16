import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { TrialBalance } from "../../../redux/slices/types/reports/TrialBalance";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import useAuth from "../../../hooks/useAuth";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import { apiRequest } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import Header from "../../../components/custom/print_header";

function TrialBalanceReport() {
  const { token, isFetchingLocalToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [trialBalanceData, setTrialBalanceData] = useState<TrialBalance | null>(
    null
  );

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;
    setIsLoading(true);
    try {
      const response = await apiRequest<ServerResponse<TrialBalance>>(
        REPORTS_ENDPOINTS.TRIAL_BALANCES.GET_ALL,
        "GET",
        token.access_token
      );
      setTrialBalanceData(response.data);
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

  // const trialBalanceData: TrialBalance[] = Array.isArray(data) ? data : [];

  console.log("tbal", trialBalanceData);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(255, 255, 255);
    doc.text("Trial Balance Report", 20, 10);

    // Table Headers
    const tableHeaders = ["Account Code", "Account Name", "Debit", "Credit"];

    // Table Data
    const tableBody = Array.isArray(trialBalanceData)
      ? trialBalanceData.map((item) => [
          item.account_code,
          item.account_name,
          item.debit ? item.debit.toLocaleString() : "",
          item.credit ? item.credit.toLocaleString() : "",
        ])
      : [];

    // Add Total Row (Fix: Convert objects to simple strings)
    const totalDebit = Array.isArray(trialBalanceData)
      ? trialBalanceData
          .reduce((acc, item) => acc + item.debit, 0)
          .toLocaleString()
      : "0";
    const totalCredit = Array.isArray(trialBalanceData)
      ? trialBalanceData
          .reduce((acc, item) => acc + item.credit, 0)
          .toLocaleString()
      : "0";

    tableBody.push([
      "TOTAL", // Text-only value instead of { content: "TOTAL", styles: ... }
      "",
      totalDebit,
      totalCredit,
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
        2: { halign: "right" }, // Aligns "Debit" column to the right
        3: { halign: "right" }, // Aligns "Credit" column to the right
      },
      margin: { top: 20 },
    });

    doc.save("TrialBalance.pdf");
  };

  return (
    <div className="bg-white p-3">
      <Header title={"Trial Balance Report"} />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold"></h1>
        <button
          className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
          onClick={handleExportPDF}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print
        </button>
      </div>

      {/* Pass customHeader inside the Table component */}
      {isLoading && trialBalanceData == null ? (
        "Loading..."
      ) : (
        <table className="w-full">
          <tbody>
            {Array.isArray(trialBalanceData) &&
              trialBalanceData.map((item) => {
                return (
                  <tr>
                    <td className="px-5 py-2 w-[30px] border-gray-300 border">
                      {item.account_code}
                    </td>
                    <td className="px-5 py-2 border-gray-300 border">
                      {item.account_name}
                    </td>
                    <td className="px-5 py-2 border-gray-300 border">
                      {item.debit ? item.debit.toLocaleString() : ""}
                    </td>
                    <td className="px-5 py-2 border-gray-300 border">
                      {item.credit ? item.credit.toLocaleString() : ""}
                    </td>
                  </tr>
                );
              })}
            <tr className="bg-gray-200">
              <td
                className="px-5 py-2 border-gray-300 border-b font-bold"
                colSpan={2}
              >
                Total
              </td>
              <td className="px-5 py-2 border-gray-300 border-b  font-bold">
                {Array.isArray(trialBalanceData)
                  ? trialBalanceData
                      .reduce((acc, item) => acc + item.debit, 0)
                      .toLocaleString()
                  : "0"}
              </td>
              <td className="px-5 py-2 border-gray-300 border-b  font-bold">
                {Array.isArray(trialBalanceData)
                  ? trialBalanceData
                      .reduce((acc, item) => acc + item.credit, 0)
                      .toLocaleString()
                  : "0"}
              </td>
            </tr>
          </tbody>
        </table>
      )}
      {!isLoading && trialBalanceData === null && "No data present"}
    </div>
  );
}

export default TrialBalanceReport;
