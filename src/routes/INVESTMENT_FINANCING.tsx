import { Icon } from "@iconify/react";
import ToBeUpdated from "../pages/ToBeUpdated";

const INVESTMENT_FINANCING = [
  {
    name: "General",
    icon: <Icon icon="solar:layers-line-duotone" fontSize={24} />,
    path: "/",
    items: [
      {
        name: "Financing Agreement",
        icon: <Icon icon="solar:user-line-duotone" fontSize={20} />,
        path: "/",
        element: <ToBeUpdated />,
      },
      {
        name: "Ownership Tracking",
        icon: <Icon icon="solar:layers-line-duotone" fontSize={20} />,
        path: "/userroles",
        element: <ToBeUpdated />,
      },
    ],
  },
  {
    name: "Reports",
    icon: <Icon icon="solar:layers-line-duotone" fontSize={24} />,
    path: "/reports",
    items: [
      {
        name: "Outstanding financings and payments",
        icon: <Icon icon="solar:user-line-duotone" fontSize={20} />,
        path: "/",
        element: <ToBeUpdated />,
      },
      {
        name: "Overdue payments.",
        icon: <Icon icon="solar:layers-line-duotone" fontSize={20} />,
        path: "/overdue",
        element: <ToBeUpdated />,
      },
      {
        name: "Asset values and depreciation schedules",
        icon: <Icon icon="solar:layers-line-duotone" fontSize={20} />,
        path: "/values",
        element: <ToBeUpdated />,
      },
    ],
  },
];
export default INVESTMENT_FINANCING;
