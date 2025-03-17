import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { ProgressSpinner } from "primereact/progressspinner";
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

interface PaymentForm {
  amount: number;
  narrative: string;
  transaction_date: string;
  fund_source_account_id: number | null;
}

interface Account {
  value: number;
  name: string;
}

interface AddOrModifyPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  assetId: number;
  onSave: () => void;
}

const AddOrModifyPaymentModal: React.FC<AddOrModifyPaymentModalProps> = ({
  visible,
  onClose,
  assetId,
  onSave,
}) => {
  const { token } = useAuth();
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    amount: 0,
    narrative: "",
    transaction_date: "",
    fund_source_account_id: null,
  });

  const [fundSourceAccounts, setFundSourceAccounts] = useState<Account[]>([]);
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

  // Fetch fund source accounts
  const fetchFundSourceAccounts = async () => {
    try {
      const response = await api.get("/erp/accounts/get-receivable-accounts");
      const fundSourceData = response.data?.data || [];
      setFundSourceAccounts(
        fundSourceData.map((acc: any) => ({
          value: acc.id,
          name: acc.name,
        }))
      );
    } catch (error) {
      console.error("Error fetching fund source accounts:", error);
      setError("Failed to load fund source accounts.");
    }
  };

  // Initialize data fetching
  useEffect(() => {
    if (token?.access_token) {
      fetchFundSourceAccounts()
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
    setPaymentForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle dropdown changes
  const handleDropdownChange = (name: keyof PaymentForm, value: any) => {
    setPaymentForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate mandatory fields
    if (
      !paymentForm.amount ||
      !paymentForm.transaction_date ||
      !paymentForm.fund_source_account_id
    ) {
      toast.warn("Please fill in all mandatory fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      await api.post(
        ASSETSENDPOINTS.ASSETS.PAYMENTS.CREATE(assetId.toString()),
        paymentForm
      );
      toast.success("Payment added successfully.");
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving payment:", error);
      toast.error("Failed to add payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <ProgressSpinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        {error}
        <Button
          label="Retry"
          className="p-button-text ml-2"
          onClick={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <Dialog
      header="Add Payment"
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
            onClick={handleSavePayment}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </div>
      }
    >
      <form onSubmit={handleSavePayment}>
        <div className="p-fluid grid grid-cols-1 gap-4">
          <div className="p-field">
            <label htmlFor="amount">
              Amount<span className="text-red-500">*</span>
            </label>
            <InputText
              id="amount"
              name="amount"
              type="number"
              value={paymentForm.amount.toString()}
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
              value={new Date(paymentForm.transaction_date)}
              onChange={(e) =>
                setPaymentForm({
                  ...paymentForm,
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
              value={paymentForm.narrative}
              onChange={handleInputChange}
            />
          </div>
          <div className="p-field">
            <label htmlFor="fund_source_account_id">
              Fund Source Account<span className="text-red-500">*</span>
            </label>
            <Dropdown
              id="fund_source_account_id"
              name="fund_source_account_id"
              value={paymentForm.fund_source_account_id}
              options={fundSourceAccounts}
              onChange={(e) => handleDropdownChange("fund_source_account_id", e.value)}
              optionLabel="name"
              optionValue="value"
              placeholder="Select Fund Source Account"
              required
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyPaymentModal;