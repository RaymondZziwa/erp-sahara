import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { PropagateLoader } from 'react-spinners';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiCreditCard,
  FiPieChart,
  FiBarChart2,
  FiArrowUp,
  FiArrowDown,
  FiPocket,
} from 'react-icons/fi';
import { RootState } from '../../redux/store';
import { baseURL } from '../../utils/api';
import useAuth from '../../hooks/useAuth';

// -------- Chart.js registration --------
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// -------- Types --------
interface RevenueData {
  total: number;
  previous_period: number;
  growth_percent: number;
}

interface ExpenseItem {
  category: string;
  amount: number;
  percentage: number;
}

interface ExpensesData {
  total: number;
  breakdown: ExpenseItem[];
}

interface CashFlowData {
  inflow: number;
  outflow: number;
  net: number;
}

interface CashBalance {
  account: string;
  balance: number;
}

interface BudgetVariance {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
}

interface AgingBucket {
  period: string;
  amount: number;
}

interface ARAPData {
  total: number;
  aging_buckets: AgingBucket[];
}

interface ARAP {
  ar: ARAPData;
  ap: ARAPData;
}

interface RatiosData {
  current_ratio: number;
  expense_ratio: number;
  gross_margin_percent: number;
}

interface DashboardData {
  revenue: RevenueData;
  expenses: ExpensesData;
  net_profit: number;
  cash_flow: CashFlowData;
  cash_balances: CashBalance[];
  budget_variance: BudgetVariance[];
  ar_ap: ARAP;
  profit_margin: number;
  ratios: RatiosData;
}

