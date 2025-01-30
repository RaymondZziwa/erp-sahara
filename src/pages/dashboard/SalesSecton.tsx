import { Card } from "primereact/card";
import { useEffect, useState } from "react";
import { Chart } from "primereact/chart";
import useAuth from "../../hooks/useAuth";
import { ServerResponse } from "../../redux/slices/types/ServerResponse";
import { REPORTS_ENDPOINTS } from "../../api/reportsEndpoints";
import { apiRequest } from "../../utils/api";

const months = ["January", "February", "March", "April", "May", "June", "July"];

interface SalesData {
  sales: Sales;
  comparison: Comparison;
}

interface Comparison {
  totalSalesyear1: number;
  totalSalesyear2: number;
  difference: number;
  percentChange: number | null;
}

interface Sales {
  year1: number[]; // Sales for last year
  year2: number[]; // Sales for current year
}

const SalesSection: React.FC = () => {
  const [data, setData] = useState<SalesData | null>(null); // Track fetched data
  const { token, isFetchingLocalToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;

    setIsLoading(true);
    try {
      const response = await apiRequest<ServerResponse<SalesData>>(
        REPORTS_ENDPOINTS.DASHBOARD.SALES,
        "GET",
        token.access_token
      );
      setData(response.data); // Set the fetched data
    } catch (error) {
      console.error("Error fetching sales data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  const currentYear = new Date().getFullYear(); // Get the current year
  const previousYear = currentYear - 1; // Calculate the previous year

  const salesData = {
    labels: months,
    datasets: [
      {
        label: `Sales ${currentYear}`, // Dynamic label for current year
        data: data?.sales.year2 || [], // Access year2 for the current year
        fill: false,
        borderColor: "#42A5F5",
        tension: 0.4,
      },
      {
        label: `Sales ${previousYear}`, // Dynamic label for previous year
        data: data?.sales.year1 || [], // Access year1 for the previous year
        fill: false,
        borderColor: "#FFA726",
        tension: 0.4,
      },
    ],
  };

  return (
    <Card
      className="bg-white shadow-md rounded-lg p-6"
      header={
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Sales</h3>
          {/* Remove dropdown if not needed */}
        </div>
      }
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-72">Loading...</div> // Loading state
      ) : (
        <Chart type="line" data={salesData} className="mt-4 h-72" />
      )}
    </Card>
  );
};

export default SalesSection;
