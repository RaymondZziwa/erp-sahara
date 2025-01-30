import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { RadioButton } from "primereact/radiobutton";
import { ProgressBar } from "primereact/progressbar";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";
import { mossAppbaseURL } from "../../../utils/api";
import { SliderItem } from "../../../redux/slices/types/mossApp/Slider";
import { MOSS_APP_ENDPOINTS } from "../../../api/mossAppEndpoints";
import { InputTextarea } from "primereact/inputtextarea";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: SliderItem;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const [formState, setFormState] = useState<Partial<SliderItem>>({
    title: "",
    image: "",
    type: "Slider",
    url: "",
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
        title: item.title || "",
        image: item.image || "",
        type: item.type || "Slider",
        url: item.url || "",
      });
      typeof item.image === "string" && setLogoPreview(item.image || null);
    } else {
      setFormState({ title: "", image: "", type: "Slider", url: "" });
      setLogoPreview(null);
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
        image: file,
      }));
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formState.title || !formState.type) {
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", formState.title || "");
    formData.append("url", formState.url || "");
    formData.append("type", formState.type || "Slider");

    if (formState.image instanceof File) {
      formData.append("image", formState.image);
    }

    const method = item?.id ? "PUT" : "POST";
    const endpoint = item?.id
      ? MOSS_APP_ENDPOINTS.SLIDERS.UPDATE(item.id.toString())
      : MOSS_APP_ENDPOINTS.SLIDERS.ADD;

    try {
      await axios({
        method,
        url: mossAppbaseURL + endpoint,
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
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const footer = (
    <div className="flex justify-end space-x-2">
      <Button
        severity="danger"
        disabled={isSubmitting}
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text"
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
      header={item?.id ? "Edit Slider" : "Add Slider"}
      visible={visible}
      style={{ width: "400px" }}
      footer={footer}
      onHide={onClose}
    >
      <form id="item-form" onSubmit={handleSave}>
        <div className="p-fluid space-y-4">
          <div className="p-field">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <InputTextarea
              id="title"
              name="title"
              value={formState.title}
              onChange={handleInputChange}
              className="w-full"
              required
            />
          </div>

          <div className="p-field">
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            {[
              { name: "Slider", value: "Slider" },
              { name: "Ad", value: "Ad" },
            ].map((status) => (
              <div key={status.value} className="flex items-center space-x-2">
                <RadioButton
                  inputId={status.value}
                  name="type"
                  value={status.name}
                  onChange={(e) =>
                    setFormState({ ...formState, type: e.value })
                  }
                  checked={status.name === formState.type}
                />
                <label htmlFor={status.value} className="ml-2 capitalize">
                  {status.name}
                </label>
              </div>
            ))}
          </div>

          <div className="p-field">
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700"
            >
              URL
            </label>
            <InputText
              id="url"
              name="url"
              value={formState.url}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          <div className="p-field">
            <label
              htmlFor="logo"
              className="block text-sm font-medium text-gray-700"
            >
              Image
            </label>
            <input
              id="logo"
              name="logo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500"
            />
            {logoPreview && (
              <div className="flex justify-center mt-4">
                <img
                  src={logoPreview as string}
                  alt="Logo Preview"
                  className="w-48 h-auto"
                />
              </div>
            )}
          </div>

          {isSubmitting && uploadProgress < 100 && (
            <div className="p-field">
              <label className="block text-sm font-medium text-gray-700">
                Upload Progress: {uploadProgress}%
              </label>
              <ProgressBar value={uploadProgress} />
            </div>
          )}
        </div>
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
