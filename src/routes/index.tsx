
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "primeicons/primeicons.css";
import { ToastContainer } from "react-toastify";
import Layout from "../components/layout";
import ROUTES from "./ROUTES";
import SignUp from "../pages/auth/SignUp";
import LoginPage from "../pages/auth/Login";
import ToBeUpdated from "../pages/ToBeUpdated";
import DamagedStockReport from "../pages/reports/inventory/damaged_stock";
import SupplierPerformanceReport from "../pages/reports/inventory/supplier_performance_report";
import StockTakingReport from "../pages/reports/inventory/stock_taking_report";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import Cashflow from "../pages/reports/accounting/CashflowReport";
import GeneralLedgerReport from "../pages/reports/accounting/GeneralLedgerReport";
import IncomeStatementReport from "../pages/reports/accounting/IncomeStatementReport";
import TrialBalance from "../pages/reports/accounting/TrialBalance";
import CashBook from "../pages/reports/accounting/CashBook";
import ComparisonTrialBalances from "../pages/reports/trialBalances/ComparisonTrailBalances";
import ComparisonIncomeStatement from "../pages/reports/incomeStatement/ComparisonIncomeStatement";
import ComparisonBalanceSheet from "../pages/reports/balanceSheet/ComparisonBalancesheet";
import BudgetDetails from "../pages/budgets/budgetDetails";
import BalanceSheetReport from "../pages/reports/accounting/BSReport";
import StockAgingReport from "../pages/reports/inventory/stock_aging_report";
import OutOfStockReport from "../pages/reports/inventory/out_of_stock_report";
import ReorderReport from "../pages/reports/inventory/reorder_report";
import OwnersEquityReport from "../pages/reports/accounting/owners_equity";
import BudgetComparisonReport from "../pages/reports/accounting/BudgetComparisonReport";
import OwnersEquityDetailedReport from "../pages/reports/accounting/detailedOwnerEquity";
import AssetRegistryReport from "../pages/reports/assets/assetRegistryReport";
import ProductionOutput from "../pages/manufacturing/productionOutput";
import Reports from "../pages/reports";
import JobOffersReport from "../pages/reports/recruitment/job-offers-report";
import ApplicationPipelineReport from "../pages/reports/recruitment/application-pipeline-report";
import InterviewActivitiesReport from "../pages/reports/recruitment/interviews-activities-report";
import ApplicationSourceReport from "../pages/reports/recruitment/application-source-report";
import RecruitmentSummaryDashboard from "../pages/reports/recruitment/recruitment-summary-dashboard-report";
import RolePermissionsPage from "../pages/settings/permissions";
import LoanRepayments from "../pages/supplierLoans/loanRepaymentRecords";
import MaintainanceLogs from "../pages/manufacturing/setup/machines/details/maintainanceLog";
import ProductionSteps from "../pages/manufacturing/productionOrders/details/productionSteps";
import ProductionSchedules from "../pages/manufacturing/productionOrders/details/productionSchedules";
import ProductionMaterialRequests from "../pages/manufacturing/productionOrders/details/materialRequests";
import DailyProductionReport from "../pages/reports/manufacturing/daily-production-report";
import Batches from "../pages/manufacturing/productionBatches";
import Ledgers from "../pages/accounts/chartOfAccounts/ledgers";
import AssetDetails from "../pages/assets/assetDetails/assetDetails";
import ManageSalaryStructure from "../pages/hr/salaryStructures/manageStructure";
import ManageEmployee from "../pages/hr/employees/manageEmployee";
import PayrollRuns from "../pages/hr/payrollPeriods/payrollRuns";
import CashierSalesReport from "../pages/reports/sales/cashier_sales_report";
import DailySalesSummaryReport from "../pages/reports/sales/daily_sales_summary";
import TopProductSalesReport from "../pages/reports/sales/top_product_sales";
import DailyProductSalesReport from "../pages/reports/sales/daily_product_sales";
import CreditSales from "../pages/inventory/pos/creditSales";
import RecentSales from "../pages/inventory/pos/recentSales";

