import React, { useState, useEffect } from "react";
import useAuth from "../../../hooks/useAuth";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import { apiRequest, baseURL } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import { ACCOUNTS_ENDPOINTS } from "../../../api/accountsEndpoints";
import { Icon } from "@iconify/react";
import Header from "../../../components/custom/print_header";
import axios from "axios";
import CustomReportHeader from "../../../components/custom/customReportHeader";
import { PropagateLoader } from "react-spinners";

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
  const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          const [filters, setFilters] = useState({
            start_date: startOfMonth.toISOString().split("T")[0],
            end_date: endOfMonth.toISOString().split("T")[0],
  });
  

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

  // let current_fy = fiscalYears[fiscalYears.length - 1]?.financial_year;
  // let previous_fy = fiscalYears[fiscalYears.length - 1]?.financial_year;

  const print = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/reports/accounting/print-tb-comparison`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token.access_token || ""}`,
          },
        }
      );

      // Explicitly set the MIME type as PDF
      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);

      // Open the file in a new browser tab
      window.open(fileURL, "_blank");
    } catch (error) {
      console.error("Error previewing the balance sheet report:", error);
    }
  };

    // const print = async () => {
    //   try {
    //     const response = await axios.get(
    //       `${baseURL}/reports/accounting/print-tb-comparison`,
    //       {
    //         responseType: "blob", // Important for downloading files
    //         headers: {
    //           Authorization: `Bearer ${token.access_token || ""}`,
    //         },
    //       }
    //     );

    //     const url = window.URL.createObjectURL(new Blob([response.data]));
    //     const link = document.createElement("a");
    //     link.href = url;
    //     link.setAttribute("download", "trial-balance-report.pdf"); // Adjust filename/extension if needed
    //     document.body.appendChild(link);
    //     link.click();
    //     link.remove();
    //     window.URL.revokeObjectURL(url);
    //   } catch (error) {
    //     console.error("Error downloading the trial balance report:", error);
    //   }
  // };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
       <PropagateLoader color="#007f80"/>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white">
      <CustomReportHeader />
      <div className="flex flex-row justify-center items-center mt-20">
      <Header title="Trial Balance Comparison Report" />
      </div>
      {(filters.start_date || filters.end_date) && (
                <div className="text-center mb-4 text-sm text-gray-600">
                  Showing data from {filters.start_date || "the beginning"} to{" "}
                  {filters.end_date || "now"}
                </div>
              )}
     

      {trialBalance && trialBalance.length < 1 && isLoading != true ? (
        "No Data Present"
      ) : (
        <table className="w-full border border-gray-200">
          <tbody>
            <tr className="font-bold">
              <td className="border-r border-b border-gray-200 p-2" colSpan={1}>
                
              </td>

              <td className="border-r border-b border-gray-200 p-2 text-center" colSpan={2}>
                Current Period
              </td>

              <td className="border-r border-b border-gray-200 p-2 text-center" colSpan={2}>
                Previous Period
              </td>

             
            </tr>
            <tr className="font-bold bg-teal-500 text-white">
              <td className="border-r border-b border-gray-200 p-2">
                Account Name
              </td>

              <td className="border-r border-b border-gray-200 p-2">Debit</td>

              <td className="border-r border-b border-gray-200 p-2">Credit</td>

              <td className="border-r border-b border-gray-200 p-2">Debit</td>

              <td className="border-r border-b border-gray-200 p-2">Credit</td>
            </tr>
            {trialBalance?.map((item) => (
              <tr key={item.account_id}>
                <td className="border-r border-b border-gray-200 px-2">
                {item.account_code}-{item.account_name}
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
