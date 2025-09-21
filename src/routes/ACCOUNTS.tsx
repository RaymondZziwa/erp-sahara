import { Icon } from "@iconify/react";
import { lazy, Suspense } from "react";
import Currencies from "../pages/procurement/settings/currencies";
import ChartOfAccounts from "../pages/accounts/chartOfAccounts";
import FiscalYears from "../pages/budgets/fiscalYears";
import PaymentMethods from "../pages/procurement/settings/payment_methods";
import BankingLedgers from "../pages/accounts/generalLedgers/banking";
import SalesTransactions from "../pages/accounts/generalLedgers/sales";
import ExpenseTransactions from "../pages/accounts/generalLedgers/expenses";
import OtherTransactions from "../pages/accounts/generalLedgers/other_transaction";
import { FaUniversity, FaWallet } from "react-icons/fa";

// Dynamic imports
const Accounts = lazy(() => import("../pages/accounts/categories"));
const AccountsSubCategories = lazy(
  () => import("../pages/accounts/subcategories")
);

// Loader fallback component
const Loading = () => <div>Loading...</div>;

const ACCOUNTS_ROUTES = [
  {
    name: "Expense Transactions",
    icon: <Icon icon="solar:book-line-duotone" fontSize={20} />,
    path: "/accounts/expense-transactions",
    element: <ExpenseTransactions />,
  },
  {
    name: "Income Transactions",
    icon: <Icon icon="solar:book-line-duotone" fontSize={20} />,
    path: "/accounts/sales-transactions",
    element: <SalesTransactions />,
  },
  {
    name: "Internal Cash Transfer",
    icon: <Icon icon="solar:book-line-duotone" fontSize={20} />,
    path: "/accounts/banking-transactions",
    element: <BankingLedgers />,
  },
  {
    name: "Other transactions",
    icon: <Icon icon="solar:book-line-duotone" fontSize={20} />,
    path: "/accounts/journal-transactions",
    element: <OtherTransactions />,
  },
  {
    name: "Chart of Accounts",
    icon: <Icon icon="mdi:chart-timeline" fontSize={20} />,
    path: "/accounts/chart-of-accounts",
    element: (
      <Suspense fallback={<Loading />}>
        <ChartOfAccounts />
      </Suspense>
    ),
  },

  {
    name: "Configurations",
    icon: <Icon icon="mdi:gear-outline" fontSize={24} />,
    path: "",
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
        name: "Fiscal Years",
        icon: <Icon icon="mdi:calendar-clock" fontSize={20} />,
        path: "/years",
        element: (
          <Suspense fallback={<Loading />}>
            <FiscalYears />
          </Suspense>
        ),
      },
      // {
      //   name: "Sub Categories",
      //   icon: <Icon icon="mdi:folder-multiple-outline" fontSize={20} />,
      //   path: "/subcategories/:id",
      //   hidden: true,
      //   element: (
      //     <Suspense fallback={<Loading />}>
      //       <ChartOfAccountDetails />
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
        path: "/accounts/payment_methods",
        element: (
          <Suspense fallback={<Loading />}>
            <PaymentMethods />
          </Suspense>
        ),
      },
      {
        name: "Banks",
        icon: <FaUniversity size={20} />,
        path: "/accounts/payment_methods",
        element: (
          <Suspense fallback={<Loading />}>
            <PaymentMethods />
          </Suspense>
        ),
      },
      {
        name: "Bank Accounts",
        icon: <FaWallet size={20} />,
        path: "/accounts/payment_methods",
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
