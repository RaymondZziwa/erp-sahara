import AccountsSection from "./AccountsSection";
import SalesSection from "./SalesSecton";
import ProfitAndLossSection from "./ProfitAndLossSection";
import ExpensesSection from "./ExpensesSection";
import InvoicesSection from "./InvoicesSecton";

const Dashboard = () => {
  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top row: Profit and Expenses side by side but smaller */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow p-4 col-span-1">
            <ProfitAndLossSection />
          </div>
          <div className="bg-white rounded-xl shadow p-4 col-span-1">
            <ExpensesSection />
          </div>
  
          {/* Accounts takes up remaining 2 columns on large screen */}
          <div className="bg-white rounded-xl shadow p-4 col-span-2 hidden lg:block">
            <AccountsSection />
          </div>
        </div>
  
        {/* Show Accounts separately on small screens */}
        <div className="lg:hidden bg-white rounded-xl shadow p-4">
          <AccountsSection />
        </div>
  
        {/* Sales full width */}
        <div className="bg-white rounded-xl shadow p-4">
          <SalesSection />
        </div>
      </div>
    </div>
  );
  
}
export default Dashboard;
