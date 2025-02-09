import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { createRequest } from "../../../../utils/api";
import useAuth from "../../../../hooks/useAuth";
import { PaymentMethod } from "../../../../redux/slices/types/procurement/Currency";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import useLedgerChartOfAccounts from "../../../../hooks/accounts/useLedgerChartOfAccounts";
import { AccountType } from "../../../../redux/slices/types/accounts/accountTypes";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: PaymentMethod;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<PaymentMethod>>({
    name: "",
    chart_of_account_id: 0,
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: chartOfAccounts, loading: chartOfAccountsLoading } =
    useLedgerChartOfAccounts({ accountType: AccountType.EXPENSES });

  const { token } = useAuth();
  useEffect(() => {
    if (item) {
      setFormState({
        name: item.name || "",
      });
    } else {
      setFormState({ name: "", chart_of_account_id: 0, description: "" });
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
    setIsSubmitting(true);
    e.preventDefault();
    // Basic validation
    if (!formState.name) {
      return; // You can handle validation error here
    }
    const data = { name: formState.name, chart_of_account_id: formState.chart_of_account_id, descripton: formState.description };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? `/erp/accounts/paymentmethod/${item.id}/update`
      : "/erp/accounts/paymentmethod/create";
    await createRequest(endpoint, token.access_token, data, onSave, method);
    setIsSubmitting(false);
    onSave();
    onClose(); // Close the modal after saving
  };

  const footer = (
    <div className="flex gap-2 justify-end ">
      <Button
        size="small"
        disabled={isSubmitting}
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500"
      />
      <Button
        size="small"
        disabled={isSubmitting}
        loading={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="item-form"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Currency" : "Add Currency"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="item-form" onSubmit={handleSave}>
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="name">Name</label>
            <InputText
              id="name"
              name="name"
              value={formState.name}
              onChange={handleInputChange}
              required
            />
          </div>
           <div className="p-field">
              <label htmlFor="item_category_id">Chart of Account</label>
                <div className="card flex justify-content-center">
                  <Dropdown
                    loading={chartOfAccountsLoading}
                    required
                    value={formState.chart_of_account_id}
                    onChange={(e: DropdownChangeEvent) => {
                      setFormState({ ...formState, chart_of_account_id: e.value });
                  }}
                    options={chartOfAccounts.map((acc) => ({
                      label: acc.name,
                      value: acc.id,
                    }))}
                    placeholder="Select Chart Of Account"
                    filter
                    className="w-full md:w-14rem"
                  />
                </div>
             </div>
             <div className="p-field">
            <label htmlFor="name">Description</label>
            <InputText
              id="name"
              name="description"
              value={formState.description}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
