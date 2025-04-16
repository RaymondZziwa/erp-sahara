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

import useItemCategories from "../../../hooks/inventory/useCategories";
import useUnitsOfMeasurement from "../../../hooks/inventory/useUnitsOfMeasurement";
import { baseURL } from "../../../utils/api";
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

  useEffect(() => {
    if (item) {
      // Convert existing images to the format we expect
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

  // Handle drag and drop events
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

  // Handle file selection via input
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

  // Function to remove media by index
  const removeImage = (index: number) => {
    setFormState((prev) => {
      const updatedImages = [...(prev.item_images || [])];
      const removedImage = updatedImages.splice(index, 1)[0];

      // Revoke the object URL to avoid memory leaks
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

    //const method = item?.id ? "PUT" : "POST";
    const method = "POST";
    const endpoint = item?.id
      ? INVENTORY_ENDPOINTS.ITEMS.UPDATE(item.id.toString())
      : INVENTORY_ENDPOINTS.ITEMS.ADD;

    // Prepare form data for submission
    const formData = new FormData();

    // Append all fields to formData
    Object.entries(formState).forEach(([key, value]) => {
      console.log('items', key, value)
      if (key !== "item_images" && value !== undefined) {
        // Convert value to string (for non-images fields)
        formData.append(key, value?.toString());
      }
    });
    // Append images
    formState.item_images.forEach((image) => {
      formData.append("item_images[]", image.file);
    });

    try {
      const response = await axios({
        method,
        url: baseURL + endpoint,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token.access_token}`,
        },
      });
      if (response.data.success) {
        toast.success("Product modified successfully!");
      } else {
        throw Error(response.data.message);
      }
    } catch (error) {
      console.error("Error saving item", error);
      handleGenericError(error);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0); // Reset progress after the upload
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text"
        disabled={isSubmitting}
      />
      <Button
        label={item?.id ? "Update" : "Save"}
        icon="pi pi-check"
        type="submit"
        form="item-form"
        loading={isSubmitting}
        disabled={isSubmitting || uploading}
      />
    </div>
  );

  return (
    <Dialog
      header={item?.id ? "Edit Item" : "Add Item"}
      visible={visible}
      className="w-full max-w-4xl"
      footer={footer}
      onHide={onClose}
    >
      <form
        id="item-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4"
      >
        {/* Left Column */}
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

            <div className="p-field mt-4">
              <label
                htmlFor="item_category_id"
                className="block mb-2 font-medium"
              >
                Category
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
                Unit of Measure
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
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-field">
                <label htmlFor="cost_price" className="block mb-2 font-medium">
                  Cost Price
                </label>
                <InputNumber
                  id="cost_price"
                  value={parseFloat(formState.cost_price as string) || 0}
                  onValueChange={(e) =>
                    handleNumberChange("cost_price", e.value)
                  }
                  mode="currency"
                  name="cost_price"
                  currency="UGX"
                  locale="en-US"
                  className="w-full"
                />
              </div>

              <div className="p-field">
                <label
                  htmlFor="selling_price"
                  className="block mb-2 font-medium"
                >
                  Selling Price
                </label>
                <InputNumber
                  id="selling_price"
                  name="selling_price"
                  value={parseFloat(formState.selling_price as string) || 0}
                  onValueChange={(e) =>
                    handleNumberChange("selling_price", e.value)
                  }
                  mode="currency"
                  currency="UGX"
                  locale="en-US"
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
                Stock Alert Level
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
                Shell life (Days)
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

          {/* Image Upload Section */}
          <Card className="p-4">
            <div className="p-field">
              <label className="block mb-2 font-medium">Product Images</label>

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

              {/* Uploaded Images Preview */}
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
                              `https://saharaauth.efinanci.com/storage/${image.image_url}`
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
      </form>
    </Dialog>
  );
};

export default AddOrModifyItem;
