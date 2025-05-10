import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Icon } from "@iconify/react";
import { apiRequest, baseURL } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import useAuth from "../../../hooks/useAuth";
import Header from "../../../components/custom/print_header";
import axios from "axios";
import { toast } from "react-toastify";

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

  const reactToPrintFn = async () => {
    try {
      const response = await axios.get(
        `${baseURL}reports/accounting/cashbook-download/2025-01-01/2025-04-28`,
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
          responseType: "blob", // assuming the endpoint returns a PDF
        }
      );

      // create a blob URL for the PDF and open it in a new tab
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(pdfBlob);
      window.open(url);
    } catch (error: any) {
      console.error("Error fetching income statement:", error);
      toast.error(
        error.response?.data?.message ||
          "Unable to print report. Please try again."
      );
    }
  };

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


  return (
    <div className="bg-white p-3">
      <Header title={"Cashbook Report"} />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold"></h1>
        <button
          className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
          onClick={reactToPrintFn}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print
        </button>
      </div>

      {/* Pass customHeader inside the Table component */}
      {isLoading && cashBookData == null ? (
        "Loading..."
      ) : (
        <table className="w-full">
          <thead className="border-b border-gray-300">
            <tr className="border-b border-gray-300 font-bold">
              <th className="px-6 py-3 text-left font-medium border-b border-gray-300 w-52">
                Date
              </th>
              <th className="px-6 py-3 text-left font-medium border-b border-gray-300">
                Description
              </th>
              <th className="px-6 py-3 text-left font-medium border-b border-gray-300">
                Debit
              </th>
              <th className="px-6 py-3 text-left font-medium border-b border-gray-300">
                Credit
              </th>
              <th className="px-6 py-3 text-left font-medium border-b border-gray-300">
                Balance
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(cashBookData) &&
              cashBookData.map((item) => {
                return (
                  <tr className="border-gray-300 border-r border-l">
                    <td className="px-5 py-2 w-[30px] border-gray-300">
                      {item.date}
                    </td>
                    <td className="px-5 py-2 ">{item.description}</td>
                    <td className="px-5 py-2 ">{item.debit}</td>
                    <td className="px-5 py-2 ">{item.credit}</td>
                    <td className="px-5 py-2 ">{item.balance}</td>
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
                {Array.isArray(cashBookData)
                  ? cashBookData
                      .reduce((acc, item) => acc + item.debit, 0)
                      .toLocaleString()
                  : "0"}
              </td>
              <td className="px-5 py-2 border-gray-300 border-b  font-bold">
                {Array.isArray(cashBookData)
                  ? cashBookData
                      .reduce((acc, item) => acc + item.credit, 0)
                      .toLocaleString()
                  : "0"}
              </td>
              <td className="px-5 py-2 border-gray-300 border-b  font-bold">
                {Array.isArray(cashBookData)
                  ? cashBookData
                      .reduce((acc, item) => acc + item.balance, 0)
                      .toLocaleString()
                  : "0"}
              </td>
            </tr>
          </tbody>
        </table>
      )}
      {!isLoading && cashBookData === null && "No data present"}
    </div>
  );
};

export default CashBook;
