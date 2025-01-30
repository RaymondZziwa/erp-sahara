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
import ReorderReport from "../pages/reports/inventory/reorder_report";
import OutOfStockReport from "../pages/reports/inventory/out_of_stock_report";
import StockAgingReport from "../pages/reports/inventory/stock_aging_report";

const AppRouter = () => {
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
        <Route path="/" element={<Navigate to="/inventory" replace />} />
        <Route path="/supplier-performance-report" element={<SupplierPerformanceReport />} />
        <Route path="/damaged-stock-report" element={<DamagedStockReport />} />
        <Route path="/out-of-stock-report" element={<OutOfStockReport />} />
        <Route path="/reorder-report" element={<ReorderReport />} />
        <Route path="/stock-aging-report" element={<StockAgingReport/>} />
        <Route path="/stock-taking-report" element={<StockTakingReport />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<ToBeUpdated />} />
        
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
