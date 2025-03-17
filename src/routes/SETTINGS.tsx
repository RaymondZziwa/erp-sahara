import { Icon } from "@iconify/react";
//import ToBeUpdated from "../pages/ToBeUpdated";
import RoleManagement from "../pages/settings/permissions";
import ApprovalLevels from "../pages/accounts/approvalLevels";

const SETTINGS_ROUTES = [
  {
    name: "General",
    icon: <Icon icon="solar:layers-line-duotone" fontSize={24} />,
    path: "/",
    items: [
      {
        name: "User Roles",
        icon: <Icon icon="solar:layers-line-duotone" fontSize={20} />,
        path: "/",
        element: <RoleManagement />,
      },
      {
        name: "Approval levels",
        icon: <Icon icon="solar:layers-line-duotone" fontSize={20} />,
        path: "approvallevels",
        element: <ApprovalLevels />,
      },
    ],
  },
];
export default SETTINGS_ROUTES;
