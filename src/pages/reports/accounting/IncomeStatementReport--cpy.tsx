// import React, { useState, useEffect, useRef } from "react";
// import { Icon } from "@iconify/react";
// import { apiRequest, baseURL } from "../../../utils/api";
// import useAuth from "../../../hooks/useAuth";
// import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
// import Header from "../../../components/custom/print_header";
// import axios from "axios";
// import CustomReportHeader from "../../../components/custom/customReportHeader";
// import { PropagateLoader } from "react-spinners";

// interface Account {
//   id: number;
//   code: string;
//   name: string;
//   subcategory_name: string;
//   subcategory_code: number;
//   total: number;
//   total_amount: number;
// }

// interface FinancialItem {
//   id: number;
//   name: string;
//   code: number;
//   total: number;
//   accounts?: Account[];
//   children: FinancialItem[];
// }

// interface ReportItem {
//   name: string;
//   subcategories: FinancialItem[];
// }

// interface ReportSection {
//   section: string;
//   items?: ReportItem[];
//   name?: string;
//   totals?: {
//     [key: string]: number;
//   };
// }

// interface ApiResponse {
//   current_period: ReportSection[];
//   comparison: ReportSection[];
// }

// const IncomeStatementReport = () => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [reportData, setReportData] = useState<ReportSection[] | null>(null);
//   const [ledgerModal, setLedgerModal] = useState<{
//     title: string;
//     ledgers: { ledger_name: string; current_amount: number }[];
//     isLoading: boolean;
//   } | null>(null);

//   const { token, isFetchingLocalToken } = useAuth();
//   const contentRef = useRef<HTMLDivElement>(null);

//   const today = new Date();
//   const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
//   const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//   const [filters] = useState({
//     start_date: startOfMonth.toISOString().split("T")[0],
//     end_date: endOfMonth.toISOString().split("T")[0],
//   });

//   const print = async () => {
//     try {
//       setIsLoading(true);
//       const response = await axios.get(
//         `${baseURL}/reports/accounting/print-income-statement`,
//         {
//           responseType: "blob",
//           headers: {
//             Authorization: `Bearer ${token.access_token || ""}`,
//           },
//         }
//       );

//       const file = new Blob([response.data], { type: "application/pdf" });
//       const fileURL = URL.createObjectURL(file);
//       window.open(fileURL, "_blank");
//       setIsLoading(false);
//     } catch (error) {
//       console.error("Error previewing the trial balance report:", error);
//       setIsLoading(false);
//     }
//   };

//   const fetchDataFromApi = async () => {
//     if (isFetchingLocalToken || !token.access_token) return;
//     setIsLoading(true);
//     try {
//       const response = await apiRequest<ApiResponse>(
//         REPORTS_ENDPOINTS.DETAILED_INCOME_STATEMENT.GET_ALL,
//         "GET",
//         token.access_token
//       );
      
