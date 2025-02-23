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
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import ItemTransactionsRecords from "../pages/inventory/inventories/item_transaction";

const AppRouter = () => {
  const token = useSelector((state: RootState) => state.userAuth.token.access_token)
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
        <Route path="/" element={<Navigate to={token ? "/inventory" : "/login"} replace />} />
        <Route path="/reports/supplier-performance-report" element={<SupplierPerformanceReport />} />
        <Route path="/reports/damaged-stock-report" element={<DamagedStockReport />} />
        <Route path="/out-of-stock-report" element={<OutOfStockReport />} />
        <Route path="/reports/reorder-report" element={<ReorderReport />} />
        <Route path="/reports/stock-aging-report" element={<StockAgingReport/>} />
        <Route path="/stock-taking-report" element={<StockTakingReport />} />
        <Route path="/pos" element={<ReorderReport />} />
        <Route path="/inventory/item/:id/:name" element={<ItemTransactionsRecords />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<ToBeUpdated />} />
        
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
