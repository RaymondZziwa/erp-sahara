import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useState, useEffect } from "react";
import { PurchaseRequest } from "../../../redux/slices/types/procurement/PurchaseRequests";
import { createRequest } from "../../../utils/api";
import useAuth from "../../../hooks/useAuth";
import jsPDF from "jspdf";
import "jspdf-autotable";
import useItems from "../../../hooks/inventory/useItems";
import { Dropdown } from "primereact/dropdown";
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
  action: "approve" | "review" | "view";
}) => {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState(
    purchaseRequest?.purchase_request_items || []
  );
  const { token } = useAuth();
  const { data: availableItems } = useItems();
  const { data: currencies } = useCurrencies();

  console.log("token", token);
  console.log("purr", purchaseRequest);
  useEffect(() => {
    setItems(purchaseRequest?.purchase_request_items || []);
  }, [purchaseRequest]);

  const handleAction = async (status: "reviewed" | "rejected") => {
    setLoading(true);

    const approvalData = {
      comments: comment,
      purchas_request_item_ids: items.map((item) => item.id),
    };

    const endpoint =
      action === "approve"
        ? `/erp/procurement/purchase_requests/${purchaseRequest?.id}/approve`
        : "/erp/procurement/purchase_requests/review";

    console.log("endpoint", endpoint);
    console.log("data", approvalData);

    const data =
      action === "approve" && status !== "rejected"
        ? approvalData
        : {
            purchase_request_id: purchaseRequest?.id,
            status,
            review_comment: comment,
            rejected_comment: status === "rejected" ? comment : undefined,
          };

    await createRequest(endpoint, token.access_token, data, onRefresh, "POST");

    setComment("");
    setLoading(false);
    onClose();
  };

  const handlePrint = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(`Purchase Request: ${purchaseRequest?.name}`, 10, 10);
    doc.setFontSize(12);

    // Request Details
    doc.text(`Request Date: ${purchaseRequest?.request_date}`, 10, 20);
    doc.text(`Status: ${purchaseRequest?.status}`, 10, 30);
    doc.text(`Requested By: ${purchaseRequest?.requested_by}`, 10, 40);
    doc.text(
      `Request Comment: ${purchaseRequest?.request_comment || "N/A"}`,
      10,
      50
    );

    if (purchaseRequest?.reviewer_comment) {
      doc.text(`Review Comment: ${purchaseRequest.reviewer_comment}`, 10, 60);
    }

    // Table
    const tableColumn = [
      { header: "Item ID", dataKey: "item_id" },
      { header: "Quantity", dataKey: "quantity" },
      { header: "Unit Price Estimate", dataKey: "unit_price_estimate" },
      { header: "Currency", dataKey: "currency_id" },
      { header: "Notes", dataKey: "notes" },
    ];

    const tableRows = items.map((item) => ({
      item_id: item.item_id,
      quantity: item.quantity,
      unit_price_estimate: item.unit_price_estimate,
      currency_id: item.currency_id,
      notes: item.notes,
    }));

    // @ts-ignore
    doc.autoTable({
      columns: tableColumn,
      body: tableRows,
      startY: 70,
      margin: { top: 70 },
    });

    doc.save("purchase_request.pdf");
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

  return (
    <Dialog
      header={`${action === "review" ? "Review" : "Approve"} Purchase Request`}
      visible={!!purchaseRequest?.id}
      onHide={onClose}
      className="w-full md:max-w-6xl"
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

          <div className="mt-4">
            <h3>Items</h3>
            <table className="min-w-full table-auto">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Item</th>
                  <th className="border px-4 py-2">Quantity</th>
                  <th className="border px-4 py-2">Unit Price Estimate</th>
                  <th className="border px-4 py-2">Currency</th>
                  <th className="border px-4 py-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">
                      {item.id ? (
                        <h4 className="w-max max-w-max">{item.item.name}</h4>
                      ) : (
                        <Dropdown
                          value={item.id}
                          options={availableItems.map((it) => ({
                            label: it.name,
                            value: it.id,
                          }))}
                        />
                      )}
                    </td>
                    <td className="border px-4 py-2">
                      <InputText
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          onEditorValueChange(e, "quantity", index)
                        }
                      />
                    </td>
                    <td className="border px-4 py-2">
                      <InputText
                        type="number"
                        value={item.unit_price_estimate}
                        onChange={(e) =>
                          onEditorValueChange(e, "unit_price_estimate", index)
                        }
                      />
                    </td>
                    <td className="border px-4 py-2">
                      <h4>
                        {currencies.find((curr) => curr.id == item.currency_id)
                          ?.code ?? ""}
                      </h4>
                    </td>
                    <td className="border px-4 py-2">
                      <InputTextarea
                        value={item.notes ?? ""}
                        onChange={(e) => onEditorValueChange(e, "notes", index)}
                        rows={2}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
            {action === "view" && (
              <Button
                label="Print"
                className="p-button-info "
                icon="pi pi-print"
                onClick={handlePrint}
                loading={loading}
              />
            )}
            <Button
              label="Reject"
              className=" !bg-red-500"
              icon="pi pi-times"
              onClick={() => handleAction("rejected")}
              loading={loading}
            />
            <Button
              label={action === "approve" ? "Approve" : "Review"}
              // label={"Approve"}
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
