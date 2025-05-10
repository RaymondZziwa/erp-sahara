import { useState } from "react";
import GeneralProductForm from "./GeneralProductForm";
import { Button } from "primereact/button";
import { INVENTORY_ENDPOINTS } from "../../../../api/inventoryEndpoints";
import { useParams } from "react-router-dom";
import axios from "axios";
import { baseURL } from "../../../../utils/api";
import useAuth from "../../../../hooks/useAuth";
import { handleGenericError } from "../../../../utils/errorHandling";
import { toast } from "react-toastify";

export interface AddProduct {
  item_category_id: string;
  unit_of_measure_id: string;
  currency_id: string;
  name: string;
  chart_of_account_id: string;
  item_type: string;
  cost_price: string;
  selling_price: string;
  vat: string;
  reference: string;
  barcode: string;
  stock_alert_level: string;
  sku_unit: string;
  has_expiry: "1" | "0";
  shell_life: string;
  description: string;
  variants: Variant[];
  item_images: File[];
  tax_class: string;
}

export interface Variant {
  sku: string;
  price: string;
  stock: string;
  attributes: Attribute[];
}

export interface Attribute {
  attribute_id: string;
  value_id: string;
}

export default function AddProduct() {
  const { itemId } = useParams();
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // @ts-ignore
  const [uploadProgress, setUploadProgress] = useState(0);
  // const [activeIndex, setActiveIndex] = useState(0);
  const [product, setProduct] = useState<AddProduct>({
    item_category_id: "",
    unit_of_measure_id: "",
    currency_id: "",
    name: "",
    chart_of_account_id: "",
    item_type: "physical",
    cost_price: "",
    selling_price: "",
    vat: "",
    reference: "",
    barcode: "",
    stock_alert_level: "",
    sku_unit: "",
    has_expiry: "1",
    shell_life: "",
    description: "",
    tax_class: "",
    variants: [],
    item_images: [],
  });

  // Handle changes to general product fields (level 1)
  const handleGeneralChange = <T extends keyof AddProduct>(
    key: T,
    value: AddProduct[T]
  ) => {
    setProduct({ ...product, [key]: value });
  };

  // Handle changes to attribute fields (level 3, inside a variant)
  const handleAttributeChange = (
    variantIndex: number,
    attributeIndex: number,
    key: keyof Attribute,
    value: number
  ) => {
    const updatedVariants = [...product.variants];
    updatedVariants[variantIndex].attributes[attributeIndex] = {
      ...updatedVariants[variantIndex].attributes[attributeIndex],
      [key]: value,
    };
    setProduct({ ...product, variants: updatedVariants });
  };

  const handleSave = async () => {
    setIsSubmitting(true);

    // Validation check for required fields (just an example)
    if (!product.name) {
      toast.warn("Product name is required!");
      setIsSubmitting(false);
      return;
    }
    const formData = new FormData();
    Object.entries(product).forEach(([key, value]) => {
      if (key !== "item_images" && key !== "variants" && value !== undefined) {
        // Convert value to string (for non-images fields)
        formData.append(key, value.toString());
      }
    });
    // Append images
    product.item_images.forEach((image) => {
      formData.append("item_images[]", image);
    });
    product.variants.map((variant) =>
      formData.append("variants[]", JSON.stringify(variant))
    );
    // formData.append("variants", JSON.stringify(product.variants));
    const method = itemId ? "PUT" : "POST";
    const endpoint = itemId
      ? INVENTORY_ENDPOINTS.ITEMS.UPDATE(itemId.toString())
      : INVENTORY_ENDPOINTS.ITEMS.ADD;

    try {
      const response = await axios({
        method,
        url: baseURL + endpoint,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token.access_token}`,
        },
        validateStatus: () => true,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      if (response.data.success) {
        toast.success("Product saved successfully!");
        setProduct({
          ...product,
          item_category_id: "",
          unit_of_measure_id: "",
          currency_id: "",
          name: "",
          chart_of_account_id: "",
          item_type: "physical",
          cost_price: "",
          selling_price: "",
          vat: "",
          reference: "",
          barcode: "",
          stock_alert_level: "",
          sku_unit: "",
          has_expiry: "1",
          shell_life: "",
          description: "",
          tax_class: "",
          variants: [],
          item_images: [],
        });
      } else {
        toast.error(response.data.message || "Failed to save product.");
      }
    } catch (error) {
      console.error("Error saving item", error);
      handleGenericError(error);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="bg-bg rounded">
      <div>
        <h4 className="text-xl font-bold my-3">Add Item</h4>
      </div>
      
      <div className="bg-bg">
        <GeneralProductForm
          handleAttributeChange={handleAttributeChange}
          handleProductChange={handleGeneralChange} // Using the general handler
          product={product}
        />
      </div>
      <div className="flex justify-between w-full">
        <div className="flex gap-2 w-full mx-4 my-2">
          <Button size="small" className="!bg-red-500">
            Cancel
          </Button>
          <Button loading={isSubmitting} onClick={handleSave} size="small">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
