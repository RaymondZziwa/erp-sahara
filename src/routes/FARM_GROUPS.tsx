import { Icon } from "@iconify/react";
import { Suspense } from "react";
import FarmGroups from "../pages/farmGroups";
import Crops from "../pages/crops";


// Loader fallback component
const Loading = () => <div>Loading...</div>;

const FARM_GROUP_ROUTES = [
  {
    name: "Farm Group Management",
    icon: <Icon icon="mdi:view-dashboard-outline" fontSize={24} />,
    path: "",
    items: [
      {
        name: "Membership",
        icon: <Icon icon="mdi:chart-timeline" fontSize={20} />,
        path: "/",
        element: (
          <Suspense fallback={<Loading />}>
            <FarmGroups />
          </Suspense>
        ),
      },
      {
        name: "Registration",
        icon: <Icon icon="mdi:chart-timeline" fontSize={20} />,
        path: "#",
        element: (
          <Suspense fallback={<Loading />}>
            <FarmGroups />
          </Suspense>
        ),
      },
      {
        name: "Profiles",
        icon: <Icon icon="mdi:chart-timeline" fontSize={20} />,
        path: "#",
        element: (
          <Suspense fallback={<Loading />}>
            <FarmGroups />
          </Suspense>
        ),
      },
    ],
  },
  {
    name: "Others",
    icon: <Icon icon="mdi:view-dashboard-outline" fontSize={24} />,
    path: "",
    items: [
      {
        name: "Economic Activities",
        icon: <Icon icon="mdi:chart-timeline" fontSize={20} />,
        path: "#",
        element: (
          <Suspense fallback={<Loading />}>
            <Crops />
          </Suspense>
        ),
      },
      {
        name: "Marketting",
        icon: <Icon icon="mdi:chart-timeline" fontSize={20} />,
        path: "#",
        element: (
          <Suspense fallback={<Loading />}>
            <Crops />
          </Suspense>
        ),
      },
      {
        name: "Warehouses",
        icon: <Icon icon="mdi:chart-timeline" fontSize={20} />,
        path: "#",
        element: (
          <Suspense fallback={<Loading />}>
            <Crops />
          </Suspense>
        ),
      },
      {
        name: "Grading Prices",
        icon: <Icon icon="mdi:chart-timeline" fontSize={20} />,
        path: "#",
        element: (
          <Suspense fallback={<Loading />}>
            <Crops />
          </Suspense>
        ),
      },
    ],
  },
];

export default FARM_GROUP_ROUTES;
