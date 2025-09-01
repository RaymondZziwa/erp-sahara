import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { createRequest } from "../../../../utils/api";
import useAuth from "../../../../hooks/useAuth";
import { RECRUITMENT_ENDPOINTS } from "../../../../api/recruitmentEndpoints";
import { CommissionStructure } from "../../../../redux/slices/types/recruitment/types";
interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: CommissionStructure;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formState, setFormState] = useState<Omit<CommissionStructure, 'id'>>({
    name: "",
    commission_type: "recruiter_placement",
    type: "percentage",
    amount: 0,
    calculation_basis: "placement_fee",
    rules: [],
  });

  useEffect(() => {
    if (item) {
      const { id, ...rest } = item;
      setFormState(rest);
    } else {
      setFormState({
        name: "",
        commission_type: "recruiter_placement",
        type: "percentage",
        amount: 0,
        calculation_basis: "placement_fee",
        rules: [],
      });
    }
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (name: string, value: string) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmountChange = (e: any) => {
    setFormState((prev) => ({ ...prev, amount: e.value }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? RECRUITMENT_ENDPOINTS.COMMISSION_STRUCTURES.UPDATE(item.id)
      : RECRUITMENT_ENDPOINTS.COMMISSION_STRUCTURES.ADD;

    await createRequest(endpoint, token.access_token, formState, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose();
    setFormState({
      name: "",
      commission_type: "recruiter_placement",
      type: "percentage",
      amount: 0,
      calculation_basis: "placement_fee",
      rules: [],
    });
  };

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500"
      />
      <Button
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        loading={isSubmitting}
        disabled={isSubmitting}
        form="commission-form"
      />
    </div>
  );

  const typeOptions = [
    { label: "Percentage", value: "percentage" },
    { label: "Fixed Amount", value: "fixed_amount" },
  ];

  const basisOptions = [
    { label: "Placement Fee", value: "placement_fee" },
    { label: "Salary", value: "salary" },
    { label: "Duration", value: "duration" },
  ];

  return (
    <Dialog
      header={item?.id ? "Edit Commission Structure" : "Add Commission Structure"}
      visible={visible}
      style={{ width: "500px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="commission-form" onSubmit={handleSave}>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-1 font-semibold">
              Name <span className="text-red-500">*</span>
            </label>
            <InputText
              id="name"
              name="name"
              value={formState.name}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Commission Type</label>
            <Dropdown
              value={formState.commission_type}
              options={[
                { label: "Recruiter Placement", value: "recruiter_placement" },
                { label: "Recruiter Temp", value: "recruiter_temp" },
                { label: "Candidate Finder", value: "candidate_finder" },
                { label: "Referral", value: "referral" },
              ]}
              onChange={(e) => handleDropdownChange("commission_type", e.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Type</label>
            <Dropdown
              value={formState.type}
              options={typeOptions}
              onChange={(e) => handleDropdownChange("type", e.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">{ formState.type === 'percentage' ? 'Percentage (%)' : 'Amount'}</label>
            <InputNumber
              value={formState.amount}
              onValueChange={handleAmountChange}
              className="w-full"
              mode="decimal"
              min={0}
              max={formState.type === 'percentage' ? 100 : undefined} 
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Calculation Basis</label>
            <Dropdown
              value={formState.calculation_basis}
              options={basisOptions}
              onChange={(e) => handleDropdownChange("calculation_basis", e.value)}
              className="w-full"
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
