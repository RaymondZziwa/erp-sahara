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
    current_profit_or_loss: number;
    additions_to_cash: {
      depreciations: number;
      decrease_in_cash_receivable: number;
      increase_in_accounts_payable: number;
      increase_in_tax_payable: number;
    };
    subtractions_from_cash: {
      increase_in_inventory: number;
    };
    net_cash_from_operating_activities: number;
  };
  investing_activities: {
    asset_purchase: number;
    sale_of_asset: number;
    loans_to_customers: number;
    proceeds_from_sales_of_investments: number;
  };
  financing_activities: {
    loan_disbursements: number;
    loan_repayments: number;
    equity_contributions: number;
    equity_withdrawals: number;
  };
  cash_at_beginning_of_period: number;
  cash_at_end_of_period: number;
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

  console.log("Cash Flow", cashFlow);

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

    const addSection = (title: string, data: Record<string, number>) => {
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

      Object.entries(data).forEach(([key, value]) => {
        tableBody.push([
          key.replace(/_/g, " "), // Formatting key names for better readability
          {
            content: value.toLocaleString(),
            styles: { halign: "right" },
          },
        ]);
      });

      const total = Object.values(data).reduce((acc, value) => acc + value, 0);
      tableBody.push([
        {
          content: "Total " + title.split(" from ")[1],
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
    };

    addSection("Cash Flow from Operating Activities", {
      current_profit_or_loss:
        cashFlow.operating_activities.current_profit_or_loss,
      ...cashFlow.operating_activities.additions_to_cash,
      ...cashFlow.operating_activities.subtractions_from_cash,
    });

    addSection(
      "Cash Flow from Investing Activities",
      cashFlow.investing_activities
    );
    addSection(
      "Cash Flow from Financing Activities",
      cashFlow.financing_activities
    );

    tableBody.push([
      { content: "Cash at Beginning of Period", styles: { fontStyle: "bold" } },
      {
        content: cashFlow.cash_at_beginning_of_period.toLocaleString(),
        styles: { halign: "right" },
      },
    ]);

    tableBody.push([
      { content: "Cash at End of Period", styles: { fontStyle: "bold" } },
      {
        content: cashFlow.cash_at_end_of_period.toLocaleString(),
        styles: { fontStyle: "bold", halign: "right" },
      },
    ]);

    autoTable(doc, {
      body: tableBody,
      theme: "grid",
      styles: { textColor: "black", cellPadding: 3, lineWidth: 0.2 },
      margin: { top: 20 },
      tableLineWidth: 0,
      tableLineColor: [255, 255, 255],
      didParseCell: function (data) {
        if (data.section === "body") {
          data.cell.styles.lineWidth = {
            top: 0.2,
            right: 0,
            bottom: 0.2,
            left: 0,
          };
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

            <tr>
              <td className="px-5 py-2 font-bold border-gray-200 border-b">
                Net Earnings
              </td>
              <td className="px-5 py-2 font-bold border-gray-200 border-b">
                {operating_activities?.current_profit_or_loss}
              </td>
            </tr>
            <tr>
              <td
                className="px-5 py-2 font-bold border-gray-200 border-b"
                colSpan={2}
              >
                Additions to Cash
              </td>
            </tr>
            <tr>
              <td className="px-5 py-2 border-gray-200 border-b border-r">
                Depreciation
              </td>
              <td className="px-5 py-2 border-gray-200 border-b">
                {operating_activities?.additions_to_cash.depreciations}
              </td>
            </tr>
            <tr>
              <td className="px-5 py-2 border-gray-200 border-b border-r">
                Decrease in Cash Receivable
              </td>
              <td className="px-5 py-2 border-gray-200 border-b">
                {
                  operating_activities?.additions_to_cash
                    .decrease_in_cash_receivable
                }
              </td>
            </tr>
            <tr>
              <td className="px-5 py-2 border-gray-200 border-b border-r">
                Increase in Accounts Payable
              </td>
              <td className="px-5 py-2 border-gray-200 border-b">
                {
                  operating_activities?.additions_to_cash
                    .increase_in_accounts_payable
                }
              </td>
            </tr>
            <tr>
              <td className="px-5 py-2 border-gray-200 border-b border-r">
                Increase in Tax Payable
              </td>
              <td className="px-5 py-2 border-gray-200 border-b">
                {
                  operating_activities?.additions_to_cash
                    .increase_in_tax_payable
                }
              </td>
            </tr>
            <tr>
              <td
                className="px-5 py-2 font-bold border-gray-200 border-b"
                colSpan={2}
              >
                Subtractions from Cash
              </td>
            </tr>
            <tr>
              <td className="px-5 py-2 border-gray-200 border-b border-r">
                Increase in Inventory
              </td>
              <td className="px-5 py-2 border-gray-200 border-b">
                {
                  operating_activities?.subtractions_from_cash
                    .increase_in_inventory
                }
              </td>
            </tr>
            <tr>
              <td className="px-5 py-2 font-bold border-gray-200 border-b">
                Current Profit or Loss
              </td>
              <td className="px-6 py-2 font-bold border-gray-200 border-b">
                {operating_activities?.current_profit_or_loss}
              </td>
            </tr>

            <tr className="font-bold bg-gray-200">
              <td className="p-3" colSpan={2}>
                Cash Flow from Investing Activities
              </td>
            </tr>

            <tr>
              <td className="px-5 py-2 border-gray-200 border-b border-r">
                Asset Purchase
              </td>
              <td className="px-5 py-2 border-gray-200 border-b">
                {investing_activities?.asset_purchase}
              </td>
            </tr>
            <tr>
              <td className="px-5 py-2 border-gray-200 border-b border-r">
                Sale of Asset
              </td>
              <td className="px-5 py-2 border-gray-200 border-b">
                {investing_activities?.sale_of_asset}
              </td>
            </tr>
            <tr>
              <td className="px-5 py-2 border-gray-200 border-b border-r">
                Loan to Customers
              </td>
              <td className="px-5 py-2 border-gray-200 border-b">
                {investing_activities?.loans_to_customers}
              </td>
            </tr>
            <tr>
              <td className="px-5 py-2 border-gray-200 border-b border-r">
                Proceeds from sales of investments
              </td>
              <td className="px-5 py-2 border-gray-200 border-b">
                {investing_activities?.proceeds_from_sales_of_investments}
              </td>
            </tr>

            <tr className="font-bold bg-gray-200">
              <td className="p-3" colSpan={2}>
                Cash Flow from Financing Activities
              </td>
            </tr>

            <tr>
              <td className="px-5 py-2 border-gray-200 border-b border-r">
                Loan Disbursements
              </td>
              <td className="px-5 py-2 border-gray-200 border-b">
                {financing_activities?.loan_disbursements}
              </td>
            </tr>
            <tr>
              <td className="px-5 py-2 border-gray-200 border-b border-r">
                Loan Repayments
              </td>
              <td className="px-5 py-2 border-gray-200 border-b">
                {financing_activities?.loan_repayments}
              </td>
            </tr>
            <tr>
              <td className="px-5 py-2 border-gray-200 border-b border-r">
                Equity Contributions
              </td>
              <td className="px-5 py-2 border-gray-200 border-b">
                {financing_activities?.equity_contributions}
              </td>
            </tr>
            <tr>
              <td className="px-5 py-2 border-gray-200 border-b border-r">
                Equity Withdrawals
              </td>
              <td className="px-5 py-2 border-gray-200 border-b">
                {financing_activities?.equity_withdrawals}
              </td>
            </tr>
            <tr className="font-bold bg-gray-200">
              <td className="px-5 py-2 border-gray-200 border-b border-r">
                Cash at Beginning of Period
              </td>
              <td className="px-5 py-2 border-gray-200 border-b">
                {cashFlow?.cash_at_beginning_of_period}
              </td>
            </tr>
            <tr className="font-bold bg-gray-200">
              <td className="px-5 py-2 border-gray-200 border-b border-r">
                Cash at End of Period
              </td>
              <td className="px-5 py-2 border-gray-200 border-b">
                {cashFlow?.cash_at_end_of_period}
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Cashflow;
