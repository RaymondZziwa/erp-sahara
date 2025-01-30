import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { Dropdown } from "primereact/dropdown";
import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import { REPORTS_ENDPOINTS } from "../../api/reportsEndpoints";
import { apiRequest } from "../../utils/api";
import { ServerResponse } from "../../redux/slices/types/ServerResponse";
import { formatCurrency } from "../../utils/formatCurrency";

interface ExpensesData {
  categories: Category[];
  total: number;
}

interface Category {
  label: string;
  amount: number;
}

const ExpensesSection = () => {
  const [data, setData] = useState<ExpensesData | null>(null); // Track fetched data
  const [range, setRange] = useState("monthly"); // Default to 'monthly'
  const { token, isFetchingLocalToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const calculateDateRange = (selectedRange: string) => {
    const endDate = new Date();
    let startDate = new Date();

    switch (selectedRange) {
      case "daily":
        startDate.setDate(endDate.getDate() - 1);
        break;
      case "monthly":
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case "yearly":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 1);
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = calculateDateRange(range);

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;

    setIsLoading(true);
    try {
      const response = await apiRequest<ServerResponse<ExpensesData>>(
        REPORTS_ENDPOINTS.DASHBOARD.EXPENSES({
          start_date: startDate.toISOString().slice(0, 10),
          end_date: endDate.toISOString().slice(0, 10),
        }),
        "GET",
        token.access_token
      );

      if (response.success) {
        setData(response.data); // Set the fetched data
      } else {
        console.error(response.message);
      }
    } catch (error) {
      console.error("Error fetching expenses data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFromApi(); // Fetch on mount and whenever the range changes
  }, [isFetchingLocalToken, token.access_token, range]);

  // Prepare chart data
  const expensesData = {
    labels: data?.categories.map((category) => category.label) || [],
    datasets: [
      {
        data: data?.categories.map((category) => category.amount) || [],
        backgroundColor: [
          "#FF6384", // Category 1 color
          "#36A2EB", // Category 2 color
          "#FFCE56", // Category 3 color
          // Add more colors as needed
        ],
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          // Add more hover colors as needed
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "right",
        labels: {
          usePointStyle: true,
        },
      },
    },
  };

  return (
    <Card
      className="bg-white shadow-md rounded-lg p-6"
      header={
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-semibold text-gray-800">Expenses</h3>
          <Dropdown
            value={range}
            options={[
              { label: "Daily", value: "daily" },
              { label: "Monthly", value: "monthly" },
              { label: "Yearly", value: "yearly" },
            ]}
            onChange={(e) => setRange(e.value)}
            placeholder="Select Range"
            className="w-40"
          />
        </div>
      }
    >
      <p className="text-gray-500 text-sm mb-2">
        {isLoading ? "Loading..." : "Total Expenses"}
      </p>
      <h2 className="text-3xl font-bold text-shade">
        {data ? formatCurrency(data.total) : formatCurrency(0)}
      </h2>
      {isLoading ? (
        <div className="text-center text-gray-700">Loading chart...</div>
      ) : (
        <div className="flex justify-center">
          <Chart
            type="doughnut"
            data={expensesData}
            className="mt-4 h-72"
            options={chartOptions}
          />
        </div>
      )}
    </Card>
  );
};

export default ExpensesSection;
