import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { ProgressSpinner } from "primereact/progressspinner";
import { Badge } from "primereact/badge";
import { Dropdown } from "primereact/dropdown";
import React, { useState } from "react";
import useRemindersStats from "../../../hooks/mossApp/useRemindersStats";

const ReminderStats: React.FC = () => {
  const { data, loading, error } = useRemindersStats();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="card">
          <ProgressSpinner
            style={{ width: "50px", height: "50px" }}
            strokeWidth="8"
            fill="var(--surface-ground)"
            animationDuration=".5s"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center">
        Error loading reminder stats.
      </div>
    );
  }

  if (!data) {
    return <div className="text-center">No Reminder stats available.</div>;
  }

  const appointmentChartData = {
    labels: data.appointments_per_month.map((item) => item.month),
    datasets: [
      {
        label: "Appointments Per Month",
        backgroundColor: "#42A5F5",
        data: data.appointments_per_month.map((item) => item.count),
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1,
  };

  // Calculating the difference between the two months' reminders
  const previousReminders = data.reminders_per_month[0]?.count || 0;
  const currentReminders = data.reminders_per_month[1]?.count || 0;
  const reminderDifference = currentReminders - previousReminders;
  const reminderPercentageChange =
    previousReminders === 0
      ? currentReminders > 0
        ? 100
        : 0
      : ((reminderDifference / previousReminders) * 100).toFixed(2);

  // Month options for Dropdown
  const months = data.reminders_per_month.map((item) => item.month);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {/* KPI Cards */}
      <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-lg p-4 flex flex-col justify-between">
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-600">
              Total Appointments
            </p>
            <p className="text-4xl font-bold text-indigo-600">
              {data.appointments_per_month.reduce(
                (acc, item) => acc + item.count,
                0
              )}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Based on appointments logged over the months.
            </p>
          </div>
          <div className="flex items-center justify-between">
            <Badge value="Overview" severity="info" />
            <span className="text-xs text-gray-400">
              {data.appointments_per_month.length} months tracked
            </span>
          </div>
        </Card>

        {/* Reminder Difference Card */}
        <Card className="shadow-lg p-4 flex flex-col justify-between">
          <div className="flex justify-between mb-4">
            <div>
              <p className="text-lg font-semibold text-gray-600">Reminders</p>
              <p className="text-4xl font-bold text-green-600">
                {
                  data.reminders_per_month.find(
                    (item) => item.month == selectedMonth
                  )?.count
                }
              </p>
              <p className="text-sm text-gray-500 mt-2">
                A change of {reminderPercentageChange}% from last month.
              </p>
            </div>
            <div className="flex h-fit">
              <Dropdown
                value={selectedMonth}
                options={months}
                onChange={(e) => setSelectedMonth(e.value)}
                placeholder="Select a month"
                className="w-40"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Badge value="Details" severity="success" />
            <span className="text-xs text-gray-400">
              {previousReminders} last month, {currentReminders} this month
            </span>
          </div>
        </Card>
      </div>

      {/* Appointment Chart */}
      <div className="col-span-2">
        <Card className="shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Appointments Overview</h2>
          <div className="h-80">
            <Chart
              type="bar"
              data={appointmentChartData}
              options={chartOptions}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReminderStats;
