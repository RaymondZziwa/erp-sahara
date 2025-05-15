import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { toast } from "react-toastify";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import { ASSETSENDPOINTS } from "../../api/assetEndpoints";
import { baseURL } from "../../utils/api";
import { Dropdown } from "primereact/dropdown";
import useCurrencies from "../../hooks/procurement/useCurrencies";

// Centralized API configuration
const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

interface ExpenseForm {
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

interface PaymentMethod {
  id: number;
  name: string;
  chart_of_account_id: number;
  description: string | null;
}

interface AddOrModifyExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  assetId: number;
  onSave: () => void;
}

const AddOrModifyExpenseModal: React.FC<AddOrModifyExpenseModalProps> = ({
  visible,
  onClose,
  assetId,
  onSave,
}) => {
  const { token } = useAuth();

  const defaultExpenseForm: ExpenseForm = {
    currency_id: "",
    amount: 0,
    narrative: "",
    transaction_date: "",
    payment_method_id: "",
  };

  const [expenseForm, setExpenseForm] = useState<ExpenseForm>(defaultExpenseForm);

  const { data: currencies } = useCurrencies();
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [expenseAccounts, setExpenseAccounts] = useState<Account[]>([]);
  const [cashAccounts, setCashAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle dropdown changes
  const handleDropdownChange = (name: keyof ExpenseForm, value: any) => {
    setExpenseForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

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

    const fetchPaymentMethods = async () => {
      try {
        const response = await api.get("/accounts/paymentmethod");
        if (!response.data?.success) {
          throw new Error("Failed to fetch payment methods.");
        }
        const paymentMethodsData = response.data.data || [];
        setPaymentMethods(paymentMethodsData);
      } catch (error) {
        console.error("Error fetching payment methods:", error);
        setError("Failed to load payment methods.");
      } finally {
        setLoading(false);
      }
    };
  
    // Initialize data fetching
    useEffect(() => {
      if (token?.access_token) {
        fetchPaymentMethods();
      }
    }, [token]);
  

  // Fetch expense accounts
  const fetchExpenseAccounts = async () => {
    try {
      const response = await api.get("/accounts/get-expense-accounts");
      const expenseData = response.data?.data || [];
      setExpenseAccounts(
        expenseData.map((acc: any) => ({
          value: acc.id,
          name: acc.name,
        }))
      );
    } catch (error) {
      console.error("Error fetching expense accounts:", error);
      setError("Failed to load expense accounts.");
    }
  };

  // Fetch cash accounts
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
      Promise.all([fetchExpenseAccounts(), fetchCashAccounts()])
        .then(() => setLoading(false))
        .catch((error) => {
          console.error("Initialization error:", error);
          setError("Failed to initialize component.");
          setLoading(false);
        });
    }
  }, [token]);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setExpenseForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate mandatory fields
    if (!expenseForm.amount || !expenseForm.transaction_date) {
      toast.warn("Please fill in all mandatory fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      await api.post(
        ASSETSENDPOINTS.ASSETS.EXPENSES.CREATE(assetId.toString()),
        expenseForm
      );
      toast.success("Expense added successfully.");
      setExpenseForm(defaultExpenseForm)
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving expense:", error);
      toast.error("Failed to add expense.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      header="Add Expense"
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
            onClick={handleSaveExpense}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </div>
      }
    >
      <form onSubmit={handleSaveExpense}>
        <div className="p-fluid grid grid-cols-1 gap-4">
          <div className="p-field">
            <label htmlFor="currency_id">
              Currency<span className="text-red-500">*</span>
            </label>
            <Dropdown
              id="currency_id"
              name="currency_id"
              value={expenseForm.currency_id}
              options={currencies.map((method) => ({
                value: method.id,
                name: method.name, // Use payment method name for display
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
              value={expenseForm.amount.toString()}
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
              value={new Date(expenseForm.transaction_date)}
              onChange={(e) =>
                setExpenseForm({
                  ...expenseForm,
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
              value={expenseForm.narrative}
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
                        value={expenseForm.payment_method_id}
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

export default AddOrModifyExpenseModal;