//       if (response.data && response.data.current_period) {
//         setReportData(response.data.current_period);
//       } else {
//         setReportData(null);
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       setReportData(null);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const fetchLedgerDetails = async (categoryId: number, title: string) => {
//     setLedgerModal({
//       title,
//       ledgers: [],
//       isLoading: true,
//     });

//     try {
//       const response = await apiRequest<any>(
//         `/reports/accounting/get-category-ledger-totals/${categoryId}`,
//         "GET",
//         token.access_token
//       );

//       setLedgerModal({
//         title,
//         ledgers: response.data || [],
//         isLoading: false,
//       });
//     } catch (error) {
//       console.error("Error fetching ledger details:", error);
//       setLedgerModal((prev) =>
//         prev ? { ...prev, isLoading: false, ledgers: [] } : null
//       );
//     }
//   };

//   const handleCategoryClick = (categoryId: number, title: string) => {
//     fetchLedgerDetails(categoryId, title);
//   };

//   const closeModal = () => setLedgerModal(null);

//   // Helper function to format currency
//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-US').format(amount);
//   };

//   // Helper function to check if a section has data
//   const hasData = (section: ReportSection) => {
//     if (section.totals) return true;
    
//     if (section.items) {
//       return section.items.some(item =>
//         item.subcategories.some(subcategory => 
//           // subcategory.total !== 0 || 
//           subcategory.accounts?.some(account => account.total_amount !== 0)
//         )
//       );
//     }
    
//     return false;
//   };

//   // Helper function to render a financial item
//   const renderFinancialItem = (item: FinancialItem, level: number = 0) => {
//     const hasAccounts = item.accounts && item.accounts.length > 0;
//     const hasNonZeroAccounts = item.accounts?.some(acc => acc.total_amount !== 0);
//     const hasChildren = item.children && item.children.length > 0;

//     return (
//       <React.Fragment key={item.id}>
//         {/* Main Item Row */}
//         {(item.total !== 0 || hasNonZeroAccounts) && (
//           <tr 
//             className={`hover:bg-gray-50 ${hasAccounts ? 'cursor-pointer' : ''}`}
//             onClick={hasAccounts ? () => handleCategoryClick(item.id, item.name) : undefined}
//           >
//             <td className={`py-2 ${level === 0 ? 'pl-4 font-semibold' : level === 1 ? 'pl-8' : 'pl-12'} ${level === 0 ? 'bg-gray-50' : ''}`}>
//               {item.name}
//             </td>
//             <td className="py-2 text-right pr-6 font-medium">
//               {formatCurrency(item.total)}
//             </td>
//           </tr>
//         )}

//         {/* Accounts */}
//         {hasNonZeroAccounts && item.accounts?.map((account) => (
//           account.total_amount !== 0 && (
//             <tr key={account.id} className="hover:bg-gray-50">
//               <td className="py-1 pl-12 text-sm text-gray-600">
//                 {account.name}
//               </td>
//               <td className="py-1 text-right pr-6 text-sm">
//                 {formatCurrency(account.total_amount)}
//               </td>
//             </tr>
//           )
//         ))}

//         {/* Children */}
//         {hasChildren && item.children.map(child => 
//           renderFinancialItem(child, level + 1)
//         )}
//       </React.Fragment>
//     );
//   };

//   useEffect(() => {
//     fetchDataFromApi();
//   }, [isFetchingLocalToken, token.access_token]);

//   return (
//     <div className="bg-white p-4 rounded-lg shadow">
//       <CustomReportHeader printfn={print} loading={isLoading} />

//       <div className="flex flex-row justify-center items-center mt-16">
//         <Header title={"Income Statement"} />
//       </div>
      
//       {(filters.start_date || filters.end_date) && (
//         <div className="text-center mb-4 text-sm text-gray-600">
//           Period: {new Date(filters.start_date).toLocaleDateString()} - {new Date(filters.end_date).toLocaleDateString()}
//         </div>
//       )}

//       {isLoading ? (
//         <div className="flex justify-center items-center p-8">
//           <PropagateLoader color="#007f80" />
//         </div>
//       ) : reportData && reportData.length > 0 ? (
//         <div className="overflow-x-auto" ref={contentRef}>
//           <table className="min-w-full bg-white border border-gray-200">
//             <tbody className="divide-y divide-gray-200">
//               {reportData.map((section, sectionIndex) => (
//                 hasData(section) && (
//                   <React.Fragment key={sectionIndex}>
//                     {/* Section Header */}
//                     <tr className="bg-teal-500 text-white">
//                       <td colSpan={2} className="py-3 px-4 font-bold text-lg">
//                         {section.section}
//                       </td>
//                     </tr>

//                     {/* Revenue and Costs Section */}
//                     {section.section === "Revenue and Costs" && section.items?.map((item, itemIndex) => (
//                       <React.Fragment key={itemIndex}>
//                         {/* Item Header */}
//                         <tr className="bg-gray-100">
//                           <td colSpan={2} className="py-2 px-4 font-semibold">
//                             {item.name}
//                           </td>
//                         </tr>

//                         {/* Subcategories */}
//                         {item.subcategories.map((subcategory) => (
//                           renderFinancialItem(subcategory, 0)
//                         ))}
//                       </React.Fragment>
//                     ))}

//                     {/* Income and Expenses Section */}
//                     {section.section === "Income and Expenses" && section.items?.map((item, itemIndex) => (
//                       <React.Fragment key={itemIndex}>
//                         {/* Item Header */}
//                         <tr className="bg-gray-100">
//                           <td colSpan={2} className="py-2 px-4 font-semibold">
//                             {item.name}
//                           </td>
//                         </tr>

//                         {/* Subcategories */}
//                         {item.subcategories.map((subcategory) => (
//                           renderFinancialItem(subcategory, 0)
//                         ))}
//                       </React.Fragment>
//                     ))}

//                     {/* Summary Section */}
//                     {section.section === "Summary" && section.totals && (
//                       <>
//                         {/* Summary Header */}
//                         <tr className="bg-gray-100">
//                           <td colSpan={2} className="py-2 px-4 font-semibold">
//                             {section.name || "Financial Summary"}
//                           </td>
//                         </tr>

//                         {/* Summary Totals */}
//                         {Object.entries(section.totals).map(([key, value]) => (
//                           <tr 
//                             key={key} 
//                             className={key === "Net Profit/Loss" ? "bg-yellow-50 font-bold border-t-2 border-gray-300" : ""}
//                           >
//                             <td className={`py-2 px-4 ${key === "Net Profit/Loss" ? "font-bold text-lg" : ""}`}>
//                               {key}
//                             </td>
//                             <td className={`py-2 text-right pr-6 ${key === "Net Profit/Loss" ? "font-bold text-lg" : "font-medium"}`}>
//                               {formatCurrency(value)}
//                             </td>
//                           </tr>
//                         ))}
//                       </>
//                     )}

//                     {/* Section Spacer */}
//                     <tr>
//                       <td colSpan={2} className="py-2"></td>
//                     </tr>
//                   </React.Fragment>
//                 )
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         <div className="flex justify-center items-center p-8">
//           <div className="text-center">
//             <Icon icon="solar:chart-bold" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//             <p className="text-gray-500 text-lg">No financial data available</p>
//             <p className="text-gray-400 text-sm">No income statement data found for the current period</p>
//           </div>
//         </div>
//       )}

//       {/* Ledger Details Modal */}
//       {ledgerModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
//             <div className="p-6 flex justify-between items-center border-b">
//               <h3 className="text-lg font-semibold">
//                 Ledger Details: {ledgerModal.title}
//               </h3>
//               <button
//                 onClick={closeModal}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <Icon icon="mdi:close" fontSize={24} />
//               </button>
//             </div>

//             <div className="overflow-y-auto flex-1">
//               {ledgerModal.isLoading ? (
//                 <div className="flex justify-center items-center p-8">
//                   <PropagateLoader color="#007f80" size={10} />
//                 </div>
//               ) : ledgerModal.ledgers.length > 0 ? (
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                         Ledger Name
//                       </th>
//                       <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
//                         Amount
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {ledgerModal.ledgers.map((ledger, index) => (
//                       <tr key={index} className="hover:bg-gray-50">
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           {ledger.ledger_name}
//                         </td>
//                         <td className="px-6 py-4 text-right font-medium">
//                           {formatCurrency(ledger.current_amount || 0)}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               ) : (
//                 <div className="flex justify-center items-center p-8">
//                   <p className="text-gray-500">No ledger details available</p>
//                 </div>
//               )}
//             </div>

//             <div className="p-4 border-t flex justify-end">
//               <button
//                 onClick={closeModal}
//                 className="px-4 py-2 bg-teal-500 text-white hover:bg-teal-600 rounded-md transition-colors"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default IncomeStatementReport;