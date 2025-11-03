import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Card } from "primereact/card";
import { Steps } from "primereact/steps";
import { Calendar } from "primereact/calendar";
import { Password } from "primereact/password"; // Import Password component
import useAuth from "../../../hooks/useAuth";
import { HUMAN_RESOURCE_ENDPOINTS } from "../../../api/hrEndpoints";
import { Employee } from "../../../redux/slices/types/hr/Employee";
import useEmployees from "../../../hooks/hr/useEmployees";
import useDepartments from "../../../hooks/hr/useDepartments";
import useDesignations from "../../../hooks/hr/useDesignations";
import useSalaryStructures from "../../../hooks/hr/useSalaryStructures";
import { toast } from "react-toastify";
import useRoles from "../../../hooks/settings/useRoles";
import useAllowanceTypes from "../../../hooks/hr/salary/useAllowanceTypes";
import useDeductionTypes from "../../../hooks/hr/salary/useDeductionTypes";
import axios from "axios";
import { baseURL } from "../../../utils/api";
import useCountries from "../../../hooks/Branches/useCountries";

interface AddOrModifyEmployeeProps {
  visible: boolean;
  onClose: () => void;
  item?: Employee;
  onSave: () => void;
}

interface Allowance {
  allowance_type_id: string;
  value: number;
}

interface Deduction {
  deduction_type_id: string;
  value: number;
  start_date?: string;
  end_date?: string;
}

interface NewEmployee {
  department_id: number;
  salary_structure_id: number;
  profile_picture: File | null;
  signature: File | null;
  designation_id: number;
  employee_code?: string;
  first_name: string;
  last_name: string;
  other_name?: string;
  email: string;
  phone: string;
  password: string;
  salutation: string;
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
  allowances: Allowance[];
  deductions: Deduction[];
}

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

const SALUTATIONS_OPTIONS = [
  { label: "Mr", value: "Mr" },
  { label: "Mrs", value: "Mrs" },
  { label: "Ms", value: "Ms" },
  { label: "Miss", value: "Miss" },
  { label: "Dr", value: "Dr" },
  { label: "Prof", value: "Prof" },
  { label: "Rev", value: "Rev" },
  { label: "Hon", value: "Hon" },
  { label: "Eng", value: "Eng" },
];

const MARITAL_STATUS_OPTIONS = [
  { label: "Single", value: "single" },
  { label: "Married", value: "married" },
  { label: "Divorced", value: "divorced" },
  { label: "Widowed", value: "widowed" },
];

const STEPS = [
  { label: "Personal Info", icon: "pi pi-user" },
  { label: "Employment", icon: "pi pi-briefcase" },
  { label: "Compensation", icon: "pi pi-money-bill" },
  { label: "Review", icon: "pi pi-eye" }
];

