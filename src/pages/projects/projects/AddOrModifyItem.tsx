import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { FileUpload, FileUploadUploadEvent } from "primereact/fileupload";

import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { PROJECTS_ENDPOINTS } from "../../../api/projectsEndpoints";
import { Project } from "../../../redux/slices/types/projects/Project";
import usePartners from "../../../hooks/projects/usePartners";
import useProjectCategories from "../../../hooks/projects/useProjectCategories";
import useSectors from "../../../hooks/projects/useSectors";
import useCurrencies from "../../../hooks/procurement/useCurrencies";
import { Calendar } from "primereact/calendar";
import useEmployees from "../../../hooks/hr/useEmployees";

interface AddProject {
  name: string;
  project_category_id: number;
  sector_id: number;
  priority: string;
  status: string;
  reporting_period: string;
  cost: number;
  currency_id: number;
  website: null;
  challenges: null;
  location: string;
  project_manager: number;
  start_date: string;
  end_date: string;
  recommendations: string;
  project_partners: Projectpartner[];
  project_files: Projectfile[];
}

interface Projectfile {
  files: string;
}

interface Projectpartner {
  partner_id: number;
  type: string;
  role: string;
}
// Sample options for select fields
const PRIORITY_OPTIONS = [
  { label: "High", value: "High" },
  { label: "Medium", value: "Medium" },
  { label: "Low", value: "Low" },
];

const STATUS_OPTIONS = [
  { label: "Not Started", value: "Not Started" },
  { label: "In Progress", value: "In Progress" },
  { label: "Completed", value: "Completed" },
  { label: "On Hold", value: "On Hold" },
  { label: "Cancelled", value: "Cancelled" },
];

const REPORTING_PERIOD_OPTIONS = [
  { label: "Daily", value: "Daily" },
  { label: "Weekly", value: "Weekly" },
  { label: "Bi-weekly", value: "Bi-weekly" },
  { label: "Monthly", value: "Monthly" },
  { label: "Quarterly", value: "Quarterly" },
  { label: "Semi-Annually", value: "Semi-Annually" },
  { label: "Annually", value: "Annually" },
  { label: "Biennially", value: "Biennially" },
  { label: "Ad-hoc", value: "Ad-hoc" },
];

