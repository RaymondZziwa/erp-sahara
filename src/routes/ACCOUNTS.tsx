import { Icon } from "@iconify/react";
import { lazy, Suspense } from "react";
import Currencies from "../pages/procurement/settings/currencies";
import ChartOfAccounts from "../pages/accounts/chartOfAccounts";
import GeneralLedgers from "../pages/accounts/generalLedgers";
//import CashRequisitions from "../pages/accounts/cashRequisition";
import Budgets from "../pages/budgets/budgets";
import FiscalYears from "../pages/budgets/fiscalYears";
import ChartOfAccountDetails from "../pages/accounts/subcategories/details";
import PaymentMethods from "../pages/procurement/settings/payment_methods";

// Dynamic imports
const Accounts = lazy(() => import("../pages/accounts/categories"));
const AccountsSubCategories = lazy(
  () => import("../pages/accounts/subcategories")
);

// Loader fallback component
const Loading = () => <div>Loading...</div>;

const ACCOUNTS_ROUTES = [
  {
    name: "General",
    icon: <Icon icon="mdi:view-dashboard-outline" fontSize={24} />,
    path: "",
    items: [
      // {
      //   name: "Expense Requsitions",
      //   icon: <Icon icon="solar:book-line-duotone" fontSize={20} />,
      //   path: "/expense-requisitions",
      //   element: <CashRequisitions />,
      // },
      {
        name: "Journal transactions",
        icon: <Icon icon="solar:book-line-duotone" fontSize={20} />,
        path: "/journal-transactions",
        element: <GeneralLedgers />,
      },
      {
        name: "Budgets",
        icon: <Icon icon="solar:book-line-duotone" fontSize={20} />,
        path: "/budgets",
        element: <Budgets />,
      },
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
        name: "Chart of Accounts",
        icon: <Icon icon="mdi:chart-timeline" fontSize={20} />,
        path: "/",
        element: (
          <Suspense fallback={<Loading />}>
            <ChartOfAccounts />
          </Suspense>
        ),
      },
    ],
  },

  {
    name: "More",
    icon: <Icon icon="mdi:account-cash" fontSize={24} />,
    path: "/accounts",
    items: [
      {
        name: "Categories",
        icon: <Icon icon="mdi:folder-outline" fontSize={20} />,
        path: "/categories",
        element: (
          <Suspense fallback={<Loading />}>
            <Accounts />
          </Suspense>
        ),
      },
      {
        name: "Sub Categories",
        icon: <Icon icon="mdi:folder-multiple-outline" fontSize={20} />,
        path: "/subcategories",
        element: (
          <Suspense fallback={<Loading />}>
            <AccountsSubCategories />
          </Suspense>
        ),
      },
      {
        name: "Sub Categories",
        icon: <Icon icon="mdi:folder-multiple-outline" fontSize={20} />,
        path: "/subcategories/:id",
        hidden: true,
        element: (
          <Suspense fallback={<Loading />}>
            <ChartOfAccountDetails />
          </Suspense>
        ),
      },
      // {
      //   name: "Cash Requisitions",
      //   icon: <Icon icon="mdi:folder-multiple-outline" fontSize={20} />,
      //   path: "/cashreq",
      //   element: (
      //     <Suspense fallback={<Loading />}>
      //       <CashRequisitions />
      //     </Suspense>
      //   ),
      // },

      {
        name: "Currencies",
        icon: <Icon icon="tdesign:money" fontSize={20} />,
        path: "/currencies",
        element: (
          <Suspense fallback={<Loading />}>
            <Currencies />
          </Suspense>
        ),
      },
      {
        name: "Payment Methods",
        icon: <Icon icon="tdesign:money" fontSize={20} />,
        path: "/payment_methods",
        element: (
          <Suspense fallback={<Loading />}>
            <PaymentMethods />
          </Suspense>
        ),
      },
    ],
  },
];

export default ACCOUNTS_ROUTES;
