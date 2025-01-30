import React from "react";

// Define specific statuses as a union type, including "Unknown"
type Status =
  | "Pending"
  | "Approved"
  | "Partially Approved"
  | "Rejected"
  | "In Progress"
  | "Completed"
  | "Unknown";

interface StatusChipsProps {
  status: Status; // The status must be one of the defined types
}

const StatusChips: React.FC<StatusChipsProps> = ({ status }) => {
  const statusOptions: Record<Status, { label: string; color: string }> = {
    Pending: { label: "Pending", color: "blue" },
    Approved: { label: "Approved", color: "green" },
    Rejected: { label: "Rejected", color: "red" },
    "Partially Approved": { label: "Partially Approved", color: "teal" }, // Corrected label and color
    "In Progress": { label: "In Progress", color: "orange" },
    Completed: { label: "Completed", color: "purple" },
    Unknown: { label: status, color: "gray" }, // Handle the Unknown status
  };

  const currentStatus = statusOptions[status];

  return (
    <span
      style={{
        backgroundColor: currentStatus?.color,
        color: "white",
        padding: "4px 8px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "bold",
      }}
    >
      {currentStatus.label}
    </span>
  );
};

export default StatusChips;
