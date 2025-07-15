import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";

import { RECRUITMENT_ENDPOINTS } from "../../../../api/recruitmentEndpoints";
import useAuth from "../../../../hooks/useAuth";
import useCandidates from "../../../../hooks/recruitment/useCandidates";
import useJobOrder from "../../../../hooks/recruitment/useJobOrder";
import { createRequest } from "../../../../utils/api";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: any;
  onSave: () => void;
}

const sourceOptions = ["Website", "Walk-ins", "LinkedIn", "Google", "Referrals", "Internal Candidates","Socials",  "Others"];
const statusOptions = ['applied', 'shortlisted', 'interview', 'offered','hired', 'rejected', 'archived'];
const ratingOptions = [1, 2, 3, 4, 5];

interface QAPair {
  question: string;
  answer: string;
}

interface FormData {
  job_order_id: string;
  candidate_id: string;
  source: string;
  status: string;
  rating: number;
  cover_letter: string;
  application_answers: QAPair[];
  is_active: boolean;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({ visible, onClose, item, onSave }) => {
  const { token } = useAuth();
  const { data: jobOrders = [] } = useJobOrder();
  const { data: candidates = [] } = useCandidates();

  const [formData, setFormData] = useState<FormData>({
    job_order_id: "",
    candidate_id: "",
    source: "",
    status: "",
    rating: 4,
    cover_letter: "",
    application_answers: [],
    is_active: true
  });

  useEffect(() => {
    if (item) {
      try {
        const answers = item.application_answers
          ? typeof item.application_answers === 'string'
            ? JSON.parse(item.application_answers)
            : item.application_answers
          : [];

        // Ensure answers is an array of QAPair objects
        const parsedAnswers = Array.isArray(answers)
          ? answers.map((qa: any) => ({
              question: qa.question || "",
              answer: qa.answer || ""
            }))
          : [];

        setFormData({
          job_order_id: item.job_order_id || "",
          candidate_id: item.candidate_id || "",
          source: item.source || "",
          status: item.status || "",
          rating: item.rating || 4,
          cover_letter: item.cover_letter || "",
          application_answers: parsedAnswers,
          is_active: item.is_active !== undefined ? item.is_active : true
        });
      } catch (error) {
        console.error("Error parsing application answers:", error);
        setFormData({
          job_order_id: item.job_order_id || "",
          candidate_id: item.candidate_id || "",
          source: item.source || "",
          status: item.status || "",
          rating: item.rating || 4,
          cover_letter: item.cover_letter || "",
          application_answers: [],
          is_active: item.is_active !== undefined ? item.is_active : true
        });
      }
    } else {
      setFormData({
        job_order_id: "",
        candidate_id: "",
        source: "",
        status: "",
        rating: 4,
        cover_letter: "",
        application_answers: [],
        is_active: true
      });
    }
  }, [item]);

  const handleChange = (key: keyof Omit<FormData, 'application_answers'>, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleQAPairChange = (index: number, field: keyof QAPair, value: string) => {
    setFormData(prev => {
      const updatedAnswers = [...prev.application_answers];
      updatedAnswers[index] = {
        ...updatedAnswers[index],
        [field]: value
      };
      return {
        ...prev,
        application_answers: updatedAnswers
      };
    });
  };

  const addQAPair = () => {
    setFormData(prev => ({
      ...prev,
      application_answers: [
        ...prev.application_answers,
        { question: "", answer: "" }
      ]
    }));
  };

  const removeQAPair = (index: number) => {
    setFormData(prev => ({
      ...prev,
      application_answers: prev.application_answers.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    const payload = {
      ...formData,
      application_answers: JSON.stringify(formData.application_answers)
    };

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? RECRUITMENT_ENDPOINTS.APPLICANTS.UPDATE(item.id)
      : RECRUITMENT_ENDPOINTS.APPLICANTS.ADD;

    try {
      await createRequest(endpoint, token.access_token, payload, onSave, method);
      onSave();
      onClose();
      setFormData({
            job_order_id: "",
            candidate_id: "",
            source: "",
            status: "",
            rating: 1,
            cover_letter: "",
            application_answers: [],
            is_active: true
          });
    } catch (error) {
      console.error("Error saving application:", error);
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button label="Cancel" onClick={onClose} className="p-button-text !bg-red-500" />
      <Button label={item?.id ? "Update" : "Submit"} onClick={handleSave} />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Application" : "Add Application"}
      visible={visible}
      style={{ width: "50rem" }}
      footer={footer}
      onHide={onClose}
    >
      <div className="grid grid-cols-2 gap-4 p-4">
        <Dropdown
          value={formData.job_order_id}
          options={jobOrders}
          optionLabel="title"
          optionValue="id"
          placeholder="Select Job Order"
          onChange={(e) => handleChange("job_order_id", e.value)}
        />

        <Dropdown
          value={formData.candidate_id}
          options={candidates.map((candidate) => ({
            value: candidate?.id,
            label: candidate.user?.full_name,
          }))}
          placeholder="Select Candidate"
          onChange={(e) => handleChange("candidate_id", e.value)}
        />

        <Dropdown
          value={formData.source}
          options={sourceOptions}
          placeholder="Select Source"
          onChange={(e) => handleChange("source", e.value)}
        />

        <Dropdown
          value={formData.status}
          options={statusOptions}
          placeholder="Select Status"
          onChange={(e) => handleChange("status", e.value)}
        />

        <Dropdown
          value={formData.rating}
          options={ratingOptions}
          placeholder="Select Rating"
          onChange={(e) => handleChange("rating", e.value)}
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => handleChange("is_active", e.target.checked)}
          />
          <label className="text-sm">Is Active</label>
        </div>
      </div>

      <div className="px-4">
        <label className="block mb-1 font-medium">Cover Letter</label>
        <InputTextarea
          className="w-full"
          value={formData.cover_letter}
          onChange={(e) => handleChange("cover_letter", e.target.value)}
          placeholder="Cover Letter"
          rows={4}
        />
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold text-base">Application Questions</h4>
          <Button
            label="Add Question"
            icon="pi pi-plus"
            className="p-button-sm"
            onClick={addQAPair}
          />
        </div>

        {formData.application_answers.map((qa, index) => (
          <div key={index} className="grid grid-cols-2 gap-4 mb-3">
            <InputText
              placeholder="Question"
              value={qa.question}
              onChange={(e) => handleQAPairChange(index, "question", e.target.value)}
            />
            <div className="flex gap-2">
              <InputText
                placeholder="Answer"
                value={qa.answer}
                onChange={(e) => handleQAPairChange(index, "answer", e.target.value)}
                className="flex-1"
              />
              <Button
                icon="pi pi-trash"
                className="p-button-danger p-button-rounded p-button-text"
                onClick={() => removeQAPair(index)}
              />
            </div>
          </div>
        ))}

        {formData.application_answers.length === 0 && (
          <div className="text-gray-500 text-center py-4">
            No questions added yet. Click "Add Question" to create one.
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default AddOrModifyItem;