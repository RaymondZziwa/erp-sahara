import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { toast } from "react-toastify";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";
import { baseURL } from "../../../utils/api";
import { ASSETSENDPOINTS } from "../../../api/assetEndpoints";
// Centralized API configuration
const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

interface IncomeForm {
  name: string;
  description: string;
  income_account_id: number | null;
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

const AddOrModifyItem: React.FC<AddOrModifyIncomeModalProps> = ({
  visible,
  onClose,
  assetId,
  onSave,
}) => {
  const { token } = useAuth();
  const [incomeForm, setIncomeForm] = useState<IncomeForm>({
    name: "",
    income_account_id: null,
    description: ""
  });

  const [incomeAccounts, setIncomeAccounts] = useState<Account[]>([]);
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

  // Initialize data fetching
  useEffect(() => {
    if (token?.access_token) {
      Promise.all([fetchIncomeAccounts()])
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
      !incomeForm.name ||
      !incomeForm.income_account_id 
    ) {
      toast.warn("Please fill in all mandatory fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post(`${baseURL}/${ ASSETSENDPOINTS.INCOME_TYPES.ADD}`, {
        incomeForm,
        headers: {
             "Content-Type": "application/json",
             "Authorization": `Bearer ${token.access_token}`
        },
      })
      toast.success("Income Type added successfully.");
      onSave(); // Refresh the parent component
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error saving income:", error);
      toast.error("Failed to add income type.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Dialog
      header="Add Income Type"
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
            <label htmlFor="name">
              Name<span className="text-red-500">*</span>
            </label>
            <InputText
              id="name"
              name="name"
              value={incomeForm.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="income_account_id">
              Income Account<span className="text-red-500">*</span>
            </label>
            <Dropdown
              id="income_account_id"
              name="income_account_id"
              value={incomeForm.income_account_id}
              options={incomeAccounts}
              onChange={(e) =>
                handleDropdownChange("income_account_id", e.value)
              }
              optionLabel="name"
              optionValue="value"
              placeholder="Select Income Account"
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="description">Description</label>
            <InputTextarea
              id="description"
              name="description"
              value={incomeForm.description}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
