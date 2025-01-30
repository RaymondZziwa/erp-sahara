import React from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
// Import hooks as needed (replace with actual hooks or data fetching logic)
import useProjects from "../../../hooks/projects/useProjects";

const ProjectDetailsView: React.FC<{ projectId: string }> = ({ projectId }) => {
  // Fetch project data and related information
  const { data: projects } = useProjects();

  const project = projects.find(
    (project) => project.id.toString() === projectId
  );

  if (!project) return <div>Loading...</div>;

  return (
    <div className="p-fluid grid grid-cols-1 gap-4 py-4">
      <div className="p-field">
        <h2 className="text-xl font-bold mb-4">Project Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <h5 className="font-semibold">Name</h5>
            <p>{project.name}</p>
          </div>
          <div>
            <h5 className="font-semibold">Category</h5>

            <p>{project.project_category.name}</p>
          </div>
          <div>
            <h5 className="font-semibold">Sector</h5>
            <p>{project.sector.sector_name}</p>
          </div>
          <div>
            <h5 className="font-semibold">Priority</h5>
            <p>{project.prioty}</p>
          </div>
          <div>
            <h5 className="font-semibold">Status</h5>
            <p>{project.status}</p>
          </div>
          <div>
            <h5 className="font-semibold">Cost</h5>
            <p>{project.cost}</p>
          </div>
          <div>
            <h5 className="font-semibold">Location</h5>
            <p>{project.location}</p>
          </div>
          <div>
            <h5 className="font-semibold">Reporting Period</h5>
            <p>{project.reporting_period}</p>
          </div>
          <div>
            <h5 className="font-semibold">Start Date</h5>
            <p>{new Date(project.start_date).toLocaleDateString()}</p>
          </div>
          <div>
            <h5 className="font-semibold">End Date</h5>
            <p>
              {project.end_date
                ? new Date(project.end_date).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div>
            <h5 className="font-semibold">Recommendations</h5>
            <p>{project.recommendations}</p>
          </div>
          <div>
            <h5 className="font-semibold">Challenges</h5>
            <p>
              {project.challenges
                ? project.challenges
                : "No challenges listed."}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Project Partners</h4>
        <DataTable
          value={project.project_partners}
          paginator
          rows={10}
          className="p-datatable-sm"
        >
          <Column field="partner.partner_name" header="Partner Name" />
          <Column field="type" header="Type" />
          <Column field="role" header="Role" />
          <Column field="partner.contact_person" header="Contact Person" />
          <Column field="partner.contact_person_email" header="Email" />
          <Column field="partner.contact_person_phone" header="Phone" />
        </DataTable>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Contracts</h4>
        {project.contracts.length > 0 ? (
          <DataTable
            value={project.contracts}
            paginator
            rows={10}
            className="p-datatable-sm"
          >
            <Column field="contract_name" header="Contract Name" />
            <Column field="contract_details" header="Details" />
            <Column field="contract_value" header="Value" />
          </DataTable>
        ) : (
          <p>No contracts listed.</p>
        )}
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Project Files</h4>
        {project.project_files.length > 0 ? (
          <ul>
            {project.project_files.map((file, index) => (
              <li key={index}>
                {file.file_name} - {file.file_size} KB
              </li>
            ))}
          </ul>
        ) : (
          <p>No files available.</p>
        )}
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Project Comments</h4>
        {project.project_comments.length > 0 ? (
          <ul>
            {project.project_comments.map((comment, index) => (
              <li key={index}>{comment.comment_text}</li>
            ))}
          </ul>
        ) : (
          <p>No comments available.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailsView;
