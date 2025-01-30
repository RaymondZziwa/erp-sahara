import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";

import { createMossAppRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { MOSS_APP_ENDPOINTS } from "../../../api/mossAppEndpoints";
import { Reminder } from "../../../redux/slices/types/mossApp/Reminders";
import useUsers from "../../../hooks/mossApp/useUsers";
import { User } from "../../../redux/slices/types/mossApp/Users";
import useDrugs from "../../../hooks/mossApp/useDrugs";
interface AddReminder {
  drug_name: string;
  drug_id: number;
  frequency: string;
  form: string; // formatted as "YYYY-MM-DD"
  prescription: string;
  period: string;
  time: string;
  user_id: number;
  utc_time: string;
  status: string;
}

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Partial<Reminder>;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const initialState: Partial<AddReminder> = {
    drug_name: "",
    frequency: "",
    prescription: "",
    form: "",
    period: "",
    time: "",
    status: "Draft",
  };

  const [formState, setFormState] = useState<Partial<Reminder>>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();
  const { data: users } = useUsers();
  const { data: drugs } = useDrugs();

  useEffect(() => {
    if (item) {
      setFormState({ ...item });
    } else {
      setFormState(initialState);
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLInputElement
    >
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (
      !formState.drug_name ||
      !formState.drug_id ||
      !formState.frequency ||
      !formState.form ||
      !formState.form ||
      !formState.period ||
      !formState.time ||
      !formState.user_id ||
      !formState.status
    ) {
      setIsSubmitting(false);
      return;
    }
    const method = formState.id ? "PUT" : "POST";
    const endpoint = formState.id
      ? MOSS_APP_ENDPOINTS.REMINDERS.UPDATE(formState.id.toString())
      : MOSS_APP_ENDPOINTS.REMINDERS.ADD;
    const body: AddReminder = {
      drug_name: formState.drug_name,
      drug_id: formState.drug_id,
      frequency: formState.frequency,
      form: formState.form, // formatted as "YYYY-MM-DD"
      prescription: formState.prescription ?? "",
      period: formState.period,
      time: formState.time,
      user_id: formState.user_id,
      utc_time: formState.time,
      status: formState.status,
    };

    await createMossAppRequest(
      endpoint,
      token.access_token,
      body,
      onSave,
      method
    );
    setIsSubmitting(false);
    onSave();
    onClose();
  };

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text !bg-red-500 hover:bg-red-400"
        size="small"
        disabled={isSubmitting}
      />
      <Button
        loading={isSubmitting}
        disabled={isSubmitting}
        label={formState.id ? "Update" : "Add"}
        icon="pi pi-check"
        type="submit"
        form="item-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={formState.id ? "Edit Reminder" : "Add Reminder"}
      visible={visible}
      style={{ width: "720px" }}
      footer={footer}
      onHide={onClose}
      className="max-w-md md:max-w-none"
    >
      <form id="item-form" onSubmit={handleSave} className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-field">
            <label htmlFor="status">Drug</label>
            <Dropdown
              id="drug_id"
              name="drug_id"
              value={formState.drug_id}
              options={drugs.map((drug) => ({ label: drug.name, id: drug.id }))}
              onChange={(e) => {
                const drug = drugs.find((drug) => drug.id == e.value.id);

                setFormState({
                  ...formState,
                  drug_name: drug?.name,
                  drug_id: e.value,
                });
              }}
              className="w-full"
              filter
            />
          </div>
          <div className="p-field">
            <label htmlFor="drug_name">Drug Name</label>
            <InputText
              id="drug_name"
              name="drug_name"
              value={formState.drug_name}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>

          <div className="p-field">
            <label htmlFor="frequency">Frequency</label>
            <InputText
              id="frequency"
              name="frequency"
              value={formState.frequency}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>

          <div className="p-field">
            <label htmlFor="prescription">Prescription Date</label>
            <Calendar
              id="prescription"
              name="prescription"
              value={new Date(formState.prescription ?? new Date())}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  prescription: e.value as unknown as string,
                })
              }
              required
              className="w-full"
            />
          </div>

          <div className="p-field">
            <label htmlFor="from">From</label>
            <Calendar
              id="from"
              name="from"
              value={new Date(formState.form ?? new Date())}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  form: e.value as unknown as string,
                })
              }
              required
              className="w-full"
            />
          </div>
          <div className="p-field">
            <label htmlFor="period">Period</label>
            <Calendar
              id="period"
              name="period"
              value={new Date(formState.period ?? new Date())}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  period: e.value as unknown as string,
                })
              }
              required
              className="w-full"
            />
          </div>

          <div className="p-field">
            <label htmlFor="time">Time</label>
            <Calendar
              id="time"
              name="time"
              timeOnly
              value={new Date(formState.time ? formState.time : new Date())}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  time: e.value as unknown as string,
                })
              }
              required
              className="w-full"
            />
          </div>

          <div className="p-field">
            <label htmlFor="status">Status</label>
            <Dropdown
              id="status"
              name="status"
              value={formState.status}
              options={["Draft", "Completed"]}
              onChange={(e) => setFormState({ ...formState, status: e.value })}
              className="w-full"
            />
          </div>
          <div className="p-field">
            <label htmlFor="user_id">Patient</label>

            <Dropdown
              required
              filter
              placeholder="Select a user"
              id="user_id"
              name="user_id"
              value={formState.user_id}
              options={users}
              onChange={(e) => setFormState({ ...formState, user_id: e.value })}
              className="w-full"
              optionLabel="display_name"
              optionValue="id"
              itemTemplate={(user: User) => (
                <div className="flex align-items-center">
                  <div>{`${user.first_name} ${user.last_name}`}</div>
                </div>
              )}
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
