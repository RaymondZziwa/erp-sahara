import { useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

const reportsData = [
  {
    category: "Accounting",
    reports: [
      { name: "Trial Balance", link: "/trial-balance" },
      {
        name: "Trial Balance Comparison",
        link: "/trial-balance-comparisons",
      },
      { name: "Income Statement", link: "/income-statement-report" },
      {
        name: "Balance Sheet Comparisons",
        link: "/balance-sheet-comparisons",
      },
      // {
      //   name: "Income Statement Comparisons",
      //   link: "/income-statement-report-comparisons",
      // },
      { name: "Balance Sheet", link: "/balance-sheet" },
      // { name: "Budget Comparison Report", link: "/budget-comparison-report" },

      { name: "Cash Flow", link: "/cashflow-report" },
      // { name: "Owner's equity", link: "/owner-equity" },
      { name: "Owner's equity summary", link: "/owners-equity" },

      { name: "Detailed Owner's equity", link: "/detailed-owners-equity" },
      { name: "General Ledger", link: "/general-ledger-book" },
      { name: "Budget comparison", link: "/budget-comparison-report" },
      { name: "Cash book", link: "/cash-book" },

      // { name: "Ledger book", link: "#" },
      // { name: "Petty cash book", link: "#" },
      // { name: "Statement of Changes in Equity", link: "#" },
      // { name: "Liquid Assets", link: "#" },
      // { name: "Investment Report", link: "#" },

      // { name: "Profit/Loss Comparison", link: "#" },
      // { name: "Balance Sheet Comparison", link: "#" },
      // { name: "Aging Payables", link: "#" },
      // { name: "Capital Adequacy", link: "#" },
      // { name: "Other Disclosures", link: "#" },
      // { name: "Budget performance report", link: "#" },
    ],
  },
  {
    category: "Inventory",
    reports: [
      {
        name: "Supplier Performance Report",
        link: "/supplier-performance-report",
      },
      { name: "Out of Stock Report", link: "/out-of-stock-report" },
      { name: "Reorder Report", link: "/reorder-report" },
      { name: "Stock Aging Report", link: "/stock-aging-report" },
      { name: "Stock Taking Report", link: "/stock-taking-report" },
    ],
  },
  {
    category: "Assets",
    reports: [
      {
        name: "Asset Registry Report",
        link: "/asset-registry-report",
      },
    ],
  },
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
