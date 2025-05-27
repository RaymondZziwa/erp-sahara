import React, { useEffect, useState, useRef } from "react";
import { Icon } from "@iconify/react";
import { useReactToPrint } from "react-to-print";
import Header from "../../../components/custom/print_header";
import useAuth from "../../../hooks/useAuth";
import useAssets from "../../../hooks/assets/useAssets";
import axios from "axios";
import { baseURL } from "../../../utils/api";

interface Asset {
  id: string;
  name: string;
  asset_type: string;
  serial_number?: string;
  purchase_date: string;
  purchase_cost: number;
  current_value: number;
  location: string;
  status: string;
}

const AssetRegistryReport: React.FC = () => {
  const { token } = useAuth();
  const {data: assets} = useAssets()

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const downloadPDF = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/reports/assets/assets-register/pdf`,
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
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
      console.error(error);
    }
  };

  const downloadExcel = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/reports/assets/assets-register/excel`,
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
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
      console.error(error);
    }
  };



  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Asset Registry Report</h1>
        <div className='flex flex-row gap-3'>
          <button
            className="bg-blue-600 px-3 py-1 rounded text-white flex gap-2 items-center"
            onClick={downloadPDF}
          >
            <Icon icon="solar:printer-bold" fontSize={20} />
            Download PDF
          </button>
          <button
            className="bg-blue-600 px-3 py-1 rounded text-white flex gap-2 items-center"
            onClick={downloadExcel}
          >
            <Icon icon="solar:printer-bold" fontSize={20} />
            Download Excel
          </button>
        </div>
      </div>

      {assets.length > 0 ? (
        <div className="overflow-x-auto">
          <Header title={"Asset Registry Report"} date={""} />
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serial No.
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
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{asset.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {asset.asset_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {asset.serial_number || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(asset.purchase_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {asset.purchase_cost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {asset.current_value.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {asset.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        asset.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : asset.status === "Disposed"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
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
          <p>No assets found matching your criteria</p>
        </div>
      )}

      {/* Printable content */}
      <div ref={contentRef} className="print-content hidden">
        <Header title="Asset Registry Report" date={""} />
        <div className="p-4">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Asset Name</th>
                <th className="border p-2 text-left">Type</th>
                <th className="border p-2 text-left">Serial No.</th>
                <th className="border p-2 text-left">Purchase Date</th>
                <th className="border p-2 text-left">Purchase Cost</th>
                <th className="border p-2 text-left">Current Value</th>
                <th className="border p-2 text-left">Location</th>
                <th className="border p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <td className="border p-2">{asset.name}</td>
                  <td className="border p-2">{asset.asset_type}</td>
                  <td className="border p-2">{asset.serial_number || "-"}</td>
                  <td className="border p-2">
                    {new Date(asset.purchase_date).toLocaleDateString()}
                  </td>
                  <td className="border p-2">
                    ${asset.purchase_cost.toLocaleString()}
                  </td>
                  <td className="border p-2">
                    ${asset.current_value.toLocaleString()}
                  </td>
                  <td className="border p-2">{asset.location}</td>
                  <td className="border p-2">{asset.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 text-xs text-gray-500">
            Generated on: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetRegistryReport;
