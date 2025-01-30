import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import { ServerResponse } from "../../redux/slices/types/ServerResponse";
import { REPORTS_ENDPOINTS } from "../../api/reportsEndpoints";
import { apiRequest } from "../../utils/api";
import { Card } from "primereact/card";
import { formatCurrency } from "../../utils/formatCurrency";
import { ProgressBar } from "primereact/progressbar";
import { Divider } from "primereact/divider";
import { Dropdown } from "primereact/dropdown";

interface InvoicesData {
  invoices: Invoices;
}

interface Invoices {
  total: number;
  total_amount: number;
  overdue: number;
  overdue_amount: number;
  not_yet_paid: number;
  not_yet_paid_amount: number;
  paid_last_30_Days: number;
  paid_last_30_Days_amount: number;
  deposited: number;
  deposited_amount: number;
  not_deposited: number;
  not_eposited_amount: number;
}

const InvoicesSection = () => {
  const [data, setData] = useState<InvoicesData | null>(null);
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
      const response = await apiRequest<ServerResponse<InvoicesData>>(
        REPORTS_ENDPOINTS.DASHBOARD.INVOICES({
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
      console.error("Error fetching invoices data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFromApi(); // Fetch on mount and whenever the range changes
  }, [isFetchingLocalToken, token.access_token, range]);

  if (isLoading) {
    return (
      <Card className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-2xl font-semibold text-gray-800">Loading...</h3>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-2xl font-semibold text-gray-800">
          No Data Available
        </h3>
      </Card>
    );
  }

  return (
    <Card
      className="bg-white shadow-md rounded-lg p-6"
      header={
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-semibold text-gray-800">Invoices</h3>
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
      <h3 className="text-xl font-semibold">Invoices</h3>
      <p className="text-gray-500 text-sm mt-2 mb-3 flex justify-between">
        <span className="md:text-2xl text-gray-600 font-bold">
          {formatCurrency(data.invoices.total_amount)}
        </span>
        <span>Last 365 Days</span>
      </p>
      <div className="flex justify-between mb-3">
        <div>
          <h3 className="md:text-2xl font-bold">
            {formatCurrency(data.invoices.overdue_amount)}
          </h3>
          <span className="text-gray-500 text-sm">Overdue</span>
        </div>
        <div>
          <h3 className="md:text-2xl font-bold">
            {formatCurrency(data.invoices.not_yet_paid_amount)}
          </h3>
          <span className="text-gray-500 text-sm">Not yet paid</span>
        </div>
      </div>
      <ProgressBar
        color="red"
        value={
          data.invoices.total_amount > 0
            ? (data.invoices.overdue_amount / data.invoices.total_amount) * 100
            : 0
        } // Calculate percentage for overdue
        className="bg-gray-200 rounded-lg"
      />
      <Divider />
      <div className="flex justify-between">
        <span>
          {formatCurrency(data.invoices.paid_last_30_Days_amount)} Paid
        </span>
        <h4 className="font-semibold">Last 30 Days</h4>
      </div>
      <div className="flex justify-between my-3">
        <div>
          <h3 className="md:text-2xl font-bold">
            {formatCurrency(data.invoices.not_eposited_amount)}
          </h3>
          <span className="text-gray-500 text-sm">Not deposited</span>
        </div>
        <div>
          <h3 className="md:text-2xl font-bold">
            {formatCurrency(data.invoices.deposited_amount)}
          </h3>
          <span className="text-gray-500 text-sm">Deposited</span>
        </div>
      </div>
      <ProgressBar
        color="green"
        value={
          data.invoices.deposited_amount + data.invoices.not_deposited > 0
            ? (data.invoices.deposited_amount /
                (data.invoices.deposited_amount +
                  data.invoices.not_deposited)) *
              100
            : 0
        } // Calculate percentage for deposited
        className="bg-gray-200 rounded-lg mb-3"
      />
      <ProgressBar
        color="orange"
        value={
          data.invoices.not_eposited_amount > 0
            ? (data.invoices.not_eposited_amount /
                (data.invoices.deposited_amount +
                  data.invoices.not_eposited_amount)) *
              100
            : 0
        } // Calculate percentage for not deposited
        className="bg-gray-200 rounded-lg mb-3"
      />
    </Card>
  );
};

export default InvoicesSection;
