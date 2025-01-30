import { Icon } from "@iconify/react";
import { lazy, Suspense } from "react";
import Suppliers from "../pages/inventory/suppliers";

// Dynamic imports
//const Dashboard = lazy(() => import("../pages/dashboard"));
const BidEvaluations = lazy(() => import("../pages/procurement/bidEvaluation"));
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
    name: "Dashboard",
    icon: <Icon icon="solar:dashboard-outline" fontSize={24} />,
    path: "",
    items: [
      {
        name: "Purchase Requests",
        icon: <Icon icon="solar:layers-line-duotone" fontSize={20} />,
        path: "/",
        element: (
          <Suspense fallback={<Loading />}>
            {/* <Dashboard /> */}
            <PurchaseRequests />
          </Suspense>
        ),
      },
    ],
  },
  {
    name: "General Operations",
    icon: <Icon icon="solar:cart-outline" fontSize={24} />,
    path: "/procurement",
    items: [
      // {
      //   name: "Purchase Requests",
      //   icon: <Icon icon="solar:cart-outline" fontSize={20} />,
      //   path: "/purchaserequests",
      //   element: (
      //     <Suspense fallback={<Loading />}>
      //       <PurchaseRequests />
      //     </Suspense>
      //   ),
      // },
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
        name: "Bids",
        icon: <Icon icon="solar:hand-money-outline" fontSize={20} />,
        path: "/bids",
        element: (
          <Suspense fallback={<Loading />}>
            <Bids />
          </Suspense>
        ),
      },
      {
        name: "Bid Evaluation",
        icon: <Icon icon="solar:star-outline" fontSize={20} />,
        path: "/bidevaluation",
        element: (
          <Suspense fallback={<Loading />}>
            <BidEvaluations />
          </Suspense>
        ),
      },
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
    ],
  },
  // {
  //   name: "Bidding & Evaluation",
  //   icon: <Icon icon="solar:hand-money-outline" fontSize={24} />,
  //   path: "/bidding",
  //   items: [],
  // },
  {
    name: "More",
    icon: <Icon icon="solar:settings-outline" fontSize={24} />,
    path: "/more",
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
        name: "Suppliers",
        icon: <Icon icon="solar:align-vertical-center-outline" fontSize={20} />,
        path: "/suppliers",
        element: (
          <Suspense fallback={<Loading />}>
            <Suppliers />
          </Suspense>
        ),
      },
    ],
  },
];

export default PROCUREMENT_ROUTES;
