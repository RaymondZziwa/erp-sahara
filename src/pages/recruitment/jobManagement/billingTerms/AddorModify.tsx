import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import useAuth from "../../../../hooks/useAuth";
import { createRequest } from "../../../../utils/api";
import { API_ENDPOINTS } from "../../../../api/apiEndpoints";

interface BillingTerm {
  id?: number;
  billing_type: string;
  rate: number;
  currency_id: string;
  payment_due_days: number;
  fee_percentage: number;
  min_fee: number;
  max_fee: number;
  expenses_billable: boolean;
  expense_markup_percentage: number;
  discount_type: string;
  discount_amount: number;
  notes?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  term?: BillingTerm;
  onSave: () => void;
}

const billingTypes = ["monthly", "hourly", "annually"];
const discountTypes = ["percentage", "fixed"];
const currencies = ["USD", "UGX", "EUR"];

const AddOrModifyBillingTerm: React.FC<Props> = ({
  visible,
  onClose,
  term,
  onSave,
}) => {
  const [formState, setFormState] = useState<BillingTerm>({
    billing_type: "monthly",
    rate: 0,
    currency_id: "USD",
    payment_due_days: 30,
    fee_percentage: 0,
    min_fee: 0,
    max_fee: 0,
    expenses_billable: false,
    expense_markup_percentage: 0,
    discount_type: "percentage",
    discount_amount: 0,
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (term) {
      setFormState({ ...term });
    }
  }, [term]);

  const handleChange = (name: string, value: any) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const method = term?.id ? "PUT" : "POST";
    const endpoint = term?.id
      ? API_ENDPOINTS.BILLING_TERMS.MODIFY(term.id)
      : API_ENDPOINTS.BILLING_TERMS.ADD;

    await createRequest(endpoint, token.access_token, formState, onSave, method);
    setIsSubmitting(false);
    onClose();
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button label="Cancel" onClick={onClose} className="p-button-text !bg-red-500" />
      <Button
        label={term?.id ? "Update" : "Submit"}
        type="submit"
        form="billing-form"
        loading={isSubmitting}
      />
    </div>
  );

  return (
    <Dialog
      header={term?.id ? "Edit Billing Term" : "Add Billing Term"}
      visible={visible}
      style={{ width: "600px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="billing-form" onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>Billing Type</label>
            <Dropdown
              options={billingTypes}
              value={formState.billing_type}
              onChange={(e) => handleChange("billing_type", e.value)}
              className="w-full"
            />
          </div>
          <div>
            <label>Currency</label>
            <Dropdown
              options={currencies}
              value={formState.currency_id}
              onChange={(e) => handleChange("currency_id", e.value)}
              className="w-full"
            />
          </div>
          <div>
            <label>Rate</label>
            <InputNumber
              value={formState.rate}
              onValueChange={(e) => handleChange("rate", e.value ?? 0)}
              className="w-full"
              mode="currency"
              currency={formState.currency_id}
              locale="en-US"
            />
          </div>
          <div>
            <label>Payment Due Days</label>
            <InputNumber
              value={formState.payment_due_days}
              onValueChange={(e) => handleChange("payment_due_days", e.value ?? 0)}
              className="w-full"
            />
          </div>
          <div>
            <label>Fee %</label>
            <InputNumber
              value={formState.fee_percentage}
              onValueChange={(e) => handleChange("fee_percentage", e.value ?? 0)}
              className="w-full"
              suffix="%"
            />
          </div>
          <div>
            <label>Min Fee</label>
            <InputNumber
              value={formState.min_fee}
              onValueChange={(e) => handleChange("min_fee", e.value ?? 0)}
              className="w-full"
            />
          </div>
          <div>
            <label>Max Fee</label>
            <InputNumber
              value={formState.max_fee}
              onValueChange={(e) => handleChange("max_fee", e.value ?? 0)}
              className="w-full"
            />
          </div>
          <div>
            <label>Expenses Billable</label>
            <Dropdown
              options={[{ label: "Yes", value: true }, { label: "No", value: false }]}
              value={formState.expenses_billable}
              onChange={(e) => handleChange("expenses_billable", e.value)}
              className="w-full"
            />
          </div>
          <div>
            <label>Expense Markup %</label>
            <InputNumber
              value={formState.expense_markup_percentage}
              onValueChange={(e) =>
                handleChange("expense_markup_percentage", e.value ?? 0)
              }
              className="w-full"
              suffix="%"
            />
          </div>
          <div>
            <label>Discount Type</label>
            <Dropdown
              options={discountTypes}
              value={formState.discount_type}
              onChange={(e) => handleChange("discount_type", e.value)}
              className="w-full"
            />
          </div>
          <div>
            <label>Discount Amount</label>
            <InputNumber
              value={formState.discount_amount}
              onValueChange={(e) => handleChange("discount_amount", e.value ?? 0)}
              className="w-full"
            />
          </div>
        </div>
        <div>
          <label>Notes</label>
          <InputTextarea
            rows={3}
            value={formState.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyBillingTerm;
