// Define the report categories, descriptions, and dummy data
interface Report {
  name: string;
  description: string;
  dummyData?: any[]; // Use any[] for dummy data rows
  icon: string; // Icon for each report
  columns: { field: string; header: string }[]; // Columns definition for DataTable
}

interface ReportCategory {
  name: string;
  reports: Report[];
}
// Updated report categories with additional reports
export const reportCategories: ReportCategory[] = [
  {
    name: "Financial Statements",
    reports: [
      {
        name: "1. Statement of Financial Position",
        description:
          "Organization’s financial position, detailing assets, liabilities, and equity.",
        dummyData: [
          { item: "Assets", amount: "1,000,000" },
          { item: "Liabilities", amount: "500,000" },
          { item: "Equity", amount: "500,000" },
        ],
        icon: "pi pi-chart-bar",
        columns: [
          { field: "item", header: "Component" },
          { field: "amount", header: "Amount" },
        ],
      },
      {
        name: "2. Income Statement (Profit and Loss)",
        description: "Summary of revenue, expenses, and profits over a period.",
        dummyData: [
          { item: "Revenue", amount: "200,000" },
          { item: "COGS", amount: "120,000" },
          { item: "Gross Profit", amount: "80,000" },
          { item: "Operating Expenses", amount: "30,000" },
          { item: "Net Profit", amount: "50,000" },
        ],
        icon: "pi pi-dollar",
        columns: [
          { field: "item", header: "Component" },
          { field: "amount", header: "Amount" },
        ],
      },
      {
        name: "3. Cash Flow Statement",
        description: "Cash inflows and outflows over a period.",
        dummyData: [
          { item: "Operating", amount: "40,000" },
          { item: "Investing", amount: "-10,000" },
          { item: "Financing", amount: "15,000" },
          { item: "Net Cash Flow", amount: "45,000" },
        ],
        icon: "pi pi-wallet",
        columns: [
          { field: "item", header: "Activity" },
          { field: "amount", header: "Amount" },
        ],
      },
    ],
  },
  {
    name: "Accounting Reports",
    reports: [
      {
        name: "4. Trial Balance",
        description: "Lists all general ledger accounts and their balances.",
        dummyData: [
          { item: "Assets", amount: "1,000,000" },
          { item: "Liabilities", amount: "500,000" },
        ],
        icon: "pi pi-book",
        columns: [
          { field: "item", header: "Account" },
          { field: "amount", header: "Amount" },
        ],
      },
      {
        name: "5. General Ledger",
        description: "Account transactions with debits and credits.",
        dummyData: [
          { item: "Cash", amount: "+30,000" },
          { item: "Sales", amount: "+100,000" },
          { item: "Expenses", amount: "-50,000" },
        ],
        icon: "pi pi-list",
        columns: [
          { field: "item", header: "Account" },
          { field: "amount", header: "Transaction" },
        ],
      },
      {
        name: "6. Accounts Payable Aging Report",
        description: "Outstanding invoices sorted by due date.",
        dummyData: [
          { item: "Invoice 1", amount: "1,500", due: "30 days" },
          { item: "Invoice 2", amount: "2,000", due: "60 days" },
          { item: "Invoice 3", amount: "800", due: "90+ days" },
        ],
        icon: "pi pi-clock",
        columns: [
          { field: "item", header: "Invoice" },
          { field: "amount", header: "Amount" },
          { field: "due", header: "Due Date" },
        ],
      },
      {
        name: "7. Accounts Receivable Aging Report",
        description: "Outstanding invoices sorted by due date.",
        dummyData: [
          { item: "Invoice A", amount: "2,500", due: "30 days" },
          { item: "Invoice B", amount: "1,000", due: "60 days" },
          { item: "Invoice C", amount: "600", due: "90+ days" },
        ],
        icon: "pi pi-clock",
        columns: [
          { field: "item", header: "Invoice" },
          { field: "amount", header: "Amount" },
          { field: "due", header: "Due Date" },
        ],
      },
      {
        name: "8. Budget vs. Actual Report",
        description:
          "Compare actual financial performance against budgeted expectations.",
        dummyData: [
          { item: "Budgeted Amount", amount: "100,000" },
          { item: "Actual Amount", amount: "95,000" },
          { item: "Variance", amount: "5,000" },
        ],
        icon: "pi pi-chart-line",
        columns: [
          { field: "item", header: "Description" },
          { field: "amount", header: "Amount" },
        ],
      },
      {
        name: "9. Statement of Retained Earnings",
        description: "Shows changes in retained earnings over a period.",
        dummyData: [
          { item: "Beginning Retained Earnings", amount: "100,000" },
          { item: "Net Income", amount: "50,000" },
          { item: "Dividends Paid", amount: "10,000" },
          { item: "Ending Retained Earnings", amount: "140,000" },
        ],
        icon: "pi pi-user",
        columns: [
          { field: "item", header: "Description" },
          { field: "amount", header: "Amount" },
        ],
      },
      {
        name: "10. Bank Reconciliation Report",
        description: "Reconcile bank statement with accounting records.",
        dummyData: [
          { item: "Bank Statement Balance", amount: "120,000" },
          { item: "General Ledger Balance", amount: "115,000" },
          { item: "Adjustments", amount: "5,000" },
        ],
        icon: "pi pi-credit-card",
        columns: [
          { field: "item", header: "Description" },
          { field: "amount", header: "Amount" },
        ],
      },
      {
        name: "11. Inventory Valuation Report",
        description: "Shows the value and quantity of inventory on hand.",
        dummyData: [
          { item: "Item 1", stockLevel: "100", valuation: "10,000" },
          { item: "Item 2", stockLevel: "200", valuation: "15,000" },
        ],
        icon: "pi pi-box",
        columns: [
          { field: "item", header: "Item" },
          { field: "stockLevel", header: "Stock Level" },
          { field: "valuation", header: "Valuation" },
        ],
      },
      {
        name: "12. Sales Report",
        description: "Sales generated by different categories.",
        dummyData: [
          { item: "Product A", revenue: "30,000" },
          { item: "Product B", revenue: "70,000" },
        ],
        icon: "pi pi-shopping-cart",
        columns: [
          { field: "item", header: "Product/Service" },
          { field: "revenue", header: "Revenue" },
        ],
      },
      {
        name: "13. Project Cost Report",
        description: "Summarize costs associated with specific projects.",
        dummyData: [
          {
            item: "Project Alpha",
            budgetedCost: "20,000",
            actualCost: "18,000",
          },
          {
            item: "Project Beta",
            budgetedCost: "30,000",
            actualCost: "28,000",
          },
        ],
        icon: "pi pi-briefcase",
        columns: [
          { field: "item", header: "Project Name" },
          { field: "budgetedCost", header: "Budgeted Cost" },
          { field: "actualCost", header: "Actual Cost" },
        ],
      },
      {
        name: "14. Statement of Changes in Equity",
        description: "Shows the changes in equity from transactions.",
        dummyData: [
          { item: "Beginning Equity", amount: "150,000" },
          { item: "Add: New Investments", amount: "20,000" },
          { item: "Less: Withdrawals", amount: "5,000" },
          { item: "Ending Equity", amount: "165,000" },
        ],
        icon: "pi pi-user-plus",
        columns: [
          { field: "item", header: "Description" },
          { field: "amount", header: "Amount" },
        ],
      },
      {
        name: "15. Payroll Summary Report",
        description: "Summary of employee payments over a period.",
        dummyData: [
          { item: "Employee A", salary: "5,000" },
          { item: "Employee B", salary: "6,000" },
        ],
        icon: "pi pi-users",
        columns: [
          { field: "item", header: "Employee" },
          { field: "salary", header: "Salary" },
        ],
      },
      {
        name: "16. Tax Summary Report",
        description: "Summary of taxes owed for the reporting period.",
        dummyData: [
          { item: "Total Taxable Income", amount: "100,000" },
          { item: "Total Tax Owed", amount: "30,000" },
        ],
        icon: "pi pi-file",
        columns: [
          { field: "item", header: "Description" },
          { field: "amount", header: "Amount" },
        ],
      },
      {
        name: "17. Cash Position Report",
        description: "Overview of cash available at a specific date.",
        dummyData: [
          { item: "Cash at Bank", amount: "50,000" },
          { item: "Petty Cash", amount: "2,000" },
        ],
        icon: "pi pi-dollar",
        columns: [
          { field: "item", header: "Description" },
          { field: "amount", header: "Amount" },
        ],
      },
      {
        name: "18. Variance Analysis Report",
        description:
          "Analyze differences between planned and actual performance.",
        dummyData: [
          { item: "Sales Variance", amount: "5,000" },
          { item: "Expense Variance", amount: "2,000" },
        ],
        icon: "pi pi-chart-bar",
        columns: [
          { field: "item", header: "Description" },
          { field: "amount", header: "Amount" },
        ],
      },
      {
        name: "19. Yearly Financial Summary",
        description: "Overview of financial performance for the year.",
        dummyData: [
          { item: "Total Revenue", amount: "500,000" },
          { item: "Total Expenses", amount: "300,000" },
          { item: "Net Profit", amount: "200,000" },
        ],
        icon: "pi pi-calendar",
        columns: [
          { field: "item", header: "Description" },
          { field: "amount", header: "Amount" },
        ],
      },
    ],
  },
];
