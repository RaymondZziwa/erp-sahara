import React, { useEffect, useState } from "react";
import { apiRequest, baseURL } from "../../../utils/api";
import { RootState } from "../../../redux/store";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import { Button } from "primereact/button";

interface RunDetailsModalProps {
  run: any;          // Replace any with your PayrollRun interface if available
  onClose: () => void;
}

export default function RunDetailsModal({ run, onClose }: RunDetailsModalProps) {
  const token = useSelector((state: RootState) => state.userAuth.token);
  const [fullRun, setFullRun] = useState<any>(run); // merged run + nets
    const [loading, setLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false)

  // ✅ Fetch run details & merge with passed-in run
  const fetchRunDetails = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(
        `/hr/payroll/runs/${run.id}`,
        "GET",
        token.access_token
      );
      const fetched = response?.data;
      // Merge nets and any new fields into the run object
      setFullRun({
        ...run,
        ...fetched,
        nets: fetched?.nets || [],
      });
        
        console.log({ ...run,
        ...fetched,
        nets: fetched?.nets || [],})
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch run details");
    } finally {
      setLoading(false);
    }
  };


const getPayslip = async (e: React.MouseEvent, netId: string) => {
  e.stopPropagation(); // stop event bubbling
  e.preventDefault();  // prevent default form/button behavior

  try {
      toast.info("Fetching payslip...");
      setIsDownloading(true)

    const res = await axios.get(
      `${baseURL}/payroll-runs/${netId}/payslip`,
      {
        headers: { Authorization: `Bearer ${token.access_token}` },
        responseType: "blob", // important for PDF
      }
    );

    // Make sure response is complete
    if (res.status === 200) {
    const pdfBlob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(pdfBlob);
        window.open(url);
        
        const link = document.createElement("a");
      link.href = url;
      link.download = `Payslip-${netId}.pdf`; // give the file a name
      document.body.appendChild(link);
      link.click();
        document.body.removeChild(link);
        setIsDownloading(false)

      // Cleanup the URL after some time
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } else {
      toast.error("Failed to fetch payslip");
    }
  } catch (error: any) {
    toast.error(error?.response?.data?.message || "Failed to fetch payslip");
  }
};


  useEffect(() => {
    if (run.id) fetchRunDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.id]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl p-6">Loading run details...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Payroll Run Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            &times;
          </button>
        </div>

        {/* Run Summary */}
        <div className="p-4 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <p><span className="font-semibold">Name:</span> {fullRun.name}</p>
            <p><span className="font-semibold">Run Date:</span> {fullRun.run_date}</p>
            <p><span className="font-semibold">Remarks:</span> {fullRun.remarks}</p>
            <p><span className="font-semibold">Status:</span> {fullRun.status}</p>
            {fullRun.schedule && (
              <>
                <p><span className="font-semibold">Period Start:</span> {fullRun.schedule.period_start}</p>
                <p><span className="font-semibold">Period End:</span> {fullRun.schedule.period_end}</p>
              </>
            )}
          </div>

          {/* Gross Table */}
          <h3 className="font-semibold mt-6">Employee Gross Details</h3>
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Employee</th>
                  <th className="px-4 py-2 text-right">Basic Pay</th>
                  <th className="px-4 py-2 text-right">Allowances</th>
                  <th className="px-4 py-2 text-right">Gross Pay</th>
                </tr>
              </thead>
              <tbody>
                {fullRun.grosses?.map((g: any, idx: number) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-2">
                      {g.employee.first_name} {g.employee.last_name}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {parseFloat(g.basic_pay).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {parseFloat(g.allowances_total).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold">
                      {parseFloat(g.gross_pay).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Nets Table */}
          <h3 className="font-semibold mt-6">Employee Net Details</h3>
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Employee</th>
                  <th className="px-4 py-2 text-right">Gross Pay</th>
                  <th className="px-4 py-2 text-right">Total Deductions</th>
                  <th className="px-4 py-2 text-right">Net Pay</th>
                  <th className="px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {fullRun.nets?.map((n: any, idx: number) => {
                  const employee = fullRun.grosses?.find(
                    (g: any) => g.employee_id === n.employee_id
                  )?.employee;
                  return (
                    <tr key={idx} className="border-t">
                      <td className="px-4 py-2">
                        {employee?.first_name} {employee?.last_name}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {parseFloat(n.gross_pay).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {parseFloat(n.total_deductions).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold">
                        {parseFloat(n.net_pay).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-center">
                              <Button
                                  loading={isDownloading}
                            onClick={(e) => getPayslip(e, n.id)}
                          className="bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700"
                        >
                          Get Payslip
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
