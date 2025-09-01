//@ts-nocheck
import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { ProgressBar } from "primereact/progressbar";
import { Card } from "primereact/card";
import { Steps } from "primereact/steps";

import useItemCategories from "../../../hooks/inventory/useCategories";
import useUnitsOfMeasurement from "../../../hooks/inventory/useUnitsOfMeasurement";
import { baseURL, imageURL } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { INVENTORY_ENDPOINTS } from "../../../api/inventoryEndpoints";
import { InventoryItem } from "../../../redux/slices/types/inventory/Items";
import { handleGenericError } from "../../../utils/errorHandling";
import { toast } from "react-toastify";
import axios from "axios";

interface AddOrModifyItemProps {
  visible: boolean;
  onClose: () => void;
  item?: InventoryItem;
  onSave: () => void;
}

const AddOrModifyItem: React.FC<AddOrModifyItemProps> = ({
  visible,
  onClose,
  item,
  onSave,
}) => {
  const initialItem = {
    name: "",
    description: "",
    item_category_id: undefined,
    unit_of_measure_id: undefined,
    cost_price: undefined,
    selling_price: undefined,
    stock_alert_level: undefined,
    reference: "",
    shell_life: "",
    sku_unit: "",
    item_images: [],
  };

  const [formState, setFormState] =
    useState<Partial<InventoryItem>>(initialItem);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { data: categories } = useItemCategories();
  const { data: units } = useUnitsOfMeasurement();
  const { token } = useAuth();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { label: "Basic Info" },
    { label: "Pricing & Details" },
    { label: "Images" },
  ];

  useEffect(() => {
    if (item) {
      const existingImages =
        item.item_images?.map((img) => {
          if (typeof img === "string") {
            return {
              image_url: img,
              name: img.split("/").pop() || "image",
            };
          } else {
            return {
              image_url: img.image_url,
              name: img.image_url.split("/").pop() || "image",
            };
          }
        }) || [];

      setFormState({
        ...item,
        item_images: existingImages,
      });
    } else {
      setFormState(initialItem);
    }
  }, [item, visible]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleNumberChange = (
    name: keyof InventoryItem,
    value: number | null
  ) => {
    setFormState((prev) => ({ ...prev, [name]: value?.toString() || "0" }));
  };

  const handleDropdownChange = (name: keyof InventoryItem, value: string) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).map((file) => ({
        name: file.name,
        image_url: URL.createObjectURL(file),
        objectURL: URL.createObjectURL(file),
        file,
      }));

      setFormState((prev) => ({
        ...prev,
        item_images: [...(prev.item_images || []), ...newFiles],
      }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        name: file.name,
        image_url: URL.createObjectURL(file),
        objectURL: URL.createObjectURL(file),
        file,
      }));

      setFormState((prev) => ({
        ...prev,
        item_images: [...(prev.item_images || []), ...newFiles],
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormState((prev) => {
      const updatedImages = [...(prev.item_images || [])];
      const removedImage = updatedImages.splice(index, 1)[0];

      if (removedImage.objectURL) {
        URL.revokeObjectURL(removedImage.objectURL);
      }

      return { ...prev, item_images: updatedImages };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formState.name) {
      setIsSubmitting(false);
      return;
    }

    const method = "POST";
    const endpoint = item?.id
      ? INVENTORY_ENDPOINTS.ITEMS.UPDATE(item.id.toString())
      : INVENTORY_ENDPOINTS.ITEMS.ADD;

    const formData = new FormData();

    Object.entries(formState).forEach(([key, value]) => {
      if (key !== "item_images" && value !== undefined) {
        formData.append(key, value?.toString());
      }
    });

    formState.item_images.forEach((image) => {
      formData.append("item_images[]", image.file);
    });

    try {
      await axios({
        method,
        url: baseURL + endpoint,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token.access_token}`,
        },
        validateStatus: () => true,
      });
      toast.success(item ? "Product modified successfully!" : "Product saved successfully!");
      setFormState(initialItem);
      onSave();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data.message);
      handleGenericError(error);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
      setActiveStep(0);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-4">
            <Card className="p-4">
              <div className="p-field">
                <label htmlFor="name" className="block mb-2 font-medium">
                  Name <span className="text-red-500">*</span>
                </label>
                <InputText
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              <div className="p-field mt-4">
                <label
                  htmlFor="item_category_id"
                  className="block mb-2 font-medium"
                >
                  Category<span className="text-red-500">*</span>
                </label>
                <Dropdown
                  value={formState.item_category_id}
                  onChange={(e: DropdownChangeEvent) =>
                    handleDropdownChange("item_category_id", e.value)
                  }
                  options={categories}
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Select a Category"
                  filter
                  className="w-full"
                />
              </div>

              <div className="p-field mt-4">
                <label
                  htmlFor="unit_of_measure_id"
                  className="block mb-2 font-medium"
                >
                  Unit of Measure<span className="text-red-500">*</span>
                </label>
                <Dropdown
                  value={formState.unit_of_measure_id}
                  onChange={(e: DropdownChangeEvent) =>
                    handleDropdownChange("unit_of_measure_id", e.value)
                  }
                  options={units}
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Select a unit"
                  filter
                  className="w-full"
                />
              </div>
              <div className="p-field mt-4">
                <label htmlFor="description" className="block mb-2 font-medium">
                  Description
                </label>
                <InputTextarea
                  id="description"
                  name="description"
                  value={formState.description ?? ""}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full"
                />
              </div>
            </Card>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <Card className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-field">
                  <label htmlFor="cost_price" className="block mb-2 font-medium">
                    Cost Price<span className="text-red-500">*</span>
                  </label>
                  <InputNumber
                    id="cost_price"
                    value={parseFloat(formState.cost_price as string) || 0}
                    onValueChange={(e) =>
                      handleNumberChange("cost_price", e.value)
                    }
                    name="cost_price"
                    className="w-full"
                  />
                </div>

                <div className="p-field">
                  <label
                    htmlFor="selling_price"
                    className="block mb-2 font-medium"
                  >
                    Selling Price<span className="text-red-500">*</span>
                  </label>
                  <InputNumber
                    id="selling_price"
                    name="selling_price"
                    value={parseFloat(formState.selling_price as string) || 0}
                    onValueChange={(e) =>
                      handleNumberChange("selling_price", e.value)
                    }
                    className="w-full"
                  />
                </div>
              </div>

              <div className="p-field mt-4">
                <label htmlFor="reference" className="block mb-2 font-medium">
                  Reference
                </label>
                <InputText
                  id="reference"
                  name="reference"
                  value={formState.reference}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              <div className="p-field mt-4">
                <label
                  htmlFor="stock_alert_level"
                  className="block mb-2 font-medium"
                >
                  Stock Alert Level<span className="text-red-500">*</span>
                </label>
                <InputText
                  id="stock_alert_level"
                  name="stock_alert_level"
                  type="number"
                  value={formState.stock_alert_level as string}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              <div className="p-field mt-4">
                <label htmlFor="shell_life" className="block mb-2 font-medium">
                  Shell life (Days)<span className="text-red-500">*</span>
                </label>
                <InputText
                  id="shell_life"
                  name="shell_life"
                  type="number"
                  value={formState.shell_life as string}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              <div className="p-field mt-4">
                <label htmlFor="sku_unit" className="block mb-2 font-medium">
                  Stock Keeping Unit (SKU)
                </label>
                <InputText
                  id="sku_unit"
                  name="sku_unit"
                  value={formState.sku_unit}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
            </Card>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <Card className="p-4">
              <div className="p-field">
                <label className="block mb-2 font-medium">Product Images<span className="text-red-500">*</span></label>

                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                    isDragging
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-400 bg-gray-50"
                  }`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="p-3 bg-blue-50 rounded-full">
                      <i className="pi pi-image text-blue-500 text-xl"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">
                        {isDragging
                          ? "Drop files here"
                          : "Drag & drop your files here"}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        or click to browse
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">
                      Supports: PNG, JPG, JPEG (Max 10MB each)
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      id="file-upload"
                      name="item_images"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                    <label
                      htmlFor="file-upload"
                      className="mt-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 cursor-pointer transition-colors"
                    >
                      Select Files
                    </label>
                  </div>
                </div>

                {uploading && (
                  <ProgressBar value={uploadProgress} className="mt-2 h-2" />
                )}

                {formState.item_images && formState.item_images.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">
                      Uploaded Images ({formState.item_images.length})
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {formState.item_images.map((image, index) => (
                        <div
                          key={index}
                          className="relative group rounded-lg overflow-hidden border border-gray-200"
                        >
                          <div className="aspect-square bg-gray-100 flex items-center justify-center">
                            <img
                              src={
                                image.objectURL ||
                                `${imageURL}/${image.image_url}`
                              }
                              alt={`Product ${index}`}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <i className="pi pi-times text-xs"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  const footer = (
    <div className="flex justify-between items-center">
       <Button
          label="Cancel"
          icon="pi pi-times"
          onClick={(e) => {
            e.preventDefault();
            setActiveStep(0);
            onClose();
          }}
          className="p-button-text !bg-red-500 hover:bg-red-400"
          disabled={isSubmitting}
        />
      <div>
        {activeStep > 0 && (
          <Button
            label="Back"
            type="button"
            icon="pi pi-arrow-left"
            onClick={() => setActiveStep(activeStep - 1)}
            className="p-button-text"
            disabled={isSubmitting}
          />
        )}
      </div>
      <div className="flex gap-2">
        {activeStep < steps.length - 1 ? (
          <Button
            type="button"
            label="Next"
            icon="pi pi-arrow-right"
            iconPos="right"
            onClick={() => setActiveStep(activeStep + 1)}
            disabled={isSubmitting || !formState.name || !formState.item_category_id || !formState.unit_of_measure_id}
          />
        ) : (
          <Button
              label={item?.id ? "Update" : "Save"}
              icon="pi pi-check"
              type="button"
              form="item-form"
              loading={isSubmitting}
              disabled={isSubmitting || uploading}
              onClick={handleSubmit}
          />
        )}
      </div>
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Item" : "Add Item"}
      visible={visible}
      className="w-full max-w-xl"
      footer={footer}
      onHide={() => {
        setActiveStep(0);
        onClose();
      }}
    >
       <Steps
        model={steps}
        activeIndex={activeStep}
        onSelect={(e) => {
          e.originalEvent.preventDefault();
          setActiveStep(e.index);
        }}
        readOnly={false}
        className="mb-6"
      />
      <form
        id="item-form"
        className="grid grid-cols-1 gap-4 p-4"
      >
        {renderStepContent()}
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;