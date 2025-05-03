"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { baseURL } from "../../../utils/api";
import { RootState } from "../../../redux/store";
import { useSelector } from "react-redux";

interface ApprovalMembersProps {
  handleMembersState: () => void;
  selectedAprovalMemebers: RequisitionApprovalMember[];
  refreshApprovers: () => void;
}

interface RequisitionApprovalMember {
  id: string;
  requisition_approval_level_id: string;
  approver_id: number;
  approver_names: string;
  approver_email: string;
  rank: number;
  approver_title: string;
  description: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

function ApprovalMembers({
  handleMembersState,
  selectedAprovalMemebers,
  refreshApprovers,
}: ApprovalMembersProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const token = useSelector((state: RootState) => state.userAuth.token.access_token)

  const handleRemoveApprover = async (approvalMemberId: string) => {
    try {
      setLoading(approvalMemberId);
      await axios.delete(
        `${baseURL}/accounts/approval-level/${approvalMemberId}/remove_approver`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Approver removed successfully");
      refreshApprovers();
    } catch (error) {
      console.error("Error removing approver:", error);
      toast.error("Failed to remove approver");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-teal-600 p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">
              Approval Members
            </h2>
            <button
              onClick={handleMembersState}
              className="text-white hover:text-indigo-200 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {selectedAprovalMemebers.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {selectedAprovalMemebers.map((approver) => (
                <li key={approver.id} className="py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {approver.approver_names}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {approver.approver_title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {approver.approver_email}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                        Rank: {approver.rank}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveApprover(approver.id)}
                      disabled={loading === approver.id}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading === approver.id ? (
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No approvers
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no approvers assigned to this level.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 flex justify-end">
          <button
            onClick={handleMembersState}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApprovalMembers;
