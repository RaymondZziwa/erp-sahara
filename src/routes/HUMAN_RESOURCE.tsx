import { Icon } from "@iconify/react";
import { lazy, Suspense } from "react";
import LoanTypes from "../pages/hr/salary/loanTypes";

// Dynamic imports for components
const Departments = lazy(() => import("../pages/hr/departments"));
const Designations = lazy(() => import("../pages/hr/designations"));
const SalaryStructures = lazy(() => import("../pages/hr/salaryStructures"));
const Employees = lazy(() => import("../pages/hr/employees"));
const Attendencies = lazy(() => import("../pages/hr/attendencies"));
const LeaveTypes = lazy(() => import("../pages/hr/leaveTypes"));
const LeaveApplications = lazy(() => import("../pages/hr/leaveApllications"));
const DeductionTypes = lazy(() => import("../pages/hr/salary/deductionTypes"));
const AllowanceTypes = lazy(() => import("../pages/hr/salary/allowanceTypes"));
const PayrollPeriods = lazy(() => import("../pages/hr/payrollPeriods"));
const Allowances = lazy(() => import("../pages/hr/salary/allowances"));
const Deductions = lazy(() => import("../pages/hr/salary/deductions"));

// Loader fallback component
const Loading = () => <div>Loading...</div>;

