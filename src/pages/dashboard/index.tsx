import AccountsSection from "./AccountsSection";
import SalesSection from "./SalesSecton";
import ProfitAndLossSection from "./ProfitAndLossSection";
import ExpensesSection from "./ExpensesSection";
import InvoicesSection from "./InvoicesSecton";

const Dashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 space-y-2 md:space-y-0 p-2 md:p-8 md:gap-4 bg-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 col-span-2 gap-4">
        {/* Invoices Section */}
        <InvoicesSection />
        {/* Expenses Section */}
        <ExpensesSection />

        {/* Profit and Loss Section */}
        <ProfitAndLossSection />

        {/* Sales Section */}
        <SalesSection />
      </div>
      {/* Bank Accounts Section */}
      <AccountsSection />
    </div>
  );
};

export default Dashboard;
