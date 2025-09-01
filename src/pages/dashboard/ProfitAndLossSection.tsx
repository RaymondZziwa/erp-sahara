import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import React, { useEffect, useState } from "react";
import { formatCurrency } from "../../utils/formatCurrency";
import { REPORTS_ENDPOINTS } from "../../api/reportsEndpoints";
import { apiRequest } from "../../utils/api";
import { ServerResponse } from "../../redux/slices/types/ServerResponse";
import useAuth from "../../hooks/useAuth";
import { Skeleton } from "primereact/skeleton";
import { ProgressBar } from "primereact/progressbar";

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
    <Card className="border-round-lg shadow-2">
    <div className="flex justify-content-between align-items-center mb-4">
      <div>
        <h2 className="text-900 font-semibold text-xl m-0">Profit & Loss</h2>
        <span className="text-600 text-sm">
          {startDate?.toLocaleDateString()} - {endDate?.toLocaleDateString()}
        </span>
      </div>
      {/* <Dropdown
        value={range}
        options={[
          { label: "Daily", value: "daily" },
          { label: "Monthly", value: "monthly" },
          { label: "Yearly", value: "yearly" },
        ]}
        onChange={(e) => setRange(e.value)}
        placeholder="Select Range"
        className="w-10rem ml-20"
      /> */}
    </div>

    {isLoading ? (
      <div className="space-y-4">
        <Skeleton width="100%" height="2rem" />
        <Skeleton width="100%" height="4rem" />
        <Skeleton width="100%" height="1rem" />
        <Skeleton width="100%" height="1rem" />
      </div>
    ) : (
      <>
        <div className="mb-6">
          <div className="text-600 text-sm mb-2">Net Income</div>
          <div
            className={`text-4xl font-bold ${
              data?.net_income >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {data ? formatCurrency(data.net_income) : formatCurrency(0)}
          </div>
        </div>

        <div className="grid">
          <div className="col-12 md:col-6">
            <div className="p-3 border-round border-1 surface-border">
              <div className="text-600 text-sm mb-2">Income</div>
              <div className="text-green-500 font-semibold text-xl">
                {data ? formatCurrency(data.income) : formatCurrency(0)}
              </div>
              {data && (
                <ProgressBar
                  value={Math.min(100, (data.income / (data.income + Math.abs(data.expenses))) * 100)}
                  showValue={false}
                  className="mt-2 h-1rem bg-gray-100"
                />
              )}
            </div>
          </div>
          <div className="col-12 md:col-6">
            <div className="p-3 border-round border-1 surface-border">
              <div className="text-600 text-sm mb-2">Expenses</div>
              <div className="text-red-500 font-semibold text-xl">
                {data ? formatCurrency(data.expenses) : formatCurrency(0)}
              </div>
              {data && (
                <ProgressBar
                  value={Math.min(100, (Math.abs(data.expenses) / (data.income + Math.abs(data.expenses))) * 100)}
                  showValue={false}
                  className="mt-2 h-1rem bg-gray-100"
                />
              )}
            </div>
          </div>
        </div>

        {revenueGrowth && (
          <div className="mt-6 pt-4 border-top-1 surface-border">
            <h4 className="text-900 font-medium mb-3">Revenue Growth</h4>
            <div className="grid">
              <div className="col-12 md:col-4">
                <div className="text-600 text-sm">Current Year</div>
                <div
                  className={`font-semibold ${
                    revenueGrowth.current_year >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {formatCurrency(revenueGrowth.current_year)}
                </div>
              </div>
              <div className="col-12 md:col-4">
                <div className="text-600 text-sm">Previous Year</div>
                <div
                  className={`font-semibold ${
                    revenueGrowth.previous_year >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {formatCurrency(revenueGrowth.previous_year)}
                </div>
              </div>
              <div className="col-12 md:col-4">
                <div className="text-600 text-sm">Growth %</div>
                <div
                  className={`font-semibold ${
                    revenueGrowth.percentage_growth >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {`${revenueGrowth.percentage_growth.toFixed(2)}%`}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )}
  </Card>
  );
};

export default ProfitAndLossSection;