// -------- Component --------
const FinancialOverviewDashboard: React.FC = () => {
  const {token} = useAuth()
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const baseCurrency = useSelector((state: RootState) => state.userAuth?.user?.organisation?.base_currency?.code) || ""

useEffect(() => {
  if (token?.access_token) {
    getData();
  }
}, [token]);

const getData = async () => {
  // Double check token exists
  if (!token?.access_token) return;
  
  try {
    setLoading(true);
    const response = await axios.get(`${baseURL}/reports/dashboard/overview`, {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    setData(response.data.data);
  } catch (error: any) {
    toast.error(error?.response?.data?.message || 'Failed to fetch dashboard data');
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <PropagateLoader color="#007f80" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    );
  }

  // ---------- Chart Data ----------
  const revenueChartData = {
    labels: ['Previous Period', 'Current Period'],
    datasets: [
      {
        label: 'Revenue',
        data: [data.revenue.previous_period, data.revenue.total],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
      },
    ],
  };

  const expensesChartData = {
    labels: data.expenses.breakdown.map(item => item.category),
    datasets: [
      {
        label: 'Expenses by Category',
        data: data.expenses.breakdown.map(item => item.amount),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(255, 205, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(54, 162, 235, 0.7)',
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const cashFlowChartData = {
    labels: ['Inflow', 'Outflow', 'Net'],
    datasets: [
      {
        label: 'Cash Flow',
        data: [data.cash_flow.inflow, data.cash_flow.outflow, data.cash_flow.net],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          data.cash_flow.net >= 0 ? 'rgba(54, 162, 235, 0.7)' : 'rgba(255, 159, 64, 0.7)',
        ],
        borderColor: [
          'rgb(75, 192, 192)',
          'rgb(255, 99, 132)',
          data.cash_flow.net >= 0 ? 'rgb(54, 162, 235)' : 'rgb(255, 159, 64)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // const arAgingData = {
  //   labels: data.ar_ap.ar.aging_buckets.map(bucket => bucket.period || []),
  //   datasets: [
  //     {
  //       label: 'Accounts Receivable Aging',
  //       data: data.ar_ap.ar.aging_buckets.map(bucket => bucket.amount),
  //       backgroundColor: 'rgba(75, 192, 192, 0.7)',
  //       borderColor: 'rgb(75, 192, 192)',
  //       borderWidth: 1,
  //     },
  //   ],
  // };

  // const apAgingData = {
  //   labels: data.ar_ap.ap.aging_buckets.map(bucket => bucket.period || []),
  //   datasets: [
  //     {
  //       label: 'Accounts Payable Aging',
  //       data: data.ar_ap.ap.aging_buckets.map(bucket => bucket.amount),
  //       backgroundColor: 'rgba(255, 99, 132, 0.7)',
  //       borderColor: 'rgb(255, 99, 132)',
  //       borderWidth: 1,
  //     },
  //   ],
  // };

  const profitMarginData = {
    labels: ['Profit Margin'],
    datasets: [
      {
        label: 'Profit Margin (%)',
        data: [data.profit_margin],
        backgroundColor: data.profit_margin >= 0 ? 'rgba(75, 192, 192, 0.7)' : 'rgba(255, 99, 132, 0.7)',
        borderColor: data.profit_margin >= 0 ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)',
        borderWidth: 1,
      },
    ],
  };

  // ---------- Chart Options ----------
  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const },
    },
  };

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiTrendingUp className="text-blue-600" />
            Financial Overview Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive view of financial performance and key metrics in ({baseCurrency})
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard 
            title="Total Revenue" 
            value={`  ${data.revenue.total.toLocaleString()}`} 
            change={data.revenue.growth_percent}
            icon={<FiTrendingUp className="text-green-600"/>}
          />
          <SummaryCard 
            title="Net Profit" 
            value={`  ${data.net_profit.toLocaleString()}`} 
            change={data.net_profit / data.revenue.total * 100}
            icon={<FiDollarSign className="text-blue-600"/>}
          />
          <SummaryCard 
            title="Profit Margin" 
            value={`${data.profit_margin.toFixed(2)}%`} 
            change={data.profit_margin}
            icon={<FiPieChart className="text-purple-600"/>}
          />
          <SummaryCard 
            title="Cash Flow" 
            value={`  ${data.cash_flow.net.toLocaleString()}`} 
            change={(data.cash_flow.net / data.cash_flow.inflow) * 100}
            icon={<FiPocket className={data.cash_flow.net >= 0 ? "text-green-600" : "text-red-600"}/>}
          />
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard title="Revenue Trend" icon={<FiTrendingUp className="text-blue-600"/>}>
            <Bar data={revenueChartData} options={barOptions} />
          </ChartCard>

          <ChartCard title="Expenses Breakdown" icon={<FiTrendingDown className="text-red-600"/>}>
            <Doughnut data={expensesChartData} options={doughnutOptions} />
          </ChartCard>
        </div>

        {/* Secondary Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3  mb-8">
          <ChartCard title="Cash Flow" icon={<FiPocket className="text-green-600"/>}>
            <Bar data={cashFlowChartData} options={barOptions} />
          </ChartCard>

          {/* <ChartCard title="AR Aging" icon={<FiCreditCard className="text-blue-600"/>}>
            <Bar data={arAgingData} options={barOptions} />
          </ChartCard>

          <ChartCard title="AP Aging" icon={<FiCreditCard className="text-red-600"/>}>
            <Bar data={apAgingData} options={barOptions} />
          </ChartCard> */}
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Financial Ratios */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiBarChart2 className="text-blue-600" />
              Financial Ratios
            </h2>
            <div className="space-y-3">
              <MetricItem 
                label="Current Ratio" 
                value={data.ratios.current_ratio.toFixed(2)} 
                indicator={data.ratios.current_ratio >= 1.5 ? "good" : data.ratios.current_ratio >= 1 ? "neutral" : "bad"}
              />
              <MetricItem 
                label="Expense Ratio" 
                value={`${(data.ratios.expense_ratio * 100).toFixed(2)}%`} 
                indicator={data.ratios.expense_ratio <= 0.3 ? "good" : data.ratios.expense_ratio <= 0.5 ? "neutral" : "bad"}
              />
              <MetricItem 
                label="Gross Margin" 
                value={`${data.ratios.gross_margin_percent.toFixed(2)}%`} 
                indicator={data.ratios.gross_margin_percent >= 20 ? "good" : data.ratios.gross_margin_percent >= 10 ? "neutral" : "bad"}
              />
            </div>
          </div>

          {/* AR/AP Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiCreditCard className="text-purple-600" />
              Receivables & Payables
            </h2>
            <div className="space-y-3">
              <MetricItem 
                label="Accounts Receivable" 
                value={`  ${data.ar_ap.ar.total.toLocaleString()}`} 
                indicator="neutral"
              />
              <MetricItem 
                label="Accounts Payable" 
                value={`  ${data.ar_ap.ap.total.toLocaleString()}`} 
                indicator="neutral"
              />
              <MetricItem 
                label="Net Working Capital" 
                value={`$${(data.ar_ap.ar.total - data.ar_ap.ap.total).toLocaleString()}`} 
                indicator={data.ar_ap.ar.total >= data.ar_ap.ap.total ? "good" : "bad"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Reusable Components ---
const SummaryCard: React.FC<{
  title: string; 
  value: string; 
  change: number;
  icon: React.ReactNode;
}> = ({title, value, change, icon}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-600 uppercase">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <div className={`flex items-center mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? <FiArrowUp size={16} /> : <FiArrowDown size={16} />}
          <span className="ml-1 text-sm font-medium">
            {Math.abs(change).toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="p-3 bg-gray-50 rounded-full">{icon}</div>
    </div>
  </div>
);

const ChartCard: React.FC<{
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
}> = ({title, icon, children}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    </div>
    <div className="h-64">{children}</div>
  </div>
);

const MetricItem: React.FC<{
  label: string; 
  value: string; 
  indicator: "good" | "neutral" | "bad";
}> = ({label, value, indicator}) => {
  const indicatorColor = {
    good: "bg-green-100 text-green-800",
    neutral: "bg-blue-100 text-blue-800",
    bad: "bg-red-100 text-red-800"
  };

  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${indicatorColor[indicator]}`}>
        {value}
      </span>
    </div>
  );
};

export default FinancialOverviewDashboard;