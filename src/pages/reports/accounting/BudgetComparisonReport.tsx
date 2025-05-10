
const BudgetComparisonReport = () => {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", margin: 20, color: "#333" }}>
      <div
        className="header"
        style={{
          textAlign: "center",
          marginBottom: 30,
          borderBottom: "2px solid #0066cc",
          paddingBottom: 10,
        }}
      >
        <div
          className="report-title"
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#0066cc",
          }}
        >
          Budget Comparison Report
        </div>
        <div
          className="subtitle"
          style={{
            fontSize: 16,
            color: "#666",
          }}
        >
          [Organization/Department Name]
        </div>
      </div>

      <div
        className="report-date"
        style={{ textAlign: "right", marginBottom: 20 }}
      >
        <strong>Report Date:</strong> [Insert Date]
        <br />
        <strong>Period Covered:</strong> [Insert Time Period]
      </div>

      <table
        style={{ width: "100%", borderCollapse: "collapse", marginBottom: 30 }}
      >
        <thead>
          <tr>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Budgeted Amount</th>
            <th style={thStyle}>Actual Amount</th>
            <th style={thStyle}>Variance</th>
            <th style={thStyle}>% Variance</th>
            <th style={thStyle}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {/* Revenue */}
          <tr>
            <td colSpan="6" style={sectionHeaderStyle}>
              Revenue
            </td>
          </tr>
          <ReportRow category="Sales Income" positive />
          <ReportRow category="Grants/Funding" negative />
          <ReportRow category="Other Income" />
          <ReportRow category="Total Revenue" total />

          {/* Expenses */}
          <tr>
            <td colSpan="6" style={sectionHeaderStyle}>
              Expenses
            </td>
          </tr>
          <ReportRow category="Personnel" negative />
          <ReportRow category="Supplies" positive />
          <ReportRow category="Equipment" />
          <ReportRow category="Utilities" negative />
          <ReportRow category="Travel" />
          <ReportRow category="Other Expenses" />
          <ReportRow category="Total Expenses" total />

          {/* Surplus/Deficit */}
          <ReportRow category="Net Surplus/Deficit" total />
        </tbody>
      </table>

      <div
        className="notes"
        style={{
          marginTop: 30,
          padding: 15,
          backgroundColor: "#f9f9f9",
          borderLeft: "4px solid #0066cc",
        }}
      >
        <h3>Key Observations:</h3>
        <ol>
          <li>[Note any significant variances or trends]</li>
          <li>[Explain major over/under spending areas]</li>
          <li>[Highlight any exceptional items]</li>
        </ol>
      </div>

      <div className="signature" style={{ marginTop: 50 }}>
        <div>
          <div style={signatureLineStyle}></div>
          <div>Prepared by: [Name]</div>
        </div>
        <div style={{ marginTop: 20 }}>
          <div style={signatureLineStyle}></div>
          <div>Approved by: [Name]</div>
        </div>
        <div style={{ marginTop: 20 }}>
          <div>Date: [Insert Date]</div>
        </div>
      </div>

      <div className="no-print" style={{ marginTop: 50, textAlign: "center" }}>
        <button onClick={() => window.print()}>Print Report</button>
      </div>
    </div>
  );
};

const ReportRow = ({ category, positive, negative, total }) => {
  const varianceClass = positive
    ? { color: "#009933", fontWeight: "bold" }
    : negative
    ? { color: "#cc0000", fontWeight: "bold" }
    : {};
  const rowStyle = total
    ? { fontWeight: "bold", backgroundColor: "#e6f2ff" }
    : {};

  return (
    <tr style={rowStyle}>
      <td>{category}</td>
      <td>$XX,XXX</td>
      <td>$XX,XXX</td>
      <td style={varianceClass}>$X,XXX</td>
      <td style={varianceClass}>X%</td>
      <td></td>
    </tr>
  );
};

const thStyle = {
  backgroundColor: "#0066cc",
  color: "white",
  textAlign: "left",
  padding: 10,
};

const sectionHeaderStyle = {
  backgroundColor: "#e6f2ff",
  fontWeight: "bold",
};

const signatureLineStyle = {
  width: 250,
  borderTop: "1px solid #333",
  marginTop: 40,
  marginBottom: 5,
};

export default BudgetComparisonReport;
