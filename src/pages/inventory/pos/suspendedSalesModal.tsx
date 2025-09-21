import { Dialog } from "primereact/dialog";

const SuspendedSalesModal = ({ isOpen, onClose, suspendedSales, onSelectSale }) => {
  return (
    <Dialog
      header="Suspended Sales"
      visible={isOpen}
      style={{ width: "50vw" }}
      onHide={onClose}
    >
      {suspendedSales.length === 0 ? (
        <p>No suspended sales available.</p>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {suspendedSales.map((sale, index) => (
            <button
              key={index}
              onClick={() => onSelectSale(sale)}
              className="w-full text-left p-4 border rounded-lg shadow-sm hover:bg-gray-50 transition"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-semibold">
                    Date: {new Date(sale.sale_date).toLocaleDateString()}
                  </p>
                  <p className="font-semibold">
                    Client: {sale.customer_name || "Walk-in"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Items: {sale.items.length}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                {sale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span>
                      {item.discount
                        ? `Disc: ${item.discount}%`
                        : ""}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-2 text-right font-semibold">
                Total: {sale.amount.toFixed(2)}
              </div>
            </button>
          ))}
        </div>
      )}
    </Dialog>
  );
};

export default SuspendedSalesModal;