const AppRouter = () => {
  const token = useSelector(
    (state: RootState) => state.userAuth.token.access_token
  );
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route element={<Layout />}>
        {ROUTES.filter((r) => !r.hidden).flatMap((route) => {
  // Handle routes without sidebarItems
  if (!route.sidebarItems || route.sidebarItems.length === 0) {
    return (
      <Route
        key={route.path}
        path={route.path}
        element={route.element} // Assuming the route has an element property
      />
    );
  }

  // Handle routes with sidebarItems
  return route.sidebarItems.flatMap((item) => {
    // Base path handling
    const basePath = route.path.endsWith('/') 
      ? route.path.slice(0, -1) 
      : route.path;
    
    const isAbsolutePath = item.path?.startsWith('/');
    const fullPath = isAbsolutePath ? item.path : `${route.path}/${item.path}`;

    // Handle items with nested routes
    if (item.items?.length > 0) {
      return item.items.map((nestedItem) => {
        // Handle empty parent item path
        const itemPath = item.path === "/" ? "" : item.path;
        const fullPath = `${basePath}${itemPath}${nestedItem.path}`;
        
        return (
          <Route
            key={fullPath}
            path={fullPath.replace(/\/+/g, '/')}  // Remove duplicate slashes
            element={nestedItem.element}
          />
        );
      });
    }

    return (
      <Route
        key={fullPath}
        path={fullPath}
        element={item.element}
      />
    );
  });
})}
          <Route
            path="/"
            element={<Navigate to={token ? "/inventory" : "/login"} replace />}
          />
          <Route
            path="/accounts/accounts/subcategories/:id"
            element={<Ledgers />}
          />
          <Route path="/reports" element={<Reports />} />
          <Route
            path="/supplier-performance-report"
            element={<SupplierPerformanceReport />}
          />
          <Route
            path="/job-offers-report"
            element={<JobOffersReport />}
          />
          <Route
            path="/application-pipeline-report"
            element={<ApplicationPipelineReport />}
          />
          <Route
            path="/interview-activities-report"
            element={<InterviewActivitiesReport />}
          />
          <Route
            path="/application-source-report"
            element={<ApplicationSourceReport />}
          />
          <Route
            path="/recruitment-summary-report"
            element={<RecruitmentSummaryDashboard />}
          />
          <Route path="/reorder-report" element={<ReorderReport />} />
          <Route path="/out-of-stock-report" element={<OutOfStockReport />} />
          <Route path="/stock-aging-report" element={<StockAgingReport />} />
          <Route
            path="/damaged-stock-report"
            element={<DamagedStockReport />}
          />
          <Route path="/balance-sheet" element={<BalanceSheetReport />} />
          <Route path="/credit-sales" element={<CreditSales />} />
          <Route path="/recent-sales" element={<RecentSales />} />
          <Route
            path="/income-statement-report"
            element={<IncomeStatementReport />}
          />
          <Route path="/trial-balance" element={<TrialBalance />} />
          <Route path="/cashflow-report" element={<Cashflow />} />
          <Route
            path="/asset-registry-report"
            element={<AssetRegistryReport />}
          />
          <Route path="/owners-equity" element={<OwnersEquityReport />} />
          <Route path="/cashier-sales-summary" element={<CashierSalesReport />} />
          <Route path="/daily_sales_summary" element={<DailySalesSummaryReport />} />
          <Route path="/top_product_sales" element={<TopProductSalesReport />} />
          <Route path="/daily_product_sales" element={<DailyProductSalesReport/>} />
          <Route
            path="/detailed-owners-equity"
            element={<OwnersEquityDetailedReport />}
          />
          <Route
            path="/manufacturing/workstations/machines/:id"
            element={<MaintainanceLogs />}
          />
          <Route path="/cash-book" element={<CashBook />} />
          <Route
            path="/general-ledger-book"
            element={<GeneralLedgerReport />}
          />
          <Route path="/stock-taking-report" element={<StockTakingReport />} />
          <Route path="/daily-production-report" element={<DailyProductionReport />} />
          <Route
            path="/balance-sheet-comparisons"
            element={<ComparisonBalanceSheet />}
          />
          <Route
            path="/income-statement-report-comparisons"
            element={<ComparisonIncomeStatement />}
          />
          <Route
            path="/budget-comparison-report"
            element={<BudgetComparisonReport />}
          />
          <Route
            path="/trial-balance-comparisons"
            element={<ComparisonTrialBalances />}
          />
          <Route
            path="budgets/budget-details/:id"
            element={<BudgetDetails />}
          />
          <Route
            path="/loans/:id/payments"
            element={<LoanRepayments />}
          />
          <Route path="/roles/:id/permissions" element={<RolePermissionsPage />} />
          {/* manufacturing dynamic routes */}
          <Route
            path="/manufacturing/production_order/production_steps/:id"
            element={<ProductionSteps />}
          />
          <Route
            path="/manufacturing/production_order/production_schedules/:id"
            element={<ProductionSchedules />}
          />
           <Route
            path="/asset-management/asset_details/:id"
            element={<AssetDetails />}
          />
          <Route
            path="/manufacturing/production_order/material_requests/:id"
            element={<ProductionMaterialRequests />}
          />
          <Route
            path="/manufacturing/production_order/batches/:id"
            element={<Batches />}
          />
          <Route
            path="/hr/salary_structure/:id"
            element={<ManageSalaryStructure />}
          />
          <Route
            path="/hr/employee/:id"
            element={<ManageEmployee />}
          />
          <Route
            path="/hr/payroll/schedules/:id/runs"
            element={<PayrollRuns />}
          />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<ToBeUpdated />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
