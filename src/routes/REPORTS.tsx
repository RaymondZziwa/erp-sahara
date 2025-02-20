import { Icon } from "@iconify/react";

import Reports from "../pages/reports";
//import TrialBalances from "../pages/reports/trialBalances";
//import ReportsSummary from "../pages/reports/reportsSummary";
// import BalanceSheet from "../pages/reports/balanceSheet";
import IncomeStatement from "../pages/reports/incomeStatement";
import CashBook from "../pages/reports/cashBook";

const REPORTS_ROUTES = [
  {
    name: "General",
    icon: <Icon icon="solar:layers-line-duotone" fontSize={24} />,
    path: "",
    items: [
      {
        name: "Reports",
        icon: <Icon icon="solar:document-line-duotone" fontSize={20} />, // Different icon for Reports
        path: "/",
        element: <Reports />,
      },
      // {
      //   name: "Trial Balances",
      //   icon: <Icon icon="solar:clipboard-line-duotone" fontSize={20} />, // Icon for Trial Balances
      //   path: "/trial-balances",
      //   element: <TrialBalances />,
      // },
      {
        name: "Income Statement",
        icon: <Icon icon="solar:chart-line-duotone" fontSize={20} />, // Icon for Income Statement
        path: "/income-statement",
        element: <IncomeStatement />,
      },
      // {
      //   name: "Balance Sheet",
      //   icon: <Icon icon="solar:wallet-line-duotone" fontSize={20} />, // Icon for Balance Sheet
      //   path: "/balance-sheet",
      //   element: <BalanceSheet />,
      // },
      {
        name: "Cash Book",
        icon: <Icon icon="solar:wallet-line-duotone" fontSize={20} />, // Icon for Balance Sheet
        path: "/cash-book",
        element: <CashBook />,
      },
      // {
      //   name: "Reports Summary",
      //   icon: <Icon icon="solar:book-line-duotone" fontSize={20} />, // Icon for Reports Summary
      //   path: "/summary",
      //   element: <ReportsSummary />,
      // },
    ],
  },
];

export default REPORTS_ROUTES;
