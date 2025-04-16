
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { AddProduct, Attribute, Variant } from ".";
import useUnitsOfMeasurement from "../../../../hooks/inventory/useUnitsOfMeasurement";


export default function AdvancedProductForm({
  product,
  handleProductChange,
}: {
  product: AddProduct;
  handleProductChange: <T extends keyof AddProduct>(
    key: T,
    value: AddProduct[T]
  ) => void;
  handleVariantChange: (
    index: number,
    key: keyof Variant,
    value: string
  ) => void;
  handleAttributeChange: (
    variantIndex: number,
    attributeIndex: number,
    key: keyof Attribute,
    value: number
  ) => void;
}) {

  const { data: uom, loading: uomLoading } = useUnitsOfMeasurement();

  // useEffect(() => {
  //   if (selectedVariation) {
  //     handleProductChange("variants", product.variants);
  //   }
  // }, [product.variants]);

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Inventory Section */}
          <Card title="Inventory">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="sku" className="block font-medium">
                  Standard Store Keeping Unit
                </label>
                <InputText
                  name="sku_unit"
                  onChange={(e) =>
                    handleProductChange("sku_unit", e.target.value)
                  }
                  placeholder="Enter SKU"
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

              {/* <div className="flex items-center">
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
              </div> */}
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

          {/* Variations Section */}
          {/* <Card title="Variations">
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
          </Card> */}
        </div>
      </div>

      {/* Modal for Attribute Selection */}
      {/* {selectedVariation && (
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
      )} */}
    </div>
  );
}
