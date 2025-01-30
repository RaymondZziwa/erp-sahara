import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import useItemAttributes from "../../../../hooks/inventory/useItemAttributes";
import { AddProduct, Attribute } from ".";
import { Dialog } from "primereact/dialog";

const VariationAttributesModal = ({
  variation: selectedVariation,
  isOpen,
  onClose,
  onAttributeChange,
  onAddAttribute,
  onDeleteVariation,
}: {
  onDeleteVariation: (index: number) => void;
  variation: {
    variationIndex: number;
    variation: AddProduct["variants"][0];
  };
  isOpen: boolean;
  onClose: () => void;
  onAttributeChange: (
    variantIndex: number,
    attributeIndex: number,
    key: keyof Attribute,
    value: number
  ) => void;
  onAddAttribute: (variationIndex: number) => void; // Function to add a new attribute field
}) => {
  const { data: attributes, loading: attributesLoading } = useItemAttributes();

  return (
    <Dialog
      visible={isOpen}
      onHide={onClose}
      header="Edit Variation Attributes"
      className="p-4 rounded-lg"
      style={{ width: "600px" }}
    >
      <div className="space-y-4">
        {/* Displaying the current attributes of the variation */}
        {selectedVariation?.variation.attributes.map((attribute, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Attribute
              </label>
              <Dropdown
                loading={attributesLoading}
                value={attribute.attribute_id}
                options={attributes?.map((attributeValue) => ({
                  label: attributeValue.name,
                  value: attributeValue.id,
                }))}
                onChange={(e) =>
                  onAttributeChange(
                    selectedVariation.variationIndex,
                    index,
                    "attribute_id",
                    e.value
                  )
                }
                placeholder="Select Attribute"
                className="w-full p-inputtext-sm"
              />
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Value
              </label>
              <Dropdown
                value={attribute.value_id}
                options={
                  attributes
                    .find((att) => att.id.toString() == attribute.attribute_id)
                    ?.values?.map((attributeValue) => ({
                      label: attributeValue.value,
                      value: attributeValue.id,
                    })) || []
                }
                onChange={(e) =>
                  onAttributeChange(
                    selectedVariation.variationIndex,
                    index,
                    "value_id",
                    e.value
                  )
                }
                placeholder="Select Value"
                className="w-full p-inputtext-sm"
              />
            </div>
            <div className="flex h-full justify-end flex-col">
              <Button
                icon="pi pi-trash"
                className="!p-button-danger !bg-red-500 w-12 h-12"
                onClick={() => onDeleteVariation(index)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Button to add more attributes */}
      <Button
        label="Add More Attribute"
        icon="pi pi-plus"
        className="p-button-outlined  mt-4 w-max"
        onClick={() => onAddAttribute(selectedVariation.variationIndex)} // Call the onAddAttribute function
      />

      {/* Save button at the bottom */}
      <div className="mt-4 flex justify-end">
        <Button
          label="Save"
          icon="pi pi-check"
          className="p-button-success"
          onClick={onClose} // Handle saving and closing the modal
        />
      </div>
    </Dialog>
  );
};

export default VariationAttributesModal;
