import { Icon } from "@iconify/react";
import { lazy, Suspense } from "react";
import ProcurementTypes from "../pages/procurement/procTypes";
import Services from "../pages/procurement/services";
import ItemPurchases from "../pages/procurement/itemPurchases/itemPurchases";

// Dynamic imports

const Bids = lazy(() => import("../pages/procurement/bids"));
const EvaluationCriteria = lazy(
  () => import("../pages/procurement/evaluationCriteria")
);
const GoodsReceived = lazy(() => import("../pages/procurement/goodsRecieved"));
const PurchaseOrders = lazy(
  () => import("../pages/procurement/purchaseOrders")
);
const PurchaseRequests = lazy(
  () => import("../pages/procurement/purchaseRequests")
);
const RequestForQuotationItems = lazy(
  () => import("../pages/procurement/requestForQuotation")
);

// Loader fallback
const Loading = () => <div>Loading...</div>;

const PROCUREMENT_ROUTES = [
  
  
  {
    name: "Purchase Requests",
    icon: <Icon icon="solar:layers-line-duotone" fontSize={20} />,
    path: "/purchase-requests",
    element: (
      <Suspense fallback={<Loading />}>
        <PurchaseRequests />
      </Suspense>
    ),
  },
  {
    name: "Requests for Quotation",
    icon: <Icon icon="solar:crown-star-line-duotone" fontSize={20} />,
    path: "/quotationrequestss",
    element: (
      <Suspense fallback={<Loading />}>
        <RequestForQuotationItems />
      </Suspense>
    ),
  },
  {
    name: "Supplier Quotations",
    icon: <Icon icon="solar:hand-money-outline" fontSize={20} />,
    path: "/bids",
    element: (
      <Suspense fallback={<Loading />}>
        <Bids />
      </Suspense>
    ),
    hidden: true
  },
  // {
  //   name: "Quotation Evaluation",
  //   icon: <Icon icon="solar:star-outline" fontSize={20} />,
  //   path: "/bidevaluation",
  //   element: (
  //     <Suspense fallback={<Loading />}>
  //       <BidEvaluations />
  //     </Suspense>
  //   ),
  // },
   {
    name: "Purchase Orders",
    icon: <Icon icon="solar:cart-line-duotone" fontSize={24} />,
    path: "/purchaseorders",
    element: (
      <Suspense fallback={<Loading />}>
        <PurchaseOrders />
      </Suspense>
    ),
  },
  {
    name: "Goods Received",
    icon: <Icon icon="solar:box-outline" fontSize={20} />,
    path: "/goodsreceived",
    element: (
      <Suspense fallback={<Loading />}>
        <GoodsReceived />
      </Suspense>
    ),
  },
  {
    name: "Configurations",
    icon: <Icon icon="solar:settings-outline" fontSize={24} />,
    path: "",
    items: [
      {
        name: "Evaluation Criteria",
        icon: <Icon icon="solar:align-vertical-center-outline" fontSize={20} />,
        path: "/evaluationcriteria",
        element: (
          <Suspense fallback={<Loading />}>
            <EvaluationCriteria />
          </Suspense>
        ),
      },
      {
        name: "Procurement Types",
        icon: <Icon icon="solar:cart-line-duotone" fontSize={24} />,
        path: "/procurement-types",
        element: (
          <Suspense fallback={<Loading />}>
            <ProcurementTypes />
          </Suspense>
        ),
      },
      {
        name: "Services",
        icon: <Icon icon="solar:star-outline" fontSize={20} />,
        path: "/services",
        element: (
          <Suspense fallback={<Loading />}>
            <Services />
          </Suspense>
        ),
      },
      
    ],
  },
];

export default PROCUREMENT_ROUTES;
