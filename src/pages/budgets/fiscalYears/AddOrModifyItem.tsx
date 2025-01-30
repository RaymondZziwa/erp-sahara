import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { Calendar } from "primereact/calendar";
import { FiscalYear } from "../../../redux/slices/types/budgets/FiscalYear";
import { BUDGETS_ENDPOINTS } from "../../../api/budgetsEndpoints";
import { toast } from "react-toastify";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: FiscalYear;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<FiscalYear>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        ...item,
      });
    } else {
      setFormState({});
    }
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (
      !formState.financial_year ||
      !formState.start_date ||
      !formState.end_date
    ) {
      setIsSubmitting(false);
      toast.warn("Start and end date  required");
      return; // Handle validation error here
    }

    const data = {
      financial_year: formState.financial_year,
      start_date: new Date(formState.start_date ?? new Date())
        .toISOString()
        .slice(0, 10),
      end_date: new Date(formState.end_date ?? new Date())
        .toISOString()
        .slice(0, 10),
    };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? BUDGETS_ENDPOINTS.FISCAL_YEARS.UPDATE(item.id.toString())
      : BUDGETS_ENDPOINTS.FISCAL_YEARS.ADD;

    await createRequest(endpoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose(); // Close the modal after saving
  };

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500 hover:bg-red-400"
        size="small"
        disabled={isSubmitting}
      />
      <Button
        loading={isSubmitting}
        disabled={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="truck-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Fiscal Year" : "Add Fiscal Year"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="truck-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        <div className="p-field">
          <label htmlFor="financial_year">Financial Year</label>
          <InputText
            id="financial_year"
            name="financial_year"
            value={formState.financial_year || ""}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="start_date">Start Date</label>
          <Calendar
            id="start_date"
            name="start_date"
            value={new Date(formState.start_date ?? new Date()) || null}
            onChange={(e) =>
              setFormState((prevState) => ({
                ...prevState,
                start_date: e.value?.toString(),
              }))
            }
            required
            showIcon
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="end_date">End Date</label>
          <Calendar
            id="end_date"
            name="end_date"
            value={new Date(formState.end_date ?? new Date()) || null}
            onChange={(e) =>
              setFormState((prevState) => ({
                ...prevState,
                end_date: e.value?.toString(),
              }))
            }
            required
            showIcon
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
