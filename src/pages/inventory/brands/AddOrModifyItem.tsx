import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";
import { INVENTORY_ENDPOINTS } from "../../../api/inventoryEndpoints";
import { Brand } from "../../../redux/slices/types/inventory/Brands";
import { baseURL } from "../../../utils/api";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: Brand;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<Brand>>({
    name: "",
    logo: "",
  });
  const [logoPreview, setLogoPreview] = useState<string | ArrayBuffer | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const { token } = useAuth();

  useEffect(() => {
    if (item) {
      setFormState({
        name: item.name || "",
        logo: item.logo || "",
      });
      typeof item.logo == "string" && setLogoPreview(item.logo || null); // Assuming `item.logo` is a URL
    } else {
      setFormState({ name: "", logo: "" });
      setLogoPreview(null);
    }
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setFormState((prevState) => ({
        ...prevState,
        logo: file,
      }));
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formState.name) {
      setIsSubmitting(false);
      return; // Handle validation error here
    }

    const formData = new FormData();
    formData.append("name", formState.name);
    if (formState.logo instanceof File) {
      formData.append("logo", formState.logo);
    }

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? INVENTORY_ENDPOINTS.BRANDS.UPDATE(item.id.toString())
      : INVENTORY_ENDPOINTS.BRANDS.ADD;

    try {
      await axios({
        method,
        url: baseURL + endpoint,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token.access_token}`,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving item", error);
      // Handle error here
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0); // Reset progress after the upload
    }
  };

  const footer = (
    <div className="flex justify-end gap-1">
      <Button
        severity="danger"
        disabled={isSubmitting}
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text mr-2 !bg-red-500"
      />
      <Button
        disabled={isSubmitting}
        loading={isSubmitting}
        label={item?.id ? "Update" : "Submit"}
        icon="pi pi-check"
        type="submit"
        form="item-form"
        severity="info"
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Brand" : "Add Brand"}
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
            <label htmlFor="logo">Logo</label>
            <input
              id="logo"
              name="logo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {logoPreview && (
              <div className="flex justify-center">
                <img
                  src={logoPreview as string}
                  alt="Logo Preview"
                  style={{ width: "100px", height: "auto", marginTop: "10px" }}
                />
              </div>
            )}
          </div>
          {isSubmitting && uploadProgress < 100 && (
            <div className="p-field">
              <label>Upload Progress: {uploadProgress}%</label>
              <progress value={uploadProgress} max="100"></progress>
            </div>
          )}
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
