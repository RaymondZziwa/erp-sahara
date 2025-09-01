import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import AddLevelModal from "./modals/create_level";
import useLevels from "../../hooks/levels/useLevels";
import AddStaffToApprovalLevelModal from "./modals/add_staff_to_level";
import ApprovalMembers from "./modals/members";

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

const ApprovalLevels = () => {
  const levels = useSelector((state: RootState) => state.levels.data);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApprovalMembersModalOpen, setIsApprovalMembersModalOpen] =
    useState<boolean>(false);
  const [levelId, setLevelId] = useState(0);
  const [modalId, setModalId] = useState(0);
  const { refresh } = useLevels();
  const [selectedApprovalMembers, setSelectedApprovalMembers] = useState<
    RequisitionApprovalMember[]
  >([]);

  const handleMembersState = () => {
    setIsApprovalMembersModalOpen((prev) => !prev);
  };

  const handleApprovalMembers = (id: number) => {
    if (id) {
      const filteredLevel = levels.filter(
        (level) => level.id.toString() === id.toString()
      )[0];
      setSelectedApprovalMembers(filteredLevel.approvers);
    }
    setIsApprovalMembersModalOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!levels) {
      refresh();
    }
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-gray-800">Approval Levels</h1>
          <p className="text-gray-600">Manage your organization's approval hierarchy</p>
        </div>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setModalId(1);
          }}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 flex items-center shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add Level
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mandate
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {levels && levels.length > 0 ? (
                levels.map((level) => (
                  <tr
                    key={level.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {level.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {level.level}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {level.approval_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {level.mandate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right space-x-2">
                      <button
                        onClick={() => {
                          setIsModalOpen(true);
                          setModalId(2);
                          setLevelId(level.id);
                        }}
                        className="text-teal-600 hover:text-teal-900 bg-teal-50 px-3 py-1 rounded-md text-sm font-medium hover:bg-teal-100 transition-colors duration-200"
                      >
                        Add Member
                      </button>
                      <button
                        onClick={() => handleApprovalMembers(level.id)}
                        className="text-gray-600 hover:text-gray-900 bg-gray-50 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors duration-200"
                      >
                        View Members
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No approval levels found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && modalId === 1 && (
        <AddLevelModal setIsModalOpen={setIsModalOpen} refresh={refresh} />
      )}
      {isModalOpen && modalId === 2 && (
        <AddStaffToApprovalLevelModal
          setIsModalOpen={setIsModalOpen}
          refresh={refresh}
          levelId={levelId}
        />
      )}
      {isApprovalMembersModalOpen && (
        <ApprovalMembers
          handleMembersState={handleMembersState}
          selectedAprovalMemebers={selectedApprovalMembers}
          refreshApprovers={refresh}
        />
      )}
    </div>
  );
};

export default ApprovalLevels;