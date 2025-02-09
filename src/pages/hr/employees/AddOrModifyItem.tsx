import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { HUMAN_RESOURCE_ENDPOINTS } from "../../../api/hrEndpoints";
import { Employee } from "../../../redux/slices/types/hr/Employee";
import useEmployees from "../../../hooks/hr/useEmployees";
import useDepartments from "../../../hooks/hr/useDepartments";
import useDesignations from "../../../hooks/hr/useDesignations";
import useSalaryStructures from "../../../hooks/hr/useSalaryStructures";

interface AddOrModifyEmployeeProps {
  visible: boolean;
  onClose: () => void;
  item?: Employee;
  onSave: () => void;
}

interface NewEmployee {
  department_id: number;
  salary_structure_id: number;
  designation_id: number;
  employee_code?: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  phone: string;
  gender: string;
  marital_status: string;
  date_of_birth: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  hire_date: string;
  supervisor_id?: number;
}

const GENDER_OPTIONS = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
];

const MARITAL_STATUS_OPTIONS = [
  { label: "Single", value: "Single" },
  { label: "Married", value: "Married" },
  { label: "Divorced", value: "Divorced" },
  { label: "Widowed", value: "Widowed" },
];

const AddOrModifyEmployee: React.FC<AddOrModifyEmployeeProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<NewEmployee>({
    department_id: 0,
    salary_structure_id: 0,
    designation_id: 0,
    employee_code: "",
    first_name: "",
    last_name: "",
    middle_name: "",
    email: "",
    phone: "",
    gender: "",
    marital_status: "",
    date_of_birth: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    hire_date: "",
    supervisor_id: undefined,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();
  const { data: employees, loading: employeesLoading } = useEmployees();
  const { data: departments, loading: departmentsLoading } = useDepartments();
  const { data: designations, loading: designationsLoading } =
    useDesignations();
  const { data: salaryStructures, loading: salaryStructuresLoading } =
    useSalaryStructures();

  useEffect(() => {
    if (item) {
      setFormState({
        ...formState,
        ...item,
        supervisor_id: undefined,
      });
    } else {
      setFormState(() => ({
        department_id: 0,
        salary_structure_id: 0,
        designation_id: 0,
        employee_code: "",
        first_name: "",
        last_name: "",
        middle_name: "",
        email: "",
        phone: "",
        gender: "",
        marital_status: "",
        date_of_birth: "",
        address: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
        hire_date: "",
        supervisor_id: undefined,
      }));
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDropdownChange = (e: DropdownChangeEvent) => {
    const { name } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: e.value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formState.first_name || !formState.last_name || !formState.email) {
      setIsSubmitting(false);
      return; // Basic validation
    }

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? HUMAN_RESOURCE_ENDPOINTS.EMPLOYEES.UPDATE(item.id.toString())
      : HUMAN_RESOURCE_ENDPOINTS.EMPLOYEES.ADD;

    try {
      await createRequest(
        endpoint,
        token.access_token,
        formState,
        onSave,
        method
      );
      onSave();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
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
        form="employee-form"
        size="small"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Employee" : "Add Employee"}
      visible={visible}
      className="max-w-lg md:max-w-3xl"
      footer={footer}
      onHide={onClose}
    >
      <form
        id="employee-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="p-field">
          <label htmlFor="employee_code">Employee Code(Optional)</label>
          <InputText
            id="employee_code"
            name="employee_code"
            value={formState.employee_code}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="first_name">First Name</label>
          <InputText
            id="first_name"
            name="first_name"
            value={formState.first_name}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="last_name">Last Name</label>
          <InputText
            id="last_name"
            name="last_name"
            value={formState.last_name}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="middle_name">Middle Name</label>
          <InputText
            id="middle_name"
            name="middle_name"
            value={formState.middle_name}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="email">Email</label>
          <InputText
            id="email"
            name="email"
            value={formState.email}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="phone">Phone</label>
          <InputText
            id="phone"
            name="phone"
            value={formState.phone}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="gender">Gender</label>
          <Dropdown
            id="gender"
            name="gender"
            value={formState.gender}
            options={GENDER_OPTIONS}
            onChange={handleDropdownChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="marital_status">Marital Status</label>
          <Dropdown
            id="marital_status"
            name="marital_status"
            value={formState.marital_status}
            options={MARITAL_STATUS_OPTIONS}
            onChange={handleDropdownChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="date_of_birth">Date of Birth</label>
          <InputText
            type="date"
            id="date_of_birth"
            name="date_of_birth"
            value={formState.date_of_birth}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="address">Address</label>
          <InputTextarea
            id="address"
            name="address"
            value={formState.address}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="city">City</label>
          <InputText
            id="city"
            name="city"
            value={formState.city}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="state">State</label>
          <InputText
            id="state"
            name="state"
            value={formState.state}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="postal_code">Postal Code</label>
          <InputText
            id="postal_code"
            name="postal_code"
            value={formState.postal_code}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="country">Country</label>
          <InputText
            id="country"
            name="country"
            value={formState.country}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="hire_date">Hire Date</label>
          <InputText
            type="date"
            id="hire_date"
            name="hire_date"
            value={formState.hire_date}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="supervisor_id">Supervisor (Optional)</label>
          <Dropdown
            showClear
            loading={employeesLoading}
            filter
            placeholder="Select supervisor"
            id="supervisor_id"
            name="supervisor_id"
            value={formState.supervisor_id}
            options={employees.map((employee) => ({
              value: employee.id,
              label: employee.first_name + " " + employee.last_name,
            }))}
            onChange={handleDropdownChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="supervisor_id">Department</label>
          <Dropdown
            showClear
            loading={departmentsLoading}
            filter
            placeholder="Select department"
            id="department_id"
            name="department_id"
            value={formState.department_id}
            options={departments.map((department) => ({
              value: department.id,
              label: department.name,
            }))}
            onChange={handleDropdownChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="designation_id">Designantion</label>
          <Dropdown
            showClear
            loading={designationsLoading}
            filter
            placeholder="Select designation"
            id="designation_id"
            name="designation_id"
            value={formState.designation_id}
            options={designations.map((designation) => ({
              value: designation.id,
              label: designation.designation_name,
            }))}
            onChange={handleDropdownChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="salary_structure_id">Salary structure</label>
          <Dropdown
            showClear
            loading={salaryStructuresLoading}
            filter
            placeholder="Select salary structure"
            id="salary_structure_id"
            name="salary_structure_id"
            value={formState.salary_structure_id}
            options={salaryStructures.map((structure) => ({
              value: structure.id,
              label: structure.strucure_name,
            }))}
            onChange={handleDropdownChange}
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyEmployee;
