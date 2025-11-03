
import { Icon } from "@iconify/react";
import { Suspense } from "react";
import Budgets from "../pages/budgets/budgets";
import BudgetDetails from "../pages/budgets/budgetDetails";
import BudgetCategories from "../pages/budgets/BudgetCategories";

// Dynamic imports
//const SettingsPage = lazy(() => import("../pages/settings"));

// Loader fallback component
const Loading = () => <div>Loading...</div>;

const BUDGETS_ROUTES = [
  {
    name: "Budgets",
    icon: <Icon icon="mdi:finance" fontSize={20} />,
    path: "/budgets",
    element: (
      <Suspense fallback={<Loading />}>
        <Budgets />
      </Suspense>
    ),
  },
  // {
  //   name: "Budget Categories",
  //   icon: <Icon icon="mdi:finance" fontSize={20} />,
  //   path: "/budgets/budget-categories",
  //   element: (
  //     <Suspense fallback={<Loading />}>
  //       <BudgetCategories />
  //     </Suspense>
  //   ),
  // },
];

export default BUDGETS_ROUTES;
