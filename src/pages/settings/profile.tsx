import { useState, useRef, ChangeEvent } from "react";
import { FiUpload, FiEdit2, FiSave, FiX } from "react-icons/fi";
import axios, { AxiosError } from "axios";
import Logo from "../../assets/images/sahara.jpeg";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { baseURL, imageURL, org } from "../../utils/api";
import { toast, ToastContainer } from "react-toastify";

interface OrganizationProfile {
  logo: string;
  organisation_name: string;
  organisation_email: string;
  phone: string;
  description: string;
  organisation_phone_number: string;
  printer_ip: string;
  address: string;
  is_budget_mandatory: number;
  website: string;
  print_header_text: string;
  tin_no: string;
  base_currency_id: number;
  organisation_type: string;
  logoPreview?: string;
  allow_access_pin: boolean;
  id?: string;
}

interface ApiResponse {
  data: {
    data: OrganizationProfile;
    message: string;
  };
}

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const currentProfile = localStorage.getItem('user') 
    ? JSON.parse(localStorage.getItem('user') || '').user.organisation 
    : null;
  const token = useSelector((state: RootState) => state.userAuth.token.access_token);
  
  const [profile, setProfile] = useState<OrganizationProfile>({
    logo: `${imageURL}/${currentProfile?.logo}`,
    organisation_name: currentProfile?.organisation_name || '',
    organisation_email: currentProfile?.organisation_email || '',
    phone: currentProfile?.phone || '',
    description: currentProfile?.description || '',
    organisation_phone_number: currentProfile?.organisation_phone_number || '',
    printer_ip: currentProfile?.printer_ip || '',
    address: currentProfile?.address || '',
    is_budget_mandatory: currentProfile?.is_budget_mandatory || 0,
    website: currentProfile?.website || '',
    print_header_text: currentProfile?.print_header_text || '',
    tin_no: currentProfile?.tin_no || '',
    base_currency_id: currentProfile?.base_currency_id || 1,
    organisation_type: currentProfile?.organisation_type || '',
    allow_access_pin: currentProfile?.allow_access_pin || 0
  });

  const [tempProfile, setTempProfile] = useState<OrganizationProfile>({
    ...profile,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditToggle = () => {
    setTempProfile({ ...profile });
    setIsEditing(!isEditing);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTempProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const safeString = (value: any): string => (value === undefined ? "" : String(value));

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();

      // Append all fields to formData
      formData.append("organisation_name", tempProfile.organisation_name);
      formData.append("organisation_email", tempProfile.organisation_email);
      formData.append("phone", tempProfile.phone);
      formData.append("description", tempProfile.description);
      formData.append("organisation_phone_number", tempProfile.organisation_phone_number);
      //formData.append("printer_ip", safeString(currentProfile?.printer_ip));
      formData.append("address", tempProfile.address);
      formData.append("is_budget_mandatory", tempProfile.is_budget_mandatory);
      formData.append("allow_access_pin", tempProfile.allow_access_pin);
      formData.append("website", tempProfile.website);
      formData.append("print_header_text", tempProfile.print_header_text);
      formData.append("tin_no", tempProfile.tin_no);
      formData.append("organisation_type", tempProfile.organisation_type);
      formData.append("base_currency_id", tempProfile.base_currency_id);

      // Append logo if it's a new file
      if (typeof tempProfile.logo !== "string" && tempProfile.logo !== Logo) {
        formData.append("logo", tempProfile.logo);
      }

      const response = await axios.post<ApiResponse>(
        `${baseURL}/organisations/${currentProfile.id}/update`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const userString = localStorage.getItem("user");
      if (userString) {
        const userData = JSON.parse(userString);
        const updatedUser = {
          ...userData,
          user: {
            ...userData.user,
            organisation: response.data.data,
          },
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      if (response.status === 200) {
        setProfile(response.data.data);
      }
      setIsEditing(false);
      toast.success(response.data.message || "Profile updated successfully!");
      
    } catch (error) {
      console.log(error)
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data.message || "Failed to update profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTempProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setTempProfile((prev) => ({ ...prev, [name]: checked ? 1 : 0 }));
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setTempProfile((prev) => ({
            ...prev,
            logo: file,
            logoPreview: event.target!.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Organization Profile</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your organization information and branding
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Action Bar */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">
              Organization Details
            </h2>
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-500 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isLoading ? (
                      "Saving..."
                    ) : (
                      <>
                        <FiSave className="mr-2" /> Save Changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleEditToggle}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <FiX className="mr-2" /> Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEditToggle}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FiEdit2 className="mr-2" /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-6 py-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Logo Section */}
              <div className="w-full md:w-1/3 flex flex-col items-center">
                <div className="relative group">
                  <img
                    src={tempProfile.logoPreview || tempProfile.logo || Logo}
                    alt="Organization logo"
                    className="w-40 h-40 rounded-lg object-cover border-2 border-gray-200"
                  />
                  {isEditing && (
                    <>
                      <div
                        onClick={triggerFileInput}
                        className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <FiUpload className="text-white text-2xl" />
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </>
                  )}
                </div>
                {isEditing && (
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    Click logo to upload new image
                  </p>
                )}
              </div>

              {/* Details Section */}
              <div className="w-full md:w-2/3 space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="organisation_name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Organization Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="organisation_name"
                        id="organisation_name"
                        value={tempProfile.organisation_name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {profile.organisation_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="organisation_email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="organisation_email"
                        id="organisation_email"
                        value={tempProfile.organisation_email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {profile.organisation_email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={tempProfile.phone}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {profile.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="organisation_phone_number"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Secondary Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="organisation_phone_number"
                        id="organisation_phone_number"
                        value={tempProfile.organisation_phone_number}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {profile.organisation_phone_number}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Description
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="description"
                        id="description"
                        value={tempProfile.description}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {profile.description}
                      </p>
                    )}
                  </div>

                  {
                    org === 'latcu' && (
                      <>
                      <div>
                    <label
                      htmlFor="organisation_type"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Organization Type
                    </label>

                    {isEditing ? (
                      <select
                        name="organisation_type"
                        id="organisation_type"
                        value={tempProfile.organisation_type}
                        onChange={handleSelectChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="">-- Select Option --</option>
                        <option value="TCJE">TCJE</option>
                        <option value="UNION">UNION</option>
                        <option value="AMCOS">AMCOS</option>
                      </select>
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {profile.organisation_type}
                      </p>
                    )}
                  </div>
                      <div>
                          <label
                            htmlFor="printer_ip"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Printer IP
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="printer_ip"
                              id="printer_ip"
                              value={tempProfile.printer_ip}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          ) : (
                            <p className="mt-1 text-sm text-gray-900">
                              {profile.printer_ip}
                            </p>
                          )}
                        </div>
                        <div>
                    <label
                      htmlFor="print_header_text"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Print Header Text
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="print_header_text"
                        id="print_header_text"
                        value={tempProfile.print_header_text}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {profile.print_header_text}
                      </p>
                    )}
                  </div>
                      </>
                    )
                  }

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Address
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="address"
                        id="address"
                        value={tempProfile.address}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {profile.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="website"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Website
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        name="website"
                        id="website"
                        value={tempProfile.website}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    ) : (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        {profile.website}
                      </a>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="tin_no"
                      className="block text-sm font-medium text-gray-700"
                    >
                      TIN Number
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="tin_no"
                        id="tin_no"
                        value={tempProfile.tin_no}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {profile.tin_no}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center">
                      <input
                        id="is_budget_mandatory"
                        name="is_budget_mandatory"
                        type="checkbox"
                        checked={tempProfile.is_budget_mandatory}
                        onChange={handleCheckboxChange}
                        disabled={!isEditing}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="is_budget_mandatory"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Budget Mandatory
                      </label>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="flex items-center">
                      <input
                        id="allow_access_pin"
                        name="allow_access_pin"
                        type="checkbox"
                        checked={tempProfile.allow_access_pin}
                        onChange={handleCheckboxChange}
                        disabled={!isEditing}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="is_budget_mandatory"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Allow access pin for external pos
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;