const PARTNER_TYPES = [
  { label: "Sponsor", value: "Sponsor" },
  { label: "Manager", value: "Manager" },
  { label: "Client", value: "Client" },
  { label: "Contractor", value: "Contractor" },
  { label: "Consultant", value: "Consultant" },
  { label: "Supplier", value: "Supplier" },
  { label: "Team Member", value: "Team Member" },
  { label: "Regulatory Body", value: "Regulatory Body" },
  { label: "Investor", value: "Investor" },
  { label: "Strategic Partner", value: "Strategic Partner" },
  { label: "Community Stakeholder", value: "Community Stakeholder" },
];

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Project;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<AddProject>>({
    project_partners: [],
    project_files: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();
  const { data: partners } = usePartners();
  const { data: projectCategories } = useProjectCategories();
  const { data: sectors } = useSectors();
  const { data: currencies } = useCurrencies();
  const { data: employees } = useEmployees();

  useEffect(() => {
    if (item) {
      setFormState({
        name: item.name,
        project_category_id: item.project_category_id, //Categories
        sector_id: item.sector_id, //Nullable Sectors
        priority: item.prioty, //in:High,Medium,Low',
        status: item.status, //'nullable|in:Not Started,In Progress,Completed,On Hold,Cancelled',
        reporting_period: item.reporting_period, //'nullable|in:Daily,Weekly,Bi-weekly,Monthly,Quarterly,Semi-Annually,Annually,Biennially,Ad-hoc',
        cost: +item.cost, //Nullable
        currency_id: 1, //Currencies nullable
        website: null, //Nullable
        challenges: null, //Nullable
        location: item.location, // Nullable
        project_manager: item.project_manager, //Staff t
        start_date: item.start_date,
        end_date: item.end_date ?? "", //Nullable if project has no clear end date
        recommendations: item.recommendations, //Nullable
        //Optional
        project_partners: item.project_partners,
        project_files: item.project_files,
      });
    } else {
      setFormState({});
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string | number) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handlePartnerChange = (
    index: number,
    field: keyof Projectpartner,
    value: any
  ) => {
    const updatedItems = [...(formState.project_partners ?? [])];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    setFormState((prevState) => ({
      ...prevState,
      project_partners: updatedItems,
    }));
  };

  const removePartner = (index: number) => {
    const updatedItems = [...(formState.project_partners ?? [])];
    updatedItems.splice(index, 1);
    setFormState((prevState) => ({
      ...prevState,
      project_partners: updatedItems,
    }));
  };

  const addPartner = () => {
    setFormState((prevState) => ({
      ...prevState,
      project_partners: [
        ...(prevState?.project_partners ?? []),
        { partner_id: 0, role: "", type: "" },
      ],
    }));
  };

  const handleFileUpload = (e: FileUploadUploadEvent) => {
    const files = Array.from(e.files).map((file: File) => ({
      files: file.name,
    }));
    setFormState((prevState) => ({
      ...prevState,
      project_files: files,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (
      !formState.name ||
      !formState.project_category_id ||
      !formState.sector_id
    ) {
      return; // Handle validation error here
    }

    const method = item?.id ? "PUT" : "POST";

    const data = {
      ...formState,
      start_date: new Date(formState.start_date ?? new Date())
        .toISOString()
        .slice(0, 10),
      end_date: new Date(formState.end_date ?? new Date())
        .toISOString()
        .slice(0, 10),
    };

    const endpoint = item?.id
      ? PROJECTS_ENDPOINTS.PROJECTS.UPDATE(item.id.toString())
      : PROJECTS_ENDPOINTS.PROJECTS.ADD;

    await createRequest(endpoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose(); // Close the modal after saving
  };

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500 hover:bg-red-400"
        size="small"
        disabled={isSubmitting}
      />
      <Button
        loading={isSubmitting}
        disabled={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="project-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Project" : "Add Project"}
      visible={visible}
      footer={footer}
      onHide={onClose}
      className="max-w-md md:max-w-2xl xl:max-w-screen-xl"
    >
      <form
        id="project-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        <div className="p-field">
          <label htmlFor="name">Name</label>
          <InputText
            id="name"
            name="name"
            value={formState.name || ""}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="project_category_id">Category</label>
          <Dropdown
            id="project_category_id"
            name="project_category_id"
            value={formState.project_category_id}
            options={projectCategories.map((cat) => ({
              value: cat.id,
              label: cat.name,
            }))}
            onChange={(e) => handleSelectChange("project_category_id", e.value)}
            placeholder="Select a Category"
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="sector_id">Sector</label>
          <Dropdown
            id="sector_id"
            name="sector_id"
            value={formState.sector_id}
            options={sectors.map((sector) => ({
              label: sector.sector_name,
              value: sector.id,
            }))}
            onChange={(e) => handleSelectChange("sector_id", e.value)}
            placeholder="Select a Sector"
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="priority">Priority</label>
          <Dropdown
            id="priority"
            name="priority"
            value={formState.priority}
            options={PRIORITY_OPTIONS}
            onChange={(e) => handleSelectChange("priority", e.value)}
            placeholder="Select Priority"
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="status">Status</label>
          <Dropdown
            id="status"
            name="status"
            value={formState.status}
            options={STATUS_OPTIONS}
            onChange={(e) => handleSelectChange("status", e.value)}
            placeholder="Select Status"
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="reporting_period">Reporting Period</label>
          <Dropdown
            id="reporting_period"
            name="reporting_period"
            value={formState.reporting_period}
            options={REPORTING_PERIOD_OPTIONS}
            onChange={(e) => handleSelectChange("reporting_period", e.value)}
            placeholder="Select Reporting Period"
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="cost">Cost</label>
          <InputText
            id="cost"
            name="cost"
            value={formState.cost?.toString() || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="currency_id">Currency</label>
          <Dropdown
            id="currency_id"
            name="currency_id"
            value={formState.currency_id}
            options={currencies.map((curr) => ({
              label: curr.code,
              value: curr.id,
            }))}
            onChange={(e) => handleSelectChange("currency_id", e.value)}
            placeholder="Select Currency"
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="website">Website</label>
          <InputText
            id="website"
            name="website"
            value={formState.website || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="location">Location</label>
          <InputText
            id="location"
            name="location"
            value={formState.location || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="start_date">Start Date</label>
          <Calendar
            id="start_date"
            name="start_date"
            value={new Date(formState.start_date ?? new Date()) || null}
            onChange={(e) =>
              setFormState((prevState) => ({
                ...prevState,
                start_date: e.value?.toString(),
              }))
            }
            required
            showIcon
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="end_date">End Date</label>
          <Calendar
            id="end_date"
            name="end_date"
            value={new Date(formState.end_date ?? new Date()) || null}
            onChange={(e) =>
              setFormState((prevState) => ({
                ...prevState,
                end_date: e.value?.toString(),
              }))
            }
            required
            showIcon
            className="w-full"
          />
        </div>

        <div className="p-field md:col-span-2 xl:col-span-3">
          <label htmlFor="challenges">Challenges</label>
          <InputTextarea
            id="challenges"
            name="challenges"
            value={formState.challenges || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="md:col-span-2 xl:col-span-3">
          <label htmlFor="recommendations">Recommendations</label>
          <InputTextarea
            id="recommendations"
            name="recommendations"
            value={formState.recommendations || ""}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="project_manager">Project Manager</label>
          <Dropdown
            id="project_manager"
            name="project_manager"
            value={formState.project_manager}
            options={employees.map((employee) => ({
              label: employee.first_name + " " + employee.last_name,
              value: employee.id,
            }))}
            onChange={(e) => handleSelectChange("project_manager", e.value)}
            placeholder="Select Project Manager"
            className="w-full"
          />
        </div>
        {/* Partners */}
        <div className="space-y-4 md:col-span-2 xl:col-span-3">
          <h4>Partners</h4>
          {formState.project_partners?.map((item, index: number) => (
            <div
              key={index}
              className="p-field flex justify-between py-2 gap-2"
            >
              <div className="grid grid-cols-3 gap-4 items-center">
                <Dropdown
                  value={item.partner_id}
                  options={partners.map((partner) => ({
                    label: partner.partner_name,
                    value: partner.id,
                  }))}
                  onChange={(e) =>
                    handlePartnerChange(index, "partner_id", e.value)
                  }
                />
                <Dropdown
                  value={item.type}
                  options={PARTNER_TYPES}
                  onChange={(e) => handlePartnerChange(index, "type", e.value)}
                />
                <InputText
                  placeholder="Role"
                  value={item.role.toString() || ""}
                  onChange={(e) =>
                    handlePartnerChange(index, "role", e.target.value)
                  }
                />
              </div>
              <Button
                type="button"
                icon="pi pi-trash"
                className="p-button-danger p-button-outlined"
                onClick={() => removePartner(index)}
                size="small"
              />
            </div>
          ))}
          <Button
            size="small"
            type="button"
            label="Add Item"
            icon="pi pi-plus"
            className="w-max"
            onClick={addPartner}
          />
        </div>

        <div className="p-field">
          <label htmlFor="project_files">Project Files</label>
          <FileUpload
            id="project_files"
            name="project_files"
            customUpload
            mode="basic"
            onUpload={handleFileUpload}
            chooseLabel="Select Files"
            uploadLabel="Upload"
            cancelLabel="Cancel"
            accept="*/*"
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
