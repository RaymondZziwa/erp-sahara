import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useState, useEffect } from "react";
import { PurchaseRequest } from "../../../redux/slices/types/procurement/PurchaseRequests";
import { baseURL, createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import useCurrencies from "../../../hooks/procurement/useCurrencies";

const ReviewOrApprovePurchaseRequest = ({
  purchaseRequest,
  onClose,
  onRefresh,
  action,
}: {
  purchaseRequest?: PurchaseRequest;
  onClose: () => void;
  onRefresh: () => void;
  action: "approve" | "view";
}) => {
  const [comment, setComment] = useState("");
  const [approvalComment, setApprovalComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState(purchaseRequest?.items || []);
  const [approvedItems, setApprovedItems] = useState<any[]>([]);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const { token } = useAuth();
  const { data: currencies } = useCurrencies();

  useEffect(() => {
    const initialItems = purchaseRequest?.items || [];
    setItems(initialItems);
    setApprovedItems(initialItems.map((item) => item.id));
  }, [purchaseRequest]);

  const handleAction = async (status: "approved" | "rejected") => {
    setLoading(true);
    try {
      const endpoint = `/procurement/purchase_requests/${purchaseRequest?.id}/${
        status === "approved" ? "approve" : "reject"
      }`;

      const data = {
        remarks: status === "approved" ? approvalComment : comment,
        ...(status === "approved" && {
          items: items
            .filter((item) => approvedItems.includes(item.id))
            .map((item) => ({
              purchase_request_item_id: item.id,
              remarks: item.notes || "",
              quantity: item.quantity,
              approved_cost_estimate: item.estimated_unit_price,
              comments: approvalComment,
              preferred_supplier_id: item.preferred_supplier_id || "",
            })),
        }),
        ...(status === "rejected" && {
          rejection_reason: approvalComment,
        }),
      };

      await createRequest(
        endpoint,
        token.access_token,
        data,
        onRefresh,
        "POST"
      );
      setApprovalComment("");
      setShowApproveModal(false);
      onClose();
    } catch (error) {
      console.error("Error handling action:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    setLoading(true);
    try {
      const pdfUrl = `/procurement/purchase_requests/${purchaseRequest?.id}/pdf`;
      const response = await fetch(`${baseURL}${pdfUrl}`, {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `purchase_request_${purchaseRequest?.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  const onEditorValueChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string,
    index: number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: e.target.value };
    setItems(newItems);
  };

  const toggleItemApproval = (itemId: number) => {
    setApprovedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };
  return (
    <>
      <Dialog
        header={`${action === "approve" ? "Approve" : "View"} Purchase Request`}
        visible={!!purchaseRequest?.id}
        onHide={onClose}
        className="w-full md:max-w-6xl"
      >
        {purchaseRequest ? (
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">
              {purchaseRequest.title || purchaseRequest.name}
            </h2>
            <div className="mb-4 space-y-2">
              <div className="flex border-b py-2">
                <span className="font-semibold w-1/3">Request Date</span>
                <span>{purchaseRequest.request_date}</span>
              </div>
              <div className="flex border-b py-2">
                <span className="font-semibold w-1/3">Status</span>
                <span
                  className={`font-semibold ${
                    purchaseRequest.status === "Approved"
                      ? "text-green-500"
                      : purchaseRequest.status === "Rejected"
                      ? "text-red-500"
                      : "text-yellow-500"
                  }`}
                >
                  {purchaseRequest.status}
                </span>
              </div>
              <div className="flex border-b py-2">
                <span className="font-semibold w-1/3">Requested By</span>
                <span>
                  {purchaseRequest.requester?.first_name || "N/A"}{" "}
                  {purchaseRequest.requester?.last_name || ""}
                </span>
              </div>
              <div className="flex border-b py-2">
                <span className="font-semibold w-1/3">Request Comment</span>
                <span>{purchaseRequest.request_comment || "N/A"}</span>
              </div>
              {purchaseRequest.reviewer_comment && (
                <div className="flex border-b py-2">
                  <span className="font-semibold w-1/3">Review Comment</span>
                  <span>{purchaseRequest.reviewer_comment}</span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-4 py-2">Selection</th>
                      <th className="border px-4 py-2">Item</th>
                      <th className="border px-4 py-2">Quantity</th>
                      <th className="border px-4 py-2">Unit Price</th>
                      <th className="border px-4 py-2">Currency</th>
                      <th className="border px-4 py-2">Total</th>
                      <th className="border px-4 py-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="border px-2 py-1 text-center">
                          <input
                            type="checkbox"
                            checked={approvedItems.includes(item.id)}
                            onChange={() => toggleItemApproval(item.id)}
                            disabled={
                              purchaseRequest.status.toLowerCase() ===
                              "rejected"
                            }
                          />
                        </td>
                        <td className="border px-4 py-2">
                          {item.item?.name || "N/A"}
                        </td>
                        <td className="border px-4 py-2">
                          {action === "approve" ? (
                            <InputText
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                onEditorValueChange(e, "quantity", index)
                              }
                              className="w-full"
                            />
                          ) : (
                            item.quantity
                          )}
                        </td>
                        <td className="border px-4 py-2">
                          {action === "approve" ? (
                            <InputText
                              type="number"
                              value={item.estimated_unit_price}
                              onChange={(e) =>
                                onEditorValueChange(
                                  e,
                                  "estimated_unit_price",
                                  index
                                )
                              }
                              className="w-full"
                            />
                          ) : (
                            item.estimated_unit_price?.toLocaleString()
                          )}
                        </td>
                        <td className="border px-4 py-2">
                          {currencies?.find(
                            (curr) => curr.id == item.currency_id
                          )?.code || "N/A"}
                        </td>
                        <td className="border px-4 py-2">
                          {(
                            item.quantity * item.estimated_unit_price
                          )?.toLocaleString()}
                        </td>
                        <td className="border px-4 py-2">
                          {action === "approve" ? (
                            <InputTextarea
                              value={item.notes ?? ""}
                              onChange={(e) =>
                                onEditorValueChange(e, "notes", index)
                              }
                              rows={2}
                              className="w-full"
                            />
                          ) : (
                            item.notes || "N/A"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-4 mt-4">
              <label htmlFor="comment" className="font-semibold">
                {action === "approve" ? "Comments" : "Comments"}:
              </label>
              <InputTextarea
                id="comment"
                value={
                  purchaseRequest.status.toLowerCase() === "rejected"
                    ? purchaseRequest.rejection_reason
                    : purchaseRequest.status.toLowerCase() === "approved"
                    ? purchaseRequest.approvals[0].comment
                    : approvalComment
                }
                onChange={(e) => setApprovalComment(e.target.value)}
                rows={4}
                className="w-full mt-2"
                placeholder="Add your comments here..."
                disabled={purchaseRequest.status.toLowerCase() === "rejected"}
              />
            </div>
            {purchaseRequest.status.toLowerCase() === "approved" &&
              purchaseRequest.approvals.length > 0 && (
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-md p-4">
                  <h3 className="font-semibold mb-2">Approval Comments History</h3>
                  <ul className="space-y-2">
                    {purchaseRequest.approvals.map((approval, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        <span className="font-medium text-red-500">
                          {approval.approver.first_name} {approval.approver.last_name}:
                        </span>{" "}
                        {approval.comment || <em>No comment provided</em>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={handlePrint}
                disabled={loading}
                aria-label="Print"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
              >
                <i className="pi pi-print"></i>
                <span>Print</span>
              </button>
              {purchaseRequest.status.toLowerCase() !== "rejected" && (
                <>
                  <button
                    onClick={() => handleAction("rejected")}
                    disabled={loading}
                    aria-label="Reject"
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50"
                  >
                    <i className="pi pi-times"></i>
                    <span>Reject</span>
                  </button>
                  <Button
                    label="Approve"
                    icon="pi pi-check"
                    className="p-button-success"
                    onClick={() => handleAction("approved")}
                    loading={loading}
                    aria-label="Approve"
                  />
                </>
              )}
            </div>
          </div>
        ) : (
          <p className="p-4">No purchase request selected.</p>
        )}
      </Dialog>
    </>
  );
};

export default ReviewOrApprovePurchaseRequest;
