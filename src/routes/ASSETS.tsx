import { Icon } from "@iconify/react";
import AssetsManagement from "../pages/assets/manage_assets";
//import ToBeUpdated from "../pages/ToBeUpdated";
import AssetsCategories from "../pages/assets/categories/manage_categories";
import AssetDetails from "../pages/assets/assetDetails/assetDetails";
import AssetAssignment from "../pages/assets/asset_assignment";
//import AssetIncomeTypes from "../pages/assets/income_types";

const ASSETS = [
  {
    name: "General",
    icon: <Icon icon="solar:layers-line-duotone" fontSize={24} />,
    path: "/",
    items: [
      {
        name: "Asset Management",
        icon: <Icon icon="solar:card-2-bold-duotone" fontSize={20} />,
        path: "",
        element: <AssetsManagement />,
      },
      {
        name: "Asset Categories",
        icon: <Icon icon="solar:layers-line-duotone" fontSize={20} />,
        path: "asset_categories",
        element: <AssetsCategories />,
      },
      // {
      //   name: "Asset Income Types",
      //   icon: <Icon icon="solar:layers-line-duotone" fontSize={20} />,
      //   path: "asset_income_types",
      //   element: <AssetIncomeTypes />,
      // },
      {
        name: "Asset Details",
        icon: <Icon icon="solar:layers-line-duotone" fontSize={20} />,
        path: `asset_details/:id`,
        element: <AssetDetails />,
        hidden: true,
      },
      {
        name: "Asset Assignment",
        icon: <Icon icon="solar:layers-line-duotone" fontSize={20} />,
        path: "asset_assignment",
        element: <AssetAssignment />,
      },
      {
        name: "Asset Maintenance",
        icon: <Icon icon="solar:layers-line-duotone" fontSize={20} />,
        path: "asset_maintenance",
        element: <AssetsCategories />,
      },
    ],
  },
];
export default ASSETS;
