import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { TrialBalance } from "../../../redux/slices/types/reports/TrialBalance";
import useAuth from "../../../hooks/useAuth";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import { apiRequest, baseURL } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import Header from "../../../components/custom/print_header";
import axios from "axios";

function TrialBalanceReport() {
  const { token, isFetchingLocalToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [trialBalanceData, setTrialBalanceData] = useState<TrialBalance | null>(
    null
  );

  // const print = async () => {
  //   try {
  //     const response = await axios.get(
  //       `${baseURL}/reports/accounting/print-tb`,
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

  const print = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/reports/accounting/print-tb`,
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
      console.error("Error previewing the trial balance report:", error);
    }
  };


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


  return (
    <div className="bg-white p-3">
      <Header title={"Trial Balance Report"} />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold"></h1>
        <button
          className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
          onClick={print}
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
          <thead className="border-b border-gray-300">
            <tr className="border border-gray-300 font-bold">
              <th className="px-6 py-3 text-left  border-b border-gray-300 w-52">
                A/C Code
              </th>
              <th className="px-6 py-3 text-left  border-b border-gray-300">
                A/C Name
              </th>
              <th className="px-6 py-3 text-left border-b border-gray-300">
                Debit
              </th>
              <th className="px-6 py-3 text-left border-b border-gray-300">
                Credit
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(trialBalanceData) &&
              trialBalanceData.map((item) => {
                return (
                  <tr className="border-gray-300 border">
                    <td className="px-5 py-2 w-[30px] border-gray-300">
                      {item.account_code}
                    </td>
                    <td className="px-5 py-2 border-gray-300 border-t">
                      {item.account_name}
                    </td>
                    <td className="px-5 py-2 border-gray-300 border-t">
                      {item.debit ? item.debit.toLocaleString() : ""}
                    </td>
                    <td className="px-5 py-2 border-gray-300 border-t">
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
