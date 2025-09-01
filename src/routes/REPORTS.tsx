import { Icon } from "@iconify/react";

import Reports from "../pages/reports";
import IncomeStatementReport from "../pages/reports/accounting/IncomeStatementReport";
import BalanceSheetReport from "../pages/reports/accounting/BSReport";

const REPORTS_ROUTES = [
  {
    name: "Reports",
    icon: <Icon icon="solar:layers-line-duotone" fontSize={24} />,
    path: "/reports",
    element: <Reports />,
  },
];

export default REPORTS_ROUTES;