const HUMAN_RESOURCE_ROUTES = [
  // {
  //   name: "Dashboard",
  //   icon: <Icon icon="mdi:view-dashboard-outline" fontSize={20} />,
  //   path: "/employees",
  //   element: (
  //     <Suspense fallback={<Loading />}>
  //       <Employees />
  //     </Suspense>
  //   ),
  // },
  {
    name: "Employees",
    icon: <Icon icon="mdi:account-group-outline" fontSize={20} />,
    path: "/employees",
    element: (
      <Suspense fallback={<Loading />}>
        <Employees />
      </Suspense>
    ),
  },
  
  // {
  //   name: "Generate Payroll",
  //   icon: <Icon icon="mdi:file-document-edit-outline" fontSize={20} />,
  //   path: "/payroll",
  //   element: (
  //     <Suspense fallback={<Loading />}>
  //       <PayrollPage />
  //     </Suspense>
  //   ),
  // },
  {
    name: "Attendance and Time Management",
    icon: <Icon icon="mdi:clock-outline" fontSize={24} />,
    path: "",
    items: [
      {
        name: "Clock-in/out",
        icon: <Icon icon="mdi:clock-start" fontSize={20} />,
        path: "/attendencies",
        element: (
          <Suspense fallback={<Loading />}>
            <Attendencies />
          </Suspense>
        ),
      },
      // {
      //   name: "Time sheets",
      //   icon: <Icon icon="mdi:calendar-text-outline" fontSize={20} />,
      //   path: "/attendencies",
      //   element: (
      //     <Suspense fallback={<Loading />}>
      //       <Attendencies />
      //     </Suspense>
      //   ),
      // },
      // {
      //   name: "Shift Management",
      //   icon: <Icon icon="mdi:calendar-sync" fontSize={20} />,
      //   path: "/attendencies",
      //   element: (
      //     <Suspense fallback={<Loading />}>
      //       <Attendencies />
      //     </Suspense>
      //   ),
      // },
      // {
      //   name: "Overtime Calculation",
      //   icon: <Icon icon="mdi:clock-alert-outline" fontSize={20} />,
      //   path: "/attendencies",
      //   element: (
      //     <Suspense fallback={<Loading />}>
      //       <Attendencies />
      //     </Suspense>
      //   ),
      // },
    ],
  },
  // {
  //   name: "Performance Management",
  //   icon: <Icon icon="mdi:chart-box-outline" fontSize={24} />,
  //   path: "",
  //   items: [
  //     {
  //       name: "Goal Setting (KPIs)",
  //       icon: <Icon icon="mdi:target" fontSize={20} />,
  //       path: "/departments",
  //       element: (
  //         <Suspense fallback={<Loading />}>
  //           <Departments />
  //         </Suspense>
  //       ),
  //     },
  //     {
  //       name: "Self and Peer Reviews",
  //       icon: <Icon icon="mdi:account-multiple-check" fontSize={20} />,
  //       path: "/departments",
  //       element: (
  //         <Suspense fallback={<Loading />}>
  //           <Departments />
  //         </Suspense>
  //       ),
  //     },
  //     {
  //       name: "Manager Assessments",
  //       icon: <Icon icon="mdi:account-star-outline" fontSize={20} />,
  //       path: "/departments",
  //       element: (
  //         <Suspense fallback={<Loading />}>
  //           <Departments />
  //         </Suspense>
  //       ),
  //     },
  //     {
  //       name: "Appraisal Cycles and Ratings",
  //       icon: <Icon icon="mdi:chart-arc" fontSize={20} />,
  //       path: "/departments",
  //       element: (
  //         <Suspense fallback={<Loading />}>
  //           <Departments />
  //         </Suspense>
  //       ),
  //     },
  //   ],
  // },
  // {
  //   name: "Training and Development",
  //   icon: <Icon icon="mdi:school-outline" fontSize={24} />,
  //   path: "",
  //   items: [
  //     {
  //       name: "Training Calendar",
  //       icon: <Icon icon="mdi:calendar-month-outline" fontSize={20} />,
  //       path: "/training-calendar",
  //       element: (
  //         <Suspense fallback={<Loading />}>
  //           <Departments />
  //         </Suspense>
  //       ),
  //     },
  //     {
  //       name: "Course Registration and Tracking",
  //       icon: <Icon icon="mdi:notebook-edit-outline" fontSize={20} />,
  //       path: "/course-registration-and-tracking",
  //       element: (
  //         <Suspense fallback={<Loading />}>
  //           <Departments />
  //         </Suspense>
  //       ),
  //     },
  //     {
  //       name: "Certification Tracking",
  //       icon: <Icon icon="mdi:certificate-outline" fontSize={20} />,
  //       path: "/certificate-tracking",
  //       element: (
  //         <Suspense fallback={<Loading />}>
  //           <Departments />
  //         </Suspense>
  //       ),
  //     },
  //     {
  //       name: "Skill Gap Analysis",
  //       icon: <Icon icon="mdi:chart-box-plus-outline" fontSize={20} />,
  //       path: "/skill-gap-analysis",
  //       element: (
  //         <Suspense fallback={<Loading />}>
  //           <Departments />
  //         </Suspense>
  //       ),
  //     },
  //   ],
  // },
  {
    name: "Payroll",
    icon: <Icon icon="mdi:account-group-outline" fontSize={20} />,
    path: "",
    items: [
      {
        name: "Schedule",
        icon: <Icon icon="mdi:note-edit-outline" fontSize={20} />,
        path: "/payroll_schedules",
        element: (
          <Suspense fallback={<Loading />}>
            <PayrollPeriods />
          </Suspense>
        ),
      },
    ]
  },
  //   {
  //   name: "Leave Management",
  //   icon: <Icon icon="mdi:beach" fontSize={24} />,
  //   path: "",
  //   items: [
  //     {
  //       name: "Leave Applications",
  //       icon: <Icon icon="mdi:note-edit-outline" fontSize={20} />,
  //       path: "/leaveapplications",
  //       element: (
  //         <Suspense fallback={<Loading />}>
  //           <LeaveApplications />
  //         </Suspense>
  //       ),
  //     },
  //     // {
  //     //   name: "Balances and Carry Forwards",
  //     //   icon: <Icon icon="mdi:scale-balance" fontSize={20} />,
  //     //   path: "/balancesandcarryforwards",
  //     //   element: (
  //     //     <Suspense fallback={<Loading />}>
  //     //       <LeaveTypes />
  //     //     </Suspense>
  //     //   ),
  //     // },
  //     {
  //       name: "Leave Types",
  //       icon: <Icon icon="mdi:format-list-checks" fontSize={20} />,
  //       path: "/leavetypes",
  //       element: (
  //         <Suspense fallback={<Loading />}>
  //           <LeaveTypes />
  //         </Suspense>
  //       ),
  //     }      
  //   ],
  // },
  //   {
  //   name: "Payroll Setup",
  //   icon: <Icon icon="mdi:calculator-variant-outline" fontSize={24} />,
  //   path: "",
  //   items: [
  //     {
  //       name: "Payroll Schedule",
  //       icon: <Icon icon="mdi:calendar-clock" fontSize={20} />,
  //       path: "/payrollperiods",
  //       element: (
  //         <Suspense fallback={<Loading />}>
  //           <PayrollPeriods />
  //         </Suspense>
  //       ),
  //     },
  //     {
  //       name: "Allowances",
  //       icon: <Icon icon="mdi:plus-circle-outline" fontSize={20} />,
  //       path: "/allowances",
  //       element: (
  //         <Suspense fallback={<Loading />}>
  //           <Allowances />
  //         </Suspense>
  //       ),
  //     },
  //     {
  //       name: "Deductions",
  //       icon: <Icon icon="mdi:minus-circle-outline" fontSize={20} />,
  //       path: "/deductions",
  //       element: (
  //         <Suspense fallback={<Loading />}>
  //           <Deductions />
  //         </Suspense>
  //       ),
  //     },
     
  //   ],
  // },
  {
    name: "Configurations",
    icon: <Icon icon="mdi:dots-horizontal" fontSize={24} />,
    path: "",
    items: [
     {
        name: "Salary Structures",
        icon: <Icon icon="mdi:currency-usd" fontSize={20} />,
        path: "/salarystructures",
        element: (
          <Suspense fallback={<Loading />}>
            <SalaryStructures />
          </Suspense>
        ),
      },
    {
        name: "Loan Types",
        icon: <Icon icon="mdi:chart-pie" fontSize={20} />,
        path: "/loantypes",
        element: (
          <Suspense fallback={<Loading />}>
            <LoanTypes />
          </Suspense>
        ),
      },
       {
        name: "Deduction Types",
        icon: <Icon icon="mdi:chart-pie" fontSize={20} />,
        path: "/deductiontypes",
        element: (
          <Suspense fallback={<Loading />}>
            <DeductionTypes />
          </Suspense>
        ),
      },
      {
        name: "Allowance Types",
        icon: <Icon icon="mdi:wallet-plus-outline" fontSize={20} />,
        path: "/allowancetypes",
        element: (
          <Suspense fallback={<Loading />}>
            <AllowanceTypes />
          </Suspense>
        ),
      },
      {
        name: "Departments",
        icon: <Icon icon="mdi:office-building-cog-outline" fontSize={20} />,
        path: "/departments",
        element: (
          <Suspense fallback={<Loading />}>
            <Departments />
          </Suspense>
        ),
      },
      {
        name: "Designations",
        icon: <Icon icon="mdi:badge-account-horizontal-outline" fontSize={20} />,
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