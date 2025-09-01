import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import usePaymentMethods from "../../../../hooks/procurement/usePaymentMethods";
import useAssetsAccounts from "../../../../hooks/accounts/useAssetsAccounts";
import { toast } from "react-toastify";
import { apiRequest } from "../../../../utils/api";
import { ACCOUNTS_ENDPOINTS } from "../../../../api/accountsEndpoints";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";

const DisburseModal = ({ visible, onHide, requisition, onSubmit }) => {
  const { data:paymentMethods } = usePaymentMethods();
    const { expenseAccounts: accounts } = useAssetsAccounts();
    const token = useSelector((state: RootState) => state.userAuth.token)

    useEffect(() => {
        console.log(requisition)
    }, [requisition])
      

  const [formData, setFormData] = useState({
    payment_method_id: null,
    chart_of_account_id: null,
    transaction_date: new Date(),
    notes: "",
  });

  const handleSubmit = async() => {
    const payload = {
      ...formData,
      transaction_date: formData.transaction_date
        ? formData.transaction_date.toISOString().split("T")[0]
        : null,
    };
    try {
        await apiRequest(ACCOUNTS_ENDPOINTS.STORE_REQUISITIONS.DISBURSE(requisition?.id), "POST", token.access_token, payload);
        toast.success("Requisition has been successfully disbursed")
    } catch (error) {
        toast.error(error?.response?.data?.message)
    }
    onSubmit(payload);
    onHide();
  };

  return (
    <Dialog
      header={`Disburse Requisition - ${requisition?.requisition_no || ""}`}
      visible={visible}
      style={{ width: "40vw" }}
      modal
      onHide={onHide}
    >
      <div className="flex flex-col gap-3">
        <Dropdown
          value={formData.payment_method_id}
          options={paymentMethods.map(pm => ({ label: pm.name, value: pm.id }))}
          onChange={(e) =>
            setFormData({ ...formData, payment_method_id: e.value })
          }
          placeholder="Select Payment Method"
          className="w-full"
        />

        <Dropdown
          value={formData.chart_of_account_id}
          options={accounts.map(acc => ({ label: acc.name, value: acc.id }))}
          onChange={(e) =>
            setFormData({ ...formData, chart_of_account_id: e.value })
          }
          placeholder="Select Expense Account"
          className="w-full"
        />

        <Calendar
          value={formData.transaction_date}
          onChange={(e) =>
            setFormData({ ...formData, transaction_date: e.value })
          }
          showIcon
          placeholder="Transaction Date"
          className="w-full"
        />

        <InputTextarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          placeholder="Notes"
          className="w-full"
        />

        <Button
          label="Disburse"
          icon="pi pi-check"
          className="p-button-success"
          onClick={handleSubmit}
        />
      </div>
    </Dialog>
  );
};

export default DisburseModal;
