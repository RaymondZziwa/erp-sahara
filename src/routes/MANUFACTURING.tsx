import { Icon } from "@iconify/react";
import { lazy, Suspense } from "react";
import WorkCenters from "../pages/manufacturing/workCenters";
import WorkOrders from "../pages/manufacturing/workCenterOrders";
import EquipmentComp from "../pages/manufacturing/workEquipment";
import MaintainanceLogs from "../pages/manufacturing/workEquipment/details/maintainanceLog";
import EqupmentDetails from "../pages/manufacturing/workCenters/details";
import BillOfMAterial from "../pages/manufacturing/billOfMaterial";
import ProductionLines from "../pages/manufacturing/productionLines";
import EquipmentAssignments from "../pages/manufacturing/equipmentAsssignments";
import ProductionPlans from "../pages/manufacturing/productionPlans";
import ProductionPlanDetails from "../pages/manufacturing/productionPlans/details";
import OrderDetails from "../pages/manufacturing/workCenterOrders/details";

// Dynamic imports
const SettingsPage = lazy(() => import("../pages/settings"));

// Loader fallback component
const Loading = () => <div>Loading...</div>;

const MANUFACTURING_ROUTES = [
  {
    name: "Dashboard",
    icon: <Icon icon="mdi:view-dashboard-outline" fontSize={24} />,
    path: "",
    items: [
      {
        name: "CPI Overview",
        icon: <Icon icon="mdi:chart-timeline" fontSize={20} />,
        path: "/",
        element: (
          <Suspense fallback={<Loading />}>
            <SettingsPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    name: "MAnufacturing Management",
    icon: <Icon icon="mdi:cash-multiple" fontSize={24} />,
    path: "/workcenters",
    items: [
      {
        name: "Work Centers",
        icon: <Icon icon="mdi:calendar-clock" fontSize={20} />,
        path: "/centers",
        element: (
          <Suspense fallback={<Loading />}>
            <WorkCenters />
          </Suspense>
        ),
      },
      {
        name: "Work Orders",
        icon: <Icon icon="mdi:finance" fontSize={20} />,
        path: "/workorders",
        element: (
          <Suspense fallback={<Loading />}>
            <WorkOrders />
          </Suspense>
        ),
      },
      {
        name: "Equipment",
        icon: <Icon icon="mdi:finance" fontSize={20} />,
        path: "/equipment",
        element: (
          <Suspense fallback={<Loading />}>
            <EquipmentComp />
          </Suspense>
        ),
      },
      {
        name: "Equipment Assignemts",
        icon: <Icon icon="mdi:finance" fontSize={20} />,
        path: "/equipment_assignments",
        element: (
          <Suspense fallback={<Loading />}>
            <EquipmentAssignments />
          </Suspense>
        ),
      },
      {
        name: "Bill of Material",
        icon: <Icon icon="mdi:finance" fontSize={20} />,
        path: "/bom",
        element: (
          <Suspense fallback={<Loading />}>
            <BillOfMAterial />
          </Suspense>
        ),
      },
      {
        name: "Production Lines",
        icon: <Icon icon="mdi:finance" fontSize={20} />,
        path: "/productionlines",
        element: (
          <Suspense fallback={<Loading />}>
            <ProductionLines />
          </Suspense>
        ),
      },
      {
        name: "Production Plans",
        icon: <Icon icon="mdi:finance" fontSize={20} />,
        path: "/productionplans",
        element: (
          <Suspense fallback={<Loading />}>
            <ProductionPlans />
          </Suspense>
        ),
      },
      {
        name: "Equipment Details",
        icon: <Icon icon="mdi:finance" fontSize={20} />,
        path: "/equipment/:id",
        element: (
          <Suspense fallback={<Loading />}>
            <MaintainanceLogs />
          </Suspense>
        ),
        hidden: true,
      },
      {
        name: "Plan Details",
        icon: <Icon icon="mdi:finance" fontSize={20} />,
        path: "/productionplans/:id",
        element: (
          <Suspense fallback={<Loading />}>
            <ProductionPlanDetails />
          </Suspense>
        ),
        hidden: true,
      },
      {
        name: "Center Details",
        icon: <Icon icon="mdi:finance" fontSize={20} />,
        path: "/centers/:id",
        element: (
          <Suspense fallback={<Loading />}>
            <EqupmentDetails />
          </Suspense>
        ),
        hidden: true,
      },
      {
        name: "Order Details",
        icon: <Icon icon="mdi:finance" fontSize={20} />,
        path: "/workorders/:id",
        element: (
          <Suspense fallback={<Loading />}>
            <OrderDetails />
          </Suspense>
        ),
        hidden: true,
      },
    ],
  },
];

export default MANUFACTURING_ROUTES;
