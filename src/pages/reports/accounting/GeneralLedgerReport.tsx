import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import useAuth from "../../../hooks/useAuth";
import { apiRequest } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";

interface LedgerDataType {
  summaries: summaries[];
  total_credit: number;
  total_debit: number;
}
interface summaries {
  account_name: string;
  total_debits: number;
  total_credits: number;
}

const GeneralLedgerReport = () => {
  const [ledgerData, setLedgerData] = useState<LedgerDataType | null>();
  const [isLoading, setIsLoading] = useState(false);
  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;
    setIsLoading(true);
    try {
      const response = await apiRequest<ServerResponse<LedgerDataType>>(
        REPORTS_ENDPOINTS.GENERAL_LEDGERS.GET_ALL,
        "GET",
        token.access_token
      );

      setLedgerData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("General Ledger Report", 14, 10);

    autoTable(doc, {
      startY: 20,
      head: [["Account Name", "Total Debits", "Total Credits"]],
      body: ledgerData?.summaries.map((item) => [
        item.account_name,
        item?.total_debits.toLocaleString(),
        item?.total_credits.toLocaleString(),
      ]),
      theme: "grid",
      headStyles: {
        fillColor: [222, 226, 230], // Set to white or desired color
        textColor: "black", // Set text color to black
        fontStyle: "bold",
      },
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

    // Add totals row
    autoTable(doc, {
      startY: (doc as any).previousAutoTable.finalY + 5,
      body: [
        ["Total Credits", "", ledgerData?.total_credit.toLocaleString() ?? 0],
        ["Total Debits", "", ledgerData?.total_debit.toLocaleString() ?? 0],
      ],
      theme: "grid",
      styles: {
        fillColor: [222, 226, 230], // Set to white or desired color
        textColor: "black", // Set text color to black
        fontStyle: "bold",
      },
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

    doc.save("General_Ledger_Report.pdf");
  };

  return (
    <div className="bg-white p-3">
      <div className="flex justify-between items-center mb-4">
        <p className="font-bold text-xl">General Ledger Report</p>
        <button
          className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
          onClick={handleExportPDF}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print
        </button>
      </div>

      {isLoading ? (
        "Loading..."
      ) : (
        <table className="w-full">
          <tbody>
            <tr className="font-bold bg-gray-200">
              <td className="p-3 ">Account Name</td>
              <td className="p-3 ">Debits</td>
              <td className="p-3 ">Credits</td>
            </tr>
            {ledgerData?.summaries.map((item) => {
              return (
                <>
                  <tr>
                    <td className="px-3 py-2 border-gray-200 border-b">
                      {item.account_name}
                    </td>
                    <td className="px-3 py-2 border-gray-200 border-b">
                      {item.total_credits.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 border-gray-200 border-b">
                      {item.total_debits.toLocaleString()}
                    </td>
                  </tr>
                </>
              );
            })}
            <tr className="font-bold bg-gray-200 ">
              <td className="px-3 py-2 " colSpan={2}>
                Total Credits
              </td>
              <td className="px-3 py-2">
                {ledgerData?.total_credit.toLocaleString()}
              </td>
            </tr>
            <tr className="font-bold bg-gray-200">
              <td className="px-3 py-2" colSpan={2}>
                Total Debits
              </td>
              <td className="px-3 py-2">
                {ledgerData?.total_debit.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default GeneralLedgerReport;
