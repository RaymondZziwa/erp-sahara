//@ts-nocheck
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

const AppRouter = () => {
  const token = useSelector(
    (state: RootState) => state.userAuth.token.access_token
  );
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route element={<Layout />}>
          {ROUTES.filter((r) => !r.hidden).map((route) => {
            return route.sidebarItems.map((item) =>
              item.items.map((itemRoute) => (
                <Route
                  path={route.path + item.path + itemRoute.path}
                  element={itemRoute.element}
                />
              ))
            );
          })}
          <Route
            path="/"
            element={<Navigate to={token ? "/inventory" : "/login"} replace />}
          />
          <Route
            path="/supplier-performance-report"
            element={<SupplierPerformanceReport />}
          />
          <Route
            path="/damaged-stock-report"
            element={<DamagedStockReport />}
          />
          <Route path="/balance-sheet" element={<BalanceSheetReport />} />
          <Route
            path="/income-statement-report"
            element={<IncomeStatementReport />}
          />
          <Route path="/trial-balance" element={<TrialBalance />} />
          <Route path="/cashflow-report" element={<Cashflow />} />
          <Route path="/cash-book" element={<CashBook />} />
          <Route
            path="/general-ledger-book"
            element={<GeneralLedgerReport />}
          />
          <Route path="/stock-taking-report" element={<StockTakingReport />} />
          <Route
            path="/balance-sheet-comparisons"
            element={<ComparisonBalanceSheet />}
          />
          <Route
            path="/income-statement-report-comparisons"
            element={<ComparisonIncomeStatement />}
          />
          <Route
            path="/trial-balance-comparisons"
            element={<ComparisonTrialBalances />}
          />
          <Route
            path="budgets/budget-details/:id"
            element={<BudgetDetails />}
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
