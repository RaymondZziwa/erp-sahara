import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { toast } from "react-toastify";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import { baseURL } from "../../utils/api";

interface ValuationForm {
  valuation_date: string;
  value: number;
  valued_by: string;
  valuation_notes: string;
}

interface AddOrModifyValuationModalProps {
  visible: boolean;
  onClose: () => void;
  assetId: string; // UUID
  onSave: () => void;
  editMode?: boolean;
  initialData?: ValuationForm;
  valuationId?: string;
}

const AddOrModifyValuationModal: React.FC<AddOrModifyValuationModalProps> = ({
  visible,
  onClose,
  assetId,
  onSave,
  editMode = false,
  initialData,
  valuationId,
}) => {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [valuationForm, setValuationForm] = useState<ValuationForm>({
    valuation_date: "",
    value: 0,
    valued_by: "",
    valuation_notes: "",
  });

  // Set initial form data if in edit mode
  useEffect(() => {
    if (editMode && initialData) {
      setValuationForm(initialData);
    } else {
      // Reset when modal opens for new entry
      setValuationForm({
        valuation_date: "",
        value: 0,
        valued_by: "",
        valuation_notes: "",
      });
    }
  }, [editMode, initialData, visible]);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValuationForm((prevState) => ({
      ...prevState,
      [name]: name === "value" ? parseFloat(value) : value,
    }));
  };

  // Handle calendar (valuation date)
  const handleDateChange = (e: any) => {
    const isoDate = e.value?.toISOString().split("T")[0] || "";
    setValuationForm((prevState) => ({
      ...prevState,
      valuation_date: isoDate,
    }));
  };

  // Save or update valuation
  const handleSaveValuation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const endpoint = editMode
      ? `${baseURL}/assets/${assetId}/valuations/${valuationId}/update`
      : `${baseURL}/assets/${assetId}/valuations/create`;

    try {
      if (token?.access_token) {
        await axios({
          method: editMode ? "put" : "post",
          url: endpoint,
          data: valuationForm,
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
        });
        toast.success(
          editMode
            ? "Valuation updated successfully."
            : "Valuation added successfully."
        );
        onSave();
        onClose();
      } else {
        toast.error("Unauthorized. Please login again.");
      }
    } catch (error) {
      console.error("Error saving valuation:", error);
      toast.error("Failed to save valuation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      header={editMode ? "Edit Valuation" : "Add Valuation"}
      visible={visible}
      style={{ width: "450px" }}
      onHide={onClose}
      footer={
        <div className="flex justify-end space-x-2">
          <Button
            label="Cancel"
            icon="pi pi-times"
            className="p-button-text !bg-red-500 hover:bg-red-400"
            onClick={onClose}
            disabled={isSubmitting}
          />
          <Button
            label={editMode ? "Update" : "Submit"}
            icon="pi pi-check"
            className="p-button-success"
            onClick={handleSaveValuation}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </div>
      }
    >
      <form onSubmit={handleSaveValuation}>
        <div className="p-fluid grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="valuation_date">
              Valuation Date<span className="text-red-500">*</span>
            </label>
            <Calendar
              id="valuation_date"
              value={
                valuationForm.valuation_date
                  ? new Date(valuationForm.valuation_date)
                  : null
              }
              onChange={handleDateChange}
              dateFormat="yy-mm-dd"
              showIcon
              required
            />
          </div>
          <div>
            <label htmlFor="value">
              Value<span className="text-red-500">*</span>
            </label>
            <InputText
              id="value"
              name="value"
              type="number"
              value={valuationForm.value.toString()}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="valued_by">
              Valued By<span className="text-red-500">*</span>
            </label>
            <InputText
              id="valued_by"
              name="valued_by"
              value={valuationForm.valued_by}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="valuation_notes">Valuation Notes</label>
            <InputTextarea
              id="valuation_notes"
              name="valuation_notes"
              value={valuationForm.valuation_notes}
              onChange={handleInputChange}
              autoResize
              rows={3}
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyValuationModal;