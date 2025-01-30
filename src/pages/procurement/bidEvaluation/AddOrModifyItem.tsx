import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
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

interface BidEvaluationAdd {
  request_for_quotation_id: number;
  evaluation_criteria_id: number;
  attachment: string;
  evaluations: {
    bid_id: number;
    score: number;
  }[];
  evaluated_at: string;
  comments: string;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const initialItem: BidEvaluationAdd = {
    request_for_quotation_id: 0,
    evaluation_criteria_id: 1,
    attachment: "",
    evaluations: [{ bid_id: 0, score: 0 }],
    evaluated_at: "",
    comments: "",
  };

  const [formState, setFormState] = useState<BidEvaluationAdd>(initialItem);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: bids } = useBids();
  const { data: evaluationCriteria } = useEvaluationCriteria();
  const { data: quotationRequests } = useRequestForQuotation();
  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        ...initialItem,
        ...item,
      });
    } else {
      setFormState(initialItem);
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

  const handleDropdownChange = (
    e: DropdownChangeEvent,
    field: keyof BidEvaluationAdd
  ) => {
    setFormState((prevState) => ({
      ...prevState,
      [field]: e.value,
    }));
  };

  const handleEvaluationChange = (
    e: React.ChangeEvent<HTMLInputElement> | DropdownChangeEvent,
    index: number
  ) => {
    const { name, value } =
      e.target instanceof HTMLInputElement
        ? e.target
        : { name: e.target.name, value: e.target.value }; // Handle both cases correctly

    const updatedEvaluations = formState.evaluations.map((evaluation, i) =>
      i === index ? { ...evaluation, [name]: value } : evaluation
    );

    setFormState((prevState) => ({
      ...prevState,
      evaluations: updatedEvaluations,
    }));
  };

  const handleAddEvaluation = () => {
    setFormState((prevState) => ({
      ...prevState,
      evaluations: [...prevState.evaluations, { bid_id: 0, score: 0 }],
    }));
  };

  const handleRemoveEvaluation = (index: number) => {
    const updatedEvaluations = formState.evaluations.filter(
      (_, i) => i !== index
    );
    setFormState((prevState) => ({
      ...prevState,
      evaluations: updatedEvaluations,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? `/erp/procurement/evaluations/${item.id}/update`
      : "/erp/procurement/evaluations/create";

    await createRequest(
      endpoint,
      token.access_token,
      formState,
      onSave,
      method
    );
    setIsSubmitting(false);

    onSave();
    onClose(); // Close the modal after saving
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
        form="item-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={`${item?.id ? "Edit" : "Add"} Evaluation`}
      visible={visible}
      className="w-1/2 md:w-4xl"
      footer={footer}
      onHide={onClose}
    >
      <form
        id="item-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        <div className="p-field">
          <label htmlFor="request_for_quotation_id">
            Request for Quotation
          </label>
          <Dropdown
            id="request_for_quotation_id"
            name="request_for_quotation_id"
            value={formState.request_for_quotation_id}
            options={quotationRequests}
            optionLabel="title"
            optionValue="id"
            onChange={(e) => {
              handleDropdownChange(e, "request_for_quotation_id");
            }}
            placeholder="Select Request for Quotation"
            filter
            className="w-full"
          />
        </div>

        <div className="p-field">
          {quotationRequests
            ?.filter((item) => item.id === formState.request_for_quotation_id)
            .map((rfq) => (
              <div key={rfq.id}>
                <h4 className="font-semibold mb-2">Bids</h4>
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1">Bid No</th>
                      <th className="border px-2 py-1">Supplier</th>
                      <th className="border px-2 py-1">Score</th>
                      <th className="border px-2 py-1">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formState.evaluations.map((evaluation, index) => (
                      <tr key={index}>
                        <td className="border px-2 py-1">
                          <Dropdown
                            id={`bid_id_${index}`}
                            name="bid_id"
                            value={evaluation.bid_id}
                            options={bids.filter(
                              (bid) =>
                                bid.request_for_quotation_id ===
                                formState.request_for_quotation_id
                            )}
                            optionLabel="bid_no"
                            optionValue="id"
                            onChange={(e) => handleEvaluationChange(e, index)}
                            placeholder="Select a bid"
                            filter
                            className="w-full"
                          />
                        </td>
                        <td className="border px-2 py-1">
                          {
                            bids.find((bid) => bid.id === evaluation.bid_id)
                              ?.supplier.supplier_name
                          }
                        </td>
                        <td className="border px-2 py-1">
                          <InputText
                            id={`score_${index}`}
                            name="score"
                            type="number"
                            value={evaluation.score.toString()}
                            onChange={(e) => handleEvaluationChange(e, index)}
                            className="w-full"
                          />
                        </td>
                        <td className="border px-2 py-1">
                          <Button
                            type="button"
                            icon="pi pi-trash"
                            className="p-button-rounded p-button-danger p-button-text"
                            onClick={() => handleRemoveEvaluation(index)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Button
                  type="button"
                  label="Add Bid"
                  icon="pi pi-plus"
                  className="p-button-text p-button-sm mt-2 w-max"
                  onClick={handleAddEvaluation}
                />
              </div>
            ))}
        </div>

        <div className="p-field">
          <label htmlFor="evaluation_criteria_id">Evaluation Criteria</label>
          <Dropdown
            id="evaluation_criteria_id"
            name="evaluation_criteria_id"
            value={formState.evaluation_criteria_id}
            options={evaluationCriteria}
            optionLabel="name"
            optionValue="id"
            onChange={(e) => handleDropdownChange(e, "evaluation_criteria_id")}
            placeholder="Select a criteria"
            filter
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="attachment">Attachment</label>
          <InputText
            id="attachment"
            name="attachment"
            type="text"
            value={formState.attachment}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="evaluated_at">Evaluated At</label>
          <InputText
            id="evaluated_at"
            name="evaluated_at"
            type="datetime-local"
            value={formState.evaluated_at}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="comments">Comments</label>
          <InputTextarea
            id="comments"
            name="comments"
            value={formState.comments}
            onChange={handleInputChange}
            rows={4}
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
