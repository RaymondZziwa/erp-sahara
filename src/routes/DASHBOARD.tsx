import { Icon } from "@iconify/react";
import Dashboard from "../pages/dashboard";
// import InventoryDashboard from "../pages/inventory/inventories/InventoryDashboard";

const DASHBOARD_ROUTES = [
  {
    name: "Dashboard",
    icon: <Icon icon="solar:layers-line-duotone" fontSize={24} />,
    path: "/",
    element: <Dashboard />,
  },
];
export default DASHBOARD_ROUTES;
