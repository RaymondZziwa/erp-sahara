import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar"; // Import Calendar component for date and time selection

import { createMossAppRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";

import { MOSS_APP_ENDPOINTS } from "../../../api/mossAppEndpoints";
import { Appointment } from "../../../redux/slices/types/mossApp/Appointments";
import useFacilities from "../../../hooks/mossApp/useFacilities";
import useAppointmentTypes from "../../../hooks/mossApp/useAppointmentTypes";
import useUsers from "../../../hooks/mossApp/useUsers";
interface AddAppontment {
  facility_id: number; // e.g., ["required"]
  appointment_date: Date | null; // "required"
  appointment_type_id: number; // "required"
  status: string; // ["required", { in: ["status1", "status2"] }]
  description: string; // "required"
  patient_id: string; // "required"
  appointment_time: Date | null; // "required"
}
interface AddOrModifyAppointmentProps {
  visible: boolean;
  onClose: () => void;
  item?: Appointment;
  onSave: () => void;
}

const statuses = [
  { label: "Scheduled", value: "scheduled" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const AddOrModifyItem: React.FC<AddOrModifyAppointmentProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<AddAppontment>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();
  const { data: facilities, loading: facilitiesLoading } = useFacilities();
  const { data: appointmentTypes, loading: appointmentTypesLoading } =
    useAppointmentTypes();
  const { data: users, loading: usersLoading } = useUsers();
  useEffect(() => {
    if (item) {
      setFormState({
        facility_id: item.facility_id,
        appointment_date: item.appointment_date
          ? new Date(item.appointment_date)
          : null,
        appointment_type_id: item.appointment_type_id,
        status: item.status || "scheduled",
        description: item.description || "",

        appointment_time: item.appointment_time
          ? new Date(`1970-01-01T${item.appointment_time}`)
          : null,
        patient_id: "",
      });
    } else {
      setFormState({});
    }
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDropdownChange = (
    e: { value: number | string | null },
    name: keyof AddAppontment
  ) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: e.value,
    }));
  };

  const handleDateChange = (e: any) => {
    setFormState((prevState) => ({
      ...prevState,
      appointment_date: e.value,
    }));
  };

  const handleTimeChange = (e: any) => {
    setFormState((prevState) => ({
      ...prevState,
      appointment_time: e.value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Basic validation
    if (
      formState.facility_id === null ||
      formState.appointment_date === null ||
      formState.appointment_type_id === null
    ) {
      return; // Handle validation error here
    }
    const data = {
      ...formState,
      appointment_date: formState.appointment_date?.toISOString().split("T")[0],
      appointment_time: formState.appointment_time?.toISOString().split("T")[1],
    };
    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? MOSS_APP_ENDPOINTS.APPOINTMENTS.UPDATE(item.id.toString())
      : MOSS_APP_ENDPOINTS.APPOINTMENTS.ADD;
    await createMossAppRequest(
      endpoint,
      token.access_token,
      data,
      onSave,
      method
    );
    setIsSubmitting(false);
    onSave();
    onClose(); // Close the modal after saving
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
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="appointment-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Appointment" : "Add Appointment"}
      visible={visible}
      style={{ width: "720px" }}
      footer={footer}
      onHide={onClose}
    >
      <form
        id="appointment-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <div className="p-field">
          <label htmlFor="facility_id">Facility</label>
          <Dropdown
            id="facility_id"
            name="facility_id"
            value={formState.facility_id}
            options={facilities.map((facility) => ({
              label: facility.name,
              id: facility.id,
            }))}
            onChange={(e) => handleDropdownChange(e, "facility_id")}
            placeholder="Select Facility"
            className="w-full"
            loading={facilitiesLoading}
          />
        </div>
        <div className="p-field">
          <label htmlFor="appointment_date">Appointment Date</label>
          <Calendar
            id="appointment_date"
            name="appointment_date"
            value={formState.appointment_date}
            onChange={handleDateChange}
            dateFormat="dd/mm/yy"
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="appointment_type_id">Appointment Type</label>
          <Dropdown
            id="appointment_type_id"
            name="appointment_type_id"
            value={formState.appointment_type_id}
            options={appointmentTypes.map((type) => ({
              label: type.name,
              id: type.id,
            }))}
            onChange={(e) => handleDropdownChange(e, "appointment_type_id")}
            placeholder="Select Appointment Type"
            className="w-full"
            loading={appointmentTypesLoading}
          />
        </div>
        <div className="p-field">
          <label htmlFor="patient_id">Patient</label>
          <Dropdown
            filter
            id="patient_id"
            name="patient_id"
            value={formState.patient_id}
            options={users.map((user) => ({
              label: user.first_name + " " + user.last_name,
              id: user.id,
            }))}
            onChange={(e) => handleDropdownChange(e, "patient_id")}
            placeholder="Select patient"
            className="w-full"
            loading={usersLoading}
          />
        </div>
        <div className="p-field">
          <label htmlFor="status">Status</label>
          <Dropdown
            id="status"
            name="status"
            value={formState.status}
            options={statuses}
            onChange={(e) => handleDropdownChange(e, "status")}
            placeholder="Select Status"
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="description">Description</label>
          <InputText
            id="description"
            name="description"
            value={formState.description}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="p-field">
          <label htmlFor="appointment_time">Appointment Time</label>
          <Calendar
            id="appointment_time"
            name="appointment_time"
            value={formState.appointment_time}
            onChange={handleTimeChange}
            timeOnly
            showTime
            hourFormat="24"
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
