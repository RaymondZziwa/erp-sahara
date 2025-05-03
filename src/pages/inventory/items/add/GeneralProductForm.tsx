//@ts-nocheck
import { useState, useCallback } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Card } from "primereact/card";
import { AddProduct } from ".";
import useItemCategories from "../../../../hooks/inventory/useCategories";
import { Link } from "react-router-dom";
import useUnitsOfMeasurement from "../../../../hooks/inventory/useUnitsOfMeasurement";
import { InputNumber } from "primereact/inputnumber";

interface Attribute {
  attribute_id: string;
  value_id: string;
}

export default function GeneralProductForm({
  product,
  handleProductChange,
}: {
  product: AddProduct;
  handleProductChange: <T extends keyof AddProduct>(
    key: T,
    value: AddProduct[T]
  ) => void;
  handleAttributeChange: (
    variantIndex: number,
    attributeIndex: number,
    key: keyof Attribute,
    value: number
  ) => void;
}) {

  const [isDragging, setIsDragging] = useState(false);

  const { data: categories, loading: categoriesLoading } = useItemCategories();
  const { data: uom, loading: uomLoading } = useUnitsOfMeasurement();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    handleProductChange(name as keyof AddProduct, value);
  };

  // Handle file selection - appends to existing files
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const newFiles = Array.from(e.target.files);
        handleProductChange("item_images", [
          ...(product.item_images || []),
          ...newFiles,
        ]);
      }
    },
    [product.item_images, handleProductChange]
  );

  // Handle drag and drop
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
      const newFiles = Array.from(e.dataTransfer.files);
      handleProductChange("item_images", [
        ...(product.item_images || []),
        ...newFiles,
      ]);
    }
  };

  // Function to remove media by index
  const removeMedia = (index: number) => {
    if (!product.item_images) return;

    const newMedia = [...product.item_images];
    newMedia.splice(index, 1);
    handleProductChange("item_images", newMedia);
  };

  return (
    <div className="container mx-auto px-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* General Section */}
          <Card>
            <div className="font-bold text-xl my-2">
              <h3>General</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="product-name">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <InputText
                  value={product.name}
                  onChange={handleChange}
                  id="product-name"
                  name="name"
                  placeholder="Product Name"
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  A product name is required and recommended to be unique.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="description">Description</label>
                <InputTextarea
                  onChange={handleChange}
                  value={product.description}
                  id="description"
                  name="description"
                  placeholder="Set a description to the product for better visibility."
                  className="min-h-[100px] w-full"
                />
              </div>
            </div>
          </Card>

          {/* Media Section */}
          <div className="space-y-4">
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
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

            {/* Uploaded Files Preview */}
            {product.item_images?.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Uploaded Media ({product.item_images.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {product.item_images.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="relative group rounded-lg overflow-hidden border border-gray-200"
                    >
                      <div className="aspect-square bg-gray-100 flex items-center justify-center">
                        {file.type.startsWith("image/") ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="p-4 text-gray-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="p-2">
                        <p className="text-xs font-medium text-gray-700 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pricing Section */}
          <Card>
            <div className="font-bold text-xl my-2">
              <h3>Pricing</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="base-price">
                  Cost Price <span className="text-red-500">*</span>
                </label>
                <InputNumber
                  id="base-price"
                  placeholder="Product price"
                  className="w-full"
                  name="cost_price"
                  value={product.cost_price.toString()}
                  onChange={(e) =>
                    handleProductChange("cost_price", e.value.toString()!)
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Set the product Cost price.
                </p>
              </div>
              <div className="space-y-2">
                <label htmlFor="base-price">
                  Selling Price <span className="text-red-500">*</span>
                </label>
                <InputNumber
                  id="base-price"
                  placeholder="Product sale price"
                  className="w-full"
                  name="selling_price"
                  value={product.selling_price.toString()}
                  onChange={(e) =>
                    handleProductChange("selling_price", e.value.toString()!)
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Set the product Sale price.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <div className="font-bold text-xl my-2">
              <h3>Product Details</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label>Categories</label>
                <Dropdown
                  loading={categoriesLoading}
                  value={product.item_category_id}
                  options={categories.map((cat) => ({
                    label: cat.name,
                    value: cat.id,
                  }))}
                  onChange={(e) =>
                    handleProductChange("item_category_id", e.value)
                  }
                  className="w-full"
                  placeholder="Select an option"
                />
                <p className="text-sm text-muted-foreground">
                  Add product to a category.
                </p>
                <Link to={"/inventory/inventory/itemscategories"}>
                  <Button className="w-full">
                    <i className="pi pi-plus h-4 w-4 mr-2"></i>
                    Create New Category
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          <Card title="Inventory">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <label htmlFor="sku" className="block font-medium">
                  Stock Keeping Unit (SKU)
                </label>
                <InputText
                  name="sku_unit"
                  onChange={(e) =>
                    handleProductChange("sku_unit", e.target.value)
                  }
                  placeholder="Enter sku"
                  className="w-full"
                />
                <small className="text-muted block mt-1">
                  SKU is a unique identifier for your product.
                </small>
              </div>
              <div>
                <label htmlFor="sku" className="block font-medium">
                  Unit of measure
                </label>
                <Dropdown
                  loading={uomLoading}
                  value={product.unit_of_measure_id}
                  options={uom.map((item) => ({
                    label: item.name,
                    value: item.id,
                  }))}
                  filter
                  onChange={(e) =>
                    handleProductChange("unit_of_measure_id", e.value)
                  }
                  placeholder="Select Size"
                  className="w-full"
                />
                <small className="text-muted block mt-1">
                  UOM is a unique identifier for your product.
                </small>
              </div>

              <div>
                <label htmlFor="low-stock" className="block font-medium">
                  Low Stock Threshold
                </label>
                <InputText
                  name="stock_alert_level"
                  value={product.stock_alert_level.toString()}
                  onChange={(e) =>
                    handleProductChange("stock_alert_level", e.target.value)
                  }
                  id="low-stock"
                  placeholder="Enter low stock alert threshold"
                  type="number"
                  className="w-full"
                  required
                />
                <small className="text-muted block mt-1">
                  Set a quantity to trigger a low stock notification.
                </small>
              </div>
              <div>
                <label htmlFor="low-stock" className="block font-medium">
                  Reference
                </label>
                <InputText
                  name="reference"
                  value={product.reference.toString()}
                  onChange={(e) =>
                    handleProductChange("reference", e.target.value)
                  }
                  id="low-stock"
                  placeholder="Enter reference"
                  type="text"
                  className="w-full"
                  required
                />
              </div>
              <div>
                <label htmlFor="low-stock" className="block font-medium">
                  Shell life (Days)
                </label>
                <InputText
                  name="shell_life"
                  value={product.shell_life.toString()}
                  onChange={(e) =>
                    handleProductChange("shell_life", e.target.value)
                  }
                  id="low-stock"
                  placeholder="Enter Shell life"
                  className="w-full"
                  required
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
