import { Icon } from "@iconify/react";
import { lazy, Suspense } from "react";
import HealthWorkers from "../pages/mossApp/healthWorkers";

// Dynamic imports
const Sliders = lazy(() => import("../pages/mossApp/sliders"));
const HealthConditions = lazy(() => import("../pages/mossApp/conditions"));
const Interests = lazy(() => import("../pages/mossApp/interests"));
const Reminders = lazy(() => import("../pages/mossApp/reminders"));
const Drugs = lazy(() => import("../pages/mossApp/drugs"));
const Facilities = lazy(() => import("../pages/mossApp/facilities"));
const Tips = lazy(() => import("../pages/mossApp/tips"));
const Communities = lazy(() => import("../pages/mossApp/communities"));
const Stories = lazy(() => import("../pages/mossApp/stories"));
const Users = lazy(() => import("../pages/mossApp/users"));
const AppointmentTypes = lazy(
  () => import("../pages/mossApp/appointmentTypes")
);
const Appointments = lazy(() => import("../pages/mossApp/appointments"));
const MossAppDashboard = lazy(() => import("../pages/mossApp/dashboard"));
const ReminderStats = lazy(
  () => import("../pages/mossApp/reminders/ReminderStats")
);

// Loader fallback component
const Loading = () => <div>Loading...</div>;

const MOSS_APP_ROUTES = [
  {
    name: "Dashboard",
    icon: <Icon icon="mdi:view-dashboard-outline" fontSize={24} />,
    path: "",
    items: [
      {
        name: "Dashboard",
        icon: <Icon icon="mdi:view-dashboard-outline" fontSize={20} />,
        path: "/",
        element: (
          <Suspense fallback={<Loading />}>
            <MossAppDashboard />
          </Suspense>
        ),
      },
      {
        name: "Reminder stats",
        icon: <Icon icon="mdi:view-dashboard-outline" fontSize={20} />,
        path: "/reminderstats",
        element: (
          <Suspense fallback={<Loading />}>
            <ReminderStats />
          </Suspense>
        ),
      },
    ],
  },
  {
    name: "Health Management",
    icon: <Icon icon="mdi:health-medical" fontSize={24} />,
    path: "/health",
    items: [
      {
        name: "Conditions",
        icon: <Icon icon="mdi:alert-circle-outline" fontSize={20} />,
        path: "/conditions",
        element: (
          <Suspense fallback={<Loading />}>
            <HealthConditions />
          </Suspense>
        ),
      },
      {
        name: "Drugs",
        icon: <Icon icon="mdi:pill" fontSize={20} />,
        path: "/drugs",
        element: (
          <Suspense fallback={<Loading />}>
            <Drugs />
          </Suspense>
        ),
      },
    ],
  },
  {
    name: "Appointments",
    icon: <Icon icon="mdi:calendar-clock" fontSize={24} />,
    path: "/appointments",
    items: [
      {
        name: "Appointment Types",
        icon: <Icon icon="mdi:calendar-month" fontSize={20} />,
        path: "/appointmenttypes",
        element: (
          <Suspense fallback={<Loading />}>
            <AppointmentTypes />
          </Suspense>
        ),
      },
      {
        name: "Appointments",
        icon: <Icon icon="mdi:calendar-today" fontSize={20} />,
        path: "/appointments",
        element: (
          <Suspense fallback={<Loading />}>
            <Appointments />
          </Suspense>
        ),
      },
      {
        name: "Reminders",
        icon: <Icon icon="mdi:bell-outline" fontSize={20} />,
        path: "/reminders",
        element: (
          <Suspense fallback={<Loading />}>
            <Reminders />
          </Suspense>
        ),
      },
    ],
  },
  {
    name: "Community & Engagement",
    icon: <Icon icon="mdi:account-group-outline" fontSize={24} />,
    path: "/community",
    items: [
      {
        name: "Communities",
        icon: <Icon icon="mdi:account-group-outline" fontSize={20} />,
        path: "/communities",
        element: (
          <Suspense fallback={<Loading />}>
            <Communities />
          </Suspense>
        ),
      },
      {
        name: "Stories",
        icon: <Icon icon="mdi:book-open-outline" fontSize={20} />,
        path: "/stories",
        element: (
          <Suspense fallback={<Loading />}>
            <Stories />
          </Suspense>
        ),
      },
      {
        name: "Tips",
        icon: <Icon icon="mdi:lightbulb-outline" fontSize={20} />,
        path: "/tips",
        element: (
          <Suspense fallback={<Loading />}>
            <Tips />
          </Suspense>
        ),
      },
    ],
  },
  {
    name: "Settings",
    icon: <Icon icon="mdi:settings-outline" fontSize={24} />,
    path: "/settings",
    items: [
      {
        name: "Sliders",
        icon: <Icon icon="mdi:format-line-spacing" fontSize={20} />,
        path: "/sliders",
        element: (
          <Suspense fallback={<Loading />}>
            <Sliders />
          </Suspense>
        ),
      },
      {
        name: "Interests",
        icon: <Icon icon="mdi:star-outline" fontSize={20} />,
        path: "/interests",
        element: (
          <Suspense fallback={<Loading />}>
            <Interests />
          </Suspense>
        ),
      },
      {
        name: "Facilities",
        icon: <Icon icon="mdi:office-building-outline" fontSize={20} />,
        path: "/facilities",
        element: (
          <Suspense fallback={<Loading />}>
            <Facilities />
          </Suspense>
        ),
      },
      {
        name: "Users",
        icon: <Icon icon="mdi:account-outline" fontSize={20} />,
        path: "/users",
        element: (
          <Suspense fallback={<Loading />}>
            <Users />
          </Suspense>
        ),
      },
      {
        name: "Health Workers",
        icon: <Icon icon="mdi:account-outline" fontSize={20} />,
        path: "/health-workers",
        element: (
          <Suspense fallback={<Loading />}>
            <HealthWorkers />
          </Suspense>
        ),
      },
    ],
  },
];

export default MOSS_APP_ROUTES;
