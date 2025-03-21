
import { Icon } from "@iconify/react";
import { Suspense } from "react";
import FiscalYears from "../pages/budgets/fiscalYears";
import Budgets from "../pages/budgets/budgets";
import BudgetDetails from "../pages/budgets/budgetDetails";

// Dynamic imports
//const SettingsPage = lazy(() => import("../pages/settings"));

// Loader fallback component
const Loading = () => <div>Loading...</div>;

const BUDGETS_ROUTES = [
  {
    name: "Dashboard",
    icon: <Icon icon="mdi:view-dashboard-outline" fontSize={24} />,
    path: "",
    items: [
      {
        name: "Budgets Overview",
        icon: <Icon icon="mdi:finance" fontSize={20} />,
        path: "/",
        element: (
          <Suspense fallback={<Loading />}>
            <Budgets />
          </Suspense>
        ),
      },
    ],
  },
  {
    name: "Budget Management",
    icon: <Icon icon="mdi:cash-multiple" fontSize={24} />,
    path: "/budgets",
    items: [
      {
        name: "Fiscal Years",
        icon: <Icon icon="mdi:calendar-clock" fontSize={20} />,
        path: "/years",
        element: (
          <Suspense fallback={<Loading />}>
            <FiscalYears />
          </Suspense>
        ),
      },
      {
        hidden: true,
        name: "Budget Details",
        icon: <Icon icon="hugeicons:folder-details" fontSize={20} />,
        path: "/budget-details/:id",
        element: (
          <Suspense fallback={<Loading />}>
            <BudgetDetails />
          </Suspense>
        ),
      },
    ],
  },
];

export default BUDGETS_ROUTES;
