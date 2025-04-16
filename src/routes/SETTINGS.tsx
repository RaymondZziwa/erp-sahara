import { Icon } from "@iconify/react";
//import ToBeUpdated from "../pages/ToBeUpdated";
import RoleManagement from "../pages/settings/permissions";
import ApprovalLevels from "../pages/settings/approval_levels";
import ProfilePage from "../pages/settings/profile";
import UserProfile from "../pages/settings/user_settings";

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
      {
        name: "Company profile",
        icon: <Icon icon="solar:layers-line-duotone" fontSize={20} />,
        path: "profile",
        element: <ProfilePage />,
      },
      {
        name: "User profile",
        icon: <Icon icon="solar:layers-line-duotone" fontSize={20} />,
        path: "user_profile",
        element: <UserProfile />,
      },
    ],
  },
];
export default SETTINGS_ROUTES;
