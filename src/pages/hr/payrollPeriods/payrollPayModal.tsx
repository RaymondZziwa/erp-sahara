import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { toast } from "react-toastify";
import { apiRequest } from "../../../utils/api";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { HUMAN_RESOURCE_ENDPOINTS } from "../../../api/hrEndpoints";
import { PayrollRun } from "../../../redux/slices/types/hr/salary/payrollRun";
import usePaymentMethods from "../../../hooks/procurement/usePaymentMethods";
import { PropagateLoader } from "react-spinners";
import usePayrollPeriods from "../../../hooks/hr/usePayRollPeriods";

interface PayrollPayModalProps {
  run: PayrollRun;           // ✅ pass the entire run
  onClose: () => void;
}

const PayrollPayModal: React.FC<PayrollPayModalProps> = ({ run, onClose }) => {
  const token = useSelector((state: RootState) => state.userAuth.token);
  const {refresh} = usePayrollPeriods()
  const { data: paymentMethods } = usePaymentMethods();
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [referenceNumber, setReferenceNumber] = useState("");

    // ✅ Fetch run details
    const viewNetDetails = async () => {
      try {
        setLoading(true)
        const response = await apiRequest(
          `/hr/payroll/runs/${run.id}`,
          "GET",
          token.access_token
        );
        const approvedNets = response?.data?.nets.filter((net) => net.status === 'approved');
        setData(approvedNets);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to fetch details");
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      if (run.id) viewNetDetails();
    }, [run]);

  const handleSubmit = async () => {
    if (!paymentMethod || !referenceNumber) {
      toast.error("All fields are required");
      return;
    }
    try {
      await apiRequest(
        HUMAN_RESOURCE_ENDPOINTS.PAYROLL_PERIODS.PAYROLL_PAY(run?.id),
        "POST",
        token.access_token,
        {
          payment_method: paymentMethod,
          payment_date: paymentDate.toISOString().split("T")[0],
          reference_number: referenceNumber,
        }
      );
      toast.success("Payroll paid successfully");
      refresh();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Payment failed");
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button label="Cancel" severity="secondary" className="!bg-red-500" onClick={onClose} />
      {data.length > 0 && <Button label="Pay" icon="pi pi-check" onClick={handleSubmit} /> }
    </div>
  );

  return (
    <Dialog
      header="Pay Payroll Run"
      visible
      style={{ width: "40rem" }}
      onHide={onClose}
      footer={footer}
      modal
    >
      {/* ✅ Approved Nets Preview from run props */}
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Approved Net Calculations</h3>
          {loading ? (
              <div className="flex justify-center items-center py-6">
                <PropagateLoader color="#007f80" />
              </div>
            ) : data?.length ? (
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">Employee</th>
                      <th className="px-4 py-2 text-right">Net Pay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((net: any, idx: number) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-2">
                          {net.employee.first_name} {net.employee.last_name}
                        </td>
                        <td className="px-4 py-2 text-right font-semibold">
                          {net.net_pay.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No approved net calculations found.</p>
            )}
      </div>

      {/* ✅ Payment form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Payment Method</label>
          <Dropdown
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.value)}
            options={paymentMethods?.map((pm: any) => ({
              label: pm.name,
              value: pm.id,
            }))}
            placeholder="Select Payment Method"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Payment Date</label>
          <Calendar
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.value as Date)}
            showIcon
            dateFormat="yy-mm-dd"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Reference Number</label>
          <InputText
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="Enter reference number"
            className="w-full"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default PayrollPayModal;
