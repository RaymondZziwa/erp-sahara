import React, { useState, useEffect } from "react";
import useAuth from "../../../hooks/useAuth";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import { apiRequest } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import { ACCOUNTS_ENDPOINTS } from "../../../api/accountsEndpoints";
import { Icon } from "@iconify/react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ComparisonTrialBalance {
  account_id: number;
  account_name: string;
  account_code: string;
  current_debit: number;
  current_credit: number;
  previous_debit: number;
  previous_credit: number;
  debit_difference: number;
  credit_difference: number;
}

interface fiscalYearType {
  id: number;
  financial_year: string;
  start_date: string;
  end_date: string;
  organisation_id: number;
  status: number;
  remaining_days: number;
  should_alert: boolean;
}

const ComparisonTrialBalances: React.FC = () => {
  const [trialBalance, setTrialBalance] = useState<
    ComparisonTrialBalance[] | null
  >([]);
  const [fiscalYears, setFiscalYears] = useState<fiscalYearType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiRequest<
        ServerResponse<ComparisonTrialBalance[]>
      >(
        REPORTS_ENDPOINTS.COMPARISON_TRIAL_BALANCES.GET_ALL,
        "GET",
        token.access_token
      );
      setIsLoading(false);

      setTrialBalance(response.data); // Dispatch action with fetched data on success
    } catch (error) {
      setIsLoading(false);
    }
    try {
      const response = await apiRequest<ServerResponse<fiscalYearType[]>>(
        ACCOUNTS_ENDPOINTS.GET_FISCAL_YEARS,
        "GET",
        token.access_token
      );
      setIsLoading(false);

      setFiscalYears(response.data); // Dispatch action with fetched data on success
    } catch (error) {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  console.log(trialBalance);

  let current_fy = fiscalYears[fiscalYears.length - 1]?.financial_year;
  let previous_fy = fiscalYears[fiscalYears.length - 1]?.financial_year;

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Define table columns
    const tableColumn = [
      "Account Code",
      "Account Name",
      ` Debit`,
      `Credit`,
      `Debit`,
      `Credit`,
      "Debit Difference",
      "Credit Difference",
    ];

    // Add the fiscal years row manually
    const fiscalYearRow = [
      "Years",
      "",
      current_fy,
      "",
      previous_fy,
      "",
      "",
      "",
    ];

    // Map your trial balance data into table rows (replace 0 with "")
    const tableRows = trialBalance?.map((item) => [
      item.account_code,
      item.account_name,
      item.current_debit !== 0 ? item.current_debit : "",
      item.current_credit !== 0 ? item.current_credit : "",
      item.previous_debit !== 0 ? item.previous_debit : "",
      item.previous_credit !== 0 ? item.previous_credit : "",
      item.debit_difference !== 0 ? item.debit_difference : "",
      item.credit_difference !== 0 ? item.credit_difference : "",
    ]);

    // Add title
    doc.text("Trial Balance Comparison", 14, 15);

    // Generate the table with the extra row
    autoTable(doc, {
      startY: 20,
      head: [fiscalYearRow, tableColumn],
      body: tableRows,
      headStyles: {
        fillColor: [222, 226, 230],
        textColor: "black",
        fontStyle: "bold",
      },
      tableLineWidth: 0, // Removes outer table borders
      tableLineColor: [255, 255, 255], // Makes sure no table outline
      didParseCell: function (data) {
        if (data.section === "body") {
          data.cell.styles.lineWidth = {
            top: 0.2,
            right: 0.2,
            bottom: 0.2,
            left: 0.2,
          }; // [top, right, bottom, left]
        }
      },
    });

    // Save the PDF
    doc.save("Trial_Balance_Comparison.pdf");
  };

  return (
    <div className="p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Trial Balance Comparison Report</h1>
        <button
          className="bg-shade px-2 py-2 rounded text-white flex gap-2 items-center"
          onClick={handleExportPDF}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print
        </button>
      </div>
      {trialBalance && trialBalance.length < 1 && isLoading != true ? (
        "No Data Present"
      ) : (
        <table className="w-full border border-gray-200">
          <tbody>
            <tr className="bg-gray-200">
              <td className="text-center font-bold py-4 px-4" colSpan={8}>
                <p className="text-center font-bold">
                  Trial Balance Comparison
                </p>
                <p className="text-center text-sm">All Figures in UGX</p>
              </td>
            </tr>
            <tr className="font-bold">
              <td className="border-r border-b border-gray-200 p-2" colSpan={2}>
                Years
              </td>

              <td className="border-r border-b border-gray-200 p-2" colSpan={2}>
                {current_fy}
              </td>

              <td className="border-r border-b border-gray-200 p-2" colSpan={2}>
                {previous_fy}
              </td>

              <td
                className="border-r border-b border-gray-200"
                colSpan={2}
              ></td>
            </tr>
            <tr className="font-bold">
              <td className="border-r border-b border-gray-200 p-2">
                Account Code
              </td>

              <td className="border-r border-b border-gray-200 p-2">
                Account Name
              </td>

              <td className="border-r border-b border-gray-200 p-2">Debit</td>

              <td className="border-r border-b border-gray-200 p-2">Credit</td>

              <td className="border-r border-b border-gray-200 p-2">Debit</td>

              <td className="border-r border-b border-gray-200 p-2">Credit</td>

              <td className="border-r border-b border-gray-200 p-2">
                Debit Difference
              </td>

              <td className="border-r border-b border-gray-200 p-2">
                Credit Difference
              </td>
            </tr>
            {trialBalance?.map((item) => (
              <tr key={item.account_id}>
                <td className="border-r border-b border-gray-200 px-2">
                  {item.account_code}
                </td>

                <td className="border-r border-b border-gray-200 px-2">
                  {item.account_name}
                </td>

                <td className="border-r border-b border-gray-200 px-2">
                  {item.current_debit !== 0 ? item.current_debit : ""}
                </td>

                <td className="border-r border-b border-gray-200 px-2">
                  {item.current_credit !== 0 ? item.current_credit : ""}
                </td>

                <td className="border-r border-b border-gray-200 px-2">
                  {item.previous_debit !== 0 ? item.previous_debit : ""}
                </td>

                <td className="border-r border-b border-gray-200 px-2">
                  {item.previous_credit !== 0 ? item.previous_credit : ""}
                </td>

                <td className="border-r border-b border-gray-200 px-2">
                  {item.debit_difference !== 0 ? item.debit_difference : ""}
                </td>

                <td className="border-r border-b border-gray-200 px-2">
                  {item.credit_difference !== 0 ? item.credit_difference : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {trialBalance && trialBalance.length < 1 && isLoading == true
        ? "Loading..."
        : ""}
    </div>
  );
};

export default ComparisonTrialBalances;
