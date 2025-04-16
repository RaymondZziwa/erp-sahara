import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { PayRollPeriod } from "../../../redux/slices/types/hr/salary/PayRollPeriod";
import { HUMAN_RESOURCE_ENDPOINTS } from "../../../api/hrEndpoints";
import useAuth from "../../../hooks/useAuth";
import { createRequest } from "../../../utils/api";

interface PayRollPeriodFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  item?: Partial<PayRollPeriod>;
}

const payFrequencies = ["Monthly", "Weekly", "Bi-Weekly", "Hourly"];
const payTimes = ["Day", "End"];
const AddOrModifyItem: React.FC<PayRollPeriodFormProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formState, setFormState] = useState<Partial<PayRollPeriod>>({
    start_date: null,
    end_date: null,
    is_repetitive: false,
    payment_every_after: "Monthly",
    paytime: "Day",
    pay_day: 1,
  });

  useEffect(() => {
    if (item) {
      setFormState({
        ...item,
      });
    } else {
      setFormState({
        start_date: null,
        end_date: null,
        is_repetitive: false,
        payment_every_after: "Monthly",
        paytime: "Day",
        pay_day: 1,
      });
    }
  }, [item]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      start_date: formState.start_date,
      end_date: formState.end_date,
      is_repetitive: formState.is_repetitive ?? false,
      payment_every_after: formState.payment_every_after ?? "Monthly",
      paytime: formState.paytime ?? "Day",
      pay_day: Number(formState.pay_day ?? 1),
    };

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? HUMAN_RESOURCE_ENDPOINTS.PAYROLL_PERIODS.UPDATE(item.id.toString())
      : HUMAN_RESOURCE_ENDPOINTS.PAYROLL_PERIODS.ADD;

    await createRequest(endpoint, token.access_token, payload, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose();
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        className="p-button-text !bg-red-500 hover:bg-red-400"
        onClick={onClose}
        disabled={isSubmitting}
        size="small"
      />
      <Button
        type="submit"
        form="payroll-period-form"
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        loading={isSubmitting}
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Payroll Period" : "Add Payroll Period"}
      visible={visible}
      onHide={onClose}
      footer={footer}
      style={{ width: "500px" }}
    >
      <form
        id="payroll-period-form"
        onSubmit={handleSave}
        className="grid gap-4"
      >
        <div className="p-field">
          <label htmlFor="start_date">Start Date</label>
          <Calendar
            id="start_date"
            value={formState.start_date ? new Date(formState.start_date) : null}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                start_date: e.value?.toISOString().split("T")[0] || null,
              }))
            }
            dateFormat="yy-mm-dd"
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="end_date">End Date</label>
          <Calendar
            id="end_date"
            value={formState.end_date ? new Date(formState.end_date) : null}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                end_date: e.value?.toISOString().split("T")[0] || null,
              }))
            }
            dateFormat="yy-mm-dd"
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="payment_every_after">Payment Frequency</label>
          <Dropdown
            id="payment_every_after"
            name="payment_every_after"
            value={formState.payment_every_after}
            options={payFrequencies}
            onChange={handleInputChange}
            placeholder="Select Frequency"
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="paytime">Pay Time</label>
          <Dropdown
            id="paytime"
            name="paytime"
            value={formState.paytime}
            options={payTimes}
            onChange={handleInputChange}
            placeholder="Select Pay Time"
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="pay_day">Pay Day (1–30)</label>
          <InputNumber
            id="pay_day"
            name="pay_day"
            value={formState.pay_day}
            onValueChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                pay_day: e.value ?? 1,
              }))
            }
            showButtons
            min={1}
            max={30}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            inputId="is_repetitive"
            checked={formState.is_repetitive}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                is_repetitive: e.checked ?? false,
              }))
            }
          />
          <label htmlFor="is_repetitive">Is Repetitive</label>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
