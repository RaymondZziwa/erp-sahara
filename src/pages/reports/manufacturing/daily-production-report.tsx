import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { PropagateLoader } from "react-spinners";
import CustomReportHeader from "../../../components/custom/customReportHeader";
import Header from "../../../components/custom/print_header";

interface ProductionItem {
  item_id: string;
  item_name: string;
  uom: string;
  total_quantity: number;
}

interface ProductionMachine {
  production_date: string;
  machine_id: string;
  machine_name: string;
  items: ProductionItem[];
}

interface ProductionReportData {
  report: ProductionMachine[];
}

const dummyData: ProductionReportData = {
  report: [
    {
      production_date: "2025-08-31",
      machine_id: "uuid-mixer1",
      machine_name: "Mixer 1",
      items: [
        { item_id: "uuid-sugar", item_name: "Sugar", uom: "box", total_quantity: 150 },
        { item_id: "uuid-flour", item_name: "Flour", uom: "box", total_quantity: 100 },
        { item_id: "uuid-salt", item_name: "Salt", uom: "box", total_quantity: 50 },
      ],
    },
    {
      production_date: "2025-08-31",
      machine_id: "uuid-mixer2",
      machine_name: "Mixer 2",
      items: [
        { item_id: "uuid-sugar", item_name: "Sugar", uom: "box", total_quantity: 200 },
        { item_id: "uuid-flour", item_name: "Flour", uom: "box", total_quantity: 120 },
        { item_id: "uuid-salt", item_name: "Salt", uom: "box", total_quantity: 60 },
      ],
    },
    {
      production_date: "2025-08-31",
      machine_id: "uuid-mixer3",
      machine_name: "Mixer 3",
      items: [
        { item_id: "uuid-sugar", item_name: "Sugar", uom: "box", total_quantity: 180 },
        { item_id: "uuid-flour", item_name: "Flour", uom: "box", total_quantity: 110 },
        { item_id: "uuid-salt", item_name: "Salt", uom: "box", total_quantity: 70 },
      ],
    },
  ],
};

const DailyProductionReport: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  const printPdf = useReactToPrint({
    content: () => contentRef.current,
  });

  const loading = false; // set true to simulate loading spinner

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PropagateLoader color="#007f80" />
      </div>
    );
  }

  return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <CustomReportHeader />
                <div className="flex flex-row justify-center items-center mt-20">
                <Header title="Daily Production Report" />
                </div>
      <div ref={contentRef} className="space-y-8">
        {dummyData.report.map((machine) => (
          <section key={machine.machine_id} className="border rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{machine.machine_name}</h2>
                <p className="text-sm text-gray-600">
                  Production Date: {machine.production_date}
                </p>
              </div>
              <div className="text-right text-gray-700 font-semibold">
                Machine ID: {machine.machine_id}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse border border-gray-200">
                <thead className="bg-teal-500 text-white">
                  <tr>
                    <th className="border border-gray-200 px-4 py-2 text-left">Item Name</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">UOM</th>
                    <th className="border border-gray-200 px-4 py-2 text-right">Total Output Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {machine.items.map((item) => (
                    <tr key={item.item_id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2">{item.item_name}</td>
                      <td className="border border-gray-200 px-4 py-2">{item.uom}</td>
                      <td className="border border-gray-200 px-4 py-2 text-right">{item.total_quantity}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-semibold">
                    <td className="border border-gray-200 px-4 py-2">Total</td>
                    <td className="border border-gray-200 px-4 py-2" />
                    <td className="border border-gray-200 px-4 py-2 text-right">
                      {machine.items.reduce((sum, item) => sum + item.total_quantity, 0)} boxes
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      <div className="p-4 text-sm text-gray-500 text-center border-t border-gray-200 mt-6">
        **All quantities are displayed in their respective units of measure
      </div>
    </div>
  );
};

export default DailyProductionReport;
