import { useRef } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import useAuth from "../../../hooks/useAuth";

const inventoryReports = [
  {
    extension: "xls",
    name: "Inventory XLS Summary",
    endpoint:
      "https://merp.efinanci.co.tz/api/erp/inventories/reports/downloadxls",
    description:
      "Download a comprehensive Excel spreadsheet summarizing your entire inventory, including quantities, values, and locations.",
  },
  {
    extension: "pdf",
    name: "Inventory Summary PDF Download",
    endpoint:
      "https://merp.efinanci.co.tz/api/erp/inventories/reports/downloadpdf",
    description:
      "Get a printable PDF overview of your inventory status, perfect for quick reviews and sharing with stakeholders.",
  },
  {
    name: "Available, Almost, Out Report",
    endpoint:
      "https://merp.efinanci.co.tz/api/erp/inventories/reports/available-out-report",
    description:
      "View a report showing items that are in stock, running low, or out of stock to manage replenishment effectively.",
  },
  {
    name: "Get Stock Taking Report",
    endpoint:
      "https://merp.efinanci.co.tz/api/erp/inventories/reports/stock-taking-report",
    description:
      "Generate a report to assist with physical inventory counts, comparing actual stock levels with system records.",
  },
  {
    name: "Get Movement Report",
    endpoint:
      "https://merp.efinanci.co.tz/api/erp/inventories/reports/movement-report",
    description:
      "Analyze the flow of inventory items over time, tracking inbound and outbound movements.",
  },
  {
    name: "Get Reorder Report",
    endpoint:
      "https://merp.efinanci.co.tz/api/erp/inventories/reports/reorder-report",
    description:
      "Identify items that need to be reordered based on current stock levels and predefined reorder points.",
  },
  {
    name: "Get Stock Aging Report",
    endpoint:
      "https://merp.efinanci.co.tz/api/erp/inventories/reports/stock-aging-report",
    description:
      "Review how long items have been in inventory to manage older stock and prevent obsolescence.",
  },
  {
    name: "Get Out of Stock Report",
    endpoint:
      "https://merp.efinanci.co.tz/api/erp/inventories/reports/out-of-stock-report",
    description:
      "List all items currently out of stock to prioritize replenishment and manage customer expectations.",
  },
  {
    name: "Get Back Order Report",
    endpoint:
      "https://merp.efinanci.co.tz/api/erp/inventories/reports/back-order-report",
    description:
      "Track unfulfilled customer orders due to stock shortages and plan for incoming inventory.",
  },
  {
    name: "Get Item Expiry Report",
    endpoint:
      "https://merp.efinanci.co.tz/api/erp/inventories/reports/item-expiry-report",
    description:
      "Monitor items with upcoming expiration dates to minimize waste and plan for clearance sales.",
  },
  {
    name: "Get Stock Transfer Report",
    endpoint:
      "https://merp.efinanci.co.tz/api/erp/inventories/reports/stock-transfer-report",
    description:
      "View all stock transfers between different locations or warehouses to maintain accurate inventory levels.",
  },
  {
    name: "Get Inventory Shrinking Report",
    endpoint:
      "https://merp.efinanci.co.tz/api/erp/inventories/reports/inventory-shrinking-report",
    description:
      "Analyze inventory losses due to theft, damage, or errors to improve inventory control measures.",
  },
  {
    name: "Get Supplier Performance Report",
    endpoint:
      "https://merp.efinanci.co.tz/api/erp/inventories/reports/supplier-performance-report",
    description:
      "Evaluate supplier reliability, delivery times, and quality to optimize your supply chain.",
  },
  {
    name: "Get Damaged Stock Report",
    endpoint:
      "https://merp.efinanci.co.tz/api/erp/inventories/reports/damaged-stock-report",
    description:
      "Track items damaged in storage or transit to manage insurance claims and improve handling procedures.",
  },
];

export default function ReportsSummary() {
  const toast = useRef<Toast>(null);
  const { token } = useAuth();

  const handleDownload = async (report: {
    name: string;
    endpoint: string;
    extension?: string;
  }) => {
    try {
      const response = await fetch(report.endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.access_token}`, // Replace with your actual token
        },
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob(); // Get the file as a Blob
      // @ts-ignore
      const filenames = response.headers
        .get("Content-Disposition")
        ?.split("filename=")[1]
        .replace(/"/g, ""); // Extract filename from headers
      const filename = new Date().toString() + "." + report.extension || "pdf";
      const url = window.URL.createObjectURL(blob); // Create a URL for the Blob
      const a = document.createElement("a"); // Create an anchor element
      console.log(response.headers.get("Content-Disposition"));

      a.href = url; // Set the href to the Blob URL
      a.download = filename || "download"; // Set the desired file name or fallback
      document.body.appendChild(a); // Append the anchor to the body
      a.click(); // Trigger a click on the anchor to start the download
      a.remove(); // Remove the anchor from the document
      window.URL.revokeObjectURL(url); // Clean up the URL object

      // Display success message
      if (toast.current) {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: `Downloading ${report.name}`,
          life: 3000,
        });
      }
    } catch (error) {
      // Display error message
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "File download failed",
          life: 3000,
        });
      }
      console.error(error);
    }
  };

  return (
    <div className="w-full mx-auto bg-white text-black p-4 rounded-lg shadow-lg">
      <Toast ref={toast} />
      <h2 className="text-2xl font-bold mb-4">Reports Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {inventoryReports.map((report, index) => (
          <div key={index} className="p-4 border rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">{report.name}</h3>
            <p className="mb-2">{report.description}</p>
            <Button
              label="Download Report"
              icon={"pi pi-download"} // PrimeReact Download Icon
              onClick={() => handleDownload(report)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
