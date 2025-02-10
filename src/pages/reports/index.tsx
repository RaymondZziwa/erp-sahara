import { useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

const reportsData = [
  {
    category: "Accounting",
    reports: [
      { name: "General Ledger", link: "#" },
      { name: "Trial Balance", link: "trial-balances" },
      { name: "Income Statement", link: "income-statement" },
      { name: "Balance Sheet", link: "balance-sheet" },
      { name: "Statement of Cash Flow", link: "#" },
      { name: "Cash book", link: "cash-book" },
      { name: "Ledger book", link: "#" },
      { name: "Petty cash book", link: "#" },
      { name: "Statement of Changes in Equity", link: "#" },
      { name: "Aging Receivables", link: "#" },
      { name: "Liquid Assets", link: "#" },
      { name: "Investment Report", link: "#" },
      { name: "Trial Balance Comparison", link: "#" },
      { name: "Profit/Loss Comparison", link: "#" },
      { name: "Balance Sheet Comparison", link: "#" },
      { name: "Aging Payables", link: "#" },
      { name: "Capital Adequacy", link: "#" },
      { name: "Other Disclosures", link: "#" },
      { name: "Budget comparison", link: "#" },
      { name: "Budget performance report", link: "#" },
    ],
  },
  {
    category: "Inventory",
    reports: [
      { name: "Supplier Performance Report", link: "/supplier-performance-report" },
      { name: "Out of Stock Report", link: "/out-of-stock-report" },
      { name: "Reorder Report", link: "/reorder-report" },
      { name: "Stock Aging Report", link: "/stock-aging-report" },
      { name: "Stock Taking Report", link: "/stock-taking-report" },
    ],
  },
  // {
  //   category: "Frequent Reports",
  //   reports: [
  //     { name: "Accounts Receivable", link: "/out-of-stock-report" },
  //     { name: "Invoices", link: "/out-of-stock-report" },
  //   ],
  // },
  // {
  //   category: "Debtors: What You Owe",
  //   reports: [
  //     { name: "Accounts Payable", link: "/out-of-stock-report" },
  //     { name: "Unpaid Bills", link: "/out-of-stock-report" },
  //   ],
  // },
  // {
  //   category: "Creditors: Who Owe You",
  //   reports: [
  //     { name: "Accounts Receivable", link: "/out-of-stock-report" },
  //     { name: "Invoices", link: "/out-of-stock-report" },
  //   ],
  // },
];

const Reports = () => {
  const [openSections, setOpenSections] = useState<string[]>(
    reportsData.map((section) => section.category) // Open all sections by default
  );

  const toggleSection = (category: string) => {
    if (openSections.includes(category)) {
      setOpenSections(openSections.filter((item) => item !== category));
    } else {
      setOpenSections([...openSections, category]);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Reports</h1>
      <div className="space-y-4">
        {reportsData.map((section) => (
          <div
            key={section.category}
            className="bg-white shadow-md p-4 rounded-md"
          >
            <div
              onClick={() => toggleSection(section.category)}
              className="flex items-center justify-between cursor-pointer"
            >
              <h2 className="font-semibold text-lg">{section.category}</h2>
              <Icon
                icon={
                  openSections.includes(section.category)
                    ? "mi:chevron-up"
                    : "mi:chevron-down"
                }
                fontSize={24}
              />
            </div>
            {openSections.includes(section.category) && (
              <div className="grid md:grid-cols-2 gap-2 mt-4">
                {section.reports.map((item) => (
                  <Link
                    key={item.name}
                    to={item.link}
                    className="text-teal-500 hover:text-teal-800 transition-colors"
                  >
                    <h4>{item.name}</h4>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
