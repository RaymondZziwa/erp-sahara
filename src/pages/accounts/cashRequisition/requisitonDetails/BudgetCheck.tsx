import { useState } from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { ProgressBar } from "primereact/progressbar";
import { InputNumber } from "primereact/inputnumber";
import {
  CashRequisition,
  Cashrequisitionitem,
} from "../../../../redux/slices/types/accounts/cash_requisitions/CashRequisition";
import useCashRequisitions from "../../../../hooks/accounts/cash_requisitions/useCashRequsitions";
import { formatCurrency } from "../../../../utils/formatCurrency";
import { Chip } from "primereact/chip";
import { InputTextarea } from "primereact/inputtextarea";
import StatusChips from "../../../../components/chips/StatusChips";
import { ACCOUNTS_ENDPOINTS } from "../../../../api/accountsEndpoints";
import useAuth from "../../../../hooks/useAuth";
import { createRequest } from "../../../../utils/api";
import { ProgressSpinner } from "primereact/progressspinner";
import useApprovalLevels from "../../../../hooks/accounts/cash_requisitions/useApprovalLevels";
enum RequisitionStatus {
  Pending = "pending",
  Approved = "approved",
  Fully_Approved = "fully_approved",
  Declined = "declined",
  Disbursed = "disbursed",
}
interface ApproveRequsition {
  comment: string;
  approver_id: number;
  items: string | Item[];
}

interface Item {
  item_id: number;
  status: string;
  approved_amount: number;
  comments: string;
}

