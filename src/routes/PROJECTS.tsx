import { Icon } from "@iconify/react";
import { Suspense } from "react";
import ProjectCategories from "../pages/projects/categories";
import Sectors from "../pages/projects/sectors";
import Partners from "../pages/projects/partners";
import Projects from "../pages/projects/projects";
import ProjectDetails from "../pages/projects/projectDetails";
import AgeGroups from "../pages/projects/ageGroups";

// Loader fallback component
const Loading = () => <div>Loading...</div>;

const PROJECTS_ROUTES = [
  {
    name: "General",
    icon: <Icon icon="mdi:view-dashboard-outline" fontSize={24} />,
    path: "",
    items: [
      {
        name: "Projects",
        icon: <Icon icon="mdi:tag-multiple" fontSize={20} />,
        path: "/",
        element: (
          <Suspense fallback={<Loading />}>
            <Projects />
          </Suspense>
        ),
      },
    ],
  },

  {
    name: "More",
    icon: <Icon icon="mdi:briefcase" fontSize={24} />,
    path: "/management",
    items: [
      {
        name: "Partners",
        icon: <Icon icon="mdi:account-multiple" fontSize={20} />,
        path: "/partners",
        element: (
          <Suspense fallback={<Loading />}>
            <Partners />
          </Suspense>
        ),
      },
      {
        name: "Categories",
        icon: <Icon icon="mdi:tag-multiple" fontSize={20} />,
        path: "/categories",
        element: (
          <Suspense fallback={<Loading />}>
            <ProjectCategories />
          </Suspense>
        ),
      },
      {
        name: "Sectors",
        icon: <Icon icon="mdi:city" fontSize={20} />,
        path: "/sectors",
        element: (
          <Suspense fallback={<Loading />}>
            <Sectors />
          </Suspense>
        ),
      },

      {
        hidden: true,
        name: "Project Details",
        icon: <Icon icon="mdi:folder-details" fontSize={20} />,
        path: "/projects/:id",
        element: (
          <Suspense fallback={<Loading />}>
            <ProjectDetails />
          </Suspense>
        ),
      },
      {
        name: "Age groups",
        icon: <Icon icon="mdi:folder-multiple" fontSize={20} />,
        path: "/agegroups",
        element: (
          <Suspense fallback={<Loading />}>
            <AgeGroups />
          </Suspense>
        ),
      },
    ],
  },
];

export default PROJECTS_ROUTES;
