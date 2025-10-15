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
import SUPPLIER_LOANS_ROUTES from "./SUPPLIER_LOANS";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import ITEM_PURCHASES_ROUTES from "./ITEM_PURCHASES";
import InventoryDashboard from "../pages/inventory/inventories/InventoryDashboard";

const ROUTES: Route[] = [
  {
    name: "Dashboard",
    icon: <Icon icon="mdi:view-dashboard-outline" fontSize={24} />,
    path: "/",
    element: <Dashboard />
    //element: <InventoryDashboard />
    //sidebarItems: DASHBOARD_ROUTES,
  },
  {
    name: "Reports",
    serviceName: "Reports",
    icon: <Icon icon="mdi:book-outline" fontSize={24} />, // More specific to project management
    path: "/reports",
    element: <Reports />,
    requiredPermission: "access_reports_module",
    //sidebarItems: REPORTS_ROUTES,
  },
  {
    name: "Inventory",
    serviceName: "Inventory",
    icon: <Icon icon="mdi:warehouse" fontSize={24} />,
    path: "/inventory",
    sidebarItems: INVENTORY_ROUTES,
    requiredPermission: "access_inventory_module",
  },
  {
    name: "Requisitions",
    serviceName: "Requisitions",
    icon: <Icon icon="mdi:book-outline" fontSize={24} />, // More specific to project management
    path: "/cash-requsuitions",
    sidebarItems: CASHREQUISITION_ROUTES,
    requiredPermission: "access_expense_requisition_module",
  },
  {
    name: "Accounts",
    serviceName: "Accounting",
    icon: <Icon icon="mdi:finance" fontSize={24} />,
    path: "/accounts",
    sidebarItems: ACCOUNTS_ROUTES,
    requiredPermission: "access_accounting_module",
  },
  {
    name: "Supplier Loans",
    serviceName: "SupplierLoan",
    icon: <Icon icon="mdi:bank-transfer" fontSize={24} />,
    path: "/supplier-loans",
    sidebarItems: SUPPLIER_LOANS_ROUTES,
    requiredPermission: "access_supplier_loan_module",
  },
  {
    name: "Budgets",
    serviceName: "Budget",
     icon: <Icon icon="mdi:cash-multiple" fontSize={24} />, // Updated for better budget representation
     path: "/budgets",
    sidebarItems: BUDGETS_ROUTES,
    requiredPermission: "access_budget_module",
  },
  {
    name: "Assets",
    serviceName: "Assets",
    icon: <Icon icon="solar:card-2-bold-duotone" fontSize={24} />, // More specific to project management
    path: "/assets",
    sidebarItems: ASSETS,
    requiredPermission: "access_assets_module",
  },
  {
    name: "Procurement",
    serviceName: "Procurement",
    icon: <Icon icon="mdi:cash-multiple" fontSize={24} />, // Updated for better budget representation
    path: "/procurement",
    sidebarItems: PROCUREMENT_ROUTES,
    requiredPermission: "access_procurement_module",
  },
  {
    name: "Item Supplies",
    serviceName: "Procurement",
    icon: <Icon icon="mdi:package-variant" fontSize={24} />, // Better representation for supplies
    path: "/item-supplies",
    sidebarItems: ITEM_PURCHASES_ROUTES,
    requiredPermission: "access_item_purchases_module",
  },  
  {
    name: "Sales",
    serviceName: "Sales",
    icon: <Icon icon="fluent:cart-24-regular" fontSize={24} />, 
    path: "/sales",
    sidebarItems: SALES_ROUTES,
    requiredPermission: "access_sales_module",
  },
 {
   name: "Recruitment",
   serviceName: "Recruitment",
     icon: <Icon icon="mdi:people" fontSize={24} />,
     path: "/recruitment",
   sidebarItems: RECRUITMENT_ROUTES,
   requiredPermission: "access_recruitment_module",
 },
  {
    name: "Human Resource",
    serviceName: "Human Resource",
    icon: <Icon icon="mdi:account-group-outline" fontSize={24} />,
    path: "/hr",
    sidebarItems: HUMAN_RESOURCE_ROUTES,
    requiredPermission: "access_hr_module",
  },
  
  {
    name: "MOSS APP",
    serviceName: "MOSAPP",
    icon: <Icon icon="mdi:tractor" fontSize={24} />,
    path: "/mossapp",
    sidebarItems: MOSS_APP_ROUTES,
    requiredPermission: "access_mosapp_module",
  },
  {
    name: "Manufacturing",
    serviceName: "Manufacturing",
    icon: <Icon icon="fluent:building-factory-24-regular" fontSize={24} />, 
    path: "/manufacturing",
    sidebarItems: MANUFACTURING_ROUTES,
    requiredPermission: "access_manufacturing_module",
 },
  {
    name: "Settings",
    serviceName: "Settings",
    icon: <Icon icon="mdi:cog-outline" fontSize={24} />,
    path: "/settings",
    sidebarItems: SETTINGS_ROUTES,
    requiredPermission: "access_settings_module",
  },
];

export default ROUTES;
