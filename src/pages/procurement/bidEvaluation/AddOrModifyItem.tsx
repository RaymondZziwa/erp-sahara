import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { FileUpload } from "primereact/fileupload";
import { createRequest } from "../../../utils/api";
import { BidEvaluation } from "../../../redux/slices/types/procurement/BidEvaluation";
import useBids from "../../../hooks/procurement/useBids";
import useEvaluationCriteria from "../../../hooks/procurement/useEvaluationCriteria";
import useAuth from "../../../hooks/useAuth";
import useRequestForQuotation from "../../../hooks/procurement/useRequestForQuotation";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Partial<BidEvaluation>;
  onSave: () => void;
}

interface EvaluationItem {
  evaluation_criteria_id: string;
  score: number;
  comments: string;
}

interface BidEvaluationForm {
  rfq_id: string;
  supplier_quotation_id: string;
  evaluation_summary: string;
  justification: string;
  technical_score: number;
  commercial_score: number;
  evaluation_items: EvaluationItem[];
  attachment?: File | null;
}

const EvaluationForm: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const initialFormState: BidEvaluationForm = {
    rfq_id: "",
    supplier_quotation_id: "",
    evaluation_summary: "",
    justification: "",
    technical_score: 0,
    commercial_score: 0,
    evaluation_items: [],
    attachment: null,
  };

  const [formState, setFormState] =
    useState<BidEvaluationForm>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: bids } = useBids();
  const { data: evaluationCriteria } = useEvaluationCriteria();
  const { data: quotationRequests } = useRequestForQuotation();
  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      // Map existing item to form state if editing
      setFormState({
        rfq_id: item.rfq_id || "",
        supplier_quotation_id: item.supplier_quotation_id || "",
        evaluation_summary: item.evaluation_summary || "",
        justification: item.justification || "",
        technical_score: item.technical_score || 0,
        commercial_score: item.commercial_score || 0,
        evaluation_items: item.evaluation_items || [],
        attachment: null, // Handle existing attachment if needed
      });
    } else {
      setFormState(initialFormState);
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

  const handleNumberInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    const value = parseFloat(e.target.value) || 0;
    setFormState((prevState) => ({
      ...prevState,
      [fieldName]: value,
    }));
  };

  const handleDropdownChange = (
    e: DropdownChangeEvent,
    field: keyof BidEvaluationForm
  ) => {
    setFormState((prevState) => ({
      ...prevState,
      [field]: e.value,
    }));
  };

  const handleEvaluationItemChange = (
    index: number,
    field: keyof EvaluationItem,
    value: string | number
  ) => {
    const updatedItems = [...formState.evaluation_items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    setFormState((prevState) => ({
      ...prevState,
      evaluation_items: updatedItems,
    }));
  };

  const handleAddEvaluationItem = () => {
    setFormState((prevState) => ({
      ...prevState,
      evaluation_items: [
        ...prevState.evaluation_items,
        { evaluation_criteria_id: "", score: 0, comments: "" },
      ],
    }));
  };

  const handleRemoveEvaluationItem = (index: number) => {
    const updatedItems = formState.evaluation_items.filter(
      (_, i) => i !== index
    );
    setFormState((prevState) => ({
      ...prevState,
      evaluation_items: updatedItems,
    }));
  };

  const handleFileUpload = (e: { files: File[] }) => {
    setFormState((prevState) => ({
      ...prevState,
      attachment: e.files[0],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Append all form fields to FormData
      formData.append("rfq_id", formState.rfq_id);
      formData.append("supplier_quotation_id", formState.supplier_quotation_id);
      formData.append("evaluation_summary", formState.evaluation_summary);
      formData.append("justification", formState.justification);
      formData.append("technical_score", formState.technical_score.toString());
      formData.append(
        "commercial_score",
        formState.commercial_score.toString()
      );

      // Append evaluation items as JSON string
      formData.append(
        "evaluation_items",
        JSON.stringify(formState.evaluation_items)
      );

      // Append file if exists
      if (formState.attachment) {
        formData.append("attachment", formState.attachment);
      }

      const method = "POST";
      const endpoint = item?.id
        ? `/procurement/quotation-evaluations/${item.id}/update`
        : "/procurement/quotation-evaluations/create";

      await createRequest(
        endpoint,
        token.access_token,
        formData,
        onSave,
        method
      );

      onSave();
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button
        type="button"
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500 hover:bg-red-400"
        size="small"
        disabled={isSubmitting}
      />
      <Button
        loading={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="evaluation-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={`${item?.id ? "Edit" : "Add"} Evaluation`}
      visible={visible}
      className="w-11/12 md:w-3/4 lg:w-1/2"
      footer={footer}
      onHide={onClose}
    >
      <form
        id="evaluation-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-field">
            <label htmlFor="rfq_id">RFQ ID</label>
            <Dropdown
              id="rfq_id"
              name="rfq_id"
              value={formState.rfq_id}
              options={quotationRequests?.map((rfq) => ({
                label: rfq.title || rfq.id.toString(),
                value: rfq.id.toString(),
              }))}
              onChange={(e) => handleDropdownChange(e, "rfq_id")}
              placeholder="Select RFQ"
              filter
              className="w-full"
            />
          </div>

          <div className="p-field">
            <label htmlFor="supplier_quotation_id">Supplier Quotation</label>
            <Dropdown
              id="supplier_quotation_id"
              name="supplier_quotation_id"
              value={formState.supplier_quotation_id}
              options={bids
                ?.filter((bid) => bid.rfq_id === formState.rfq_id)
                .map((bid) => ({
                  label: `${bid.rfq_supplier?.supplier.supplier_name} - ${bid.quotation_ref}`,
                  value: bid.id.toString(),
                }))}
              onChange={(e) => handleDropdownChange(e, "supplier_quotation_id")}
              placeholder="Select Supplier Quotation"
              filter
              className="w-full"
              disabled={!formState.rfq_id}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-field">
            <label htmlFor="technical_score">Technical Score</label>
            <InputText
              id="technical_score"
              name="technical_score"
              type="number"
              min="0"
              max="100"
              value={formState.technical_score.toString()}
              onChange={(e) => handleNumberInputChange(e, "technical_score")}
              className="w-full"
            />
          </div>

          <div className="p-field">
            <label htmlFor="commercial_score">Commercial Score</label>
            <InputText
              id="commercial_score"
              name="commercial_score"
              type="number"
              min="0"
              max="100"
              value={formState.commercial_score.toString()}
              onChange={(e) => handleNumberInputChange(e, "commercial_score")}
              className="w-full"
            />
          </div>
        </div>

        <div className="p-field">
          <label htmlFor="evaluation_summary">Evaluation Summary</label>
          <InputTextarea
            id="evaluation_summary"
            name="evaluation_summary"
            value={formState.evaluation_summary}
            onChange={handleInputChange}
            rows={3}
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="justification">Justification</label>
          <InputTextarea
            id="justification"
            name="justification"
            value={formState.justification}
            onChange={handleInputChange}
            rows={3}
            className="w-full"
          />
        </div>

        <div className="p-field">
          <div className="flex justify-between items-center mb-2">
            <label>Evaluation Items</label>
            <Button
              type="button"
              label="Add Item"
              icon="pi pi-plus"
              className="p-button-text p-button-sm"
              onClick={handleAddEvaluationItem}
            />
          </div>

          <div className="space-y-4">
            {formState.evaluation_items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded"
              >
                <div className="p-field">
                  <label htmlFor={`criteria_name_${index}`}>Criteria</label>
                  <Dropdown
                    id={`criteria_name_${index}`}
                    value={item.evaluation_criteria_id}
                    options={evaluationCriteria?.map((criteria) => ({
                      label: criteria.name,
                      value: criteria.id,
                    }))}
                    onChange={(e) =>
                      handleEvaluationItemChange(
                        index,
                        "evaluation_criteria_id",
                        e.value
                      )
                    }
                    placeholder="Select Criteria"
                    filter
                    className="w-full"
                  />
                </div>

                <div className="p-field">
                  <label htmlFor={`score_${index}`}>Score</label>
                  <InputText
                    id={`score_${index}`}
                    type="number"
                    min="0"
                    max="100"
                    value={item.score.toString()}
                    onChange={(e) =>
                      handleEvaluationItemChange(
                        index,
                        "score",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full"
                  />
                </div>

                <div className="p-field">
                  <label htmlFor={`comments_${index}`}>Comments</label>
                  <InputTextarea
                    id={`comments_${index}`}
                    value={item.comments}
                    onChange={(e) =>
                      handleEvaluationItemChange(
                        index,
                        "comments",
                        e.target.value
                      )
                    }
                    rows={1}
                    className="w-full"
                  />
                </div>

                <div className="col-span-full flex justify-end">
                  <Button
                    type="button"
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-danger p-button-text"
                    onClick={() => handleRemoveEvaluationItem(index)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default EvaluationForm;
