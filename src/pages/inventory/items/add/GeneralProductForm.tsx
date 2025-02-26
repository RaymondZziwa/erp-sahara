import { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { RadioButton } from "primereact/radiobutton";
import { Dropdown } from "primereact/dropdown";
import { Card } from "primereact/card";
import { FileUpload } from "primereact/fileupload";
import { AddProduct } from ".";
import useItemCategories from "../../../../hooks/inventory/useCategories";
import { Link } from "react-router-dom";
import useCurrencies from "../../../../hooks/procurement/useCurrencies";
import useChartOfAccounts from "../../../../hooks/accounts/useChartOfAccounts";
import { Checkbox } from "primereact/checkbox";
import useUnitsOfMeasurement from "../../../../hooks/inventory/useUnitsOfMeasurement";
import VariationAttributesModal from "./VariationsAttributesModal";
interface Attribute {
  attribute_id: string;
  value_id: string;
}

export default function GeneralProductForm({
  product,
  handleProductChange,
  handleAttributeChange,
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
  const [discountType, setDiscountType] = useState("no-discount");
  const [selectedVariation, setSelectedVariation] = useState<{
    variationIndex: number;
    variation: AddProduct["variants"][0];
  } | null>(null);

  const { data: categories, loading: categoriesLoading } = useItemCategories();
  const { data: currencies, loading: currenciesLoading } = useCurrencies();
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    handleProductChange(name as keyof AddProduct, value);
  };

  const productTypeOptions = [
    { label: "Physical", value: "physical" },
    { label: "Service", value: "service" },
    { label: "Raw Material", value: "raw_material" },
    { label: "Semi-Finished", value: "semi_finished" },
    { label: "Finished Good", value: "finished_good" },
    { label: "Asset", value: "asset" },
    { label: "Consumable", value: "consumable" },
    { label: "Digital Good", value: "digital_good" },
    { label: "Subscriptions", value: "subscriptions" },
  ];
  const { data: uom, loading: uomLoading } = useUnitsOfMeasurement();

  const { data: accounts, loading: accountsLoading } = useChartOfAccounts();

  // Function to update variation fields (e.g. price, stock, sku)
  const handleVariationChange = (
    index: number,
    field: string,
    value: string | any
  ) => {
    handleProductChange("variants", [
      ...product.variants.map((variation, i) => {
        if (i === index) {
          return { ...variation, [field]: value };
        }
        return variation;
      }),
    ]);
  };

  // Function to add a new variation
  const addVariation = () => {
    const newVariation = { sku: "", price: "", stock: "", attributes: [] };
    handleProductChange("variants", [...product.variants, newVariation]);
  };

  // Function to remove a variation by index
  const removeVariation = (index: number) => {
    handleProductChange(
      "variants",
      product.variants.filter((_, i) => i !== index)
    );
  };

  // Function to add a new attribute to a specific variation
  const handleAddAttribute = (variationIndex: number) => {
    console.log(variationIndex);

    handleProductChange("variants", [
      ...product.variants.map((variation, idx) => {
        if (idx === variationIndex) {
          return {
            ...variation,
            attributes: [
              ...variation.attributes,
              { attribute_id: "", value_id: "" }, // Add a new empty attribute
            ],
          };
        }
        return variation;
      }),
    ]);
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
            <div className=" space-y-6">
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

          <Card>
            <div className="font-bold text-xl my-2">
              <h3>Media</h3>
            </div>
            <div className="space-y-4">
              {/* File Upload Component */}
              <div className="  rounded-lg p-6 text-center">
                <FileUpload
                  onUpload={(e) => handleProductChange("images", e.files)}
                  multiple
                  name="thumbnail"
                  customUpload
                  auto
                  accept="image/*"
                  maxFileSize={10000000000000}
                  emptyTemplate={
                    <div className="p-4 border-2 border-dashed text-center">
                      <i className="pi pi-image text-lg"></i>
                      <p>
                        Upload your product images. Only *.png, *.jpg, and
                        *.jpeg image files are accepted.
                      </p>
                    </div>
                  }
                />
              </div>
            </div>
          </Card>

          {/* Pricing Section */}
          <Card>
            <div className="font-bold text-xl my-2">
              <h3>Pricing</h3>
            </div>
            <div className=" space-y-6">
              <div className="space-y-2">
                <label htmlFor="base-price">
                  Cost Price <span className="text-red-500">*</span>
                </label>
                <InputNumber
                  id="base-price"
                  placeholder="Product price"
                  mode="decimal"
                  className="w-full"
                  name="cost_price"
                  //@ts-expect-error
                  value={product.cost_price}
                  onChange={(e) =>
                    handleProductChange("cost_price", e.value?.toString()!)
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
                  mode="decimal"
                  className="w-full"
                  name="selling_price"
                  //@ts-expect-error
                  value={product.selling_price}
                  onChange={(e) =>
                    handleProductChange("selling_price", e.value?.toString()!)
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Set the product Sale price.
                </p>
              </div>

              <div className="space-y-2">
                <label>Discount Type</label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioButton
                      value="no-discount"
                      id="no-discount"
                      name="discountType"
                      checked={discountType === "no-discount"}
                      onChange={(e) => setDiscountType(e.value)}
                    />
                    <label htmlFor="no-discount">No Discount</label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioButton
                      value="percentage"
                      id="percentage"
                      name="discountType"
                      checked={discountType === "percentage"}
                      onChange={(e) => setDiscountType(e.value)}
                    />
                    <label htmlFor="percentage">Percentage %</label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioButton
                      value="fixed"
                      id="fixed"
                      name="discountType"
                      checked={discountType === "fixed"}
                      onChange={(e) => setDiscountType(e.value)}
                    />
                    <label htmlFor="fixed">Fixed Price</label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="tax-class">
                    Currency <span className="text-red-500">*</span>
                  </label>
                  <Dropdown
                    loading={currenciesLoading}
                    id="tax-class"
                    value={product.currency_id}
                    onChange={(e) =>
                      handleProductChange("currency_id", e.value)
                    }
                    options={currencies.map((curr) => ({
                      label: curr.name,
                      value: curr.id,
                    }))}
                    className="w-full"
                    placeholder="Select an option"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="vat">
                    VAT Amount (%) <span className="text-red-500">*</span>
                  </label>
                  <InputNumber
                    max={100}
                    // @ts-ignore
                    value={product.vat}
                    name="vat"
                    onChange={(e) =>
                      handleProductChange("vat", e.value?.toString()!)
                    }
                    id="vat"
                    mode="decimal"
                    placeholder="Set the product VAT about."
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <div className="font-bold text-xl my-2">
              <h3>Chart of Account</h3>
            </div>
            <div className=" space-y-2">
              <Dropdown
                filter
                loading={accountsLoading}
                value={product.chart_of_account_id}
                onChange={(e) =>
                  handleProductChange("chart_of_account_id", e.value)
                }
                options={accounts.map((acc) => ({
                  label: acc.name,
                  value: acc.id,
                }))}
                className="w-full"
                placeholder="Select Account"
              />
              <p className="text-sm text-muted-foreground">Set the account.</p>
            </div>
          </Card>

          {/* Product Details */}
          <Card>
            <div className="font-bold text-xl my-2">
              <h3>Product Details</h3>
            </div>
            <div className=" space-y-6">
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
                  <Button className="w-full ">
                    <i className="pi  pi-plus h-4 w-4 mr-2"></i>
                    Create New Category
                  </Button>
                </Link>
              </div>
              <div className="space-y-2">
                <label>Product Type</label>
                <Dropdown
                  filter
                  onChange={(e) => handleProductChange("item_type", e.value)}
                  value={product.item_type}
                  options={productTypeOptions.map((cat) => ({
                    label: cat.label,
                    value: cat.value,
                  }))}
                  className="w-full"
                  placeholder="Select an option"
                />
              </div>
            </div>
          </Card>
          {/* Inventory Section */}
          <Card title="Inventory">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <label htmlFor="sku" className="block font-medium">
                  SKU
                </label>
                <InputText
                  name="sku_unit"
                  onChange={(e) =>
                    handleProductChange("sku_unit", e.target.value)
                  }
                  placeholder="Select Size"
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
                  filter
                  loading={uomLoading}
                  value={product.unit_of_measure_id}
                  options={uom.map((item) => ({
                    label: item.name,
                    value: item.id,
                  }))}
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

              <div className="flex items-center">
                <Checkbox
                  checked={product.has_expiry === "1"}
                  inputId="backorders"
                  onChange={() =>
                    handleProductChange(
                      "has_expiry",
                      product.has_expiry === "1" ? "0" : "1"
                    )
                  }
                />
                <label htmlFor="backorders" className="ml-2">
                  Has expiry?
                </label>
              </div>
              <small className="text-muted block mt-1">
                Enable this option to allow orders when stock is out.
              </small>

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
                />
                <small className="text-muted block mt-1">
                  Set a quantity to trigger a low stock notification.
                </small>
              </div>
            </div>
          </Card>
        </div>
      </div>
      {/* Variations Section */}
      <Card title="Variations" className="mt-4">
        <div className="space-y-4">
          {product.variants.map((variation, index) => (
            <div key={index} className="flex items-center gap-4">
              <InputText
                value={variation.sku}
                name="sku_unit"
                onChange={(e) =>
                  handleVariationChange(index, "sku", e.target.value)
                }
                placeholder="Enter sku"
                className="w-1/4"
              />
              <Button
                size="small"
                onClick={() => {
                  setSelectedVariation({
                    variation,
                    variationIndex: index,
                  });
                }}
                className="flex text-nowrap"
                label={`${variation.attributes.length} Attributes`}
                icon="pi pi-plus"
              />

              <InputText
                value={variation.price}
                onChange={(e) =>
                  handleVariationChange(index, "price", e.target.value)
                }
                placeholder="Price"
                className="w-1/4"
              />
              <InputText
                value={variation.stock}
                onChange={(e) =>
                  handleVariationChange(index, "stock", e.target.value)
                }
                placeholder="Stock"
                className="w-1/4"
              />

              <Button
                icon="pi pi-trash"
                className="!p-button-danger !bg-red-500"
                onClick={() => removeVariation(index)}
              />
            </div>
          ))}
          <Button
            label="Add Another Variation"
            icon="pi pi-plus"
            className="p-button-outlined"
            onClick={addVariation}
          />
        </div>
      </Card>
      {/* Modal for Attribute Selection */}
      {selectedVariation && (
        <VariationAttributesModal
          onDeleteVariation={(index) => {
            handleProductChange("variants", [
              ...product.variants.map((variation, idx) => {
                if (idx === selectedVariation.variationIndex) {
                  return {
                    ...variation,
                    attributes: [
                      ...variation.attributes.filter((_, i) => i !== index),
                    ],
                  };
                }
                return variation;
              }),
            ]);
          }}
          variation={{
            variation: product.variants[selectedVariation.variationIndex],
            variationIndex: selectedVariation.variationIndex,
          }}
          onClose={() => setSelectedVariation(null)}
          isOpen={!!selectedVariation}
          onAttributeChange={handleAttributeChange}
          onAddAttribute={handleAddAttribute}
        />
      )}
    </div>
  );
}
