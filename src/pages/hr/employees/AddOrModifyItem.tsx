import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { HUMAN_RESOURCE_ENDPOINTS } from "../../../api/hrEndpoints";
import { Employee } from "../../../redux/slices/types/hr/Employee";
import useEmployees from "../../../hooks/hr/useEmployees";
import useDepartments from "../../../hooks/hr/useDepartments";
import useDesignations from "../../../hooks/hr/useDesignations";
import useSalaryStructures from "../../../hooks/hr/useSalaryStructures";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { toast } from "react-toastify";

interface AddOrModifyEmployeeProps {
  visible: boolean;
  onClose: () => void;
  item?: Employee;
  onSave: () => void;
}

interface NewEmployee {
  department_id: number;
  salary_structure_id: number;
  profile_picture: any;
  signature: any;
  designation_id: number;
  employee_code?: string;
  first_name: string;
  last_name: string;
  other_name?: string;
  email: string;
  phone: string;
  password: string,
  salutation: string,
  gender: string;
  marital_status: string;
  date_of_birth: string;
  address: string;
  state: string;
  postal_code: string;
  country: string;
  hire_date: string;
  role_id: string;
  supervisor_id?: number;
}

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

const SALUTATIONS_OPTIONS = [
  { label: "Mr", value: "Mr" },
  { label: "Mrs", value: "Mrs" },
];

const MARITAL_STATUS_OPTIONS = [
  { label: "Single", value: "single" },
  { label: "Married", value: "married" },
  { label: "Divorced", value: "divorced" },
  { label: "Widowed", value: "widowed" },
];

const AddOrModifyEmployee: React.FC<AddOrModifyEmployeeProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<NewEmployee>({
    department_id: 0,
    designation_id: 0,
    salary_structure_id: 0,
    employee_code: "",
    first_name: "",
    last_name: "",
    other_name: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    marital_status: "",
    date_of_birth: "",
    address: "",
    salutation: "",
    state: "",
    postal_code: "",
    country: "",
    hire_date: "",
    supervisor_id: undefined,
    profile_picture: "",
    signature: "",
    role_id: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();
  const { data: employees, loading: employeesLoading } = useEmployees();
  const { data: departments, loading: departmentsLoading } = useDepartments();
  const { data: designations, loading: designationsLoading } =
    useDesignations();
  const { data: salaryStructures, loading: salaryStructuresLoading } =
    useSalaryStructures();
  const roles = useSelector((state: RootState) => state.roles.data);

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
        designation_id: 0,
        salary_structure_id: 0,
        employee_code: "",
        first_name: "",
        last_name: "",
        other_name: "",
        email: "",
        password: "",
        phone: "",
        gender: "",
        marital_status: "",
        date_of_birth: "",
        address: "",
        salutation: "",
        state: "",
        postal_code: "",
        country: "",
        hire_date: "",
        supervisor_id: undefined,
        profile_picture: "",
        signature: "",
        role_id: ""
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormState(prevState => ({
        ...prevState,
        profile_picture: file
      }));
    }
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

    if (
      !formState.first_name || 
      !formState.last_name || 
      !formState.email || 
      !formState.country ||
      !formState.date_of_birth ||
      !formState.phone ||
      !formState.gender ||
      !formState.hire_date ||
      !formState.role_id ||
      !formState.department_id ||
      !formState.designation_id || 
      !formState.address || 
      !formState.salutation ||
      !formState.marital_status ||
      !formState.state
    ) {
      setIsSubmitting(false);
      toast.warn('Please fill in all mandatory fields')
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
       <p className="mb-6">
          Fields marked with a red asterik (<span className="text-red-500">*</span>) are mandatory.
       </p>
      <form
        id="employee-form"
        onSubmit={handleSave}
        className="p-fluid grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="p-field">
          <label htmlFor="employee_code">Employee Code</label>
          <InputText
            id="employee_code"
            name="employee_code"
            value={formState.employee_code}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="salutation">Salutation<span className="text-red-500">*</span></label>
          <Dropdown
            id="salutation"
            name="salutation"
            value={formState.salutation}
            options={SALUTATIONS_OPTIONS}
            onChange={handleDropdownChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="first_name">First Name<span className="text-red-500">*</span></label>
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
          <label htmlFor="last_name">Last Name<span className="text-red-500">*</span></label>
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
          <label htmlFor="other_name">Other Name</label>
          <InputText
            id="other_name"
            name="other_name"
            value={formState.other_name}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="email">Email<span className="text-red-500">*</span></label>
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
          <label htmlFor="phone">Phone<span className="text-red-500">*</span></label>
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
          <label htmlFor="gender">Gender<span className="text-red-500">*</span></label>
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
          <label htmlFor="marital_status">Marital Status<span className="text-red-500">*</span></label>
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
          <label htmlFor="date_of_birth">Date of Birth<span className="text-red-500">*</span></label>
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
          <label htmlFor="address">Address<span className="text-red-500">*</span></label>
          <InputText
            id="address"
            name="address"
            value={formState.address}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="state">State<span className="text-red-500">*</span></label>
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
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="country">Country<span className="text-red-500">*</span></label>
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
          <label htmlFor="hire_date">Hire Date<span className="text-red-500">*</span></label>
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
          <label htmlFor="supervisor_id">Supervisor</label>
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
          <label htmlFor="supervisor_id">Department<span className="text-red-500">*</span></label>
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
          <label htmlFor="designation_id">Designation<span className="text-red-500">*</span></label>
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
            options={salaryStructures.length > 0 ? salaryStructures?.map((structure) => ({
              value: structure.id,
              label: structure.structure_name,
            })) : []}            
            onChange={handleDropdownChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="salary_structure_id">Role<span className="text-red-500">*</span></label>
          <Dropdown
            showClear
            loading={salaryStructuresLoading}
            filter
            placeholder="Select role"
            id="role_id"
            name="role_id"
            value={formState.role_id}
            options={roles && roles.map((role) => ({
              value: role.id,
              label: role.name,
            }))}
            onChange={handleDropdownChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="password">Password</label>
          <InputText
            id="password"
            type="password"
            name="password"
            value={formState.password}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="profile_picture">Profile Picture</label>
          <input
            id="profile_picture"
            type="file"
            name="profile_picture"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
          />
        </div>
        <div className="p-field">
          <label htmlFor="signature">Digital Signature</label>
          <input
            id="signature"
            type="file"
            name="signature"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
          />
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyEmployee;
