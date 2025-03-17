//@ts-nocheck
import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import Logo from "../../../assets/images/logos/ltcu.jpeg";
import { useReactToPrint } from "react-to-print";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import useAuth from "../../../hooks/useAuth";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import { apiRequest } from "../../../utils/api";

interface Account {
  account_code: string;
  account_name: string;
  balance: number;
}

interface Subcategory {
  subcategory_name: string;
  subcategory_total: number;
  accounts: Account[];
}

function ComparisonBalanceSheet() {
    const [incomeStatement, setIncomeStatement] =
      useState<ComparisonBalanceSheet | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { token, isFetchingLocalToken } = useAuth();

    const fetchDataFromApi = async () => {
      if (isFetchingLocalToken || !token.access_token) return;
      setIsLoading(true);
      try {
        const response = await apiRequest<
          ServerResponse<ComparisonBalanceSheet>
        >(
          REPORTS_ENDPOINTS.COMPARISON_BALANCE_SHEET.GET_ALL,
          "GET",
          token.access_token
        );
        console.log("resp", response.data);

        setIncomeStatement(response.data.data as ComparisonBalanceSheet);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    console.log("is", incomeStatement);
    useEffect(() => {
      fetchDataFromApi();
    }, [isFetchingLocalToken, token.access_token]);

    const { assets, equity, liabilities } = incomeStatement || {
      assets: [],
      equity: [],
      liabilities: [],
    };

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  // Function to open the modal
  const handleRowClick = (accounts: Account[]) => {
    setOpenModalData(accounts);
  };

  // Function to close the modal
  const closeModal = () => {
    setOpenModalData(null);
  };

  return (
    <div className="bg-white p-3">
      <div className="flex justify-end items-center mb-4">
        <button
          className="bg-shade px-2 py-1 rounded text-white flex gap-2 items-center"
          onClick={() => reactToPrintFn()}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print
        </button>
      </div>
      <div className="flex flex-row justify-between items-center">
        <img src={Logo} alt="" className="w-20 h-18 mb-4" />
        <p className="font-bold text-2xl">Comparison Balance Sheet Report</p>
      </div>
      <table className="w-full">
        <tbody>
          {/* Assets Section */}
          <tr className="font-bold bg-gray-300">
            <td className="p-3" colSpan={2}>
              ASSETS
            </td>
          </tr>
          {assets?.map((item) => (
            <React.Fragment key={item.subcategory_name}>
              <tr
                className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                onClick={() => handleRowClick(item.accounts)}
              >
                <td className="p-3">{item.subcategory_name}</td>
                <td className="p-3 text-right">
                  {item.subcategory_total.toLocaleString()}
                </td>
              </tr>
            </React.Fragment>
          ))}
          <tr className="font-bold bg-gray-200">
            <td className="p-3">TOTAL ASSETS</td>
            <td className="p-3 text-right border-t-2 border-black">
              {assets
                ?.reduce((acc, item) => acc + item.subcategory_total, 0)
                .toLocaleString()}
            </td>
          </tr>

          {/* Equity Section */}
          <tr className="font-bold bg-gray-300">
            <td className="p-3" colSpan={2}>
              EQUITY
            </td>
          </tr>
          {equity?.map((item) => (
            <React.Fragment key={item.subcategory_name}>
              <tr
                className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                onClick={() => handleRowClick(item.accounts)}
              >
                <td className="p-3">{item.subcategory_name}</td>
                <td className="p-3 text-right">
                  {item.subcategory_total.toLocaleString()}
                </td>
              </tr>
            </React.Fragment>
          ))}
          <tr className="font-bold bg-gray-200">
            <td className="p-3">TOTAL EQUITY</td>
            <td className="p-3 text-right border-t-2 border-black">
              {equity
                ?.reduce((acc, item) => acc + item.subcategory_total, 0)
                .toLocaleString()}
            </td>
          </tr>

          {/* Liabilities Section */}
          <tr className="font-bold bg-gray-300">
            <td className="p-3" colSpan={2}>
              LIABILITIES
            </td>
          </tr>
          {liabilities?.map((item) => (
            <React.Fragment key={item.subcategory_name}>
              <tr
                className="bg-gray-100 cursor-pointer hover:bg-gray-200"
                onClick={() => handleRowClick(item.accounts)}
              >
                <td className="p-3">{item.subcategory_name}</td>
                <td className="p-3 text-right">
                  {item.subcategory_total.toLocaleString()}
                </td>
              </tr>
            </React.Fragment>
          ))}
          <tr className="font-bold bg-gray-200">
            <td className="p-3">TOTAL LIABILITIES</td>
            <td className="p-3 text-right border-t-2 border-black">
              {liabilities
                ?.reduce((acc, item) => acc + item.subcategory_total, 0)
                .toLocaleString()}
            </td>
          </tr>

          {/* Profit/Loss Section */}
          <tr className="font-bold bg-gray-200">
            <td className="p-3">PROFIT/LOSS</td>
            <td className="p-3 text-right">
              {/* {data.current_profit_or_loss
                ? data?.current_profit_or_loss.toLocaleString()
                : 0} */}
            </td>
          </tr>
        </tbody>
      </table>

     

      <div ref={contentRef} className="print-content">
        {/* <PrintableContent reportName={"Balance Report"} />
        <style>
          {`
                   @media print {
                      .print-content {
                        display: block !important;
                      }
                    }
                    .print-content {
                      display: none;
                    }
                `}
        </style> */}
      </div>
    </div>
  );
}

export default ComparisonBalanceSheet;
