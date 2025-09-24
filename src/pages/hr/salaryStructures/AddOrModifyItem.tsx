import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { toast, ToastContainer } from "react-toastify";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { HUMAN_RESOURCE_ENDPOINTS } from "../../../api/hrEndpoints";

interface AdditionalBenefit {
  type: string;
  amount: number;
}

interface AddOrModifySalaryStructureProps {
  visible: boolean;
  onClose: () => void;
  item?: any;
  onSave: () => void;
}

const AddOrModifySalaryStructure: React.FC<AddOrModifySalaryStructureProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const { token } = useAuth();
  const [formState, setFormState] = useState({
    name: "",
    basic_pay: 0,
    notes: "",
    //additional_benefits: [] as AdditionalBenefit[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormState({
        name: item.name || "",
        basic_pay: item.basic_pay || 0,
        notes: item.notes || "",
        //additional_benefits: item.additional_benefits || [],
      });
    } else {
      setFormState({
        name: "",
        basic_pay: 0,
        notes: "",
        //additional_benefits: [],
      });
    }
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: name === "basic_pay" ? Number(value) : value,
    }));
  };

  // const handleBenefitChange = (index: number, field: "type" | "amount", value: string | number) => {
  //   const updated = [...formState.additional_benefits];
  //   updated[index][field] = field === "amount" ? Number(value) : value;
  //   setFormState(prev => ({ ...prev, additional_benefits: updated }));
  // };

  // const addBenefit = () => {
  //   setFormState(prev => ({
  //     ...prev,
  //     additional_benefits: [...prev.additional_benefits, { type: "", amount: 0 }],
  //   }));
  // };

  // const removeBenefit = (index: number) => {
  //   const updated = [...formState.additional_benefits];
  //   updated.splice(index, 1);
  //   setFormState(prev => ({ ...prev, additional_benefits: updated }));
  // };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formState.name || !formState.basic_pay) {
      toast.warn("Fill in all mandatory fields");
      setIsSubmitting(false);
      return;
    }

    try {
      const data = { ...formState };
      const method = item?.id ? "PUT" : "POST";
      const endpoint = item?.id
        ? HUMAN_RESOURCE_ENDPOINTS.SALARY_STRUCTURES.UPDATE(item.id)
        : HUMAN_RESOURCE_ENDPOINTS.SALARY_STRUCTURES.ADD;

      await createRequest(endpoint, token.access_token, data, onSave, method);

      //toast.success(item ? "Salary structure updated" : "Salary structure saved");

      setFormState({
        name: "",
        basic_pay: 0,
        notes: "",
        //additional_benefits: [],
      });
      onSave();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error saving salary structure");
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button label="Cancel" onClick={onClose} className="p-button-text !bg-red-500" disabled={isSubmitting} />
      <Button label={item?.id ? "Update" : "Submit"} type="submit" form="salary-structure-form" loading={isSubmitting} />
    </div>
  );

  return (
    <>
      <ToastContainer />
      <Dialog header={item?.id ? "Edit Salary Structure" : "Add Salary Structure"} visible={visible} style={{ width: "500px" }} footer={footer} onHide={onClose}>
        <form id="salary-structure-form" onSubmit={handleSave} className="p-fluid grid grid-cols-1 gap-4">
          <div className="p-field">
            <label>Name<span className="text-red-500">*</span></label>
            <InputText name="name" value={formState.name} onChange={handleInputChange} required className="w-full" />
          </div>

          <div className="p-field">
            <label>
              Basic Pay<span className="text-red-500">*</span>
            </label>
            <InputText
              name="basic_pay"
              value={
                formState.basic_pay !== undefined && formState.basic_pay !== null
                  ? Number(formState.basic_pay).toLocaleString()
                  : ""
              }
              onChange={(e) => {
                const rawValue = e.target.value.replace(/,/g, "");
                setFormState((prev) => ({
                  ...prev,
                  basic_pay: rawValue === "" ? "" : Number(rawValue),
                }));
              }}
              required
              className="w-full"
            />
          </div>


          <div className="p-field">
            <label>Notes</label>
            <InputTextarea name="notes" value={formState.notes} onChange={handleInputChange} className="w-full" />
          </div>

          {/* <div className="p-field">
            <label>Additional Benefits</label>
            {formState.additional_benefits.map((benefit, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <InputText
                  placeholder="Type"
                  value={benefit.type}
                  onChange={(e) => handleBenefitChange(index, "type", e.target.value)}
                  className="flex-1"
                />
                <InputNumber
                  placeholder="Amount"
                  value={benefit.amount}
                  onValueChange={(e) => handleBenefitChange(index, "amount", e.value || 0)}
                  className="flex-1"
                />
                <Button type="button" icon="pi pi-trash" className="p-button-danger" onClick={() => removeBenefit(index)} />
              </div>
            ))}
            <Button type="button" label="Add Benefit" icon="pi pi-plus" className="p-button-success mt-2" onClick={addBenefit} />
          </div> */}
        </form>
      </Dialog>
    </>
  );
};

export default AddOrModifySalaryStructure;
