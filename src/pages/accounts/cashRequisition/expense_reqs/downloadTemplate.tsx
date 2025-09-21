import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { ToastContainer, toast } from "react-toastify";
import useBudgets from "../../../../hooks/budgets/useBudgets";
import useCurrencies from "../../../../hooks/procurement/useCurrencies";
import useAuth from "../../../../hooks/useAuth";
import axios from "axios";
import { baseURL } from "../../../../utils/api";

interface AddOrModifyCurrencyBudgetProps {
  visible: boolean;
  onClose: () => void;
  initialData?: {
    currency_id?: string;
    budget_id?: string;
  };
}

interface Payload {
  currency_id: string;
  budget_id: string;
}

const DownloadTemplateModal: React.FC<AddOrModifyCurrencyBudgetProps> = ({
  visible,
  onClose,
  initialData,
}) => {
  const { data: currencies, loading: currenciesLoading } = useCurrencies();
  const { data: budgets, loading: budgetsLoading } = useBudgets();
  const { token } = useAuth();

  const [formState, setFormState] = useState<Payload>({
    currency_id: initialData?.currency_id || "",
    budget_id: initialData?.budget_id || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormState(initialData as Payload);
    }
  }, [initialData]);

  const handleChange = (field: keyof Payload, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };
    
    const print = async () => {
        if(!formState.budget_id || !formState.currency_id) {
          toast.error("Please select both currency and budget");
          return;
        }
        try {
          const response = await axios.get(
            `${baseURL}/accounts/cash-requisitions/downloadtemplate`,
            {
              headers: {
                Authorization: `Bearer ${token?.access_token}`,
              },
              params: {
                budget_id: formState.budget_id,
                currency_id: formState.currency_id,
              },
              responseType: 'blob',
            }
          );
    
          // Create a blob from the response
          const blob = new Blob([response.data]);
          const url = window.URL.createObjectURL(blob);
    
          // Create a link and click it to start download
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'cash-requisition-template.xlsx');
          document.body.appendChild(link);
          link.click();
    
          // Cleanup
          link.remove();
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error(error);
        }
      };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500 hover:!bg-red-400 text-white"
        size="small"
        disabled={isSubmitting}
      />
      <Button
        label="Submit"
        icon="pi pi-check"
        onClick={print}
        className="!bg-tal-500 hover:!bg-teal-700 text-white"
        size="small"
        disabled={isSubmitting || currenciesLoading || budgetsLoading}
      />
    </div>
  );

  return (
    <>
      <ToastContainer />
      <Dialog
        header="Select Currency & Budget for Template"
        visible={visible}
        footer={footer}
        onHide={onClose}
        className="w-full md:w-1/3"
      >
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col">
            <label>Currency<span className="text-red-500">*</span></label>
            <Dropdown
              value={formState.currency_id}
              options={currencies.map((c) => ({ label: c.name, value: c.id }))}
              onChange={(e) => handleChange("currency_id", e.value)}
              placeholder="Select Currency"
              className="w-full"
              filter
            />
          </div>

          <div className="flex flex-col">
            <label>Budget<span className="text-red-500">*</span></label>
            <Dropdown
              value={formState.budget_id}
              options={budgets.map((b) => ({ label: b.name, value: b.id }))}
              onChange={(e) => handleChange("budget_id", e.value)}
              placeholder="Select Budget"
              className="w-full"
              filter
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default DownloadTemplateModal;
