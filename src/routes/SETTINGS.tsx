import { Icon } from "@iconify/react";
//import ToBeUpdated from "../pages/ToBeUpdated";
import RoleManagement from "../pages/settings/permissions";
import UserSettings from "../pages/settings/users";
import ApprovalLevels from "../pages/settings/approval_levels";

const SETTINGS_ROUTES = [
  {
    name: "General",
    icon: <Icon icon="solar:layers-line-duotone" fontSize={24} />,
    path: "/",
    items: [
      // {
      //   name: "Users",
      //   icon: <Icon icon="solar:user-line-duotone" fontSize={20} />,
      //   path: "users",
      //   element: <UserSettings />,
      // },
      {
        name: "User Roles",
        icon: <Icon icon="solar:layers-line-duotone" fontSize={20} />,
        path: "userroles",
        element: <RoleManagement />,
      },
      {
        name: "Approval levels",
        icon: <Icon icon="solar:layers-line-duotone" fontSize={20} />,
        path: "approvallevels",
        element: <ApprovalLevels />,
      },
      {
        // name: "Setting",
        // icon: <Icon icon="solar:layers-line-duotone" fontSize={20} />,
        path: "/",
        element: <UserSettings />,
      },
    ],
  },
];
export default SETTINGS_ROUTES;
