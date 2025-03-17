//@ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { apiRequest } from "../../../utils/api";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import useAuth from "../../../hooks/useAuth";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import { useReactToPrint } from "react-to-print";
import { PrintableContent } from "./IS_print_template";
import Logo from "../../../assets/images/logos/ltcu.jpeg";

interface IncomeStatementData {
  group_name: string;
  categories: {
    category_name: string;
    current_total: number;
    children: {
      category_name: string;
      current_total: number;
      ledgers: {
        ledger_name: string;
        current_amount: number;
      }[];
    }[];
  }[];
}

function IncomeStatementReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [incomeStatementData, setIncomeStatementData] = useState<
    IncomeStatementData[] | null
  >(null);
  const [openModalData, setOpenModalData] = useState<{
    category_name: string;
    ledgers: { ledger_name: string; current_amount: number }[];
  } | null>(null);

  const { token, isFetchingLocalToken } = useAuth();

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;
    setIsLoading(true);
    try {
      const response = await apiRequest<ServerResponse<IncomeStatementData[]>>(
        REPORTS_ENDPOINTS.DETAILED_INCOME_STATEMENT.GET_ALL,
        "GET",
        token.access_token
      );
      console.log("isreport", response.data);
      setIncomeStatementData(response.data); // Set the data property of the response
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateGrossProfit = (categories) => {
    // Find Total Income (Sales Revenue)
    const salesRevenueCategory = categories.find(
      (category) => category.category_name === "Sales Revenue"
    );
    const totalIncome = salesRevenueCategory
      ? salesRevenueCategory.current_total
      : 0;

    // Find Total Direct Costs
    const directCostsCategory = categories.find(
      (category) => category.category_name === "Direct Costs"
    );
    const totalDirectCosts = directCostsCategory
      ? directCostsCategory.current_total
      : 0;

    // Gross Profit = Total Income - Total Direct Costs
    return totalIncome - totalDirectCosts;
  };

  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  // Function to open the modal
  const handleRowClick = (child: {
    category_name: string;
    ledgers: { ledger_name: string; current_amount: number }[];
  }) => {
    // Check if the child has ledgers
    if (child.ledgers && child.ledgers.length > 0) {
      setOpenModalData(child);
    }
  };

  // Function to close the modal
  const closeModal = () => {
    setOpenModalData(null);
  };

  return (
    <div className="bg-white p-3">
      <div className="flex justify-end items-center mb-4">
        <button
          className="bg-shade p-3 rounded text-white flex gap-2 items-center"
          onClick={() => reactToPrintFn()}
        >
          <Icon icon="solar:printer-bold" fontSize={20} />
          Print
        </button>
      </div>

      <div className="flex flex-row justify-between items-center">
        <img src={Logo} alt="" className="w-20 h-18 mb-4" />
        <p className="font-bold text-2xl">Income Statement Report</p>
      </div>

      {incomeStatementData ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  colSpan={2}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {incomeStatementData[0].group_name}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Map through categories */}
              {incomeStatementData[0].categories.map((category, index) => (
                <React.Fragment key={index}>
                  {/* Parent Category */}
                  <tr>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <strong>{category.category_name}</strong>
                    </td>
                  </tr>

                  {/* Map through children */}
                  {category.children.map((child, childIndex) => (
                    <React.Fragment key={childIndex}>
                      {/* Child Category */}

                      {/* Map through nested children (category.children.children) */}
                      {child.children &&
                        child.children.map((nestedChild, nestedChildIndex) => (
                          <React.Fragment key={nestedChildIndex}>
                            {/* Nested Child Category */}
                            <tr
                              onClick={() => handleRowClick(nestedChild)}
                              className={`${
                                nestedChild.ledgers &&
                                nestedChild.ledgers.length > 0
                                  ? "cursor-pointer hover:bg-gray-50"
                                  : "cursor-default"
                              }`}
                            >
                              <td className="px-14 py-4 text-gray-700">
                                {nestedChild.child_name}
                              </td>
                              <td className="px-6 py-4 text-gray-500">
                                {nestedChild.current_total}
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      <tr
                        onClick={() => handleRowClick(child)}
                        className={`${
                          child.ledgers && child.ledgers.length > 0
                            ? "cursor-pointer hover:bg-gray-50"
                            : "cursor-default"
                        }`}
                      >
                        <td className="px-10 py-4 text-gray-700">
                          Total {child.category_name}
                        </td>
                        <td className="px-6 py-4 text-gray-500  border-t-2 border-black">
                          {child.current_total}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}

              {/* Gross Profit */}
              <tr>
                <td className="px-6 py-4 font-medium text-gray-900">
                  Gross Profit/Loss
                </td>
                <td className="px-6 py-4 text-gray-500 font-bold border-t-2 border-black">
                  {calculateGrossProfit(incomeStatementData[0].categories) ||
                    "XXXXX"}
                </td>
              </tr>
            </tbody>
          </table>
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  colSpan={2}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {incomeStatementData[1].group_name}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Map through categories */}
              {incomeStatementData[1].categories.map((category, index) => (
                <React.Fragment key={index}>
                  {/* Parent Category */}
                  <tr>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <strong>{category.category_name}</strong>
                    </td>
                  </tr>

                  {/* Map through children */}
                  {category.children.map((child, childIndex) => (
                    <React.Fragment key={childIndex}>
                      {/* Child Category */}

                      {/* Map through nested children (category.children.children) */}
                      {child.children &&
                        child.children.map((nestedChild, nestedChildIndex) => (
                          <React.Fragment key={nestedChildIndex}>
                            {/* Nested Child Category */}
                            <tr
                              onClick={() => handleRowClick(nestedChild)}
                              className={`${
                                nestedChild.ledgers &&
                                nestedChild.ledgers.length > 0
                                  ? "cursor-pointer hover:bg-gray-50"
                                  : "cursor-default"
                              }`}
                            >
                              <td className="px-14 py-4 text-gray-700">
                                {nestedChild.child_name}
                              </td>
                              <td className="px-6 py-4 text-gray-500">
                                {nestedChild.current_total}
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      <tr
                        onClick={() => handleRowClick(child)}
                        className={`${
                          child.ledgers && child.ledgers.length > 0
                            ? "cursor-pointer hover:bg-gray-50"
                            : "cursor-default"
                        }`}
                      >
                        <td className="px-10 py-4 text-gray-700">
                          Total {child.category_name}
                        </td>
                        <td className="px-6 py-4 text-gray-500  border-t-2 border-black">
                          {child.current_total}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}

              {/* Gross Profit */}
              <tr>
                <td className="px-6 py-4 font-medium text-gray-900">
                  NET Profit/Loss
                </td>
                <td className="px-6 py-4 text-gray-500 font-bold border-t-2 border-black">
                  {calculateGrossProfit(incomeStatementData[0].categories) ||
                    "XXXXX"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex justify-center items-center bg-red">
          <p>Initializing report. Please be patient....</p>
        </div>
      )}

      {/* Modal for Ledgers */}
      {openModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900">
                Ledgers for {openModalData.child_name}
              </h2>
              <table className="min-w-full mt-4">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ledger Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {openModalData.ledgers && openModalData.ledgers.length > 0 ? (
                    openModalData.ledgers.map((ledger, ledgerIndex) => (
                      <tr key={ledgerIndex}>
                        <td className="px-6 py-4 text-gray-700">
                          {ledger.ledger_name}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {ledger.current_amount}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-6 py-4 text-gray-500 italic"
                      >
                        No ledgers available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end p-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div ref={contentRef} className="print-content">
        <PrintableContent
          reportName={"Income Statement Report"}
          incomeStatementData={incomeStatementData}
        />
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
        </style>
      </div>

      {!isLoading && incomeStatementData === null && "No data present"}
    </div>
  );
}

export default IncomeStatementReport;
