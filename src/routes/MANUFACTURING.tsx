
import { Icon } from "@iconify/react";
import { Suspense } from "react";
import MaintainanceLogs from "../pages/manufacturing/workEquipment/details/maintainanceLog";
import EqupmentDetails from "../pages/manufacturing/workStations/details";
import BillOfMAterial from "../pages/manufacturing/billOfMaterial";
import ProductionLines from "../pages/manufacturing/productionLines";
import EquipmentAssignments from "../pages/manufacturing/equipmentAsssignments";
import ProductionPlans from "../pages/manufacturing/productionPlans";
import ProductionPlanDetails from "../pages/manufacturing/productionPlans/details";
//import OrderDetails from "../pages/manufacturing/workCenterOrders/details";
import Overview from "../pages/manufacturing/Overview";
//import ToBeUpdated from "../pages/ToBeUpdated";
import QualityControl from "../pages/manufacturing/qualityControl";
import Materials from "../pages/manufacturing/materials";
import WorkCenters from "../pages/manufacturing/setup/workStations";
import Machines from "../pages/manufacturing/setup/machines";
import WorkOrders from "../pages/manufacturing/workOrders";
import ProductionOrders from "../pages/manufacturing/productionOrders";

// Dynamic imports
//const SettingsPage = lazy(() => import("../pages/settings"));

// Loader fallback component
const Loading = () => <div>Loading...</div>;

const MANUFACTURING_ROUTES = [
  {
    name: "Bill of Materials",
    icon: <Icon icon="mdi:format-list-bulleted-type" fontSize={20} />,
    path: "/bill-of-materials",
    element: (
      <Suspense fallback={<Loading />}>
        <BillOfMAterial />
      </Suspense>
    ),
  },
  {
    name: "Work Orders",
    icon: <Icon icon="mdi:playlist-check" fontSize={20} />,
    path: "/work-orders",
    element: (
      <Suspense fallback={<Loading />}>
        <WorkOrders />
      </Suspense>
    ),
  },
  {
    name: "Production Orders",
    icon: <Icon icon="mdi:hammer-wrench" fontSize={20} />,
    path: "/production-orders",
    element: (
      <Suspense fallback={<Loading />}>
        <ProductionOrders />
      </Suspense>
    ),
  },
  
  {
    name: "Configurations",
    icon: <Icon icon="mdi:gear-outline" fontSize={24} />,
    path: "",
    items: [
      {
        name: "Work Stations",
        icon: <Icon icon="mdi:calendar-clock" fontSize={20} />,
        path: "/workstations",
        element: (
          <Suspense fallback={<Loading />}>
            <WorkCenters />
          </Suspense>
        ),
      },
      {
        name: "Machines",
        icon: <Icon icon="mdi:finance" fontSize={20} />,
        path: "/machines",
        element: (
          <Suspense fallback={<Loading />}>
            <Machines />
          </Suspense>
        ),
      },
    ],
  },
];

export default MANUFACTURING_ROUTES;
