"use client";

interface ApprovalMembersProps {
  handleMembersState: () => void;
  selectedAprovalMemebers: RequisitionApprovalMember[];
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
}: ApprovalMembersProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">Memebers</h2>
        <div className="p-3">
          {selectedAprovalMemebers.length > 0 ? (
            selectedAprovalMemebers.map((approver, index: number) => {
              return (
                <div key={index}>
                  <p>{approver.approver_names}</p>
                </div>
              );
            })
          ) : (
            <p className="text-center py-3">
              No approvers present for this level
            </p>
          )}
        </div>
        <button
          className="w-[100px] bg-gray-300 ml-auto mr-auto block p-2 rounded hover:bg-gray-400"
          onClick={handleMembersState}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default ApprovalMembers;
