import { Icon } from "@iconify/react";
import { lazy, Suspense } from "react";
import Customers from "../pages/inventory/customers";

// Dynamic imports
const Quotations = lazy(() => import("../pages/sales/quotations"));
const Leads = lazy(() => import("../pages/sales/leads"));
const CustomerOrders = lazy(() => import("../pages/sales/purchaseOrders"));
const DistributionOrders = lazy(
  () => import("../pages/sales/distributionOrders")
);

// Loader fallback
const Loading = () => <div>Loading...</div>;

const SALES_ROUTES = [
  {
    name: "General",
    icon: <Icon icon="solar:cart-outline" fontSize={24} />,
    path: "",
    items: [
      {
        name: "Quotations",
        icon: <Icon icon="mdi:format-quote-open-outline" fontSize={24} />,
        path: "/",
        element: (
          <Suspense fallback={<Loading />}>
            <Quotations />
          </Suspense>
        ),
      },
      {
        name: "Customer Orders",
        icon: <Icon icon="solar:cart-line-duotone" fontSize={24} />,
        path: "/customerorders",
        element: (
          <Suspense fallback={<Loading />}>
            <CustomerOrders />
          </Suspense>
        ),
      },
      {
        name: "Distribution Orders",
        icon: <Icon icon="mdi:truck-outline" fontSize={24} />,
        path: "/distributionorders",
        element: (
          <Suspense fallback={<Loading />}>
            <DistributionOrders />
          </Suspense>
        ),
      },

      {
        name: "Leads",
        icon: <Icon icon="mdi:lead-pencil" fontSize={24} />,
        path: "/leads",
        element: (
          <Suspense fallback={<Loading />}>
            <Leads />
          </Suspense>
        ),
      },
    ],
  },
  {
    name: "More",
    icon: <Icon icon="solar:cart-outline" fontSize={24} />,
    path: "/more",
    items: [
      {
        name: "Customers",
        icon: <Icon icon="solar:users-group-rounded-bold" fontSize={20} />,
        path: "/customers",
        element: (
          <Suspense fallback={<Loading />}>
            <Customers />
          </Suspense>
        ),
      },
    ],
  },
];

export default SALES_ROUTES;
