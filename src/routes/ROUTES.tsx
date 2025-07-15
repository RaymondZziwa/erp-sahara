//@ts-nocheck
import { Icon } from "@iconify/react";
import PROCUREMENT_ROUTES from "./PROCUREMENT";
import SETTINGS_ROUTES from "./SETTINGS";
import DASHBOARD_ROUTES from "./DASHBOARD";
import INVENTORY_ROUTES from "./INVENTORY";
import MOSS_APP_ROUTES from "./MOSSAPP";
import SALES_ROUTES from "./SALES";
import ACCOUNTS_ROUTES from "./ACCOUNTS";
import HUMAN_RESOURCE_ROUTES from "./HUMAN_RESOURCE";
import BUDGETS_ROUTES from "./BUDGETS";
// import PROJECTS_ROUTES from "./PROJECTS";
import { Route } from "./routeTypes";
import REPORTS_ROUTES from "./REPORTS";
// import CROPS_ROUTES from "./CROPS";
import CASHREQUISITION_ROUTES from "./CASH_REQUISITIONS";
import MANUFACTURING_ROUTES from "./MANUFACTURING";
import ASSETS from "./ASSETS";
// import FARM_GROUP_ROUTES from "./FARM_GROUPS";
// import INVESTMENT_FINANCING from "./INVESTMENT_FINANCING";
import {org} from "../utils/api"
import RECRUITMENT_ROUTES from "./RECRUITMENT";
import Dashboard from "../pages/dashboard";
import Reports from "../pages/reports";

const ROUTES: Route[] = [
  {
    name: "Dashboard",
    icon: <Icon icon="mdi:view-dashboard-outline" fontSize={24} />,
    path: "/",
    element: <Dashboard />
    //sidebarItems: DASHBOARD_ROUTES,
  },
  {
    name: "Reports",
    icon: <Icon icon="mdi:book-outline" fontSize={24} />, // More specific to project management
    path: "/reports",
    element: <Reports />
    //sidebarItems: REPORTS_ROUTES,
  },
  {
    name: "Inventory",
    icon: <Icon icon="mdi:warehouse" fontSize={24} />,
    path: "/inventory",
    sidebarItems: INVENTORY_ROUTES,
  },
  {
    name: "Requisitions",
    icon: <Icon icon="mdi:book-outline" fontSize={24} />, // More specific to project management
    path: "/cash-requsuitions",
    sidebarItems: CASHREQUISITION_ROUTES,
  },
  {
    name: "Accounts",
    icon: <Icon icon="mdi:finance" fontSize={24} />,
    path: "/accounts",
    sidebarItems: ACCOUNTS_ROUTES,
  },
  {
     name: "Budgets",
     icon: <Icon icon="mdi:cash-multiple" fontSize={24} />, // Updated for better budget representation
     path: "/budgets",
     sidebarItems: BUDGETS_ROUTES,
  },
  {
    name: "Assets",
    icon: <Icon icon="solar:card-2-bold-duotone" fontSize={24} />, // More specific to project management
    path: "/assets",
    sidebarItems: ASSETS,
  },
  {
    name: "Procurement",
    icon: <Icon icon="mdi:cash-multiple" fontSize={24} />, // Updated for better budget representation
    path: "/procurement",
    sidebarItems: PROCUREMENT_ROUTES,
  },

  
  {
    name: "Sales",
    icon: <Icon icon="fluent:cart-24-regular" fontSize={24} />, 
    path: "/sales",
    sidebarItems: SALES_ROUTES,
  },
 {
     name: "Recruitment",
     icon: <Icon icon="mdi:people" fontSize={24} />,
     path: "/recruitment",
     sidebarItems: RECRUITMENT_ROUTES,
 },
  {
    name: "Human Resource",
    icon: <Icon icon="mdi:account-group-outline" fontSize={24} />,
    path: "/hr",
    sidebarItems: HUMAN_RESOURCE_ROUTES,
  },
  
  // {
  //     name: "MOSS APP",
  //     icon: <Icon icon="mdi:tractor" fontSize={24} />, // Example: Tractor icon for a farm-related look
  //     path: "/farm_groups",
  //     sidebarItems: MOSS_APP_ROUTES,
  // },
  {
    name: "Manufacturing",
    icon: <Icon icon="fluent:building-factory-24-regular" fontSize={24} />, 
    path: "/manufacturing",
    sidebarItems: MANUFACTURING_ROUTES,
 },
  {
    name: "Settings",
    icon: <Icon icon="mdi:cog-outline" fontSize={24} />,
    path: "/settings",
    sidebarItems: SETTINGS_ROUTES,
  },
];

export default ROUTES;
