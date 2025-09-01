import { Icon } from "@iconify/react";
import { Suspense } from "react";
import SupplierLoans from "../pages/supplierLoans";

// Dynamic imports

// Loader fallback
const Loading = () => <div>Loading...</div>;

const SUPPLIER_LOANS_ROUTES = [
  {
    name: "Supplier Loans",
    icon: <Icon icon="mdi:bank-transfer" fontSize={20} />,
    path: "/supplier-loans",
    element: (
      <Suspense fallback={<Loading />}>
        <SupplierLoans />
      </Suspense>
    ),
  },
];

export default SUPPLIER_LOANS_ROUTES;
