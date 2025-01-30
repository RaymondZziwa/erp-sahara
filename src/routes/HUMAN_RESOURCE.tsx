import { Icon } from "@iconify/react";
import { lazy, Suspense } from "react";

// Dynamic imports for components
const Departments = lazy(() => import("../pages/hr/departments"));
const Designations = lazy(() => import("../pages/hr/designations"));
const SalaryStructures = lazy(() => import("../pages/hr/salaryStructures"));
const Employees = lazy(() => import("../pages/hr/employees"));
const Attendencies = lazy(() => import("../pages/hr/attendencies"));
const LeaveTypes = lazy(() => import("../pages/hr/leaveTypes"));
const LeaveApplications = lazy(() => import("../pages/hr/leaveApllications"));
const BonusTypes = lazy(() => import("../pages/hr/salary/bonusTypes"));
const LoanTypes = lazy(() => import("../pages/hr/salary/loanTypes"));
const DeductionTypes = lazy(() => import("../pages/hr/salary/deductionTypes"));
const AllowanceTypes = lazy(() => import("../pages/hr/salary/allowanceTypes"));
const PayrollPeriods = lazy(() => import("../pages/hr/payrollPeriods"));
const Allowances = lazy(() => import("../pages/hr/salary/allowances"));
const Deductions = lazy(() => import("../pages/hr/salary/deductions"));

// Loader fallback component
const Loading = () => <div>Loading...</div>;

const HUMAN_RESOURCE_ROUTES = [
  {
    name: "General",
    icon: <Icon icon="mdi:view-dashboard-outline" fontSize={24} />,
    path: "/",
    items: [
      {
        name: "Main Dashboard",
        icon: <Icon icon="mdi:chart-bar" fontSize={20} />,
        path: "/",
        hidden: true,
        element: (
          <Suspense fallback={<Loading />}>
            <Employees />
          </Suspense>
        ),
      },
      {
        name: "Employees",
        icon: <Icon icon="mdi:account-outline" fontSize={20} />,
        path: "/employees",
        element: (
          <Suspense fallback={<Loading />}>
            <Employees />
          </Suspense>
        ),
      },

      {
        name: "Attendance",
        icon: <Icon icon="mdi:calendar-check-outline" fontSize={20} />,
        path: "/attendencies",
        element: (
          <Suspense fallback={<Loading />}>
            <Attendencies />
          </Suspense>
        ),
      },
    ],
  },

  {
    name: "Salary Management",
    icon: <Icon icon="mdi:currency-usd-circle-outline" fontSize={24} />,
    path: "/salary",
    items: [
      {
        name: "Salary Structures",
        icon: <Icon icon="mdi:cash-multiple" fontSize={20} />,
        path: "/salarystructures",
        element: (
          <Suspense fallback={<Loading />}>
            <SalaryStructures />
          </Suspense>
        ),
      },
      {
        name: "Payroll Periods",
        icon: <Icon icon="mdi:calendar-multiselect-outline" fontSize={20} />,
        path: "/payrollperiods",
        element: (
          <Suspense fallback={<Loading />}>
            <PayrollPeriods />
          </Suspense>
        ),
      },
      {
        name: "Bonus Types",
        icon: <Icon icon="mdi:gift-outline" fontSize={20} />,
        path: "/bonustypes",
        element: (
          <Suspense fallback={<Loading />}>
            <BonusTypes />
          </Suspense>
        ),
      },
      {
        name: "Allowances",
        icon: <Icon icon="mdi:cash-check" fontSize={20} />,
        path: "/allowances",
        element: (
          <Suspense fallback={<Loading />}>
            <Allowances />
          </Suspense>
        ),
      },
      {
        name: "Deductions",
        icon: <Icon icon="mdi:minus-circle-outline" fontSize={20} />,
        path: "/deductions",
        element: (
          <Suspense fallback={<Loading />}>
            <Deductions />
          </Suspense>
        ),
      },
      {
        name: "Loan Types",
        icon: <Icon icon="mdi:bank-outline" fontSize={20} />,
        path: "/loantypes",
        element: (
          <Suspense fallback={<Loading />}>
            <LoanTypes />
          </Suspense>
        ),
      },
      {
        name: "Deduction Types",
        icon: <Icon icon="mdi:percent-outline" fontSize={20} />,
        path: "/deductiontypes",
        element: (
          <Suspense fallback={<Loading />}>
            <DeductionTypes />
          </Suspense>
        ),
      },
      {
        name: "Allowance Types",
        icon: <Icon icon="mdi:wallet-outline" fontSize={20} />,
        path: "/allowancetypes",
        element: (
          <Suspense fallback={<Loading />}>
            <AllowanceTypes />
          </Suspense>
        ),
      },
    ],
  },
  {
    name: "Leave Management",
    icon: <Icon icon="mdi:beach" fontSize={24} />,
    path: "/leave-management",
    items: [
      {
        name: "Leave Types",
        icon: <Icon icon="mdi:beach" fontSize={20} />,
        path: "/leavetypes",
        element: (
          <Suspense fallback={<Loading />}>
            <LeaveTypes />
          </Suspense>
        ),
      },
      {
        name: "Leave Applications",
        icon: <Icon icon="mdi:clipboard-text-outline" fontSize={20} />,
        path: "/leaveapplications",
        element: (
          <Suspense fallback={<Loading />}>
            <LeaveApplications />
          </Suspense>
        ),
      },
    ],
  },
  {
    name: "More",
    icon: <Icon icon="mdi:account-group-outline" fontSize={24} />,
    path: "/hr",
    items: [
      {
        name: "Departments",
        icon: <Icon icon="mdi:office-building-outline" fontSize={20} />,
        path: "/departments",
        element: (
          <Suspense fallback={<Loading />}>
            <Departments />
          </Suspense>
        ),
      },
      {
        name: "Designations",
        icon: <Icon icon="mdi:account-tie-outline" fontSize={20} />,
        path: "/designations",
        element: (
          <Suspense fallback={<Loading />}>
            <Designations />
          </Suspense>
        ),
      },
    ],
  },
];

export default HUMAN_RESOURCE_ROUTES;
