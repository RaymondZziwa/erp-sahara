import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { apiRequest } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import useAuth from "../../../hooks/useAuth";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface cashFlowData {
  operating_activities: {
    Operating: cashFlowDetails[];
  };
  investing_activities: {
    Investing: cashFlowDetails[];
  };
  financing_activities: {
    Financing: cashFlowDetails[];
  };
}
interface cashFlowDetails {
  account_id: number;
  account_name: string;
  account_code: string;
  net_cash_flow: number;
}
function Cashflow() {
  const [cashFlow, setCashFlow] = useState<cashFlowData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;
    setIsLoading(true);
    try {
      const response = await apiRequest<ServerResponse<cashFlowData>>(
        REPORTS_ENDPOINTS.CASH_FLOW_STATEMENT.GET_ALL,
        "GET",
        token.access_token
      );
      setCashFlow(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  const operating_activities = cashFlow?.operating_activities;
  const financing_activities = cashFlow?.financing_activities;
  const investing_activities = cashFlow?.investing_activities;

  const handleExportPDF = (cashFlow: cashFlowData) => {
    const doc = new jsPDF();
    doc.setFillColor(255, 255, 255);
    doc.text("Cash Flow Statement", 20, 10);

    const tableBody: any[] = [];

    const sections = [
      {
        title: "Cash Flow from Operating Activities",
        data: cashFlow.operating_activities.Operating,
      },
      {
        title: "Cash Flow from Investing Activities",
        data: cashFlow.investing_activities.Investing || [],
      },
      {
        title: "Cash Flow from Financing Activities",
        data: cashFlow.financing_activities.Financing || [],
      },
    ];

    sections.forEach(({ title, data }) => {
      // **Header Row for Section (e.g., "Cash Flow from Operating Activities")**
      tableBody.push([
        {
          content: title,
          colSpan: 2,
          styles: {
            fontStyle: "bold",
            fillColor: [222, 226, 230],
            halign: "left",
            cellPadding: 3,
          },
        },
      ]);

      if (data.length > 0) {
        // **Account Rows**
        data.forEach((item) => {
          tableBody.push([
            item.account_name,
            {
              content: item.net_cash_flow.toLocaleString(),
              styles: { halign: "right" },
            },
          ]);
        });

        // **Total Row**
        const total = data.reduce((acc, item) => acc + item.net_cash_flow, 0);
        tableBody.push([
          {
            content: "Net " + title.split(" from ")[1],
            styles: {
              fontStyle: "bold",
              fillColor: [246, 249, 252],
              halign: "left",
            },
          },
          {
            content: total.toLocaleString(),
            styles: { fontStyle: "bold", halign: "right" },
          },
        ]);
      } else {
        // **No Data Message**
        tableBody.push([
          {
            content: "No transactions recorded",
            colSpan: 2,
            styles: { halign: "center", fontStyle: "italic" },
          },
        ]);
      }
    });

    autoTable(doc, {
      body: tableBody,
      theme: "grid",
      styles: { textColor: "black", cellPadding: 3, lineWidth: 0.2 },
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

    doc.save("CashFlowStatement.pdf");
  };

  return (
    <div className="bg-white p-3">
      <div className="flex justify-between items-center mb-4">
        <p className="font-bold text-xl">Cash Flow Report</p>
        <button
          className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
          onClick={() => cashFlow && handleExportPDF(cashFlow)}
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
              <td className="p-3" colSpan={2}>
                Cash Flow from Operating Activities
              </td>
            </tr>
            {operating_activities?.Operating
              ? operating_activities?.Operating.map((item) => {
                  return (
                    <tr>
                      <td className="px-5 py-2 border-gray-300 border-b border-r">
                        {item.account_name}
                      </td>
                      <td className="px-5 py-2 border-gray-200 border-b">
                        {item.net_cash_flow}
                      </td>
                    </tr>
                  );
                })
              : ""}
            <tr>
              <td className="px-5 py-2 font-bold border-gray-200 border-b">
                Net Cash from Operations
              </td>
              <td className="px-5 py-2 font-bold border-gray-200 border-b">
                {operating_activities?.Operating.reduce(
                  (acc, item) => acc + item.net_cash_flow,
                  0
                )}
              </td>
            </tr>
            <tr className="font-bold bg-gray-200">
              <td className="p-3" colSpan={2}>
                Cash Flow from Investing Activities
              </td>
            </tr>
            {investing_activities?.Investing
              ? investing_activities?.Investing.map((item) => {
                  return (
                    <tr>
                      <td className="px-5 py-2 border-gray-200 border-b">
                        {item.account_name}
                      </td>
                      <td className="px-5 py-2 border-gray-200 border-b">
                        {item.net_cash_flow}
                      </td>
                    </tr>
                  );
                })
              : ""}
            <tr className="font-bold bg-gray-200">
              <td className="p-3" colSpan={2}>
                Cash Flow from Financing Activities
              </td>
            </tr>
            {financing_activities?.Financing
              ? financing_activities?.Financing.map((item) => {
                  return (
                    <tr>
                      <td className="px-5 py-2 border-gray-200 border-b">
                        {item.account_name}
                      </td>
                      <td className="px-5 py-2 border-gray-200 border-b">
                        {item.net_cash_flow}
                      </td>
                    </tr>
                  );
                })
              : ""}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Cashflow;
