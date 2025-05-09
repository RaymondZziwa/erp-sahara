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

// Centralized API configuration
const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

interface ExpenseForm {
  amount: number;
  narrative: string;
  transaction_date: string;
  expense_account_id: number | null;
  cash_account_id: number | null;
}

interface Account {
  value: number;
  name: string;
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
  const [expenseForm, setExpenseForm] = useState<ExpenseForm>({
    amount: 0,
    narrative: "",
    transaction_date: "",
    expense_account_id: null,
    cash_account_id: null,
  });

  const [expenseAccounts, setExpenseAccounts] = useState<Account[]>([]);
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExpenseForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle dropdown changes
  const handleDropdownChange = (name: keyof ExpenseForm, value: any) => {
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
    if (
      !expenseForm.amount ||
      !expenseForm.transaction_date ||
      !expenseForm.expense_account_id ||
      !expenseForm.cash_account_id
    ) {
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
            <label htmlFor="expense_account_id">
              Expense Account<span className="text-red-500">*</span>
            </label>
            <Dropdown
              id="expense_account_id"
              name="expense_account_id"
              value={expenseForm.expense_account_id}
              options={expenseAccounts}
              onChange={(e) => handleDropdownChange("expense_account_id", e.value)}
              optionLabel="name"
              optionValue="value"
              placeholder="Select Expense Account"
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="cash_account_id">
              Cash Account<span className="text-red-500">*</span>
            </label>
            <Dropdown
              id="cash_account_id"
              name="cash_account_id"
              value={expenseForm.cash_account_id}
              options={cashAccounts}
              onChange={(e) => handleDropdownChange("cash_account_id", e.value)}
              optionLabel="name"
              optionValue="value"
              placeholder="Select Cash Account"
              required
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyExpenseModal;