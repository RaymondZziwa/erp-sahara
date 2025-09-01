import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { toast } from "react-toastify";
import axios from "axios";
import useSuppliers from "../../hooks/inventory/useSuppliers";
import useAuth from "../../hooks/useAuth";
import { baseURL } from "../../utils/api";
import { SUPPLIER_LOAN_ENDPOINTS } from "../../api/supplierLoanEndpoints";
import { InputNumber } from "primereact/inputnumber";


interface AddOrModifySupplierLoanRequestProps {
  visible: boolean;
  onClose: () => void;
  loanRequest?: Partial<SupplierLoanRequestPayload>;
  onSave: () => void;
}

export interface SupplierLoanRequestPayload {
  supplier_id: string;
  requested_amount: number;
  interest_rate: number;
  installments: number;
  purpose: string;
  requested_at: string;
  expected_repayment_date: string;
}

const AddOrModifySupplierLoanRequest: React.FC<AddOrModifySupplierLoanRequestProps> = ({
  visible,
  onClose,
  loanRequest,
  onSave,
}) => {
  const { token } = useAuth();
  const { data: suppliers, loading: loadingSuppliers } = useSuppliers();

  const initialState: SupplierLoanRequestPayload = {
    supplier_id: "",
    requested_amount: 0,
    interest_rate: 0,
    installments: 1,
    purpose: "",
    requested_at: new Date().toISOString().split("T")[0],
    expected_repayment_date: new Date().toISOString().split("T")[0],
  };

  const [formState, setFormState] = useState<SupplierLoanRequestPayload>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (loanRequest) {
      setFormState({
        supplier_id: loanRequest.supplier_id || "",
        requested_amount: loanRequest.requested_amount || 0,
        interest_rate: loanRequest.interest_rate || 0,
        installments: loanRequest.installments || 1,
        purpose: loanRequest.purpose || "",
        requested_at: loanRequest.requested_at || new Date().toISOString().split("T")[0],
        expected_repayment_date:
          loanRequest.expected_repayment_date || new Date().toISOString().split("T")[0],
      });
    } else {
      setFormState(initialState);
    }
  }, [loanRequest]);

  const handleInputChange = (e: any) => {
    if (e.value !== undefined) {
      const { name } = e.originalEvent?.target || {};
      setFormState({ ...formState, [name]: e.value });
    } else {
      const { name, value } = e.target;
      setFormState({ ...formState, [name]: value });
    }
  };
  

  const handleDropdownChange = (e: DropdownChangeEvent, field: keyof SupplierLoanRequestPayload) => {
    setFormState((prev) => ({
      ...prev,
      [field]: e.value,
    }));
  };

  const handleDateChange = (value: Date | null, field: keyof SupplierLoanRequestPayload) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value ? value.toISOString().split("T")[0] : "",
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    if(!formState.supplier_id || !formState.requested_amount || !formState.interest_rate || !formState.installments || !formState.purpose || !formState.requested_at || !formState.expected_repayment_date) {
      toast.error("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      const method = loanRequest ? "PUT" : "POST";
      const endpoint = !loanRequest
        ? SUPPLIER_LOAN_ENDPOINTS.SUPPLIER_LOANS.ADD
        : SUPPLIER_LOAN_ENDPOINTS.SUPPLIER_LOANS.UPDATE(loanRequest?.id);

      const payload = {
        ...formState,
        requested_at: new Date(formState.requested_at).toISOString(),
        expected_repayment_date: new Date(formState.expected_repayment_date).toISOString(),
      }
      //console.log("Saving supplier loan request:", payload);
      await axios({
        url: baseURL + endpoint,
        method,
        data: payload,
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Supplier Loan Request saved successfully!");
      setFormState(initialState);
      onSave();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      header={loanRequest ? "Edit Supplier Loan Request" : "Add Supplier Loan Request"}
      visible={visible}
      onHide={onClose}
      modal
      style={{ width: "450px" }}
      footer={
        <div className="flex justify-end space-x-2">
          <Button
            label="Cancel"
            icon="pi pi-times"
            onClick={onClose}
            className="p-button-text !bg-red-500"
            disabled={isSubmitting}
          />
          <Button
            label={loanRequest ? "Update" : "Save"}
            icon="pi pi-check"
            onClick={() =>
              document
                .getElementById("supplier-loan-request-form")
                ?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
            }
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </div>
      }
    >
      <form
        id="supplier-loan-request-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 gap-4"
      >
        <p>Fields marked with<span className="text-red-500">*</span> are mandatory</p>
        {/* Supplier */}
        <div className="p-field">
          <label htmlFor="supplier_id">Supplier<span className="text-red-500">*</span></label>
          <Dropdown
            id="supplier_id"
            value={formState.supplier_id}
            options={suppliers?.map((s) => ({ label: s.name, value: s.id })) || []}
            onChange={(e) => handleDropdownChange(e, "supplier_id")}
            placeholder="Select Supplier"
            disabled={loadingSuppliers}
            filter
            required
          />
        </div>
        {/* Requested Amount */}
          <div className="p-field">
            <label htmlFor="requested_amount">
              Requested Amount<span className="text-red-500">*</span>
            </label>
            <InputNumber
              id="requested_amount"
              name="requested_amount"
              value={formState.requested_amount}
              onValueChange={(e) =>
                setFormState({ ...formState, requested_amount: e.value })
              }
              required
            />
          </div>

          {/* Interest Rate */}
          <div className="p-field">
            <label htmlFor="interest_rate">
              Interest Rate (%)<span className="text-red-500">*</span>
            </label>
            <InputNumber
              id="interest_rate"
              name="interest_rate"
              max={100}
              min={1}
              value={formState.interest_rate}
              onValueChange={(e) =>
                setFormState({ ...formState, interest_rate: e.value })
              }
              required
            />
          </div>

          {/* Installments */}
          <div className="p-field">
            <label htmlFor="installments">
              Installments<span className="text-red-500">*</span>
            </label>
            <InputNumber
              id="installments"
              name="installments"
              min={1}
              max={90}
              value={formState.installments}
              onValueChange={(e) =>
                setFormState({ ...formState, installments: e.value })
              }
              required
            />
          </div>


        {/* Purpose */}
        <div className="p-field">
          <label htmlFor="purpose">Purpose<span className="text-red-500">*</span></label>
          <InputTextarea
            id="purpose"
            name="purpose"
            value={formState.purpose}
            onChange={handleInputChange}
            rows={3}
            required
          />
        </div>

        {/* Requested At */}
        <div className="p-field">
          <label htmlFor="requested_at">Requested At<span className="text-red-500">*</span></label>
          <Calendar
            id="requested_at"
            value={formState.requested_at ? new Date(formState.requested_at) : null}
            onChange={(e) => handleDateChange(e.value as Date, "requested_at")}
            dateFormat="yy-mm-dd"
            showIcon
            required
          />
        </div>

        {/* Expected Repayment Date */}
        <div className="p-field">
          <label htmlFor="expected_repayment_date">Expected Repayment Date<span className="text-red-500">*</span></label>
          <Calendar
            id="expected_repayment_date"
            value={formState.expected_repayment_date ? new Date(formState.expected_repayment_date) : null}
            onChange={(e) => handleDateChange(e.value as Date, "expected_repayment_date")}
            dateFormat="yy-mm-dd"
            showIcon
            required
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifySupplierLoanRequest;
