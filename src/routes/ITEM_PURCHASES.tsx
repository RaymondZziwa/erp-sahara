import { Icon } from "@iconify/react";
import { Suspense } from "react";
import QaSettings from "../pages/procurement/itemPurchases/qaSettings";
import SettlementTable from "../pages/accounts/itemDeliveryPayment";
import ItemPurchases from "../pages/procurement/itemPurchases/itemPurchases";

// Loader fallback component
const Loading = () => <div>Loading...</div>;

const ITEM_PURCHASES_ROUTES = [
  {
    name: "Item Deliveries",
    icon: <Icon icon="mdi:truck-delivery-outline" fontSize={20} />, // Better icon for deliveries
    path: "/itempurchases",
    element: (
      <Suspense fallback={<Loading />}>
        <ItemPurchases />
      </Suspense>
    ),
  },
  {
    name: "Supplier Payments",
    icon: <Icon icon="mdi:cash-check" fontSize={20} />, // Represents payments/settlements
    path: "/supplier-payment",
    element: (
      <Suspense fallback={<Loading />}>
        <SettlementTable />
      </Suspense>
    ),
  },
  {
    name: "QA Settings",
    icon: <Icon icon="mdi:flask-outline" fontSize={20} />, // QA/testing representation
    path: "/qasettings",
    element: (
      <Suspense fallback={<Loading />}>
        <QaSettings />
      </Suspense>
    ),
  },
];

export default ITEM_PURCHASES_ROUTES;
