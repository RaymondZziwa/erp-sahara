import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { baseURL } from '../../../../utils/api';

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
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
  FiActivity,
  FiTrendingUp,
  FiTruck,
  FiUsers,
  FiPieChart,
  FiBarChart2,
  FiCheckCircle,
  FiAlertTriangle,
  FiDollarSign,
  FiClipboard,
} from 'react-icons/fi';
import { PropagateLoader } from 'react-spinners';

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
interface DashboardData {
  deliveries: {
    count: number;
    quantity: number;
  };
  settlements: {
    payable: number;
    paid: number;
    balance: number;
  };
  qa: {
    avg_good_beans: number | null;
    avg_defect: number | null;
    avg_moisture: number | null;
    pending: number;
  };
}

// -------- Component --------
const ItemPurchaseDashboard: React.FC = () => {
  const token = useSelector((state: RootState) => state.userAuth.token.access_token);
  const [data, setData] = useState<DashboardData>({ 
    deliveries: { count: 0, quantity: 0 },
    settlements: { payable: 0, paid: 0, balance: 0 },
    qa: { avg_good_beans: null, avg_defect: null, avg_moisture: null, pending: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseURL}/purchases/reports/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(response.data.data || response.data);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <PropagateLoader color="#007f80" />
        </div>
      </div>
    );
  }

  // ---------- Chart Data ----------
  const settlementsChartData = {
    labels: ['Payable', 'Paid', 'Balance'],
    datasets: [
      {
        label: 'Amount',
        data: [data.settlements.payable, data.settlements.paid, data.settlements.balance],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const qaMetricsChartData = {
    labels: ['Good Beans', 'Defects', 'Moisture'],
    datasets: [
      {
        label: 'Average Percentage',
        data: [
          data.qa.avg_good_beans || 0,
          data.qa.avg_defect || 0,
          data.qa.avg_moisture || 0,
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const deliveryStatusData = {
    labels: ['Completed', 'Pending QA'],
    datasets: [
      {
        data: [data.deliveries.count - data.qa.pending, data.qa.pending],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // ---------- Chart Options ----------
  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Financial Overview', color: '#374151' },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const },
      title: { display: true, text: 'Quality Metrics', color: '#374151' },
    },
  };

  const deliveryStatusOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const },
      title: { display: true, text: 'Delivery Status', color: '#374151' },
    },
  };

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiActivity className="text-blue-600" />
            Item Purchase Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Overview of procurement performance and quality metrics
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard 
            title="Total Deliveries" 
            value={data.deliveries.count} 
            icon={<FiTruck className="text-blue-600"/>}
          />
          <SummaryCard 
            title="Total Quantity" 
            value={`${data.deliveries.quantity.toLocaleString()} units`} 
            icon={<FiTrendingUp className="text-green-600"/>}
          />
          <SummaryCard 
            title="Pending QA" 
            value={data.qa.pending} 
            icon={<FiAlertTriangle className="text-orange-600"/>}
          />
          <SummaryCard 
            title="Balance Due" 
            value={`UGX ${data.settlements.balance.toLocaleString()}`} 
            icon={<FiDollarSign className="text-red-600"/>}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <ChartCard title="Financial Overview" icon={<FiDollarSign className="text-blue-600"/>}>
            <Bar data={settlementsChartData} options={barOptions} />
          </ChartCard>

          <ChartCard title="Quality Metrics" icon={<FiCheckCircle className="text-green-600"/>}>
            <Doughnut data={qaMetricsChartData} options={doughnutOptions} />
          </ChartCard>

          <ChartCard title="Delivery Status" icon={<FiClipboard className="text-purple-600"/>}>
            <Pie data={deliveryStatusData} options={deliveryStatusOptions} />
          </ChartCard>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QA Metrics Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiCheckCircle className="text-green-600" />
              Quality Assurance Metrics
            </h2>
            <div className="space-y-3">
              <MetricItem 
                label="Average Good Beans" 
                value={data.qa.avg_good_beans ? `${data.qa.avg_good_beans.toFixed(2)}%` : 'N/A'} 
                color="text-green-600"
              />
              <MetricItem 
                label="Average Defects" 
                value={data.qa.avg_defect ? `${data.qa.avg_defect.toFixed(2)}%` : 'N/A'} 
                color="text-red-600"
              />
              <MetricItem 
                label="Average Moisture" 
                value={data.qa.avg_moisture ? `${data.qa.avg_moisture.toFixed(2)}%` : 'N/A'} 
                color="text-blue-600"
              />
              <MetricItem 
                label="Pending QA Reviews" 
                value={data.qa.pending} 
                color="text-orange-600"
              />
            </div>
          </div>

          {/* Financial Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiDollarSign className="text-blue-600" />
              Financial Summary
            </h2>
            <div className="space-y-3">
              <MetricItem 
                label="Total Payable" 
                value={`UGX ${data.settlements.payable.toLocaleString()}`} 
                color="text-gray-600"
              />
              <MetricItem 
                label="Amount Paid" 
                value={`UGX ${data.settlements.paid.toLocaleString()}`} 
                color="text-green-600"
              />
              <MetricItem 
                label="Balance Due" 
                value={`UGX ${data.settlements.balance.toLocaleString()}`} 
                color="text-red-600"
              />
              <MetricItem 
                label="Payment Progress" 
                value={`${data.settlements.payable > 0 ? ((data.settlements.paid / data.settlements.payable) * 100).toFixed(1) : 0}%`} 
                color="text-blue-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Reusable Components ---
const SummaryCard: React.FC<{title: string; value: string | number; icon: React.ReactNode}> = ({title, value, icon}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-600 uppercase">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className="p-3 bg-gray-50 rounded-full">{icon}</div>
    </div>
  </div>
);

const ChartCard: React.FC<{title: string; icon: React.ReactNode; children: React.ReactNode}> = ({title, icon, children}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    </div>
    <div className="h-64">{children}</div>
  </div>
);

const MetricItem: React.FC<{label: string; value: string | number; color?: string}> = ({label, value, color = "text-gray-900"}) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
    <span className="text-sm font-medium text-gray-600">{label}</span>
    <span className={`text-sm font-semibold ${color}`}>{value}</span>
  </div>
);

export default ItemPurchaseDashboard;