export default function BudgetCheck({
  requisition,
}: {
  requisition: CashRequisition;
}) {
  const budgetId = requisition?.budget_id;
  const { data: requisitions, refresh } = useCashRequisitions();
  const { data: approvalLevels } = useApprovalLevels();

  const budgetRequsitions = requisitions.filter(
    (req) => budgetId !== null && req.budget_id == budgetId
  );
  const [selectedRequisition, setSelectedRequisition] =
    useState<CashRequisition | null>(null);
  const [budgetCheckDialogVisible, setBudgetCheckDialogVisible] =
    useState(false);
  const [updatedItems, setUpdatedItems] = useState<Cashrequisitionitem[]>([]);
  const [comment, setComment] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<Cashrequisitionitem[]>([]);
  const [loading, setLoading] = useState(false);

  const actionBodyTemplate = (rowData: CashRequisition) => {
    return (
      <Button
        icon="pi pi-check"
        className="p-button-rounded p-button-success p-button-text !bg-green-500"
        onClick={() => openBudgetCheckDialog(rowData)}
      />
    );
  };

  const openBudgetCheckDialog = (requisition: CashRequisition) => {
    setSelectedRequisition(requisition);
    setBudgetCheckDialogVisible(true);
    setUpdatedItems(requisition.cash_requisition_items);

    setComment("");
  };
  const handleAmountChange = (itemId: number, value: string) => {
    setUpdatedItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, approved_amount: value } : item
      )
    );
  };

  const { user, token } = useAuth();
  const handleAction = async (
    action: "approve" | "reject" | "delete" | "disburse"
  ) => {
    setLoading(true);
    const endpointMap: Record<string, Function> = {
      approve: ACCOUNTS_ENDPOINTS.CASH_REQUISITIONS.APPROVE,
      reject: ACCOUNTS_ENDPOINTS.CASH_REQUISITIONS.REJECT,
      disburse: ACCOUNTS_ENDPOINTS.CASH_REQUISITIONS.DISBURSE,
      delete: ACCOUNTS_ENDPOINTS.CASH_REQUISITIONS.DELETE,
    };

    const endpoint = endpointMap[action](requisition.id.toString());
    const data: ApproveRequsition = {
      approver_id: user.id,
      comment: comment,
      items: [],
    };

    if (action !== "delete") {
      data.comment = comment; // Only add comment for approve, reject, or disburse actions
      data.items = updatedItems
        .filter((item) => item.approved_amount && +item.approved_amount >= 0)
        .map((item) => ({
          approved_amount: item.approved_amount ? +item.approved_amount : 0,
          comments: "",
          item_id: item.id,
          status: action === "approve" ? "approved" : "rejected",
        })); // Add updated items if not deleting
    }

    try {
      await createRequest(endpoint, token.access_token, data, refresh, "POST");
    } catch (error) {
      console.error("Error performing action:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Budget {requisition?.budget ? `(${requisition.budget.name})` : ""}{" "}
        Requisitions
      </h1>
      {requisition?.current_approval_level && (
        <div className="my-2">
          <h4 className="text-md font-medium">Current Approval level</h4>
          <ProgressBar
            value={
              (+requisition.current_approval_level / approvalLevels.length) *
              100
            }
          />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {budgetRequsitions.map((req) => (
          <Card
            key={req.id}
            title={`${req.title} requisition`}
            className="mb-0"
          >
            {req.budget ? (
              <ProgressBar
                value={
                  (+req.total_amount / +req?.budget?.allocated_amount) * 100
                }
              />
            ) : (
              <Chip label="No budget to this req" />
            )}
            <div className="mt-2 flex justify-between">
              <span>
                Approved: {formatCurrency(+req.approved_total_amount)}
              </span>
              <span>Total: {formatCurrency(+req.total_amount)}</span>
            </div>
          </Card>
        ))}
      </div>
      <Card title={requisition.budget?.name + " requsitions"}>
        <DataTable
          selection={requisition}
          selectionMode={"single"}
          header={"All Requisitions under this Budget"}
          title="Other Req"
          value={budgetRequsitions}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 20]}
          className="p-datatable-sm"
        >
          <Column field="id" header="ID" sortable></Column>
          <Column field="title" header="Item" sortable></Column>

          <Column
            field="total_amount"
            header="Total Cost"
            sortable
            body={(rowData) => formatCurrency(rowData.total_amount)}
          ></Column>
          <Column
            field="status"
            header="Status"
            sortable
            body={(rowData: CashRequisition) => (
              <StatusChips
                status={
                  rowData.status.toLowerCase() === "pending"
                    ? "Pending"
                    : rowData.status === "approved"
                    ? "Approved"
                    : rowData.status === "partially_approved"
                    ? "Partially Approved"
                    : rowData.status === "rejected"
                    ? "Rejected"
                    : rowData.status === "fully_approved"
                    ? "Approved"
                    : "Unknown"
                }
              />
            )}
          ></Column>
          <Column
            field="status"
            header="Approval level"
            sortable
            body={(rowData: CashRequisition) =>
              `${rowData.current_approval_level} / ${approvalLevels.length}`
            }
          ></Column>

          <Column
            header="Action"
            body={actionBodyTemplate}
            exportable={false}
            style={{ width: "10%" }}
          ></Column>
        </DataTable>
      </Card>

      <Dialog
        header={`Approve/Reject  ${requisition.title}`}
        visible={budgetCheckDialogVisible}
        style={{ width: "60vw" }}
        onHide={() => setBudgetCheckDialogVisible(false)}
        footer={
          <div className="flex justify-end mt-4 space-x-2">
            {loading ? (
              <ProgressSpinner
                style={{ width: "50px", height: "50px" }}
                strokeWidth="3"
                fill="var(--surface-ground)"
                animationDuration=".8s"
              />
            ) : (
              <div className="grid md:flex gap-2">
                <Button
                  size="small"
                  label="Approve"
                  icon="pi pi-check"
                  className={` ${
                    requisition.status == RequisitionStatus.Approved
                      ? "hidden"
                      : "block"
                  } `}
                  onClick={() => handleAction("approve")}
                />
                <Button
                  className={` ${
                    requisition.status == RequisitionStatus.Approved
                      ? "hidden"
                      : "block"
                  } !bg-red-400`}
                  size="small"
                  label="Reject"
                  icon="pi pi-times"
                  severity="danger"
                  onClick={() => handleAction("reject")}
                />
                <Button
                  disabled={requisition.status !== RequisitionStatus.Approved}
                  size="small"
                  label="Disburse"
                  icon="pi pi-dollar"
                  className={` ${
                    requisition.status == RequisitionStatus.Approved
                      ? "block"
                      : "hidden"
                  } !bg-orange-500`}
                  onClick={() => handleAction("disburse")}
                />
                <Button
                  disabled={requisition.status == RequisitionStatus.Approved}
                  size="small"
                  label="Delete"
                  icon="pi pi-trash"
                  severity="danger"
                  className={` ${
                    requisition.status == RequisitionStatus.Approved
                      ? "hidden"
                      : "block"
                  } !bg-red-500`}
                  onClick={() => handleAction("delete")}
                />
              </div>
            )}
          </div>
        }
      >
        {selectedRequisition && (
          <div className="space-y-4">
            <>
              {/* Requisition Items DataTable */}
              <DataTable
                // scrollable
                size="small"
                value={updatedItems}
                className="mt-6 max-w-screen-sm md:max-w-screen-2xl"
                header="Requisition Items"
                selectionMode="multiple"
                selection={selectedItems}
                onSelectionChange={(e) => setSelectedItems(e.value)}
              >
                <Column
                  selectionMode="multiple"
                  headerStyle={{ width: "3em" }}
                />
                <Column field="item_name" header="Name" />
                <Column field="quantity" header="Quantity" />
                <Column
                  field="unit_cost"
                  header="Unit Price"
                  body={(rowData) => `${rowData.unit_cost}`}
                />
                <Column
                  field="total_price"
                  header="Total Price"
                  body={(rowData) => `${rowData.total_price}`}
                />
                <Column
                  field="approved_amount"
                  header="Total Amount"
                  body={(rowData: Cashrequisitionitem) => {
                    return (
                      <span>
                        {+rowData.unit_cost * +rowData.quantity || "N/A"}
                      </span>
                    );
                  }}
                />
                <Column
                  field="approval_status"
                  header="Status"
                  body={(rowData: Cashrequisitionitem) => (
                    <div>
                      <StatusChips
                        status={
                          rowData.approval_status.toLowerCase() === "pending"
                            ? "Pending"
                            : rowData.approval_status === "approved"
                            ? "Approved"
                            : rowData.approval_status === "partially_approved"
                            ? "Partially Approved"
                            : rowData.approval_status === "rejected"
                            ? "Rejected"
                            : rowData.approval_status === "fully_approved"
                            ? "Approved"
                            : "Unknown"
                        }
                      />
                    </div>
                  )}
                />
                <Column
                  field="approved_amount"
                  header="Approved Amount"
                  body={(rowData) => {
                    return rowData.approval_status.toLowerCase() ===
                      RequisitionStatus.Pending ? (
                      <InputNumber
                        type="text"
                        value={rowData.approved_amount || ""}
                        onChange={(e) =>
                          handleAmountChange(
                            rowData.id,
                            e.value ? e.value?.toString() : ""
                          )
                        }
                        placeholder="Enter approved amount"
                      />
                    ) : (
                      <span>{rowData.approved_amount || "N/A"}</span>
                    );
                  }}
                />

                <Column
                  header="Comment"
                  body={(rowData: Cashrequisitionitem) => (
                    <input
                      type="text"
                      className="p-inputtext"
                      placeholder="Add a comment"
                      onChange={(e) => {
                        console.log(
                          `Comment for ${rowData.item_name}: ${e.target.value}`
                        );
                        // Optionally update comments state here
                      }}
                    />
                  )}
                />
              </DataTable>
              {/* Budget and Project Information */}
            </>
            {selectedRequisition && (
              <div>
                <h4 className="text-md font-medium">Req Budget</h4>
                <ProgressBar
                  value={
                    (+selectedRequisition!.approved_total_amount /
                      +selectedRequisition?.total_amount) *
                    100
                  }
                />
                <div className="mt-2 flex justify-between">
                  <span>
                    Used:{" "}
                    {formatCurrency(selectedRequisition!.approved_total_amount)}
                  </span>
                  <span>
                    Total: {formatCurrency(selectedRequisition!.total_amount)}
                  </span>
                </div>
              </div>
            )}
            {selectedRequisition.current_approval_level && (
              <div>
                <h4 className="text-md font-medium">Approval level</h4>
                <ProgressBar
                  value={
                    (+selectedRequisition!.current_approval_level /
                      approvalLevels.length) *
                    100
                  }
                />
              </div>
            )}
            <div>
              <label
                htmlFor="comment"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Additional Comment (if needed)
              </label>
              <InputTextarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
