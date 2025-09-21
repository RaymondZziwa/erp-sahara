import { Icon } from "@iconify/react";

import CashRequisitions from "../pages/accounts/cashRequisition/expense_reqs";
//import ApprovalLevels from "../pages/accounts/approvalLevels";
import FuelRequisitions from "../pages/accounts/cashRequisition/fuel_reqs";
import StoreRequisitions from "../pages/accounts/cashRequisition/store_reqs";
import CarRepairRequisitions from "../pages/accounts/cashRequisition/vehicleRepairs";

// Loader fallback component
const Loading = () => <div>Loading...</div>;
const CASHREQUISITION_ROUTES = [
  {
    name: "Expense Requisitions",
    icon: <Icon icon="solar:book-line-duotone" fontSize={20} />,
    path: "/cash_req",
    element: <CashRequisitions />,
  },
  {
    name: "Fuel Requisitions",
    icon: <Icon icon="solar:book-line-duotone" fontSize={20} />,
    path: "/fuel_req",
    element: <FuelRequisitions />,
  },
  {
    name: "Store Requisitions",
    icon: <Icon icon="solar:book-line-duotone" fontSize={20} />,
    path: "/store_req",
    element: <StoreRequisitions />,
  },
    {
    name: "Vehicle Repair Request",
    icon: <Icon icon="solar:book-line-duotone" fontSize={20} />,
    path: "/vehicle_repair_requests",
    element: <CarRepairRequisitions />,
  },
];
export default CASHREQUISITION_ROUTES;
