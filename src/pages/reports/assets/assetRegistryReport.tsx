import React, { useEffect, useState, useRef } from "react";
import { Icon } from "@iconify/react";
import { useReactToPrint } from "react-to-print";
import Header from "../../../components/custom/print_header";
import useAuth from "../../../hooks/useAuth";
import useAssets from "../../../hooks/assets/useAssets";
import axios from "axios";
import { apiRequest, baseURL } from "../../../utils/api";
import CustomReportHeader from "../../../components/custom/customReportHeader";
import { PropagateLoader } from "react-spinners";

interface Asset {
  id: string;
  name: string;
  asset_type: string;
  identity_no: string;
  asset_category: {
    name: string;
  };
  purchase_date: string;
  purchase_cost: string;
  current_value: string | null;
  accumulated_depreciation: string;
  branch_id: string;
  status: string;
  condition: string;
  serial_number?: string;
  location?: string;
}

interface ApiResponse {
  data: Asset[];
  success: boolean;
  message: string;
}

const AssetRegistryReport: React.FC = () => {
  const { token } = useAuth();
  const { data: assets = [] } = useAssets();
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<Asset[]>([]);
  const [isFetchingLocalToken, setIsFetchingLocalToken] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  // Fetch data from API
  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token?.access_token) return;
    
    setIsLoading(true);
    try {
      const response = await apiRequest<ApiResponse>(
        '/reports/assets/assets-register',
        "GET",
        token.access_token
      );
      
      // Set the report data from the API response
      if (response.data && Array.isArray(response.data)) {
        setReportData(response.data);
      } else {
        setReportData([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Use either the hook data or fetched API data
  const displayData = assets && assets.length > 0 ? assets : reportData;

  useEffect(() => {
    // If no assets from hook, fetch from API
    if (!assets || assets.length === 0) {
      fetchDataFromApi();
    }
  }, [assets, token]);

  const downloadPDF = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/reports/assets/assets-register/pdf`,
        {
          headers: {
            Authorization: `Bearer ${token?.access_token}`,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "assets-register.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  const downloadExcel = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/reports/assets/assets-register/excel`,
        {
          headers: {
            Authorization: `Bearer ${token?.access_token}`,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "assets-register.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading Excel:", error);
    }
  };

  const handlePrint = () => {
    reactToPrintFn();
  };

  // Format currency
  const formatCurrency = (amount: string | null) => {
    if (!amount) return "-";
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge class
  const getStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "available":
        return "bg-green-100 text-green-800";
      case "disposed":
      case "sold":
        return "bg-red-100 text-red-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <PropagateLoader color="#007f80"/>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <CustomReportHeader printfn={downloadPDF} exportPdf={downloadPDF}  exportExcel={downloadExcel}/>
      <div className="flex justify-between items-center mt-16">
        <Header title={"Asset Registry Report"} />
      </div>

      {displayData.length > 0 ? (
        <div className="overflow-x-auto">
          <div className="mb-4 text-sm text-gray-600">
            Total Assets: {displayData.length}
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset Name
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchase Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchase Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accumulated Depreciation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayData.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {asset.name}
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {asset.asset_category?.name || "-"}
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {asset.identity_no || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(asset.purchase_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    UGX {formatCurrency(asset.purchase_cost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {asset.current_value ? `UGX ${formatCurrency(asset.current_value)}` : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    UGX {formatCurrency(asset.accumulated_depreciation)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {asset.condition || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(asset.status)}`}
                    >
                      {asset.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex justify-center items-center p-8">
          <div className="text-center">
            <Icon icon="solar:box-bold" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No assets found</p>
            <p className="text-gray-400 text-sm">There are no assets matching your criteria</p>
          </div>
        </div>
      )}

      {/* Printable content */}
      <div ref={contentRef} className="print-content hidden">
        <Header title="Asset Registry Report" date={new Date().toLocaleDateString()} />
        <div className="p-4">
          <div className="mb-4 text-sm text-gray-600">
            Generated on: {new Date().toLocaleDateString()} | Total Assets: {displayData.length}
          </div>
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left text-xs font-medium">Asset Name</th>
                <th className="border border-gray-300 p-2 text-left text-xs font-medium">Category</th>
                <th className="border border-gray-300 p-2 text-left text-xs font-medium">ID Number</th>
                <th className="border border-gray-300 p-2 text-left text-xs font-medium">Purchase Date</th>
                <th className="border border-gray-300 p-2 text-left text-xs font-medium">Purchase Cost (UGX)</th>
                <th className="border border-gray-300 p-2 text-left text-xs font-medium">Current Value (UGX)</th>
                <th className="border border-gray-300 p-2 text-left text-xs font-medium">Accumulated Depreciation (UGX)</th>
                <th className="border border-gray-300 p-2 text-left text-xs font-medium">Condition</th>
                <th className="border border-gray-300 p-2 text-left text-xs font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((asset) => (
                <tr key={asset.id}>
                  <td className="border border-gray-300 p-2 text-sm">{asset.name}</td>
                  <td className="border border-gray-300 p-2 text-sm">{asset.asset_category?.name || "-"}</td>
                  <td className="border border-gray-300 p-2 text-sm">{asset.identity_no || "-"}</td>
                  <td className="border border-gray-300 p-2 text-sm">{formatDate(asset.purchase_date)}</td>
                  <td className="border border-gray-300 p-2 text-sm">{formatCurrency(asset.purchase_cost)}</td>
                  <td className="border border-gray-300 p-2 text-sm">{asset.current_value ? formatCurrency(asset.current_value) : "-"}</td>
                  <td className="border border-gray-300 p-2 text-sm">{formatCurrency(asset.accumulated_depreciation)}</td>
                  <td className="border border-gray-300 p-2 text-sm">{asset.condition || "-"}</td>
                  <td className="border border-gray-300 p-2 text-sm">{asset.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-6 text-xs text-gray-500 border-t pt-2">
            <p>This report was generated automatically from the asset management system.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetRegistryReport;