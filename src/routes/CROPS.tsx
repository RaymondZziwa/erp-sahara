import { Icon } from "@iconify/react";
import { Suspense } from "react";
import WorkCenters from "../pages/manufacturing/workCenters";
import Crops from "../pages/crops";

// Dynamic imports

// Loader fallback component
const Loading = () => <div>Loading...</div>;

const CROPS_ROUTES = [
  {
    name: "Crops Management",
    icon: <Icon icon="mdi:view-dashboard-outline" fontSize={24} />,
    path: "",
    items: [
      {
        name: "View Crops",
        icon: <Icon icon="mdi:chart-timeline" fontSize={20} />,
        path: "/",
        element: (
          <Suspense fallback={<Loading />}>
            <Crops />
          </Suspense>
        ),
      },
    ],
  },
];

export default CROPS_ROUTES;
