import { Card } from "primereact/card";
import { useEffect, useState } from "react";
import { Chart } from "primereact/chart";
import useAuth from "../../hooks/useAuth";
import { ServerResponse } from "../../redux/slices/types/ServerResponse";
import { REPORTS_ENDPOINTS } from "../../api/reportsEndpoints";
import { apiRequest } from "../../utils/api";
import { formatCurrency } from "../../utils/formatCurrency";
import { Dropdown } from "primereact/dropdown";
import { Skeleton } from "primereact/skeleton";

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
  const [error, setError] = useState<string | null>(null); // Error state

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;

    setIsLoading(true);
    setError(null); // Reset error before fetching
    try {
      const response = await apiRequest<ServerResponse<SalesData>>(
        REPORTS_ENDPOINTS.DASHBOARD.SALES,
        "GET",
        token.access_token
      );

      if (!response.data || !response.data.sales) {
        throw new Error("Invalid response format: Missing sales data.");
      }

      setData(response.data);
    } catch (err: any) {
      console.error("Error fetching sales data:", err);
      setError(err.message || "Failed to load sales data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  const salesData = {
    labels: months,
    datasets: [
      {
        label: `Sales ${currentYear}`,
        data: data?.sales?.year2 ?? Array(months.length).fill(0),
        fill: true,
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        borderColor: "#6366F1",
        tension: 0.3,
        pointBackgroundColor: "#6366F1",
        pointBorderColor: "#fff",
        pointHoverRadius: 6,
        pointRadius: 4,
      },
      {
        label: `Sales ${previousYear}`,
        data: data?.sales?.year1 ?? Array(months.length).fill(0),
        fill: true,
        backgroundColor: "rgba(156, 163, 175, 0.1)",
        borderColor: "#9CA3AF",
        tension: 0.3,
        pointBackgroundColor: "#9CA3AF",
        pointBorderColor: "#fff",
        pointHoverRadius: 6,
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
        },
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <Card className="border-round-lg shadow-2">
      <div className="flex justify-content-between align-items-center mb-4">
        <h2 className="text-900 font-semibold text-xl m-0">Sales Trend</h2>
        {/* <Dropdown
          value={range}
          options={[
            { label: "Monthly", value: "monthly" },
            { label: "Quarterly", value: "quarterly" },
            { label: "Yearly", value: "yearly" },
          ]}
          onChange={(e) => setRange(e.value)}
          placeholder="Select Range"
          className="w-10rem"
        /> */}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton width="100%" height="2rem" />
          <Skeleton width="100%" height="12rem" />
        </div>
      ) : error ? (
        <div className="flex justify-content-center align-items-center py-6">
          <span className="text-red-500">{error}</span>
        </div>
      ) : (
        <div style={{ height: "300px" }}>
          <Chart type="line" data={salesData} options={chartOptions} />
        </div>
      )}

      {data?.comparison && (
        <div className="mt-6 pt-4 border-top-1 surface-border">
          <div className="grid">
            <div className="col-12 md:col-4">
              <div className="text-600 text-sm">Current Year</div>
              <div className="text-900 font-semibold">
                {formatCurrency(data.comparison.totalSalesyear2)}
              </div>
            </div>
            <div className="col-12 md:col-4">
              <div className="text-600 text-sm">Previous Year</div>
              <div className="text-900 font-semibold">
                {formatCurrency(data.comparison.totalSalesyear1)}
              </div>
            </div>
            <div className="col-12 md:col-4">
              <div className="text-600 text-sm">Growth</div>
              <div
                className={`font-semibold ${
                  data.comparison.percentChange && data.comparison.percentChange >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {data.comparison.percentChange
                  ? `${data.comparison.percentChange.toFixed(2)}%`
                  : "N/A"}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default SalesSection;
