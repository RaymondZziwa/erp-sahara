import { Icon } from "@iconify/react";
import { lazy, Suspense } from "react";
import Customers from "../pages/sales/customers";
import Opportunities from "../pages/sales/opportunities";
import GoodsReceivedNotes from "../pages/sales/goodsReceivedNotes";
import DeliveryNotes from "../pages/sales/deliveryNotes";
import Invoices from "../pages/sales/invoices";

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
    name: "Quotations",
    icon: <Icon icon="mdi:format-quote-open-outline" fontSize={24} />,
    path: "/quotations",
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
    name: "Delivery Notes",
    icon: <Icon icon="mdi:truck-outline" fontSize={24} />,
    path: "/deliverynotes",
    element: (
      <Suspense fallback={<Loading />}>
        <DeliveryNotes />
      </Suspense>
    ),
  },
  // {
  //   name: "Distribution Orders",
  //   icon: <Icon icon="mdi:truck-outline" fontSize={24} />,
  //   path: "/distributionorders",
  //   element: (
  //     <Suspense fallback={<Loading />}>
  //       <DistributionOrders />
  //     </Suspense>
  //   ),
  // },
  {
    name: "Good Received Note",
    icon: <Icon icon="mdi:truck-outline" fontSize={24} />,
    path: "/goodsreceivednotes",
    element: (
      <Suspense fallback={<Loading />}>
        <GoodsReceivedNotes />
      </Suspense>
    ),
  },
  {
    name: "Invoices",
    icon: <Icon icon="mdi:truck-outline" fontSize={24} />,
    path: "/invoices",
    element: (
      <Suspense fallback={<Loading />}>
        <Invoices />
      </Suspense>
    ),
  },
  // {
  //   name: "Letter of Credit",
  //   icon: <Icon icon="mdi:truck-outline" fontSize={24} />,
  //   path: "/distributionorders",
  //   element: (
  //     <Suspense fallback={<Loading />}>
  //       <DistributionOrders />
  //     </Suspense>
  //   ),
  // },
  {
    name: "Configurations",
    icon: <Icon icon="mdi:gear-outline" fontSize={24} />,
    path: "",
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
      {
        name: "Opportunities",
        icon: <Icon icon="solar:hand-money-bold" fontSize={20} />,
        path: "/opportunities",
        element: (
          <Suspense fallback={<Loading />}>
            <Opportunities />
          </Suspense>
        ),
      },
    ],
  },
];

export default SALES_ROUTES;
