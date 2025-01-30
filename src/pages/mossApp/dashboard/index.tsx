import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { ProgressBar } from "primereact/progressbar";
import { Badge } from "primereact/badge";
import { Column } from "primereact/column";
import useMossAppDashboardStats from "../../../hooks/mossApp/useMossAppDashboardStats";

const MossAppDashboard = () => {
  const { data: dashboardStats } = useMossAppDashboardStats();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      <Card className="shadow-lg p-6 lg:col-span-1">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Dashboard Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Users Overview */}
          <div className="flex flex-col space-y-4 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-xl font-medium text-gray-600">
              Users Overview
            </h3>
            <p className="text-5xl font-extrabold text-indigo-600">
              {dashboardStats?.user_statistics.total_users}
            </p>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Last 7 days</span>
                  <span className="text-xl font-bold text-gray-800">
                    {dashboardStats?.user_statistics.new_users_last_7_days}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Last 30 days</span>
                  <span className="text-xl font-bold text-gray-800">
                    {dashboardStats?.user_statistics.new_users_last_30_days}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Appointments Overview */}
          <div className="flex flex-col space-y-4 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-xl font-medium text-gray-600">
              Appointments Overview
            </h3>
            <p className="text-5xl font-extrabold text-indigo-600">
              {dashboardStats?.appointment_statistics.total_appointments}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-600">
                Completed
              </span>
              <p className="text-3xl font-bold text-green-600">
                {dashboardStats?.appointment_statistics.completed_appointments}
              </p>
            </div>
          </div>

          {/* Reminders Overview */}
          <div className="flex flex-col space-y-4 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-xl font-medium text-gray-600">
              Reminders Overview
            </h3>
            <p className="text-5xl font-extrabold text-indigo-600">
              {dashboardStats?.reminder_statistics.total_reminders}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-600">
                Completed
              </span>
              <p className="text-3xl font-bold text-green-600">
                {dashboardStats?.reminder_statistics.completed_reminders}
              </p>
            </div>
          </div>

          {/* Drug Statistics */}
          <div className="flex flex-col space-y-4 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-xl font-medium text-gray-600">
              Drug Statistics
            </h3>
            <p className="text-5xl font-extrabold text-indigo-600">
              {dashboardStats?.drug_statistics.total_drugs}
            </p>
          </div>

          {/* General Insights */}
          <div className="flex flex-col space-y-4 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-xl font-medium text-gray-600">
              General Insights
            </h3>
            <div>
              <p className="text-sm text-gray-500">User Engagement</p>
              <ProgressBar
                value={dashboardStats?.general_insights.user_engagement}
                style={{ width: "100%" }}
              />
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">Reminder Success Rate</p>
              <ProgressBar
                value={dashboardStats?.general_insights.reminder_success_rate}
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Top Users by Appointments */}
      <Card className="shadow-lg p-6 ">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Top Users by Appointments
        </h2>
        <DataTable
          value={dashboardStats?.user_statistics.top_users_by_appointments}
        >
          <Column field="display_name" header="Display Name"></Column>
          <Column field="email" header="Email"></Column>
          <Column
            field="appointmentsCount"
            header="Appointments"
            body={(rowData) => (
              <Badge value={rowData.appointments_count ?? 0} />
            )}
          ></Column>
        </DataTable>
      </Card>
    </div>
  );
};

export default MossAppDashboard;
