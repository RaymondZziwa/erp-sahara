import React, { useState } from "react";
import { Icon } from "@iconify/react";

import ConfirmDeleteDialog from "../../../components/dialog/ConfirmDeleteDialog";
import BreadCrump from "../../../components/layout/bread_crump";
import AddOrModifyItem from "./AddOrModifyItem";

import { INVENTORY_ENDPOINTS } from "../../../api/inventoryEndpoints";
import useItemAttributes from "../../../hooks/inventory/useItemAttributes";
import {
  ItemAttribue,
  ItemAttributeValue,
} from "../../../redux/slices/types/inventory/Attribute";
import useItemAttributeValues from "../../../hooks/inventory/useItemAttributesValues";
import AddOrModifyAttributeValue from "./AddOrModifyAttributeValue";
import { toast } from "react-toastify";
import axios from "axios";
import { baseURL } from "../../../utils/api";
import { RootState } from "../../../redux/store";
import { useSelector } from "react-redux";

const ItemAttributes: React.FC = () => {
  const { data: categories, refresh } = useItemAttributes();
  const token = useSelector((state: RootState) => state.userAuth.token)
  const [dialogState, setDialogState] = useState<{
    selectedItem: ItemAttribue | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });
  const [attributeValueDialogState, setAttributeValueDialogState] = useState<{
    selectedItem: ItemAttributeValue | undefined;
    currentAction: "delete" | "edit" | "add" | "";
  }>({ selectedItem: undefined, currentAction: "" });

  const {
    data: attributeValues,
    loading: attributeValuesLoading,
    refresh: refreshAttributeValues,
  } = useItemAttributeValues({
    attributeId: dialogState.selectedItem?.id?.toString() ?? "",
  });

  const openAddOrEditDialog = (action: "add" | "edit", item?: ItemAttribue) => {
    setDialogState({
      selectedItem: item,
      currentAction: action,
    });
  };

  const openDeleteDialog = (item: ItemAttribue) => {
    setDialogState({
      selectedItem: item,
      currentAction: "delete",
    });
  };

  const deleteAttribute = async (id: any) => {
    const method = "DELETE";
    const endpoint = id
      && INVENTORY_ENDPOINTS.ITEM_ATTRIBUTE_VALUES.DELETE(id.toString())

    try {
      await axios({
        method,
        url: baseURL + endpoint,
        headers: {
          "Content-Type": "multipart/json",
          Authorization: `Bearer ${token.access_token}`,
        },
      });
    } catch (error) {
      console.error("Error saving item", error);
      // Handle error here
    } 
  }

  return (
    <div>
      {/* Add/Edit Dialog */}
      <AddOrModifyItem
        onSave={refresh}
        item={dialogState.selectedItem}
        visible={
          dialogState.currentAction === "add" ||
          (dialogState.currentAction === "edit" &&
            !!dialogState.selectedItem?.id)
        }
        onClose={() =>
          setDialogState({ currentAction: "", selectedItem: undefined })
        }
      />
      {/* Add/Edit Dialog */}
      {
        <AddOrModifyAttributeValue
          attributeId={dialogState.selectedItem?.id.toString()!}
          onSave={() => {
            refresh();
            refreshAttributeValues();
          }}
          item={attributeValueDialogState.selectedItem}
          visible={
            attributeValueDialogState.currentAction === "add" ||
            (attributeValueDialogState.currentAction === "edit" &&
              !!attributeValueDialogState.selectedItem?.id)
          }
          onClose={() =>
            setAttributeValueDialogState({
              currentAction: "",
              selectedItem: undefined,
            })
          }
        />
      }

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        apiPath={INVENTORY_ENDPOINTS.ITEM_ATTRIBUTES.DELETE(
          dialogState.selectedItem?.id?.toString() ?? ""
        )}
        onClose={() =>
          setDialogState({ currentAction: "", selectedItem: undefined })
        }
        visible={
          dialogState.currentAction === "delete" &&
          !!dialogState.selectedItem?.id
        }
        onConfirm={() => {
          refresh();
          refreshAttributeValues();
        }}
      />

      {/* Breadcrumb */}
      <BreadCrump name="ItemAttribues" pageName="ItemAttribues" />

      <div className="bg-white px-6 py-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Manage Attributes</h1>
          <button
            onClick={() => openAddOrEditDialog("add")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Icon icon="solar:add-circle-bold" fontSize={20} />
            Add Attribute
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Panel: Select an Attribute */}
          <div className="border rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-medium mb-4">Select Attribute</h2>

            {categories.length > 0 ? (
              <ul className="space-y-4">
                {categories.map((cat) => (
                  <li
                    key={cat.id}
                    className={`flex justify-between items-center p-3 cursor-pointer rounded-lg ${
                      dialogState.selectedItem?.id === cat.id
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                    onClick={() => {
                      if (dialogState.selectedItem?.id !== cat.id) {
                        setDialogState({
                          selectedItem: cat,
                          currentAction: "",
                        });
                      }
                    }}
                  >
                    <span>{cat.name}</span>
                    <div className="flex gap-2">
                      {/* Edit Button */}

                      <Icon
                        icon="meteor-icons:pencil"
                        className="text-blue-500 hover:text-blue-600 cursor-pointer"
                        fontSize={18}
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddOrEditDialog("edit", cat);
                        }}
                      />
                      {/* Delete Button */}
                      <Icon
                        icon="solar:trash-bin-trash-bold"
                        className="text-red-500 hover:text-red-600 cursor-pointer"
                        fontSize={18}
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(cat);
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">
                No attributes found. Add a new one!
              </p>
            )}
          </div>

          {/* Right Panel: Display Values of Selected Attribute */}
          <div className="border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium mb-4">
                {dialogState.selectedItem
                  ? `Values for "${dialogState.selectedItem.name}"`
                  : "Select an Attribute to View Its Values"}
              </h2>
              <button
                disabled={!dialogState.selectedItem}
                onClick={() => {
                  if (!dialogState.selectedItem) {
                    return toast.warn("Select Attribute first");
                  }
                  setAttributeValueDialogState({
                    currentAction: "add",
                    selectedItem: undefined,
                  });
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded flex items-center gap-2"
              >
                <Icon icon="solar:add-circle-bold" fontSize={20} />
                Add value
              </button>
            </div>
            {attributeValuesLoading ? (
              <p>Loading values...</p>
            ) : attributeValues?.length > 0 ? (
              <ul className="space-y-2">
                {attributeValues.map((value) => (
                  <li
                    key={value.id}
                    className="bg-gray-100 hover:bg-gray-200 rounded p-2 text-gray-800 flex justify-between"
                  >
                    <h4>{value.value}</h4>
                    <div className="flex gap-1">
                      <Icon
                        icon="meteor-icons:pencil"
                        className="text-blue-500 hover:text-blue-600 cursor-pointer"
                        fontSize={18}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAttributeValueDialogState({
                            currentAction: "edit",
                            selectedItem: value,
                          });
                        }}
                      />
                      <Icon
                        icon="solar:trash-bin-trash-bold"
                        className="text-red-500 hover:text-red-600 cursor-pointer"
                        fontSize={18}
                        onClick={()=>deleteAttribute(value.id)}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No values available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemAttributes;
