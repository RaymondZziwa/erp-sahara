import React from "react";
import { useParams } from "react-router-dom";

import useProjects from "../../../hooks/projects/useProjects";
import { TabPanel, TabView } from "primereact/tabview";
import ProjectsActivities from "./projectsActivities";
import ProjectDetailsView from "./ProjectDetailsView";
import ProjectsRoles from "./projectRoles";
import ProjectTeams from "./projectTeams";

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch project data and related information
  const { data: projects } = useProjects();

  const project = projects.find((project) => project.id.toString() === id);

  if (!project) return <div>Loading...</div>;

  return (
    <div className="my-4">
      <TabView>
        <TabPanel header="Details">
          <ProjectDetailsView projectId={project.id.toString()} />
        </TabPanel>
        <TabPanel header="Activities">
          <ProjectsActivities projectId={project.id.toString()} />
        </TabPanel>
        <TabPanel header="Roles">
          <ProjectsRoles projectId={project.id.toString()} />
        </TabPanel>
        <TabPanel header="Teams">
          <ProjectTeams projectId={project.id.toString()} />
        </TabPanel>
      </TabView>
    </div>
  );
};

export default ProjectDetails;
