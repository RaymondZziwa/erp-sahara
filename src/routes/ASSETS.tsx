import { Icon } from "@iconify/react";
import ToBeUpdated from "../pages/ToBeUpdated";

const ASSETS = [
  {
    name: "General",
    icon: <Icon icon="solar:layers-line-duotone" fontSize={24} />,
    path: "/",
    items: [
      {
        name: "Asset Inventory",
        icon: <Icon icon="solar:card-2-bold-duotone" fontSize={20} />,
        path: "/",
        element: <ToBeUpdated />,
      },
      {
        name: "Maintainance management",
        icon: <Icon icon="solar:layers-line-duotone" fontSize={20} />,
        path: "/userroles",
        element: <ToBeUpdated />,
      },
    ],
  },
];
export default ASSETS;
