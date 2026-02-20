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
import usePayrollPeriods from "../../../hooks/hr/usePayRollPeriods";

interface PayRollPeriodFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  item?: Partial<PayRollPeriod>;
}

const frequencyOptions = [
  { label: "One-Time", value: "one_time" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" }
];

const payTimeOptions = [
  { label: "Specific Day", value: "specific_day" },
  { label: "End of Period", value: "end_of_period" }
];

const AddOrModifyItem: React.FC<PayRollPeriodFormProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const { token } = useAuth();
  const {refresh} = usePayrollPeriods()
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formState, setFormState] = useState({
    period_start: null as Date | null,
    period_end: null as Date | null,
    scheduled_date: null as Date | null,
    paytime: "specific_day",
    frequency: "monthly",
    pay_day: 25,
    is_repetitive: false,
  });

  useEffect(() => {
    if (item) {
      setFormState({
        period_start: item.period_start ? new Date(item.period_start) : null,
        period_end: item.period_end ? new Date(item.period_end) : null,
        scheduled_date: item.scheduled_date ? new Date(item.scheduled_date) : null,
        paytime: item.paytime || "specific_day",
        frequency: item.frequency || "monthly",
        pay_day: item.pay_day || 25,
        is_repetitive: item.is_repetitive || false,
      });
    } else {
      setFormState({
        period_start: null,
        period_end: null,
        scheduled_date: null,
        paytime: "specific_day",
        frequency: "monthly",
        pay_day: 25,
        is_repetitive: false,
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

    // Validate required fields
    if (!formState.period_start || !formState.period_end) {
      alert("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      period_start: formState.period_start ? formState.period_start.toISOString().split("T")[0] : null,
      period_end: formState.period_end ? formState.period_end.toISOString().split("T")[0] : null,
      scheduled_date: formState.scheduled_date ? formState.scheduled_date.toISOString().split("T")[0] : null,
      paytime: formState.paytime,
      frequency: formState.frequency,
      pay_day: Number(formState.pay_day),
      is_repetitive: formState.is_repetitive,
    };

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? HUMAN_RESOURCE_ENDPOINTS.PAYROLL_PERIODS.UPDATE(item.id.toString())
      : HUMAN_RESOURCE_ENDPOINTS.PAYROLL_PERIODS.ADD;

    try {
      await createRequest(endpoint, token.access_token, payload, onSave, method);
      refresh();
      onClose();
    } catch (error) {
      console.error("Error saving payroll period:", error);
    } finally {
      setIsSubmitting(false);
    }
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
          <label htmlFor="period_start">Period Start Date *</label>
          <Calendar
            id="period_start"
            value={formState.period_start}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                period_start: e.value as Date,
              }))
            }
            dateFormat="yy-mm-dd"
            showIcon
            className="w-full"
            required
          />
        </div>

        <div className="p-field">
          <label htmlFor="period_end">Period End Date *</label>
          <Calendar
            id="period_end"
            value={formState.period_end}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                period_end: e.value as Date,
              }))
            }
            dateFormat="yy-mm-dd"
            showIcon
            className="w-full"
            required
          />
        </div>

        <div className="p-field">
          <label htmlFor="frequency">Frequency *</label>
          <Dropdown
            id="frequency"
            name="frequency"
            value={formState.frequency}
            options={frequencyOptions}
            onChange={handleInputChange}
            placeholder="Select Frequency"
            className="w-full"
            required
          />
        </div>

        <div className="p-field">
          <label htmlFor="paytime">Pay Time *</label>
          <Dropdown
            id="paytime"
            name="paytime"
            value={formState.paytime}
            options={payTimeOptions}
            onChange={handleInputChange}
            placeholder="Select Pay Time"
            className="w-full"
            required
          />
        </div>

        {formState.paytime === "specific_day" && (
          <>
           <div className="p-field">
              <label htmlFor="scheduled_date">Scheduled Date</label>
              <Calendar
                id="scheduled_date"
                value={formState.scheduled_date}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    scheduled_date: e.value as Date,
                  }))
                }
                dateFormat="yy-mm-dd"
                showIcon
                className="w-full"
              />
            </div>
          <div className="p-field">
            <label htmlFor="pay_day">Pay Day (1-31) *</label>
            <InputNumber
              id="pay_day"
              name="pay_day"
              value={formState.pay_day}
              onValueChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  pay_day: e.value ?? 25,
                }))
              }
              showButtons
              min={1}
              max={31}
              className="w-full"
            />
            </div>
          </>
        )}

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
          <label htmlFor="is_repetitive" className="cursor-pointer">
            Is Repetitive
          </label>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;