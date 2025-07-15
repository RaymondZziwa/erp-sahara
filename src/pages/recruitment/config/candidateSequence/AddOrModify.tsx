import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";
import { createRequest } from "../../../../utils/api";
import useAuth from "../../../../hooks/useAuth";
import { RECRUITMENT_ENDPOINTS } from "../../../../api/recruitmentEndpoints";

interface InvoiceSequence {
  prefix: string;
  use_year_month: number;
  use_branch_number: number; 
  last_sequence: number;
  id: string;        
}

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: InvoiceSequence;
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

  // Initialize form state based on item or default empty values
  const [formState, setFormState] = useState<Omit<InvoiceSequence, "id">>({
    prefix: "",
    use_year_month: 0,
    use_branch_number: 0,
    last_sequence: 0,
  });

  useEffect(() => {
    if (item) {
      const { id, ...rest } = item;
      setFormState(rest);
    } else {
      setFormState({
        prefix: "",
        use_year_month: 0,
        use_branch_number: 0,
        last_sequence: 0,
      });
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: "use_year_month" | "use_branch_number") => (e: any) => {
    setFormState((prev) => ({ ...prev, [name]: e.checked ? 1 : 0 }));
  };

  const handleNumberChange = (name: keyof Omit<InvoiceSequence, "id">, value: number) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!item?.id) {
      // No adding supported
      onClose();
      return;
    }
    setIsSubmitting(true);

    const endpoint = RECRUITMENT_ENDPOINTS.CANDIDATE_SEQUENCES.UPDATE(item.id);

    await createRequest(endpoint, token.access_token, formState, onSave, "PUT");
    setIsSubmitting(false);
    onSave();
    onClose();
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
        label="Update"
        icon="pi pi-check"
        type="submit"
        loading={isSubmitting}
        disabled={isSubmitting}
        form="invoice-sequence-form"
      />
    </div>
  );

  return (
    <Dialog
      header={item ? "Edit Candidate Sequence" : "Add Candidate Sequence"}
      visible={visible}
      style={{ width: "500px" }}
      footer={footer}
      onHide={onClose}
      modal
      closable
    >
      <form id="invoice-sequence-form" onSubmit={handleSave}>
        <div className="space-y-4">
          <div>
            <label htmlFor="prefix" className="block mb-1 font-semibold">
              Prefix <span className="text-red-500">*</span>
            </label>
            <InputText
              id="prefix"
              name="prefix"
              value={formState.prefix}
              onChange={handleInputChange}
              required
              className="w-full"
              maxLength={10}
            />
          </div>

          <div className="flex items-center gap-4">
            <Checkbox
              inputId="use_year_month"
              checked={formState.use_year_month === 1}
              onChange={handleCheckboxChange("use_year_month")}
            />
            <label htmlFor="use_year_month" className="font-semibold">
              Use Year/Month in Sequence
            </label>
          </div>

          <div className="flex items-center gap-4">
            <Checkbox
              inputId="use_branch_number"
              checked={formState.use_branch_number === 1}
              onChange={handleCheckboxChange("use_branch_number")}
            />
            <label htmlFor="use_branch_number" className="font-semibold">
              Use Branch Number in Sequence
            </label>
          </div>

          <div>
            <label htmlFor="last_sequence" className="block mb-1 font-semibold">
              Last Sequence Number <span className="text-red-500">*</span>
            </label>
            <InputNumber
              id="last_sequence"
              value={formState.last_sequence}
              onValueChange={(e) => handleNumberChange("last_sequence", e.value ?? 0)}
              className="w-full"
              min={0}
              required
              mode="decimal"
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
