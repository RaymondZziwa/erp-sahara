
import { Icon } from "@iconify/react";
import { Suspense } from "react";
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
//import OrderDetails from "../pages/manufacturing/workCenterOrders/details";
import Overview from "../pages/manufacturing/Overview";
//import ToBeUpdated from "../pages/ToBeUpdated";
import QualityControl from "../pages/manufacturing/qualityControl";
import Materials from "../pages/manufacturing/materials";

// Dynamic imports
//const SettingsPage = lazy(() => import("../pages/settings"));

// Loader fallback component
const Loading = () => <div>Loading...</div>;

const MANUFACTURING_ROUTES = [

  {
    name: "Production Orders",
    icon: <Icon icon="mdi:file-document-outline" fontSize={20} />,
    path: "/",
    element: (
      <Suspense fallback={<Loading />}>
        <WorkOrders />
      </Suspense>
    ),
  },
  {
    name: "Settings",
    icon: <Icon icon="mdi:gear-outline" fontSize={24} />,
    path: "/workcenters",
    items: [
      {
        name: "Work Stations",
        icon: <Icon icon="mdi:calendar-clock" fontSize={20} />,
        path: "/centers",
        element: (
          <Suspense fallback={<Loading />}>
            <WorkCenters />
          </Suspense>
        ),
      },
      {
        name: "Machines",
        icon: <Icon icon="mdi:finance" fontSize={20} />,
        path: "/equipment",
        element: (
          <Suspense fallback={<Loading />}>
            <EquipmentComp />
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
      // {
      //   name: "Production Plans",
      //   icon: <Icon icon="mdi:finance" fontSize={20} />,
      //   path: "/productionplans",
      //   element: (
      //     <Suspense fallback={<Loading />}>
      //       <ProductionPlans />
      //     </Suspense>
      //   ),
      // },
      // {
      //   name: "Processing",
      //   icon: <Icon icon="mdi:finance" fontSize={20} />,
      //   path: "/productionplans",
      //   element: (
      //     <Suspense fallback={<Loading />}>
      //       <ProductionPlans />
      //     </Suspense>
      //   ),
      // },
      // {
      //   name: "Production Output",
      //   icon: <Icon icon="mdi:finance" fontSize={20} />,
      //   path: "/productionplans",
      //   element: (
      //     <Suspense fallback={<Loading />}>
      //       <ProductionPlans />
      //     </Suspense>
      //   ),
      // },
      // {
      //   name: "Equipment Details",
      //   icon: <Icon icon="mdi:finance" fontSize={20} />,
      //   path: "/equipment/:id",
      //   element: (
      //     <Suspense fallback={<Loading />}>
      //       <MaintainanceLogs />
      //     </Suspense>
      //   ),
      //   hidden: true
      // },
      // {
      //   name: "Plan Details",
      //   icon: <Icon icon="mdi:finance" fontSize={20} />,
      //   path: "/productionplans/:id",
      //   element: (
      //     <Suspense fallback={<Loading />}>
      //       <ProductionPlanDetails />
      //     </Suspense>
      //   ),
      // },
      // {
      //   name: "Center Details",
      //   icon: <Icon icon="mdi:finance" fontSize={20} />,
      //   path: "/centers/:id",
      //   element: (
      //     <Suspense fallback={<Loading />}>
      //       <EqupmentDetails />
      //     </Suspense>
      //   ),
      //   hidden: true
      // },
      // {
      //   name: "Quality Control",
      //   icon: <Icon icon="mdi:finance" fontSize={20} />,
      //   path: "/qualitycontrol",
      //   element: (
      //     <Suspense fallback={<Loading />}>
      //       <QualityControl />
      //     </Suspense>
      //   ),
      // },
    ],
  },
];

export default MANUFACTURING_ROUTES;
