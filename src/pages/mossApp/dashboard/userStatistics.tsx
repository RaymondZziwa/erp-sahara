import React, { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import axios from 'axios';
import useAuth from '../../../hooks/useAuth';
import { PropagateLoader } from 'react-spinners';

const UserStatistics = () => {
  const { token } = useAuth();
  const [userData, setUserData] = useState({
    totalUsers: 0,
    conditions: [],
    interests: [],
    ageGroups: [],
    genders: [],
    countries: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [conditionChart, setConditionChart] = useState({});
  const [interestChart, setInterestChart] = useState({});
  const [ageChart, setAgeChart] = useState({});
  const [genderChart, setGenderChart] = useState({});
  const [countryChart, setCountryChart] = useState({});

  const fetchUserStatistics = async () => {
    if (!token?.access_token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        'https://mosappapi.mosmiles.org/api/app/user_statistics',
        {
          headers: {
            'Authorization': `Bearer ${token.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const data = response.data.data;
        
        // Transform the API response to match your component's expected format
        const transformedData = {
          totalUsers: data.total_users,
          conditions: Object.entries(data.per_condition || {}).map(([name, value]) => ({ name, value })),
          interests: Object.entries(data.user_interests || {}).map(([name, value]) => ({ name, value })),
          ageGroups: Object.entries(data.per_age_group || {}).map(([name, value]) => ({ name, value })),
          genders: Object.entries(data.per_gender || {}).map(([name, value]) => ({ name, value })),
          countries: Object.entries(data.per_country || {}).map(([name, value]) => ({ name, value }))
        };
        
        setUserData(transformedData);
      } else {
        setError(response.data.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
      console.error('Error fetching user statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStatistics();
  }, [token?.access_token]);

  // Set up chart data when userData changes
  useEffect(() => {
    if (userData.totalUsers === 0) return;

    // Condition chart (pie)
    const conditionChartData = {
      labels: userData.conditions.map(c => c.name),
      datasets: [
        {
          data: userData.conditions.map(c => c.value),
          backgroundColor: [
            '#42A5F5', '#66BB6A', '#FFA726', '#FF6384', '#36A2EB', '#FFCE56'
          ],
          hoverBackgroundColor: [
            '#64B5F6', '#81C784', '#FFB74D', '#FF82A0', '#5CB3FF', '#FFD87F'
          ]
        }
      ]
    };

    // Interests chart (doughnut)
    const interestChartData = {
      labels: userData.interests.map(i => i.name),
      datasets: [
        {
          data: userData.interests.map(i => i.value),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
          ],
          hoverBackgroundColor: [
            '#FF82A0', '#5CB3FF', '#FFD87F', '#70D4D4', '#AD85FF', '#FFB070', '#FF82A0', '#DCDEE0'
          ]
        }
      ]
    };

    // Age group chart (bar)
    const ageChartData = {
      labels: userData.ageGroups.map(a => a.name),
      datasets: [
        {
          label: 'Users by Age Group',
          backgroundColor: '#9C27B0',
          data: userData.ageGroups.map(a => a.value)
        }
      ]
    };

    // Gender chart (pie)
    const genderChartData = {
      labels: userData.genders.map(g => g.name),
      datasets: [
        {
          data: userData.genders.map(g => g.value),
          backgroundColor: ['#039BE5', '#E91E63', '#78909C'],
          hoverBackgroundColor: ['#03A9F4', '#EC407A', '#90A4AE']
        }
      ]
    };

    // Country chart (optional - you can add this if needed)
    const countryChartData = {
      labels: userData.countries.map(c => c.name),
      datasets: [
        {
          label: 'Users by Country',
          backgroundColor: '#00BCD4',
          data: userData.countries.map(c => c.value)
        }
      ]
    };

    setConditionChart(conditionChartData);
    setInterestChart(interestChartData);
    setAgeChart(ageChartData);
    setGenderChart(genderChartData);
    setCountryChart(countryChartData);
  }, [userData]);

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  const interestOptions = {
    ...chartOptions,
    cutout: '60%'
  };

  const ageOptions = {
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
            <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <PropagateLoader color='teal'/>
            <p className="mt-2 text-gray-600">Loading user statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-center text-red-500">
            <i className="pi pi-exclamation-triangle text-4xl"></i>
            <p className="mt-2">Error: {error}</p>
            <button 
              onClick={fetchUserStatistics}
              className="mt-4 bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button 
          onClick={fetchUserStatistics}
          className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <i className="pi pi-refresh mr-2"></i>
          Refresh
        </button>
      </div> */}
      
      {/* Total Users Card
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-md rounded-lg">
          <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-700">Total Users</h2>
            <p className="text-3xl font-bold mt-2">{userData.totalUsers}</p>
            <ProgressBar 
              value={(userData.totalUsers / 2000) * 100} 
              className="mt-4" 
              showValue={false}
            />
            <p className="text-sm text-gray-500 mt-2">Capacity: 2000 users</p>
          </div>
        </Card>
      </div> */}

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Condition Chart */}
        <Card className="shadow-md rounded-lg items-center">
          <div className="p-4 flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold mb-4 text-center">Users by Condition</h2>
            <Chart 
              type="pie" 
              data={conditionChart} 
              options={chartOptions} 
              style={{ height: '300px' }} 
            />
          </div>
        </Card>

        {/* Interests Chart */}
        <Card className="shadow-md rounded-lg items-center">
          <div className="p-4 flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold mb-4 text-center">User Interests</h2>
            <Chart 
              type="doughnut" 
              data={interestChart} 
              options={interestOptions} 
              style={{ height: '300px', width: '300px' }} 
            />
          </div>
        </Card>

        {/* Age Group Chart */}
        <Card className="shadow-md rounded-lg">
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4 text-center">Users by Age Group</h2>
            <Chart 
              type="bar" 
              data={ageChart} 
              options={ageOptions} 
              style={{ height: '300px' }} 
            />
          </div>
        </Card>

        {/* Gender Chart */}
        <Card className="shadow-md rounded-lg items-center">
        <div className="p-4 flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold mb-4 text-center">Users by Gender</h2>
            <div className="flex justify-center w-full">
            <Chart 
                type="pie" 
                data={genderChart} 
                options={chartOptions} 
                style={{ height: '300px', width: '300px' }} 
            />
            </div>
        </div>
        </Card>

      </div>
    </div>
  );
};

export default UserStatistics;