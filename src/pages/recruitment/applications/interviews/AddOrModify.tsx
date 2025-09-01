import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import useAuth from "../../../../hooks/useAuth";
import useEmployees from "../../../../hooks/hr/useEmployees";
import useApplicants from "../../../../hooks/recruitment/useApplicants";
import { createRequest } from "../../../../utils/api";
import { RECRUITMENT_ENDPOINTS } from "../../../../api/recruitmentEndpoints";
import { InputNumber } from "primereact/inputnumber";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  item?: any;
}

const interviewTypes = ["video", "in-person", "phone"];
const statuses = ['scheduled','completed','canceled','rescheduled'];
const responseStatuses = ["pending", "accepted", "declined"];

const AddOrModify: React.FC<Props> = ({ visible, onClose, onSave, item }) => {
  const { token, user } = useAuth();
  const { data: employees = [] } = useEmployees();
  const { data: applicants = [] } = useApplicants();

  const [form, setForm] = useState<any>({
    application_id: "",
    interviewer_id: user?.id || "",
    type: "video",
    status: "scheduled",
    scheduled_at: null,
    duration: "",
    location: "",
    notes: "",
    feedback: {
      technical_skills: "",
      communication: "",
      comments: "",
    },
    participants: [],
  });

  useEffect(() => {
    if (item) {
      // Ensure boolean values are properly set for participants
      const formattedItem = {
        ...item,
        participants: item.participants?.map(p => ({
          ...p,
          is_required: typeof p.is_required === 'string' 
            ? p.is_required === 'true' 
            : Boolean(p.is_required)
        })) || []
      };
      setForm(formattedItem);
    } else {
      // Reset form for new interview
      setForm({
        application_id: "",
        interviewer_id: user?.id || "",
        type: "video",
        status: "scheduled",
        scheduled_at: null,
        duration: "",
        location: "",
        notes: "",
        feedback: {
          technical_skills: "",
          communication: "",
          comments: "",
        },
        participants: [],
      });
    }
  }, [item, user?.id]);

  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleFeedbackChange = (key: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      feedback: {
        ...prev.feedback,
        [key]: value,
      },
    }));
  };

  const handleParticipantChange = (index: number, key: string, value: any) => {
    setForm((prev: any) => {
      const updated = [...prev.participants];
      // Convert to boolean if the key is 'is_required'
      updated[index][key] = key === 'is_required' 
        ? (value === true || value === 'true') 
        : value;
      return { ...prev, participants: updated };
    });
  };

  const addParticipant = () => {
    setForm((prev: any) => ({
      ...prev,
      participants: [
        ...prev.participants,
        {
          employee_id: "",
          is_required: true,  // Explicit boolean
          response_status: "pending",
        },
      ],
    }));
  };

  const removeParticipant = (index: number) => {
    setForm((prev: any) => {
      const updated = [...prev.participants];
      updated.splice(index, 1);
      return { ...prev, participants: updated };
    });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        scheduled_at: form.scheduled_at?.toISOString().split("T")[0] || null,
      };
  
      const isEdit = !!item?.id;
      const endpoint = isEdit 
        ? RECRUITMENT_ENDPOINTS.INTERVIEWS.UPDATE(item.id)
        : RECRUITMENT_ENDPOINTS.INTERVIEWS.ADD;
      const method = isEdit ? "PUT" : "POST";
  
      await createRequest(
        endpoint,
        token.access_token,
        payload,
        () => {
          onSave(); // Refresh the list
          onClose(); // Close the dialog
        },
        method
      );
  
    } catch (error) {
      console.error("Error saving interview:", error);
      // You might want to add error notification here
    }
  };

  return (
    <Dialog header="Schedule Interview" visible={visible} style={{ width: "700px" }} onHide={onClose}>
  <div className="space-y-4">
    {/* General Fields in 2-column layout */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Dropdown
        value={form.application_id}
        options={applicants.map((a) => ({ label: a.candidate?.user?.full_name, value: a.id }))}
        onChange={(e) => handleChange("application_id", e.value)}
        placeholder="Select Application"
        className="w-full"
      />
      <Dropdown
        value={form.interviewer_id}
        options={employees.map((e) => ({ label: `${e.first_name} ${e.last_name}`, value: e.id }))}
        onChange={(e) => handleChange("interviewer_id", e.value)}
        placeholder="Select Interviewer"
        className="w-full"
      />

      <Dropdown
        value={form.type}
        options={interviewTypes.map((t) => ({ label: t, value: t }))}
        onChange={(e) => handleChange("type", e.value)}
        placeholder="Interview Type"
        className="w-full"
      />
      <Dropdown
        value={form.status}
        options={statuses.map((s) => ({ label: s, value: s }))}
        onChange={(e) => handleChange("status", e.value)}
        placeholder="Status"
        className="w-full"
      />

      <Calendar
        value={form.scheduled_at}
        onChange={(e) => handleChange("scheduled_at", e.value)}
        showTime
        showIcon
        className="w-full"
        placeholder="Scheduled At"
      />
      <InputText
        value={form.duration}
        onChange={(e) => handleChange("duration", e.target.value)}
        placeholder="Duration (minutes)"
        className="w-full"
      />

      <InputText
        value={form.location}
        onChange={(e) => handleChange("location", e.target.value)}
        placeholder="Location (e.g., Zoom link)"
        className="w-full"
      />
      <InputTextarea
        value={form.notes}
        onChange={(e) => handleChange("notes", e.target.value)}
        placeholder="Notes"
        className="w-full"
        rows={2}
      />
    </div>

    {/* Feedback */}
    <h4 className="font-semibold mt-4">Feedback (optional)</h4>
    
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <InputNumber
    placeholder="Technical Skills (1-5)"
    value={form.feedback.technical_skills}
    onValueChange={(e) => {
      const val = Math.min(5, Math.max(1, e.value ?? 0)); // Clamp between 1 and 5
      handleFeedbackChange("technical_skills", val);
    }}
    min={1}
    max={5}
    className="w-full"
  />

  <InputNumber
    placeholder="Communication (1-5)"
    value={form.feedback.communication}
    onValueChange={(e) => {
      const val = Math.min(5, Math.max(1, e.value ?? 0)); // Clamp between 1 and 5
      handleFeedbackChange("communication", val);
    }}
    min={1}
    max={5}
    className="w-full"
  />
</div>
    <InputTextarea
      placeholder="Comments"
      value={form.feedback.comments}
      onChange={(e) => handleFeedbackChange("comments", e.target.value)}
      className="w-full"
      rows={2}
    />

    {/* Participants Section */}
    <h4 className="font-semibold mt-4">Participants</h4>
    {form.participants.map((p: any, index: number) => (
      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-2">
        <Dropdown
          value={p.employee_id}
          options={employees.map((e) => ({ label: `${e.first_name} ${e.last_name}`, value: e.id }))}
          onChange={(e) => handleParticipantChange(index, "employee_id", e.value)}
          placeholder="Employee"
          className="w-full"
        />
       <Dropdown
  value={p.is_required}
  options={[
    { label: "Required", value: true },
    { label: "Optional", value: false },
  ]}
  onChange={(e) => handleParticipantChange(index, "is_required", e.value === true || e.value === 'true')}
  className="w-full"
  optionLabel="label"
/>
        <Dropdown
          value={p.response_status}
          options={responseStatuses.map((r) => ({ label: r, value: r }))}
          onChange={(e) => handleParticipantChange(index, "response_status", e.value)}
          className="w-full"
          placeholder="Response Status"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-danger"
          onClick={() => removeParticipant(index)}
          label=""
        />
      </div>
    ))}
    <Button
      icon="pi pi-plus"
      label="Add Participant"
      onClick={addParticipant}
      className="p-button-sm p-button-secondary"
    />

    {/* Submit */}
    <div className="flex justify-end mt-4">
      <Button label="Submit" onClick={handleSubmit} />
    </div>
  </div>
</Dialog>

  );
};

export default AddOrModify;
