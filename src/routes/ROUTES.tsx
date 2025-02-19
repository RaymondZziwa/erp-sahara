import { Icon } from "@iconify/react";

//import PROCUREMENT_ROUTES from "./PROCUREMENT";
import SETTINGS_ROUTES from "./SETTINGS";
import DASHBOARD_ROUTES from "./DASHBOARD";
import INVENTORY_ROUTES from "./INVENTORY";
//import MOSS_APP_ROUTES from "./MOSSAPP";
//import SALES_ROUTES from "./SALES";
import ACCOUNTS_ROUTES from "./ACCOUNTS";
// import HUMAN_RESOURCE_ROUTES from "./HUMAN_RESOURCE";
// import BUDGETS_ROUTES from "./BUDGETS";
// import PROJECTS_ROUTES from "./PROJECTS";
import { Route } from "./routeTypes";
import REPORTS_ROUTES from "./REPORTS";
// import CASHREQUISITION_ROUTES from "./CASH_REQUISITIONS";
import MANUFACTURING_ROUTES from "./MANUFACTURING";
import ASSETS from "./ASSETS";
// import INVESTMENT_FINANCING from "./INVESTMENT_FINANCING";

const ROUTES: Route[] = [
  {
    name: "Dashboard",
    icon: <Icon icon="mdi:view-dashboard-outline" fontSize={24} />,
    path: "/",
    sidebarItems: DASHBOARD_ROUTES,
  },
  {
    name: "Inventory",
    icon: <Icon icon="mdi:warehouse" fontSize={24} />,
    path: "/inventory",
    sidebarItems: INVENTORY_ROUTES,
  },
  {
    name: "Accounts",
    icon: <Icon icon="mdi:finance" fontSize={24} />,
    path: "/accounts",
    sidebarItems: ACCOUNTS_ROUTES,
  },
  // {
  //   name: "Expense Requisitions",
  //   icon: <Icon icon="mdi:book-outline" fontSize={24} />, // More specific to project management
  //   path: "/cash-requsuitions",
  //   //@ts-expect-error --ignore
  //   sidebarItems: CASHREQUISITION_ROUTES,
  // },
  // {
  //   name: "Procurement",
  //   icon: <Icon icon="mdi:cart-outline" fontSize={24} />,
  //   path: "/procurement",
  //   sidebarItems: PROCUREMENT_ROUTES,
  // },
  // {
  //   name: "Sales",
  //   icon: <Icon icon="mdi:cash-register" fontSize={24} />,
  //   path: "/sales",
  //   sidebarItems: SALES_ROUTES,
  // },
  {
    name: "Manufacturing",
    icon: <Icon icon="mdi:cash-register" fontSize={24} />,
    path: "/manufacturing",
    sidebarItems: MANUFACTURING_ROUTES,
  },
  {
    name: "Reports",
    icon: <Icon icon="mdi:book-outline" fontSize={24} />, // More specific to project management
    path: "/reports",
    sidebarItems: REPORTS_ROUTES,
  },
  // {
  //   name: "Budgets",
  //   icon: <Icon icon="mdi:cash-multiple" fontSize={24} />, // Updated for better budget representation
  //   path: "/budgets",
  //   sidebarItems: BUDGETS_ROUTES,
  // },

  // {
  //   name: "MOSS App",
  //   icon: <Icon icon="mdi:cellphone" fontSize={24} />,
  //   path: "/mossapp",
  //   sidebarItems: MOSS_APP_ROUTES,
  //   hidden: true,
  // },

  // {
  //   name: "Human Resource",
  //   icon: <Icon icon="mdi:account-group-outline" fontSize={24} />,
  //   path: "/hr",
  //   sidebarItems: HUMAN_RESOURCE_ROUTES,
  // },
  {
    name: "Assets",
    icon: <Icon icon="solar:card-2-bold-duotone" fontSize={24} />, // More specific to project management
    path: "/assets",
    sidebarItems: ASSETS,
  },
  // {
  //   name: "Investment Financing",
  //   icon: <Icon icon="solar:money-bag-bold" fontSize={24} />, // More specific to project management
  //   path: "/investment",
  //   sidebarItems: INVESTMENT_FINANCING,
  // },
  // {
  //   name: "Projects",
  //   icon: <Icon icon="mdi:clipboard-text-outline" fontSize={24} />, // More specific to project management
  //   path: "/projects",
  //   sidebarItems: PROJECTS_ROUTES,
  // },
  {
    name: "Settings",
    icon: <Icon icon="mdi:cog-outline" fontSize={24} />,
    path: "/settings",
    //@ts-expect-error --ignore
    sidebarItems: SETTINGS_ROUTES,
  },
];

export default ROUTES;
