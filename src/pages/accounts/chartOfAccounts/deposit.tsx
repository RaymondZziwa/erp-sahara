import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { baseURL } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";

import { InputTextarea } from "primereact/inputtextarea";
import { ChartofAccount } from "../../../redux/slices/types/accounts/ChartOfAccounts";
import { toast } from "react-toastify";
import axios from "axios";
import { Dropdown } from "primereact/dropdown";
import useCurrencies from "../../../hooks/procurement/useCurrencies";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: ChartofAccount;
  onSave: () => void;
}

const DepositBalance: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState({
    description: "",
    currency_id: 2,
    transaction_date: "",
    opening_balance: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();
  const { data: currencies } = useCurrencies();
  //   useEffect(() => {
  //     if (item) {
  //       setFormState({
  //         currency_id: 2,
  //       });
  //     }
  //   }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      setIsSubmitting(true);

      // Basic validation
      if (!formState.opening_balance || !formState.transaction_date) {
        setIsSubmitting(false);
        toast.warn("Please fill in all required fields");
        return; // Handle validation error here
      }

      // Prepare the payload
      const payload = {
        ...formState,
        opening_balance: parseInt(formState.opening_balance), // Convert to integer
      };

      // Send the request
      const res = await axios.post(
        `${baseURL}/accounts/chartofaccounts/${item?.id}/addopeningbalance`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`, // Include the token in the headers
          },
        }
      );

      if (res.data.success) {
        setIsSubmitting(false);
        toast.success("Opening balance saved successfully!");
        onSave(); // Call the onSave callback
       // setFormState({}); // Reset the form state
        onClose(); // Close the modal after saving
      } else {
        toast.error(res.data.message);
        setIsSubmitting(false);
      }
    } catch (error) {
      // Handle errors
      setIsSubmitting(false);
      console.error("Error saving opening balance:", error);
      toast.error("An error occurred while saving the opening balance.");
    }
  };

  const footer = (
    <div className="flex justify-end space-x-2 border-t py-2">
      <Button
        disabled={isSubmitting}
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-400"
        size="small"
        severity="danger"
      />
      <Button
        loading={isSubmitting}
        disabled={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="truck-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Record Opening Balance" : "Add Account"}
      visible={visible}
      footer={footer}
      className="max-w-3xl md:min-w-[768px]"
      onHide={onClose}
    >
      <form
        id="truck-form"
        onSubmit={handleSave}
        className="p-fluid grid md:grid-cols-2 gap-4"
      >
        <div className="p-field">
          <label htmlFor="opening_balance">
            Opening Balance<span className="text-red-500">*</span>
          </label>
          <InputText
            id="opening_balance"
            name="opening_balance"
            type="number"
            value={formState.opening_balance}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="transaction_date">
            As of<span className="text-red-500">*</span>
          </label>
          <InputText
            id="transaction_date"
            name="transaction_date"
            type="date"
            value={formState.transaction_date}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="currency_id">Currency</label>
          <Dropdown
            id="currency_id"
            name="currency_id"
            value={formState.currency_id}
            options={currencies.map((curr) => ({
              label: curr.code,
              value: curr.id,
            }))}
            onChange={(e) =>
              setFormState({ ...formState, currency_id: e.value })
            }
            className="w-full"
            placeholder="Select Currency"
          />
        </div>
        <div className="p-field col-span-full">
          <label htmlFor="description">Narrative</label>
          <InputTextarea
            id="description"
            name="description"
            value={formState.description}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default DepositBalance;
