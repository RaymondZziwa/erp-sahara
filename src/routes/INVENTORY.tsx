import { Icon } from "@iconify/react";
import { lazy, Suspense } from "react";
import AddProduct from "../pages/inventory/items/add";
// import InventoryDashboard from "../pages/inventory/inventories/InventoryDashboard";
import InventoryDashboard from "../pages/inventory/inventories/InventoryDashboard";
//import Dashboard from "../pages/inventory/inventories/new_dasboard";
import POS from "../pages/inventory/pos/pos";
import StockOut from "../pages/inventory/inventories/stock_out";

// Dynamic imports
//const Dashboard = lazy(() => import("../pages/dashboard"));
const UnitsOfMeasurement = lazy(
  () => import("../pages/procurement/settings/units")
);
const Suppliers = lazy(() => import("../pages/inventory/suppliers"));
const ItemCategories = lazy(() => import("../pages/inventory/categories"));
const Items = lazy(() => import("../pages/inventory/items"));
const Warehouses = lazy(() => import("../pages/inventory/warehouses"));
const Inventories = lazy(() => import("../pages/inventory/inventories"));
// const Variants = lazy(() => import("../pages/inventory/variants"));
const Trucks = lazy(() => import("../pages/inventory/trucks"));
const Drivers = lazy(() => import("../pages/inventory/drivers"));

// Loader fallback component
const Loading = () => <div>Loading...</div>;

const INVENTORY_ROUTES = [
  {
    name: "General",
    icon: <Icon icon="solar:layers-line-duotone" fontSize={24} />,
    path: "",
    items: [
      {
        name: "Dashboard",
        icon: <Icon icon="solar:layers-line-duotone" fontSize={20} />,
        path: "/",
        element: (
          <Suspense fallback={<Loading />}>
            <InventoryDashboard />
          </Suspense>
        ),
      },
      {
        name: "Point Of Sale",
        icon: <Icon icon="ph:house-simple-duotone" fontSize={20} />,
        path: "/pos",
        element: (
          <Suspense fallback={<Loading />}>
            <POS />
          </Suspense>
        ),
      },
      // {
      //   name: "Stock Transfer",
      //   icon: <Icon icon="solar:archive-outline" fontSize={20} />,
      //   path: "/stock",
      //   element: (
      //     <Suspense fallback={<Loading />}>
      //       <StockMovements />
      //     </Suspense>
      //   ),
      // },
      {
        name: "Stock In",
        icon: <Icon icon="solar:archive-outline" fontSize={20} />,
        path: "/record",
        element: (
          <Suspense fallback={<Loading />}>
            <Inventories />
          </Suspense>
        ),
      },
      {
        name: "Stock Out",
        icon: <Icon icon="solar:archive-outline" fontSize={20} />,
        path: "/stock_out",
        element: (
          <Suspense fallback={<Loading />}>
            <StockOut />
          </Suspense>
        ),
      },
    ],
  },
  {
    name: "More",
    icon: <Icon icon="solar:archive-outline" fontSize={24} />,
    path: "/inventory",
    items: [
      {
        name: "Stores",
        icon: <Icon icon="ph:house-simple-duotone" fontSize={20} />,
        path: "/warehouses",
        element: (
          <Suspense fallback={<Loading />}>
            <Warehouses />
          </Suspense>
        ),
      },
      // {
      //   name: "Store types",
      //   icon: <Icon icon="ph:house-simple-duotone" fontSize={20} />,
      //   path: "/warehousetypes",
      //   element: (
      //     <Suspense fallback={<Loading />}>
      //       <WarehouseTypes />
      //     </Suspense>
      //   ),
      // },
      {
        name: "Suppliers",
        icon: <Icon icon="solar:buildings-3-outline" fontSize={20} />,
        path: "/suppliers",
        element: (
          <Suspense fallback={<Loading />}>
            <Suppliers />
          </Suspense>
        ),
      },
      {
        name: "Trucks",
        icon: <Icon icon="material-symbols:fire-truck" fontSize={20} />,
        path: "/trucks",
        element: (
          <Suspense fallback={<Loading />}>
            <Trucks />
          </Suspense>
        ),
      },
      {
        name: "Drivers",
        icon: <Icon icon="material-symbols:person-4-outline-rounded" />,
        path: "/drivers",
        element: (
          <Suspense fallback={<Loading />}>
            <Drivers />
          </Suspense>
        ),
      },
      {
        name: "Item Categories",
        icon: <Icon icon="solar:box-outline" fontSize={20} />,
        path: "/itemscategories",
        element: (
          <Suspense fallback={<Loading />}>
            <ItemCategories />
          </Suspense>
        ),
      },
      {
        name: "Items",
        icon: <Icon icon="solar:box-outline" fontSize={20} />,
        path: "/items",
        element: (
          <Suspense fallback={<Loading />}>
            <Items />
          </Suspense>
        ),
      },

      // {
      //   name: "Item Attributes",
      //   icon: <Icon icon="solar:box-outline" fontSize={20} />,
      //   path: "/attributes",
      //   element: (
      //     <Suspense fallback={<Loading />}>
      //       <ItemAttributes />
      //     </Suspense>
      //   ),
      // },

      {
        name: "Items",
        icon: <Icon icon="solar:box-outline" fontSize={20} />,
        path: "/items/add",
        hidden: true,
        element: (
          <Suspense fallback={<Loading />}>
            <AddProduct />
          </Suspense>
        ),
      },
      // {
      //   name: "Brands",
      //   icon: <Icon icon="tabler:brand-office" fontSize={20} />,
      //   path: "/brands",
      //   element: (
      //     <Suspense fallback={<Loading />}>
      //       <Brands />
      //     </Suspense>
      //   ),
      // },

      {
        name: "Units of Measurement",
        icon: <Icon icon="solar:ruler-outline" fontSize={20} />,
        path: "/uom",
        element: (
          <Suspense fallback={<Loading />}>
            <UnitsOfMeasurement />
          </Suspense>
        ),
      },
    ],
  },
];

export default INVENTORY_ROUTES;
