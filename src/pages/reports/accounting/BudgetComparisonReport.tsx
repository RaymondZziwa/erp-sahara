import { useEffect, useState } from "react";
import useAuth from "../../../hooks/useAuth";
import { apiRequest, baseURL } from "../../../utils/api";
import axios from "axios";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import { REPORTS_ENDPOINTS } from "../../../api/reportsEndpoints";
import useBudgets from "../../../hooks/budgets/useBudgets";
import Header from "../../../components/custom/print_header";


const BudgetComparisonReport = () => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [budgetId, setBudgetId] = useState("");
  const { token, isFetchingLocalToken } = useAuth();
  const { data: budgets } = useBudgets();

  useEffect(()=> {
    const selectedBudget = budgets.filter((budget) => budget.id === budgetId);
    setStartDate(selectedBudget[0]?.fiscal_year.start_date)
    setEndDate(selectedBudget[0]?.fiscal_year.end_date);
  }, [budgetId])

  const print = async () => {
    if (!budgetId) {
      alert("Please select a budget");
      return;
    }
    try {
      const response = await axios.get(
        `${baseURL}/reports/accounting/print_budget_comparison_report?&budget_id=${budgetId}&start_date=${startDate}&end_date=${endDate}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token.access_token || ""}`,
          },
        }
      );

      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, "_blank");
    } catch (error) {
      console.error("Error previewing the trial balance report:", error);
    }
  };

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token || !budgetId) return;
    setIsLoading(true);
    try {
      const response = await apiRequest<ServerResponse<any[]>>(
        REPORTS_ENDPOINTS.BUDGET_COMPARISON_REPORT.GET_ALL(
          startDate,
          endDate,
          budgetId
        ),
        "GET",
        token.access_token
      );
      setReportData(response.data.items || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (budgetId) {
      fetchDataFromApi();
    }
  }, [
    isFetchingLocalToken,
    token.access_token,
    budgetId,
    startDate,
    endDate
  ]);

  const calculateVariance = (budget: number, actual: number) => {
    return actual - budget;
  };

  const calculateVariancePercentage = (budget: number, actual: number) => {
    if (budget === 0) return 0;
    return ((actual - budget) / budget) * 100;
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", margin: 20, color: "#333" }}>
      <Header title={"Budget Comparison Report"} />
      <div
        className="header"
        style={{
          textAlign: "center",
          marginBottom: 30,
          borderBottom: "2px solid #0066cc",
          paddingBottom: 10,
        }}
      ></div>

      <div
        style={{ marginBottom: 20, display: "flex", gap: 20, flexWrap: "wrap" }}
        className="justify-between"
      >
        <div>
          <label
            htmlFor="budgetId"
            style={{ display: "block", marginBottom: 5 }}
          >
            Budget
          </label>
          <select
            id="budgetId"
            name="budgetId"
            value={budgetId}
            onChange={(e) => setBudgetId(e.target.value)}
            style={{ padding: 8, minWidth: 200 }}
          >
            <option value="">Select Budget</option>
            {budgets?.map((budget) => (
              <option key={budget.id} value={budget.id}>
                {budget.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ alignSelf: "flex-end" }}>
          <button
            onClick={fetchDataFromApi}
            style={{ padding: "8px 16px", marginRight: 10 }}
          >
            Generate Report
          </button>
          <button
            onClick={print}
            style={{ padding: "8px 16px" }}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded gap-2"
          >
            Print PDF
          </button>
        </div>
      </div>

      <div
        className="report-date"
        style={{ textAlign: "left", marginBottom: 20 }}
      >
        <strong>Period Covered:</strong> {startDate} to {endDate}
      </div>

      {isLoading ? (
        <div>Loading report data...</div>
      ) : reportData.length > 0 ? (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: 30,
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Account</th>
              <th style={thStyle}>Budget Amount</th>
              <th style={thStyle}>Actual Amount</th>
              <th style={thStyle}>Variance</th>
              <th style={thStyle}>Variance %</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((item) => {
              const variance = calculateVariance(
                item.budget_amount,
                item.actual_amount
              );
              const variancePercentage = calculateVariancePercentage(
                item.budget_amount,
                item.actual_amount
              );
              const isPositive = variance >= 0;
              const isNegative = variance < 0;

              return (
                <tr key={item.account_id}>
                  <td style={{ padding: 10, borderBottom: "1px solid #ddd" }}>
                    {item.account_name}
                  </td>
                  <td
                    style={{
                      padding: 10,
                      borderBottom: "1px solid #ddd",
                      textAlign: "center",
                    }}
                  >
                    {item.budgeted_amount?.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: 10,
                      borderBottom: "1px solid #ddd",
                      textAlign: "right",
                    }}
                  >
                    {item.actual_amount?.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: 10,
                      borderBottom: "1px solid #ddd",
                      textAlign: "right",
                      color: isPositive
                        ? "#009933"
                        : isNegative
                        ? "#cc0000"
                        : "inherit",
                      fontWeight: isPositive || isNegative ? "bold" : "normal",
                    }}
                  >
                    {item.variance_amount.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: 10,
                      borderBottom: "1px solid #ddd",
                      textAlign: "right",
                      color: isPositive
                        ? "#009933"
                        : isNegative
                        ? "#cc0000"
                        : "inherit",
                      fontWeight: isPositive || isNegative ? "bold" : "normal",
                    }}
                  >
                    {item.variance_percent.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div style={{ margin: "20px 0", color: "#666" }}>
          {budgetId
            ? "No data available for the selected criteria"
            : "Please select a budget to generate the report"}
        </div>
      )}
    </div>
  );
};

const thStyle = {
  backgroundColor: "#0066cc",
  color: "white",
  textAlign: "left",
  padding: 10,
};

export default BudgetComparisonReport;
