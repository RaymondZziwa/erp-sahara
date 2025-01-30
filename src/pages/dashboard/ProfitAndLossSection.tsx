import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import React, { useEffect, useState } from "react";
import { formatCurrency } from "../../utils/formatCurrency";
import { REPORTS_ENDPOINTS } from "../../api/reportsEndpoints";
import { apiRequest } from "../../utils/api";
import { ServerResponse } from "../../redux/slices/types/ServerResponse";
import useAuth from "../../hooks/useAuth";

interface ProfitAndLossData {
  net_income: number;
  income: number;
  expenses: number;
}

interface RevenueGrowth {
  percentage_growth: number;
  current_year: number;
  previous_year: number;
}

const ProfitAndLossSection: React.FC = () => {
  const [data, setData] = useState<ProfitAndLossData | null>(null);
  const [revenueGrowth, setRevenueGrowth] = useState<RevenueGrowth | null>(
    null
  );
  const [range, setRange] = useState("monthly"); // Default range
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

  const fetchData = async () => {
    const params = new URLSearchParams({
      start_date: startDate.toISOString().slice(0, 10),
      end_date: endDate.toISOString().slice(0, 10),
    });

    if (isFetchingLocalToken || !token.access_token) return;

    setIsLoading(true);
    try {
      const response = await apiRequest<ServerResponse<ProfitAndLossData>>(
        REPORTS_ENDPOINTS.DASHBOARD.PROFIT_AND_LOSS({
          start_date: params.get("start_date")!,
          end_date: params.get("end_date")!,
        }),
        "GET",
        token.access_token
      );

      if (response.success) {
        setData(response.data);

        // Fetch revenue growth data
        const revenueResponse = await apiRequest<ServerResponse<RevenueGrowth>>(
          REPORTS_ENDPOINTS.DASHBOARD.REVENUE_GROWTH({
            start_date: params.get("start_date")!,
            end_date: params.get("end_date")!,
          }),
          "GET",
          token.access_token
        );

        if (revenueResponse.success) {
          setRevenueGrowth(revenueResponse.data);
        } else {
          console.error(revenueResponse.message);
        }
      } else {
        console.error(response.message);
      }
    } catch (error) {
      console.error("Error fetching profit and loss data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [range]); // Fetch data when the range changes

  return (
    <Card
      className="bg-white shadow-lg rounded-lg p-6"
      header={
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-semibold text-gray-800">
            Profit and Loss
          </h3>
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
        Date Range: {startDate?.toLocaleDateString()} -{" "}
        {endDate?.toLocaleDateString()}
      </p>
      {isLoading ? (
        <p className="text-center text-gray-700">Loading...</p>
      ) : (
        <>
          <h2
            className="text-4xl font-bold"
            style={{
              color: data && data.net_income >= 0 ? "#4CAF50" : "#F44336",
            }}
          >
            {data ? formatCurrency(data.net_income) : formatCurrency(0)}
          </h2>
          <div className="mt-4">
            <p className="flex justify-between text-gray-700">
              <span>Income:</span>
              <span
                className="font-bold"
                style={{
                  color: data && data.income >= 0 ? "#4CAF50" : "#F44336",
                }}
              >
                {data ? formatCurrency(data.income) : formatCurrency(0)}
              </span>
            </p>
            <p className="flex justify-between text-gray-700">
              <span>Expenses:</span>
              <span
                className="font-bold"
                style={{
                  color: data && data.expenses >= 0 ? "#F44336" : "#4CAF50",
                }}
              >
                {data ? formatCurrency(data.expenses) : formatCurrency(0)}
              </span>
            </p>
          </div>
          {revenueGrowth && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Revenue Growth
              </h3>
              <p className="flex justify-between text-gray-700">
                <span>Current Year:</span>
                <span
                  className="font-bold"
                  style={{
                    color:
                      revenueGrowth.current_year >= 0 ? "#4CAF50" : "#F44336",
                  }}
                >
                  {formatCurrency(revenueGrowth.current_year)}
                </span>
              </p>
              <p className="flex justify-between text-gray-700">
                <span>Previous Year:</span>
                <span
                  className="font-bold"
                  style={{
                    color:
                      revenueGrowth.previous_year >= 0 ? "#4CAF50" : "#F44336",
                  }}
                >
                  {formatCurrency(revenueGrowth.previous_year)}
                </span>
              </p>
              <p className="flex justify-between text-gray-700">
                <span>Percentage Growth:</span>
                <span
                  className="font-bold"
                  style={{
                    color:
                      revenueGrowth.percentage_growth >= 0
                        ? "#4CAF50"
                        : "#F44336",
                  }}
                >
                  {`${revenueGrowth.percentage_growth.toFixed(2)}%`}
                </span>
              </p>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default ProfitAndLossSection;
