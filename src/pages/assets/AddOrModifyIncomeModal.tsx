import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { toast } from "react-toastify";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import { ASSETSENDPOINTS } from "../../api/assetEndpoints";
import { baseURL } from "../../utils/api";
import useCurrencies from "../../hooks/procurement/useCurrencies";
import usePaymentMethods from "../../hooks/procurement/usePaymentMethods";

// Centralized API configuration
const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

interface PaymentMethod {
  id: number;
  name: string;
  chart_of_account_id: number;
  description: string | null;
}

interface IncomeForm {
  currency_id: string;
  amount: number;
  narrative: string;
  transaction_date: string;
  payment_method_id: string;
}

interface Account {
  value: number;
  name: string;
}

interface AddOrModifyIncomeModalProps {
  visible: boolean;
  onClose: () => void;
  assetId: number;
  onSave: () => void;
}

const AddOrModifyIncomeModal: React.FC<AddOrModifyIncomeModalProps> = ({
  visible,
  onClose,
  assetId,
  onSave,
}) => {
  const { token } = useAuth();
  const [incomeForm, setIncomeForm] = useState<IncomeForm>({
    currency_id: "",
    amount: 0,
    narrative: "",
    transaction_date: "",
    payment_method_id: ""
  });

    const { data: currencies } = useCurrencies();
    const {data: paymentMethods} = usePaymentMethods()
  const [incomeAccounts, setIncomeAccounts] = useState<Account[]>([]);
  const [cashAccounts, setCashAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Axios interceptors for token injection
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (token?.access_token) {
          config.headers.Authorization = `Bearer ${token.access_token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          setError("Session expired. Please login again.");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  // Fetch income accounts
  const fetchIncomeAccounts = async () => {
    try {
      const response = await api.get("/accounts/get-income-accounts");
      const incomeData = response.data?.data || [];
      setIncomeAccounts(
        incomeData.map((acc: any) => ({
          value: acc.id,
          name: acc.name,
        }))
      );
    } catch (error) {
      console.error("Error fetching income accounts:", error);
      setError("Failed to load income accounts.");
    }
  };

  // Fetch cash accounts (chart of accounts)
  const fetchCashAccounts = async () => {
    try {
      const response = await api.get("/accounts/get-cash-accounts");
      const cashData = response.data?.data || [];
      setCashAccounts(
        cashData.map((acc: any) => ({
          value: acc.id,
          name: acc.name,
        }))
      );
    } catch (error) {
      console.error("Error fetching cash accounts:", error);
      setError("Failed to load cash accounts.");
    }
  };

  // Initialize data fetching
  useEffect(() => {
    if (token?.access_token) {
      Promise.all([fetchIncomeAccounts(), fetchCashAccounts()])
        .then(() => setLoading(false))
        .catch((error) => {
          console.error("Initialization error:", error);
          setError("Failed to initialize component.");
          setLoading(false);
        });
    }
  }, [token]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setIncomeForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle dropdown changes
  const handleDropdownChange = (name: keyof IncomeForm, value: any) => {
    setIncomeForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSaveIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate mandatory fields
    if (
      !incomeForm.amount ||
      !incomeForm.transaction_date || 
      !incomeForm.currency_id || 
      !incomeForm.payment_method_id
    ) {
      toast.warn("Please fill in all mandatory fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      await api.post(
        ASSETSENDPOINTS.ASSETS.INCOMES.CREATE(assetId.toString()),
        incomeForm
      );
      toast.success("Income added successfully.");
      onSave(); // Refresh the parent component
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error saving income:", error);
      toast.error("Failed to add income.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      header="Add Income"
      visible={visible}
      style={{ width: "400px" }}
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
            label="Submit"
            icon="pi pi-check"
            className="p-button-success"
            onClick={handleSaveIncome}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </div>
      }
    >
      <form onSubmit={handleSaveIncome}>
        <div className="p-fluid grid grid-cols-1 gap-4">
          <div className="p-field">
                      <label htmlFor="currency_id">
                        Currency<span className="text-red-500">*</span>
                      </label>
                      <Dropdown
                        id="currency_id"
                        name="currency_id"
                        value={incomeForm.currency_id}
                        options={currencies.map((method) => ({
                          value: method.id,
                          name: method.name,
                        }))}
                        onChange={(e) => handleDropdownChange("currency_id", e.value)}
                        optionLabel="name"
                        optionValue="value"
                        placeholder="Select Currency"
                        required
                      />
                    </div>
          <div className="p-field">
            <label htmlFor="amount">
              Amount<span className="text-red-500">*</span>
            </label>
            <InputText
              id="amount"
              name="amount"
              type="number"
              value={incomeForm.amount.toString()}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="transaction_date">
              Transaction Date<span className="text-red-500">*</span>
            </label>
            <Calendar
              id="transaction_date"
              name="transaction_date"
              value={new Date(incomeForm.transaction_date)}
              onChange={(e) =>
                setIncomeForm({
                  ...incomeForm,
                  transaction_date: e.value?.toISOString().split("T")[0] || "",
                })
              }
              dateFormat="yy-mm-dd"
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="narrative">Narrative</label>
            <InputTextarea
              id="narrative"
              name="narrative"
              value={incomeForm.narrative}
              onChange={handleInputChange}
            />
          </div>
          <div className="p-field">
                                <label htmlFor="payment_method_id">
                                  Payment Method<span className="text-red-500">*</span>
                                </label>
                                <Dropdown
                                  id="payment_method_id"
                                  name="payment_method_id"
                                  value={incomeForm.payment_method_id}
                                  options={paymentMethods.map((method) => ({
                                    value: method.id, 
                                    name: method.name,
                                  }))}
                                  onChange={(e) =>
                                    handleDropdownChange("payment_method_id", e.value)
                                  }
                                  optionLabel="name"
                                  optionValue="value"
                                  placeholder="Select Payment Method"
                                  required
                                />
                              </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyIncomeModal;