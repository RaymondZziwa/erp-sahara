import { Icon } from "@iconify/react";

import Reports from "../pages/reports";
import IncomeStatementReport from "../pages/reports/accounting/IncomeStatementReport";
import BalanceSheetReport from "../pages/reports/accounting/BSReport";

const REPORTS_ROUTES = [
  {
    name: "Reports",
    icon: <Icon icon="solar:layers-line-duotone" fontSize={24} />,
    path: "/",
    element: <Reports />,
    // items: [
    //   {
    //     name: "Reports",
    //     icon: <Icon icon="solar:document-line-duotone" fontSize={20} />, // Different icon for Reports
    //     path: "/",
    //     element: <Reports />,
    //     hidden: true
    //   },
    //   // {
    //   //   name: "Trial Balances",
    //   //   icon: <Icon icon="solar:clipboard-line-duotone" fontSize={20} />, // Icon for Trial Balances
    //   //   path: "/trial-balances",
    //   //   element: <TrialBalances />,
    //   // },
    //   // {
    //   //   name: "Income Statement",
    //   //   icon: <Icon icon="solar:chart-line-duotone" fontSize={20} />, // Icon for Income Statement
    //   //   path: "/reports/income-statement",
    //   //   element: <IncomeStatementReport />,
    //   // },
    //   // {
    //   //   name: "Balance Sheet",
    //   //   icon: <Icon icon="solar:wallet-line-duotone" fontSize={20} />, // Icon for Balance Sheet
    //   //   path: "/balance-sheet",
    //   //   element: <BalanceSheet />,
    //   // },
    //   // {
    //   //   name: "Cash Book",
    //   //   icon: <Icon icon="solar:wallet-line-duotone" fontSize={20} />, // Icon for Balance Sheet
    //   //   path: "/cash-book",
    //   //   element: <CashBook />,
    //   // },
    //   // {
    //   //   name: "Stock Taking Report",
    //   //   icon: <Icon icon="solar:clipboard-line-duotone" fontSize={20} />, // Icon for Trial Balances
    //   //   path: "/stock-taking-report",
    //   //   element: <StockTakingReport />,
    //   // },
    //   // {
    //   //   name: "Out of Stock Report",
    //   //   icon: <Icon icon="solar:clipboard-line-duotone" fontSize={20} />, // Icon for Trial Balances
    //   //   path: "/out-of-stock-report",
    //   //   element: <OutOfStockReport />,
    //   // },
    //   // {
    //   //   name: "Trial Balances",
    //   //   icon: <Icon icon="solar:clipboard-line-duotone" fontSize={20} />, // Icon for Trial Balances
    //   //   path: "/trial-balances",
    //   //   element: <TrialBalances />,
    //   // },
    //   // {
    //   //   name: "Balance Sheet",
    //   //   icon: <Icon icon="solar:wallet-line-duotone" fontSize={20} />, // Icon for Balance Sheet
    //   //   path: "/balance-sheet",
    //   //   element: <BalanceSheetReport />,
    //   // },
    //   // {
    //   //   name: "Cash Book",
    //   //   icon: <Icon icon="solar:wallet-line-duotone" fontSize={20} />, // Icon for Balance Sheet
    //   //   path: "/cash-book",
    //   //   element: <CashBook />,
    //   // },
    //   // {
    //   //   name: "Reports Summary",
    //   //   icon: <Icon icon="solar:book-line-duotone" fontSize={20} />, // Icon for Reports Summary
    //   //   path: "/summary",
    //   //   element: <ReportsSummary />,
    //   // },
    // ],
  },
];

export default REPORTS_ROUTES;
