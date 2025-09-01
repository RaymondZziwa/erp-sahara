import React, { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';
import axios from 'axios';
import useAuth from '../../../hooks/useAuth';

const MossAppDashboard = () => {
  const { token } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chart states
  const [appointmentsChart, setAppointmentsChart] = useState({});
  const [remindersChart, setRemindersChart] = useState({});
  const [userGrowthChart, setUserGrowthChart] = useState({});

  const fetchDashboardData = async () => {
    if (!token?.access_token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        'https://mosappapi.mosmiles.org/api/app/dashboard',
        {
          headers: {
            'Authorization': `Bearer ${token.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setDashboardData(response.data.data);
        prepareCharts(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const prepareCharts = (data) => {
    // Appointments per day chart (last 30 days)
    const last30DaysAppointments = data.appointment_statistics?.appointments_per_day?.slice(-30) || [];
    const appointmentsChartData = {
      labels: last30DaysAppointments.map(a => new Date(a.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Appointments per Day',
          data: last30DaysAppointments.map(a => a.count),
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }
      ]
    };

    // Reminders per day chart (last 30 days)
    const last30DaysReminders = data.reminder_statistics?.reminders_per_day?.slice(-30) || [];
    const remindersChartData = {
      labels: last30DaysReminders.map(r => new Date(r.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Reminders per Day',
          data: last30DaysReminders.map(r => r.count),
          backgroundColor: 'rgba(139, 92, 246, 0.6)',
          borderColor: 'rgba(139, 92, 246, 1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }
      ]
    };

    // User growth chart (simplified)
    const userGrowthData = {
      labels: ['Total Users', 'New (7 days)', 'New (30 days)', 'Active'],
      datasets: [
        {
          label: 'User Statistics',
          data: [
            data.user_statistics?.total_users || 0,
            data.user_statistics?.new_users_last_7_days || 0,
            data.user_statistics?.new_users_last_30_days || 0,
            data.user_statistics?.active_users || 0
          ],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ]
        }
      ]
    };

    setAppointmentsChart(appointmentsChartData);
    setRemindersChart(remindersChartData);
    setUserGrowthChart(userGrowthData);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token?.access_token]);

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const getSeverity = (count) => {
    if (count > 20) return 'success';
    if (count > 10) return 'info';
    if (count > 5) return 'warning';
    return 'danger';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="shadow-lg rounded-xl">
              <div className="p-4">
                <Skeleton width="60%" height="1.5rem" className="mb-2" />
                <Skeleton width="40%" height="2rem" />
                <Skeleton width="100%" height="0.75rem" className="mt-3" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center text-red-600">
            <i className="pi pi-exclamation-triangle text-5xl mb-4"></i>
            <p className="text-xl font-semibold mb-2">Error Loading Dashboard</p>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              <i className="pi pi-refresh mr-2"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Comprehensive view of platform statistics and performance</p>
        </div>
        {/* <button 
          onClick={fetchDashboardData}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg flex items-center transition-colors mt-4 sm:mt-0"
        >
          <i className="pi pi-refresh mr-2"></i>
          Refresh Data
        </button> */}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Users Card */}
        <Card className="shadow-lg rounded-xl border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="pi pi-users text-blue-600 text-lg"></i>
              </div>
              <Tag value="Users" severity="info" className="text-xs" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {formatNumber(dashboardData.user_statistics?.total_users || 0)}
            </h3>
            <p className="text-gray-600 text-sm">Total Users</p>
            <div className="flex justify-between items-center mt-3 text-xs">
              <span className="text-green-600">
                +{formatNumber(dashboardData.user_statistics?.new_users_last_7_days || 0)} this week
              </span>
              <span className="text-blue-600">
                +{formatNumber(dashboardData.user_statistics?.new_users_last_30_days || 0)} this month
              </span>
            </div>
          </div>
        </Card>

        {/* Appointments Card */}
        <Card className="shadow-lg rounded-xl border-0 bg-gradient-to-br from-green-50 to-green-100">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <i className="pi pi-calendar text-green-600 text-lg"></i>
              </div>
              <Tag value="Appointments" severity="success" className="text-xs" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {formatNumber(dashboardData.appointment_statistics?.total_appointments || 0)}
            </h3>
            <p className="text-gray-600 text-sm">Total Appointments</p>
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <div>
                <span className="text-green-600 font-semibold">
                  {formatNumber(dashboardData.appointment_statistics?.upcoming_appointments || 0)}
                </span>
                <p className="text-gray-500">Upcoming</p>
              </div>
              <div>
                <span className="text-blue-600 font-semibold">
                  {formatNumber(dashboardData.appointment_statistics?.completed_appointments || 0)}
                </span>
                <p className="text-gray-500">Completed</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Reminders Card */}
        <Card className="shadow-lg rounded-xl border-0 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <i className="pi pi-bell text-purple-600 text-lg"></i>
              </div>
              <Tag value="Reminders" severity="help" className="text-xs" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {formatNumber(dashboardData.reminder_statistics?.total_reminders || 0)}
            </h3>
            <p className="text-gray-600 text-sm">Total Reminders</p>
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <div>
                <span className="text-purple-600 font-semibold">
                  {formatNumber(dashboardData.reminder_statistics?.upcoming_reminders || 0)}
                </span>
                <p className="text-gray-500">Upcoming</p>
              </div>
              <div>
                <span className="text-green-600 font-semibold">
                  {formatNumber(dashboardData.reminder_statistics?.completed_reminders || 0)}
                </span>
                <p className="text-gray-500">Completed</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Drugs Card */}
        <Card className="shadow-lg rounded-xl border-0 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <i className="pi pi-medkit text-orange-600 text-lg"></i>
              </div>
              <Tag value="Drugs" severity="warning" className="text-xs" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {formatNumber(dashboardData.drug_statistics?.total_drugs || 0)}
            </h3>
            <p className="text-gray-600 text-sm">Available Drugs</p>
            <div className="mt-3">
              <ProgressBar 
                value={(dashboardData.drug_statistics?.total_drugs / 20) * 100} 
                showValue={false}
                className="h-2"
              />
              <p className="text-xs text-gray-500 mt-1">Inventory Level</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Appointments Chart */}
        <Card className="shadow-lg rounded-xl">
          <div className="p-5">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Appointments Trend (Last 30 Days)</h3>
            <div className="h-80">
              <Chart 
                type="line" 
                data={appointmentsChart} 
                options={chartOptions} 
                className="w-full h-full"
              />
            </div>
          </div>
        </Card>

        {/* Reminders Chart */}
        <Card className="shadow-lg rounded-xl">
          <div className="p-5">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Reminders Trend (Last 30 Days)</h3>
            <div className="h-80">
              <Chart 
                type="line" 
                data={remindersChart} 
                options={chartOptions} 
                className="w-full h-full"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* User Growth and Top Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth Chart */}
        <Card className="shadow-lg rounded-xl">
          <div className="p-5">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">User Statistics</h3>
            <div className="h-80">
              <Chart 
                type="bar" 
                data={userGrowthChart} 
                options={barChartOptions} 
                className="w-full h-full"
              />
            </div>
          </div>
        </Card>

        {/* Top Users Table */}
        <Card className="shadow-lg rounded-xl">
          <div className="p-5">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Top Users by Appointments</h3>
            <div className="h-80 overflow-auto">
              <DataTable 
                value={dashboardData.user_statistics?.top_users_by_appointments || []}
                size="small"
                showGridlines
                className="text-sm"
              >
                <Column field="display_name" header="User" />
                <Column field="appointments_count" header="Appointments" 
                  body={(rowData) => (
                    <Tag value={rowData.appointments_count} severity={getSeverity(rowData.appointments_count)} />
                  )} 
                />
                <Column field="points" header="Points" />
                <Column field="joining_date" header="Joined" 
                  body={(rowData) => new Date(rowData.joining_date).toLocaleDateString()} 
                />
              </DataTable>
            </div>
          </div>
        </Card>
      </div>

      {/* General Insights */}
      <Card className="shadow-lg rounded-xl mb-8">
        <div className="p-5">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">General Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-700">User Engagement</h4>
                <i className="pi pi-chart-line text-blue-500"></i>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {dashboardData.general_insights?.user_engagement || 0}%
                </div>
                <ProgressBar 
                  value={dashboardData.general_insights?.user_engagement || 0} 
                  className="h-2"
                />
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-700">Reminder Success Rate</h4>
                <i className="pi pi-check-circle text-green-500"></i>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {dashboardData.general_insights?.reminder_success_rate || 0}%
                </div>
                <ProgressBar 
                  value={dashboardData.general_insights?.reminder_success_rate || 0} 
                  className="h-2"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MossAppDashboard;