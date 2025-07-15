import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { FileUpload } from "primereact/fileupload";
import { RECRUITMENT_ENDPOINTS } from "../../../../api/recruitmentEndpoints";
import useBranches from "../../../../hooks/Branches/useBranches";
import useSkills from "../../../../hooks/recruitment/useSkills";
import useAuth from "../../../../hooks/useAuth";
import { createRequest } from "../../../../utils/api";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: any;
  onSave: () => void;
}

const salutations = [
  "Mr", "Mrs", "Miss", "Ms", "Dr", "Prof", "Rev", "Eng", "Hon", "Sir", "Lady"
];

const genders = ["male", "female"];
const maritalStatuses = ["single", "married", "divorced", "widowed"];
const sources = [
  "Website", "Walk-ins", "LinkedIn", "Google", "Referrals", "Internal Candidates", "Socials", "Others"
];
const proficiencyLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];
const awards = [
  "PLE", "O-Level", "A-Level", "Certificate", "Diploma", "Degree", "PGD", "Masters", "PHD"
];

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({ visible, onClose, item, onSave }) => {
  const { token } = useAuth();
  const { data: branches = [] } = useBranches()
  const { data: skills = [] } = useSkills()
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    salutation: "",
    first_name: "",
    last_name: "",
    other_name: "",
    email: "",
    phone: "",
    gender: "",
    marital_status: "",
    branch_id: "",
    date_of_birth: null,
    profile_picture: null,
    location: "",
    current_job_title: "",
    current_employer: "",
    years_experience: "",
    availability: "",
    salary_expectations: "",
    notice_period: "",
    source: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    consent_date: null,
    data_retention_period: "",
    resume: null,
    skills: [],
    qualifications: []
  });

  useEffect(() => {
    if (item) {
      // Convert the item data to match the form structure
      setFormData({
        salutation: item.user.salutation || "",
        first_name: item.user.first_name || "",
        last_name: item.user.last_name || "",
        other_name: item.user.other_name || "",
        email: item.user.email || "",
        phone: item.user.phone || "",
        gender: item.user.gender || "",
        marital_status: item.user.marital_status || "",
        branch_id: item.branch_id || "",
        date_of_birth: item.user.date_of_birth ? new Date(item.user.date_of_birth) : null,
        profile_picture: item.profile_picture || null,
        location: item.location || "",
        current_job_title: item.current_job_title || "",
        current_employer: item.current_employer || "",
        years_experience: item.years_experience || "",
        availability: item.availability || "",
        salary_expectations: item.salary_expectations || "",
        notice_period: item.notice_period || "",
        source: item.source || "",
        linkedin_url: item.linkedin_url || "",
        github_url: item.github_url || "",
        portfolio_url: item.portfolio_url || "",
        consent_date: item.consent_date ? new Date(item.consent_date) : null,
        data_retention_period: item.data_retention_period || "",
        resume: item.resume || null,
        skills: item.skills ? item.skills.map((skill: any) => ({
          skill_id: skill.skill_id,
          proficiency_level: skill.proficiency_level,
          years_experience: skill.years_experience,
          last_used: skill.last_used ? new Date(skill.last_used) : null,
          is_primary: skill.is_primary
        })) : [],
        qualifications: item.qualifications ? item.qualifications.map((qual: any) => ({
          institution: qual.institution,
          award: qual.award,
          field_of_study: qual.field_of_study,
          start_date: qual.start_date ? new Date(qual.start_date) : null,
          end_date: qual.end_date ? new Date(qual.end_date) : null,
          is_completed: qual.is_completed,
          attachment: qual.attachment || null
        })) : []
      });
    } else {
      // Reset to empty form if no item (adding new candidate)
      setFormData({
        salutation: "",
        first_name: "",
        last_name: "",
        other_name: "",
        email: "",
        phone: "",
        gender: "",
        marital_status: "",
        branch_id: "",
        date_of_birth: null,
        profile_picture: null,
        location: "",
        current_job_title: "",
        current_employer: "",
        years_experience: "",
        availability: "",
        salary_expectations: "",
        notice_period: "",
        source: "",
        linkedin_url: "",
        github_url: "",
        portfolio_url: "",
        consent_date: null,
        data_retention_period: "",
        resume: null,
        skills: [],
        qualifications: []
      });
      setStep(1); // Reset to first step
    }
  }, [item]);

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const handleSave = async () => {
    const payload = new FormData();
  
    Object.entries(formData).forEach(([key, value]) => {
      let finalValue = value;
  
      // Handle top-level date fields
      if (key === "date_of_birth" || key === "consent_date") {
        if (value instanceof Date) {
          finalValue = value.toISOString().split("T")[0];
        } else if (typeof value === "string" && !isNaN(Date.parse(value))) {
          finalValue = new Date(value).toISOString().split("T")[0];
        }
      }
  
      // Format skill.last_used
      if (key === "skills" && Array.isArray(value)) {
        const processedSkills = value.map((skill) => {
          let formattedDate = "";
          const lastUsed = skill.last_used;
  
          if (lastUsed instanceof Date) {
            formattedDate = lastUsed.toISOString().split("T")[0];
          } else if (typeof lastUsed === "string" && !isNaN(Date.parse(lastUsed))) {
            formattedDate = new Date(lastUsed).toISOString().split("T")[0];
          }
  
          return {
            ...skill,
            last_used: formattedDate,
          };
        });
  
        payload.append(key, JSON.stringify(processedSkills));
      }
  
      // Format qualification.start_date and end_date
      else if (key === "qualifications" && Array.isArray(value)) {
        const processedQualifications = value.map((qualification) => {
          const formatDate = (dateValue) => {
            if (dateValue instanceof Date) {
              return dateValue.toISOString().split("T")[0];
            } else if (typeof dateValue === "string" && !isNaN(Date.parse(dateValue))) {
              return new Date(dateValue).toISOString().split("T")[0];
            }
            return "";
          };
  
          return {
            ...qualification,
            start_date: formatDate(qualification.start_date),
            end_date: formatDate(qualification.end_date),
          };
        });
  
        payload.append(key, JSON.stringify(processedQualifications));
      }
  
      // Handle all other fields
      else if (finalValue !== null && finalValue !== undefined) {
        payload.append(key, finalValue);
      }
    });

    const method = item?.id ? "PUT" : "POST";
        const endpoint = item?.id
          ? RECRUITMENT_ENDPOINTS.CANDIDATES.UPDATE(item.id.toString())
          : RECRUITMENT_ENDPOINTS.CANDIDATES.ADD;
  
    await createRequest(
      endpoint,
      token.access_token,
      payload,
      onSave,
      method
    );
  
    onSave();
    onClose();
    setStep(1);
  };
  
  

  const footer = (
    <div className="flex justify-between">
      {step > 1 && <Button label="Back" onClick={handleBack} />}
      {step < 5 ? (
        <Button label="Next" onClick={handleNext} />
      ) : (
        <Button label="Submit" onClick={handleSave} />
      )}
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Candidate" : "Add Candidate"}
      visible={visible}
      style={{ width: "700px" }}
      footer={footer}
      onHide={onClose}
    >
      {step === 1 && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Dropdown value={formData.salutation} options={salutations.map(s => ({ label: s, value: s }))} onChange={e => setFormData(prev => ({ ...prev, salutation: e.value }))} placeholder="Select Salutation" className="w-full" />
    <InputText placeholder="First Name" className="w-full" value={formData.first_name} onChange={e => setFormData(prev => ({ ...prev, first_name: e.target.value }))} />
    <InputText placeholder="Last Name" className="w-full" value={formData.last_name} onChange={e => setFormData(prev => ({ ...prev, last_name: e.target.value }))} />
    <InputText placeholder="Other Name" className="w-full" value={formData.other_name} onChange={e => setFormData(prev => ({ ...prev, other_name: e.target.value }))} />
    <InputText placeholder="Email" className="w-full" value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} />
    <InputText placeholder="Phone" className="w-full" value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} />
  </div>
)}


