import { Icon } from "@iconify/react";
import AssetsManagement from "../pages/assets/manage_assets";

const ASSETS = [
  {
    name: "General",
    icon: <Icon icon="solar:layers-line-duotone" fontSize={24} />,
    path: "/",
    items: [
      {
        name: "Asset Management",
        icon: <Icon icon="solar:card-2-bold-duotone" fontSize={20} />,
        path: "/",
        element: <AssetsManagement />,
      },
      // {
      //   name: "Maintainance management",
      //   icon: <Icon icon="solar:layers-line-duotone" fontSize={20} />,
      //   path: "/userroles",
      //   element: <ToBeUpdated />,
      // },
    ],
  },
];
export default ASSETS;
