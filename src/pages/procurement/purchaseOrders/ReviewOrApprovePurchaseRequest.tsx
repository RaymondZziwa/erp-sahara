import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { InputTextarea } from "primereact/inputtextarea";
import { useState } from "react";
import { PurchaseRequest } from "../../../redux/slices/types/procurement/PurchaseRequests";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import { Column } from "primereact/column";

const ReviewOrApprovePurchaseRequest = ({
  purchaseRequest,
  onClose,
  onRefresh,
  action,
}: {
  purchaseRequest?: PurchaseRequest;
  onClose: () => void;
  onRefresh: () => void;
  action: "approve" | "review";
}) => {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleAction = async (status: "reviewed" | "rejected") => {
    setLoading(true);

    const endpoint =
      action === "approve"
        ? "/procurement/purchase_requests/approve"
        : "/procurement/purchase_requests/review";

    const data =
      action === "approve" && status !== "rejected"
        ? {
            purchase_request_id: purchaseRequest?.id,
            status: "approved",
            approval_comment: comment,
            items: purchaseRequest?.purchase_request_items?.map((item) => ({
              item_id: item.id,
              approved_quantity: item.quantity,
              unit_price_estimate: item.unit_price_estimate,
              currency_id: item.currency_id,
              notes: item.notes,
            })),
          }
        : {
            purchase_request_id: purchaseRequest?.id,
            status,
            review_comment: comment,
            rejected_comment: status === "rejected" ? comment : undefined,
          };

    await createRequest(endpoint, token.access_token, data, onRefresh, "POST");

    setComment("");
    setLoading(false);
  };

  return (
    <Dialog
      header={`${action === "review" ? "Review" : "Approve"} Purchase Request`}
      visible={!!purchaseRequest?.id}
      onHide={onClose}
      className="w-full md:w-2/3 lg:w-1/2"
    >
      {purchaseRequest ? (
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">{purchaseRequest.name}</h2>
          <div className="mb-4 space-y-2">
            <div className="flex border-b py-2">
              <span className="font-semibold w-1/3">Request Date</span>
              <span>{purchaseRequest.request_date}</span>
            </div>
            <div className="flex border-b py-2">
              <span className="font-semibold w-1/3">Status</span>
              <span>{purchaseRequest.status}</span>
            </div>
            <div className="flex border-b py-2">
              <span className="font-semibold w-1/3">Requested By</span>
              <span>{purchaseRequest.requested_by}</span>
            </div>
            <div className="flex border-b py-2">
              <span className="font-semibold w-1/3">Request Comment</span>
              <span>{purchaseRequest.request_comment || "N/A"}</span>
            </div>
            {purchaseRequest.reviewer_comment && (
              <div className="flex border-b py-2">
                <span className="font-semibold w-1/3">Review Comment</span>
                <span>{purchaseRequest.reviewer_comment || "N/A"}</span>
              </div>
            )}
          </div>

          <DataTable
            value={purchaseRequest.purchase_request_items}
            className="mb-4"
          >
            <Column field="item.name" header="Item" className="text-sm" />
            <Column field="quantity" header="Quantity" className="text-sm" />
            <Column
              field="unit_price_estimate"
              header="Unit Price"
              className="text-sm"
            />
            <Column
              field="total_price_estimate"
              header="Total Price"
              className="text-sm"
            />
          </DataTable>

          <div className="mb-4">
            <label htmlFor="comment" className="font-semibold">
              {action === "approve" ? "Approval" : "Review"} Comment:
            </label>
            <InputTextarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full mt-2"
              placeholder="Add your comment here..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              label="Reject"
              className="p-button-danger"
              icon="pi pi-times"
              onClick={() => handleAction("rejected")}
              loading={loading}
            />
            <Button
              label="Approve"
              className="p-button-success"
              icon="pi pi-check"
              onClick={() => handleAction("reviewed")}
              loading={loading}
            />
          </div>
        </div>
      ) : (
        <p className="p-4">No purchase request selected.</p>
      )}
    </Dialog>
  );
};

export default ReviewOrApprovePurchaseRequest;