{step === 2 && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Dropdown value={formData.gender} options={genders.map(g => ({ label: g, value: g }))} onChange={e => setFormData(prev => ({ ...prev, gender: e.value }))} placeholder="Gender" className="w-full" />
    <Dropdown value={formData.marital_status} options={maritalStatuses.map(m => ({ label: m, value: m }))} onChange={e => setFormData(prev => ({ ...prev, marital_status: e.value }))} placeholder="Marital Status" className="w-full" />
    <Calendar value={formData.date_of_birth} onChange={e => setFormData(prev => ({ ...prev, date_of_birth: e.value }))} showIcon placeholder="Date of Birth" className="w-full" />
    <Dropdown
  value={formData.branch_id}
  options={branches.map(branch => ({
    label: branch.name,
    value: branch.id
  }))}
  onChange={e => setFormData(prev => ({ ...prev, branch_id: e.value }))}
  placeholder="Select Branch"
  className="w-full"
  filter
  showClear
/>

    <InputText placeholder="Location" className="w-full" value={formData.location} onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))} />
    <InputText placeholder="Current Job Title" className="w-full" value={formData.current_job_title} onChange={e => setFormData(prev => ({ ...prev, current_job_title: e.target.value }))} />
    <InputText placeholder="Current Employer" className="w-full" value={formData.current_employer} onChange={e => setFormData(prev => ({ ...prev, current_employer: e.target.value }))} />
    <InputText placeholder="Years of Experience" className="w-full" value={formData.years_experience} onChange={e => setFormData(prev => ({ ...prev, years_experience: e.target.value }))} />
  </div>
      )}
      
      {step === 3 && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Availability */}
    <Dropdown
      value={formData.availability}
      options={[
        { label: "Immediate", value: "Immediate" },
        { label: "1 Week", value: "1 Week" },
        { label: "2 Weeks", value: "2 Weeks" },
        { label: "1 Month", value: "1 Month" },
      ]}
      onChange={(e) =>
        setFormData((prev) => ({ ...prev, availability: e.value }))
      }
      placeholder="Availability"
      className="w-full"
      showClear
    />

    {/* Salary Expectations */}
    <InputText
      placeholder="Salary Expectations"
      className="w-full"
      value={formData.salary_expectations}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          salary_expectations: e.target.value,
        }))
      }
    />

    {/* Notice Period */}
    <InputText
      placeholder="Notice Period"
      className="w-full"
      value={formData.notice_period}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          notice_period: e.target.value,
        }))
      }
    />

    {/* Source */}
    <Dropdown
      value={formData.source}
      options={[
        "Website",
        "Walk-ins",
        "LinkedIn",
        "Google",
        "Referrals",
        "Internal Candidates",
        "Socials",
        "Others",
      ].map((src) => ({ label: src, value: src }))}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          source: e.value,
        }))
      }
      placeholder="Source"
      className="w-full"
      showClear
      filter
    />

    {/* LinkedIn URL */}
    <InputText
      placeholder="LinkedIn URL"
      className="w-full"
      value={formData.linkedin_url}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          linkedin_url: e.target.value,
        }))
      }
    />

    {/* GitHub URL */}
    <InputText
      placeholder="GitHub URL"
      className="w-full"
      value={formData.github_url}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          github_url: e.target.value,
        }))
      }
    />

    {/* Portfolio URL */}
    <InputText
      placeholder="Portfolio URL"
      className="w-full"
      value={formData.portfolio_url}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          portfolio_url: e.target.value,
        }))
      }
    />

    {/* Consent Date */}
    <Calendar
      value={formData.consent_date}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                consent_date: e.value,
              }))
      }
      placeholder="Consent Date"
      showIcon
      className="w-full"
    />

    {/* Data Retention Period */}
    <InputText
      placeholder="Data Retention Period (in years)"
      className="w-full"
      value={formData.data_retention_period}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          data_retention_period: e.target.value,
        }))
      }
    />
  </div>
      )}
      {step === 4 && (
  <div className="space-y-6">
    {formData.skills.map((skill: any, index: number) => (
      <div key={index} className="border p-4 rounded-md grid grid-cols-1 md:grid-cols-2 gap-4">
        <Dropdown
          value={skill.skill_id}
          options={skills.map((s) => ({ label: s.name, value: s.id }))}
          onChange={(e) =>
            setFormData((prev: any) => {
              const updated = [...prev.skills];
              updated[index].skill_id = e.value;
              return { ...prev, skills: updated };
            })
          }
          placeholder="Select Skill"
          className="w-full"
          filter
          showClear
        />

        <Dropdown
          value={skill.proficiency_level}
          options={["Beginner", "Intermediate", "Advanced", "Expert"].map(lvl => ({ label: lvl, value: lvl }))}
          onChange={(e) =>
            setFormData((prev: any) => {
              const updated = [...prev.skills];
              updated[index].proficiency_level = e.value;
              return { ...prev, skills: updated };
            })
          }
          placeholder="Proficiency Level"
          className="w-full"
        />

        <InputText
          type="number"
          placeholder="Years of Experience"
          className="w-full"
          value={skill.years_experience}
          onChange={(e) =>
            setFormData((prev: any) => {
              const updated = [...prev.skills];
              updated[index].years_experience = e.target.value;
              return { ...prev, skills: updated };
            })
          }
        />

        <Calendar
          value={skill.last_used}
          onChange={(e) =>
            setFormData((prev: any) => {
              const updated = [...prev.skills];
              updated[index].last_used = e.value;
              return { ...prev, skills: updated };
            })
          }
          placeholder="Last Used Date"
          showIcon
          className="w-full"
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={skill.is_primary}
            onChange={(e) =>
              setFormData((prev: any) => {
                const updated = [...prev.skills];
                updated[index].is_primary = e.target.checked;
                return { ...prev, skills: updated };
              })
            }
          />
          <label className="text-sm">Primary Skill</label>
        </div>

        <Button
          label="Remove"
          icon="pi pi-trash"
          className="p-button-danger"
          onClick={() =>
            setFormData((prev: any) => {
              const updated = [...prev.skills];
              updated.splice(index, 1);
              return { ...prev, skills: updated };
            })
          }
        />
      </div>
    ))}

    <Button
      label="Add Skill"
      icon="pi pi-plus"
      className="p-button-secondary"
      onClick={() =>
        setFormData((prev: any) => ({
          ...prev,
          skills: [
            ...prev.skills,
            {
              skill_id: "",
              proficiency_level: "",
              years_experience: "",
              last_used: null,
              is_primary: false,
            },
          ],
        }))
      }
    />
  </div>
      )}
      {step === 5 && (
  <div className="space-y-6">
    {formData.qualifications.map((qualification: any, index: number) => (
      <div
        key={index}
        className="border p-4 rounded-md grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Institution */}
        <InputText
          placeholder="Institution"
          className="w-full"
          value={qualification.institution}
          onChange={(e) =>
            setFormData((prev: any) => {
              const updated = [...prev.qualifications];
              updated[index].institution = e.target.value;
              return { ...prev, qualifications: updated };
            })
          }
        />

        {/* Award */}
        <Dropdown
          value={qualification.award}
          options={[
            "PLE",
            "O-Level",
            "A-Level",
            "Certificate",
            "Diploma",
            "Degree",
            "PGD",
            "Masters",
            "PHD",
          ].map((a) => ({ label: a, value: a }))}
          onChange={(e) =>
            setFormData((prev: any) => {
              const updated = [...prev.qualifications];
              updated[index].award = e.value;
              return { ...prev, qualifications: updated };
            })
          }
          placeholder="Award"
          className="w-full"
        />

        {/* Field of Study */}
        <InputText
          placeholder="Field of Study"
          className="w-full"
          value={qualification.field_of_study}
          onChange={(e) =>
            setFormData((prev: any) => {
              const updated = [...prev.qualifications];
              updated[index].field_of_study = e.target.value;
              return { ...prev, qualifications: updated };
            })
          }
        />

        {/* Start Date */}
        <Calendar
          value={qualification.start_date}
          onChange={(e) =>
            setFormData((prev: any) => {
              const updated = [...prev.qualifications];
              updated[index].start_date = e.value;
              return { ...prev, qualifications: updated };
            })
          }
          placeholder="Start Date"
          showIcon
          className="w-full"
        />

        {/* End Date */}
        <Calendar
          value={qualification.end_date}
          onChange={(e) =>
            setFormData((prev: any) => {
              const updated = [...prev.qualifications];
              updated[index].end_date = e.value;
              return { ...prev, qualifications: updated };
            })
          }
          placeholder="End Date"
          showIcon
          className="w-full"
        />

        {/* Is Completed */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={qualification.is_completed}
            onChange={(e) =>
              setFormData((prev: any) => {
                const updated = [...prev.qualifications];
                updated[index].is_completed = e.target.checked;
                return { ...prev, qualifications: updated };
              })
            }
          />
          <label className="text-sm">Completed?</label>
        </div>

        {/* Attachment */}
        <FileUpload
          mode="basic"
          name="attachment"
          auto
          customUpload
          chooseLabel="Upload Attachment"
          uploadHandler={(e) =>
            setFormData((prev: any) => {
              const updated = [...prev.qualifications];
              updated[index].attachment = e.files[0];
              return { ...prev, qualifications: updated };
            })
          }
        />
        {qualification.attachment && (
          <div className="text-sm text-green-700">
            Attached: <span className="font-medium">{qualification.attachment.name}</span>
          </div>
        )}

        {/* Remove Button */}
        <Button
          label="Remove"
          icon="pi pi-trash"
          className="p-button-danger"
          onClick={() =>
            setFormData((prev: any) => {
              const updated = [...prev.qualifications];
              updated.splice(index, 1);
              return { ...prev, qualifications: updated };
            })
          }
        />
      </div>
    ))}

    {/* Add Qualification Button */}
    <Button
      label="Add Qualification"
      icon="pi pi-plus"
      className="p-button-secondary"
      onClick={() =>
        setFormData((prev: any) => ({
          ...prev,
          qualifications: [
            ...prev.qualifications,
            {
              institution: "",
              award: "",
              field_of_study: "",
              start_date: null,
              end_date: null,
              is_completed: false,
              attachment: null,
            },
          ],
        }))
      }
    />
  </div>
)}


    </Dialog>
  );
};

export default AddOrModifyItem;
