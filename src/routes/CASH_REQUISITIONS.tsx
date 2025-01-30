import { Icon } from "@iconify/react";

import CashRequisitions from "../pages/accounts/cashRequisition";
//import ApprovalLevels from "../pages/accounts/approvalLevels";
import { Suspense } from "react";
import CashRequisitionDetails from "../pages/accounts/cashRequisition/requisitonDetails";
import AddCashRequisition from "../pages/accounts/cashRequisition/add";

// Loader fallback component
const Loading = () => <div>Loading...</div>;
const CASHREQUISITION_ROUTES = [
  {
    name: "General",
    icon: <Icon icon="solar:layers-line-duotone" fontSize={24} />,
    path: "",
    items: [
      {
        name: "Requisitions",
        icon: <Icon icon="solar:book-line-duotone" fontSize={20} />,
        path: "/req",
        element: <CashRequisitions />,
      },
      {
        // name: "Requisitions",
        // icon: <Icon icon="solar:book-line-duotone" fontSize={20} />,
        path: "/req/add",
        element: <AddCashRequisition />,
      },
      {
        name: "Requisitions",
        icon: <Icon icon="solar:book-line-duotone" fontSize={20} />,
        path: "/",
        element: <CashRequisitions />,
        hidden: true,
      },

      // {
      //   name: "Approval Levels",
      //   icon: <Icon icon="solar:book-line-duotone" fontSize={20} />,
      //   path: "/levels",
      //   element: <ApprovalLevels />,
      // },
      {
        hidden: true,
        name: "Cash Requisitions Details",
        icon: <Icon icon="mdi:folder-multiple-outline" fontSize={20} />,
        path: "/req/:id",
        element: (
          <Suspense fallback={<Loading />}>
            <CashRequisitionDetails />
          </Suspense>
        ),
      },
    ],
  },
];
export default CASHREQUISITION_ROUTES;