const AddOrModifyEmployee: React.FC<AddOrModifyEmployeeProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
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
    profile_picture: null,
    signature: null,
    role_id: "",
    allowances: [],
    deductions: []
  });

  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepErrors, setStepErrors] = useState<{[key: number]: string[]}>({});
  
  const { token } = useAuth();
  const { data: employees, loading: employeesLoading } = useEmployees();
  const { data: departments, loading: departmentsLoading } = useDepartments();
  const { data: designations, loading: designationsLoading } = useDesignations();
  const { data: salaryStructures, loading: salaryStructuresLoading } = useSalaryStructures();
  const { data: roles, refresh: fetchRoles } = useRoles();
  const { data: allowanceTypes } = useAllowanceTypes();
  const { data: deductionTypes } = useDeductionTypes();
  const { data: countries } = useCountries();

  useEffect(() => {
    if (!roles) {
      fetchRoles();
    }
  }, []);

  useEffect(() => {
    if (visible) {
      if (item) {
        setFormState({
          ...formState,
          ...item,
          supervisor_id: item.supervisor_id || undefined,
          allowances: item.allowances || [],
          deductions: item.deductions || [],
        });
      } else {
        setFormState({
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
          profile_picture: null,
          signature: null,
          role_id: "",
          allowances: [],
          deductions: []
        });
      }
      setCurrentStep(0);
      setProfilePreview(null);
      setSignaturePreview(null);
      setStepErrors({});
    }
  }, [item, visible]);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Format date to YYYY-MM-DD string for form submission
  const formatDateForSubmission = (date: Date | null): string => {
    if (!date) return "";
    return date.toISOString().split('T')[0];
  };

  // Convert string date to Date object for Calendar component
  const parseDateFromString = (dateString: string): Date | null => {
    if (!dateString) return null;
    return new Date(dateString);
  };

  // Validate current step
  const validateCurrentStep = (): boolean => {
    const errors: string[] = [];

    switch (currentStep) {
      case 0: // Personal Information
        if (!formState.salutation) errors.push("Salutation is required");
        if (!formState.first_name) errors.push("First name is required");
        if (!formState.last_name) errors.push("Last name is required");
        if (!formState.email) errors.push("Email is required");
        if (!formState.phone) errors.push("Phone is required");
        if (!formState.gender) errors.push("Gender is required");
        if (!formState.marital_status) errors.push("Marital status is required");
        if (!formState.date_of_birth) {
          errors.push("Date of birth is required");
        } else {
          const age = calculateAge(formState.date_of_birth);
          if (age < 18) {
            errors.push("Employee must be at least 18 years old");
          }
        }
        break;
      
      case 1: // Employment Details
        if (!formState.hire_date) errors.push("Hire date is required");
        if (!formState.role_id) errors.push("Role is required");
        if (!formState.department_id) errors.push("Department is required");
        if (!formState.designation_id) errors.push("Designation is required");
        if (!formState.address) errors.push("Address is required");
        if (!formState.state) errors.push("Region is required");
        if (!formState.country) errors.push("Country is required");
        break;
      
      case 2: // Compensation (optional validation)
        // Allowances validation
        formState.allowances.forEach((allowance, index) => {
          if (!allowance.allowance_type_id) {
            errors.push(`Allowance ${index + 1}: Type is required`);
          }
          if (!allowance.value || allowance.value <= 0) {
            errors.push(`Allowance ${index + 1}: Value must be greater than 0`);
          }
        });

        // Deductions validation
        formState.deductions.forEach((deduction, index) => {
          if (!deduction.deduction_type_id) {
            errors.push(`Deduction ${index + 1}: Type is required`);
          }
          if (!deduction.value || deduction.value <= 0) {
            errors.push(`Deduction ${index + 1}: Value must be greater than 0`);
          }
        });
        break;
    }

    setStepErrors(prev => ({ ...prev, [currentStep]: errors }));
    return errors.length === 0;
  };

  // Check if current step is valid for enabling next button
  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 0:
        return !!(formState.salutation && formState.first_name && formState.last_name && 
                 formState.email && formState.phone && formState.gender && 
                 formState.marital_status && formState.date_of_birth);
      case 1:
        return !!(formState.hire_date && formState.role_id && formState.department_id && 
                 formState.designation_id && formState.address && formState.state && 
                 formState.country);
      case 2:
        // Compensation step is optional, so always valid
        return true;
      default:
        return true;
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prevState) => ({
      ...prevState,
      password: e.target.value,
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'profile_picture' | 'signature') => {
    const file = event.target.files?.[0];
    if (file) {
      setFormState(prevState => ({
        ...prevState,
        [type]: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'profile_picture') {
          setProfilePreview(e.target?.result as string);
        } else {
          setSignaturePreview(e.target?.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDropdownChange = (e: DropdownChangeEvent) => {
    const { name } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: e.value,
    }));
  };

  // Handle date change for PrimeReact Calendar
  const handleDateChange = (name: 'date_of_birth' | 'hire_date', value: Date | Date[] | null) => {
    // PrimeReact Calendar can return Date, Date[], or null
    // We expect a single date, so we handle Date or null
    if (value && !Array.isArray(value)) {
      const dateString = formatDateForSubmission(value);
      setFormState(prevState => ({
        ...prevState,
        [name]: dateString
      }));
    } else if (value === null) {
      setFormState(prevState => ({
        ...prevState,
        [name]: ""
      }));
    }
  };

  const handleAllowanceChange = (index: number, field: keyof Allowance, value: any) => {
    setFormState(prevState => {
      const newAllowances = [...prevState.allowances];
      newAllowances[index] = { ...newAllowances[index], [field]: value };
      return { ...prevState, allowances: newAllowances };
    });
  };

  const handleDeductionChange = (index: number, field: keyof Deduction, value: any) => {
    setFormState(prevState => {
      const newDeductions = [...prevState.deductions];
      newDeductions[index] = { ...newDeductions[index], [field]: value };
      return { ...prevState, deductions: newDeductions };
    });
  };

  const addAllowance = () => {
    setFormState(prevState => ({
      ...prevState,
      allowances: [...prevState.allowances, { allowance_type_id: '', value: 0 }]
    }));
  };

  const removeAllowance = (index: number) => {
    setFormState(prevState => ({
      ...prevState,
      allowances: prevState.allowances.filter((_, i) => i !== index)
    }));
  };

  const addDeduction = () => {
    setFormState(prevState => ({
      ...prevState,
      deductions: [...prevState.deductions, { deduction_type_id: '', value: 0 }]
    }));
  };

  const removeDeduction = (index: number) => {
    setFormState(prevState => ({
      ...prevState,
      deductions: prevState.deductions.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      // Check age for step 0
      if (currentStep === 0 && formState.date_of_birth) {
        const age = calculateAge(formState.date_of_birth);
        if (age < 18) {
          toast.warn(`Employee age is ${age}. Must be at least 18 years old.`);
          return;
        }
      }
      
      setCurrentStep(prev => prev + 1);
    } else {
      // Show toast with first error
      if (stepErrors[currentStep] && stepErrors[currentStep].length > 0) {
        toast.warn(stepErrors[currentStep][0]);
      }
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSave = async () => {
    setIsSubmitting(true);

    // Final validation
    if (!validateCurrentStep()) {
      setIsSubmitting(false);
      toast.warn("Please fix the errors before submitting");
      return;
    }

    if (formState.password.length < 8) {
      toast.warn("Password must be atleast 8 characters.")
      setIsSubmitting(false);
      return;
    }

    const method = "POST";
    const endpoint = item?.id
      ? HUMAN_RESOURCE_ENDPOINTS.EMPLOYEES.UPDATE(item.id.toString())
      : HUMAN_RESOURCE_ENDPOINTS.EMPLOYEES.ADD;

    // Create FormData for file upload
    const formData = new FormData();
    
    // Append all form fields
    Object.keys(formState).forEach(key => {
      if (key === 'allowances') {
        formState.allowances.forEach((allowance, index) => {
          Object.keys(allowance).forEach(allowanceKey => {
            const value = allowance[allowanceKey as keyof Allowance];
            if (value !== null && value !== undefined) {
              formData.append(`allowances[${index}][${allowanceKey}]`, value.toString());
            }
          });
        });
      } else if (key === 'deductions') {
        formState.deductions.forEach((deduction, index) => {
          Object.keys(deduction).forEach(deductionKey => {
            const value = deduction[deductionKey as keyof Deduction];
            if (value !== null && value !== undefined && value !== '') {
              formData.append(`deductions[${index}][${deductionKey}]`, value.toString());
            }
          });
        });
      } else if (key === 'profile_picture' && formState.profile_picture) {
        formData.append(key, formState.profile_picture);
      } else if (key === 'signature' && formState.signature) {
        formData.append(key, formState.signature);
      } else {
        const value = formState[key as keyof NewEmployee];
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value.toString());
        }
      }
    });

    try {
      // Using axios directly for better FormData handling
      const config = {
        method: method.toLowerCase(),
        url: `${baseURL}${endpoint}`,
        data: formData,
        headers: {
          'Authorization': `Bearer ${token.access_token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      const response = await axios(config);
      
      if (response.status === 200 || response.status === 201) {
        toast.success(`Employee ${item?.id ? 'updated' : 'created'} successfully`);
        onSave();
        onClose();
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error: any) {

      const errorMessage = error.response?.data?.message || 'Error saving employee';
      toast.error(errorMessage);
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Personal Information
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-field">
              <label htmlFor="salutation">Salutation<span className="text-red-500">*</span></label>
              <Dropdown
                id="salutation"
                name="salutation"
                value={formState.salutation}
                options={SALUTATIONS_OPTIONS}
                onChange={handleDropdownChange}
                className="w-full text-sm"
                placeholder="Select salutation"
              />
            </div>
            <div className="p-field">
              <label htmlFor="first_name">First Name<span className="text-red-500">*</span></label>
              <InputText
                id="first_name"
                name="first_name"
                value={formState.first_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm"
                placeholder="Enter first name"
              />
            </div>
            <div className="p-field">
              <label htmlFor="last_name">Last Name<span className="text-red-500">*</span></label>
              <InputText
                id="last_name"
                name="last_name"
                value={formState.last_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm"
                placeholder="Enter last name"
              />
            </div>
            <div className="p-field">
              <label htmlFor="other_name">Other Name</label>
              <InputText
                id="other_name"
                name="other_name"
                value={formState.other_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm"
                placeholder="Enter other name"
              />
            </div>
            <div className="p-field">
              <label htmlFor="email">Email<span className="text-red-500">*</span></label>
              <InputText
                id="email"
                name="email"
                value={formState.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm"
                placeholder="Enter email"
              />
            </div>
            <div className="p-field">
              <label htmlFor="phone">Phone<span className="text-red-500">*</span></label>
              <InputText
                id="phone"
                name="phone"
                value={formState.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm"
                placeholder="Enter phone number"
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
                className="w-full text-sm"
                placeholder="Select gender"
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
                className="w-full text-sm"
                placeholder="Select marital status"
              />
            </div>
            <div className="p-field">
              <label htmlFor="date_of_birth">Date of Birth<span className="text-red-500">*</span></label>
              <Calendar
                id="date_of_birth"
                value={parseDateFromString(formState.date_of_birth)}
                onChange={(e) => handleDateChange('date_of_birth', e.value)}
                className="w-full text-sm"
                dateFormat="yy-mm-dd"
                showIcon
                maxDate={new Date()} // Cannot select future dates for date of birth
                placeholder="Select date of birth"
                readOnlyInput
              />
            </div>
            <div className="p-field md:col-span-2">
              <label htmlFor="profile_picture">Profile Picture</label>
              <div className="flex items-center gap-4">
                <input
                  id="profile_picture"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'profile_picture')}
                  className="flex-1 py-2 text-sm"
                />
                {profilePreview && (
                  <div className="w-16 h-16 border rounded overflow-hidden">
                    <img src={profilePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 1: // Employment Details
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-field">
              <label htmlFor="employee_code">Employee ID/Number</label>
              <InputText
                id="employee_code"
                name="employee_code"
                value={formState.employee_code}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm"
                placeholder="Enter employee ID"
              />
            </div>
            <div className="p-field">
              <label htmlFor="hire_date">Hire Date<span className="text-red-500">*</span></label>
              <Calendar
                id="hire_date"
                value={parseDateFromString(formState.hire_date)}
                onChange={(e) => handleDateChange('hire_date', e.value)}
                className="w-full text-sm"
                dateFormat="yy-mm-dd"
                showIcon
                minDate={new Date()} // Hire date cannot be in the past
                placeholder="Select hire date"
                readOnlyInput
              />
            </div>
            <div className="p-field">
              <label htmlFor="department_id">Department<span className="text-red-500">*</span></label>
              <Dropdown
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
                className="w-full text-sm"
              />
            </div>
            <div className="p-field">
              <label htmlFor="designation_id">Designation<span className="text-red-500">*</span></label>
              <Dropdown
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
                className="w-full text-sm"
              />
            </div>
            <div className="p-field">
              <label htmlFor="role_id">Role<span className="text-red-500">*</span></label>
              <Dropdown
                filter
                placeholder="Select role"
                id="role_id"
                name="role_id"
                value={formState.role_id}
                options={roles?.map((role) => ({
                  value: role.id,
                  label: role.name,
                })) || []}
                onChange={handleDropdownChange}
                className="w-full text-sm"
              />
            </div>
            <div className="p-field">
              <label htmlFor="supervisor_id">Supervisor</label>
              <Dropdown
                loading={employeesLoading}
                filter
                placeholder="Select supervisor"
                id="supervisor_id"
                name="supervisor_id"
                value={formState.supervisor_id}
                options={employees.map((employee) => ({
                  value: employee.id,
                  label: `${employee.first_name} ${employee.last_name}`,
                }))}
                onChange={handleDropdownChange}
                className="w-full text-sm"
              />
            </div>
            <div className="p-field md:col-span-2">
              <label htmlFor="address">Address<span className="text-red-500">*</span></label>
              <InputText
                id="address"
                name="address"
                value={formState.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm"
                placeholder="Enter address"
              />
            </div>
            <div className="p-field">
              <label htmlFor="state">Region<span className="text-red-500">*</span></label>
              <Dropdown
                id="state"
                name="state"
                value={formState.state}
                onChange={handleDropdownChange}
                options={[
                  { label: "Central", value: "Central" },
                  { label: "Northern", value: "Northern" },
                  { label: "Eastern", value: "Eastern" },
                  { label: "Western", value: "Western" },
                ]}
                className="w-full text-sm"
                placeholder="Select region"
                filter
                showClear
              />
            </div>
            <div className="p-field">
              <label htmlFor="country">Country<span className="text-red-500">*</span></label>
              <Dropdown
                id="country"
                name="country"
                value={formState.country}
                onChange={handleDropdownChange}
                options={countries?.map((country) => ({
                  label: country.country_name,
                  value: country.country_name, // or use country.id if you prefer
                })) || []}
                className="w-full text-sm"
                placeholder="Select country"
                filter
                showClear
              />
            </div>
            <div className="p-field">
              <label htmlFor="postal_code">Postal Code</label>
              <InputText
                id="postal_code"
                name="postal_code"
                value={formState.postal_code}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm"
                placeholder="Enter postal code"
              />
            </div>
            <div className="p-field md:col-span-2">
              <label htmlFor="signature">Digital Signature</label>
              <div className="flex items-center gap-4">
                <input
                  id="signature"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'signature')}
                  className="flex-1 py-2 text-sm"
                />
                {signaturePreview && (
                  <div className="w-16 h-16 border rounded overflow-hidden">
                    <img src={signaturePreview} alt="Signature Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 2: // Compensation
        return (
          <div className="space-y-6">
            <div className="p-field">
              <label htmlFor="salary_structure_id">Salary Structure</label>
              <Dropdown
                loading={salaryStructuresLoading}
                filter
                placeholder="Select salary structure"
                id="salary_structure_id"
                name="salary_structure_id"
                value={formState.salary_structure_id}
                options={salaryStructures.map((structure) => ({
                  value: structure.id,
                  label: structure.name,
                }))}
                onChange={handleDropdownChange}
                className="w-full text-sm"
              />
            </div>

            <div className="p-field">
              <label htmlFor="password">Password <span className="text-red-500">(Atleast 8 characters)</span></label>
              <Password
                id="password"
                name="password"
                value={formState.password}
                onChange={handlePasswordChange}
                className="w-full text-sm"
                placeholder="Enter password"
                toggleMask
                feedback={false}
                promptLabel="Enter a password"
                weakLabel="Too simple"
                mediumLabel="Average complexity"
                strongLabel="Complex password"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="font-semibold">Allowances</label>
                <Button type="button" icon="pi pi-plus" label="Add Allowance" onClick={addAllowance} size="small" />
              </div>
              
              {formState.allowances.map((allowance, index) => (
                <Card key={index} className="p-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="text-sm font-medium">Allowance Type</label>
                      <Dropdown
                        placeholder="Select allowance type"
                        value={allowance.allowance_type_id}
                        options={allowanceTypes?.map(type => ({
                          value: type.id,
                          label: type.name,
                        })) || []}
                        onChange={(e) => handleAllowanceChange(index, 'allowance_type_id', e.value)}
                        className="w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Value</label>
                      <InputNumber
                        value={allowance.value}
                        onValueChange={(e) => handleAllowanceChange(index, 'value', e.value)}
                        className="w-full text-sm"
                      />
                    </div>
                    <Button
                      type="button"
                      icon="pi pi-trash"
                      className="p-button-danger p-button-outlined"
                      onClick={() => removeAllowance(index)}
                      size="small"
                    />
                  </div>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="font-semibold">Deductions</label>
                <Button type="button" icon="pi pi-plus" label="Add Deduction" onClick={addDeduction} size="small" />
              </div>
              
              {formState.deductions.map((deduction, index) => (
                <Card key={index} className="p-3">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium">Deduction Type</label>
                      <Dropdown
                        placeholder="Select deduction type"
                        value={deduction.deduction_type_id}
                        options={deductionTypes?.map(type => ({
                          value: type.id,
                          label: type.name,
                        })) || []}
                        onChange={(e) => handleDeductionChange(index, 'deduction_type_id', e.value)}
                        className="w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Value</label>
                      <InputNumber
                        value={deduction.value}
                        onValueChange={(e) => handleDeductionChange(index, 'value', e.value)}
                        className="w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Start Date</label>
                      <Calendar
                        value={parseDateFromString(deduction.start_date || '')}
                        onChange={(e) => handleDeductionChange(index, 'start_date', formatDateForSubmission(e.value as Date))}
                        className="w-full text-sm"
                        dateFormat="yy-mm-dd"
                        showIcon
                        placeholder="Select start date"
                        readOnlyInput
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">End Date</label>
                      <Calendar
                        value={parseDateFromString(deduction.end_date || '')}
                        onChange={(e) => handleDeductionChange(index, 'end_date', formatDateForSubmission(e.value as Date))}
                        className="w-full text-sm"
                        dateFormat="yy-mm-dd"
                        showIcon
                        placeholder="Select end date"
                        readOnlyInput
                      />
                    </div>
                    <Button
                      type="button"
                      icon="pi pi-trash"
                      className="p-button-danger p-button-outlined md:col-span-5"
                      onClick={() => removeDeduction(index)}
                      size="small"
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3: // Review
        return (
          <div className="space-y-4">
            <Card title="Personal Information" className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><strong>Name:</strong> {formState.salutation} {formState.first_name} {formState.last_name}</div>
                <div><strong>Email:</strong> {formState.email}</div>
                <div><strong>Phone:</strong> {formState.phone}</div>
                <div><strong>Gender:</strong> {formState.gender}</div>
                <div><strong>Date of Birth:</strong> {formState.date_of_birth}</div>
                <div><strong>Age:</strong> {formState.date_of_birth ? calculateAge(formState.date_of_birth) : 'N/A'} years</div>
                <div><strong>Marital Status:</strong> {formState.marital_status}</div>
              </div>
            </Card>

            <Card title="Employment Details" className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><strong>Employee ID:</strong> {formState.employee_code || 'N/A'}</div>
                <div><strong>Hire Date:</strong> {formState.hire_date}</div>
                <div><strong>Department:</strong> {departments.find(d => d.id === formState.department_id)?.name || 'N/A'}</div>
                <div><strong>Designation:</strong> {designations.find(d => d.id === formState.designation_id)?.designation_name || 'N/A'}</div>
                <div><strong>Role:</strong> {roles?.find(r => r.id === formState.role_id)?.name || 'N/A'}</div>
                <div><strong>Supervisor:</strong> {formState.supervisor_id ? employees.find(e => e.id === formState.supervisor_id)?.first_name + ' ' + employees.find(e => e.id === formState.supervisor_id)?.last_name : 'N/A'}</div>
                <div className="md:col-span-2"><strong>Address:</strong> {formState.address}, {formState.state}, {formState.country}</div>
              </div>
            </Card>

            <Card title="Compensation" className="p-3">
              <div className="text-sm space-y-2">
                <div><strong>Salary Structure:</strong> {salaryStructures.find(s => s.id === formState.salary_structure_id)?.structure_name || 'N/A'}</div>
                
                {formState.allowances.length > 0 && (
                  <div>
                    <strong>Allowances:</strong>
                    <ul className="ml-4 mt-1">
                      {formState.allowances.map((allowance, index) => (
                        <li key={index}>
                          {allowanceTypes?.find(at => at.id === allowance.allowance_type_id)?.name}: UGX {allowance.value.toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {formState.deductions.length > 0 && (
                  <div>
                    <strong>Deductions:</strong>
                    <ul className="ml-4 mt-1">
                      {formState.deductions.map((deduction, index) => (
                        <li key={index}>
                          {deductionTypes?.find(dt => dt.id === deduction.deduction_type_id)?.name}: UGX {deduction.value.toLocaleString()}
                          {deduction.start_date && ` (${deduction.start_date} to ${deduction.end_date || 'Ongoing'})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex gap-4">
              {profilePreview && (
                <div>
                  <label className="block text-sm font-medium mb-2">Profile Picture</label>
                  <img src={profilePreview} alt="Profile Preview" className="w-32 h-32 object-cover border rounded" />
                </div>
              )}
              {signaturePreview && (
                <div>
                  <label className="block text-sm font-medium mb-2">Digital Signature</label>
                  <img src={signaturePreview} alt="Signature Preview" className="w-32 h-16 object-contain border rounded" />
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const footer = (
    <div className="flex justify-between items-center pt-4 border-t">
      <div>
        {currentStep > 0 && (
          <Button
            label="Previous"
            icon="pi pi-arrow-left"
            onClick={prevStep}
            className="p-button-outlined p-button-secondary"
            disabled={isSubmitting}
          />
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">
          Step {currentStep + 1} of {STEPS.length}
        </span>
        <div className="flex gap-2">
          <Button
            label="Cancel"
            icon="pi pi-times"
            onClick={onClose}
            className="p-button-outlined p-button-danger !bg-red-500"
            disabled={isSubmitting}
          />
          
          {currentStep < STEPS.length - 1 ? (
            <Button
              label="Next"
              icon="pi pi-arrow-right"
              iconPos="right"
              onClick={nextStep}
              disabled={!isStepValid() || isSubmitting}
            />
          ) : (
            <Button
              loading={isSubmitting}
              label={item?.id ? "Update Employee" : "Create Employee"}
              icon="pi pi-check"
              onClick={handleSave}
              disabled={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Employee" : "Add New Employee"}
      visible={visible}
      className="max-w-4xl w-[90vw]"
      footer={footer}
      onHide={onClose}
      closable={!isSubmitting}
    >
      <div className="mb-6">
        <Steps
          model={STEPS.map((step, index) => ({
            ...step,
            disabled: index > currentStep
          }))}
          activeIndex={currentStep}
          onSelect={(e) => setCurrentStep(e.index)}
          readOnly={isSubmitting}
          className="custom-steps"
        />
      </div>

      {stepErrors[currentStep] && stepErrors[currentStep].length > 0 && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-md">
          <div className="text-red-700 text-sm">
            <strong>Please fix the following issues:</strong>
            <ul className="mt-1 ml-4 list-disc">
              {stepErrors[currentStep].map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="max-h-[60vh] overflow-y-auto pr-2">
        {renderStepContent()}
      </div>

      <style jsx>{`
        :global(.custom-steps .p-steps-item.p-highlight .p-steps-number) {
          background-color: var(--primary-color);
          color: white;
        }
        
        :global(.custom-steps .p-steps-item.p-disabled) {
          opacity: 0.6;
        }
      `}</style>
    </Dialog>
  );
};

export default AddOrModifyEmployee;