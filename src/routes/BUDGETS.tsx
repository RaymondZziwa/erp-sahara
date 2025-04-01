
import { Icon } from "@iconify/react";
import { Suspense } from "react";
import Budgets from "../pages/budgets/budgets";
import BudgetDetails from "../pages/budgets/budgetDetails";

// Dynamic imports
//const SettingsPage = lazy(() => import("../pages/settings"));

// Loader fallback component
const Loading = () => <div>Loading...</div>;

const BUDGETS_ROUTES = [
  {
    name: "Budgets",
    icon: <Icon icon="mdi:view-dashboard-outline" fontSize={24} />,
    path: "",
    items: [
      {
        name: "Budgets",
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
    name: "Settings",
    icon: <Icon icon="mdi:cash-multiple" fontSize={24} />,
    path: "/budgets",
    items: [
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
      {
        hidden: true,
        name: "Budget Categories",
        icon: <Icon icon="hugeicons:folder-details" fontSize={20} />,
        path: "#",
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
