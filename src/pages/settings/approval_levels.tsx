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
  const [isApprovalMemebersModalOpen, setIsApprovalMemebersModalOpen] =
    useState<boolean>(false);
  const [levelId, setLevelId] = useState(0);
  const [modalId, setModalId] = useState(0);
  const { refresh } = useLevels();
  const [selectedAprovalMemebers, setSelectedAprovalMemebers] = useState<
    RequisitionApprovalMember[]
  >([]);

  console.log(levels);

  const handleMembersState = () => {
    setIsApprovalMemebersModalOpen((prev) => !prev);
  };

  const handleApprovalMembers = (id: number) => {
    if (id) {
      const filteredLevel = levels.filter(
        (level) => level.id.toString() === id.toString()
      )[0];
      setSelectedAprovalMemebers(filteredLevel.approvers);
    }

    setIsApprovalMemebersModalOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!levels) {
      refresh();
    }
  }, []);

  return (
    <div className="p-6">
      <ToastContainer />
      <div className="flex flex-row justify-between items-center mb-2">
        <h1 className="text-2xl font-bold mb-4">Approval Level Settings</h1>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setModalId(1);
          }}
          className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-300"
        >
          + Add level
        </button>
      </div>
      <div className="overflow-x-auto shadow-md">
        <table className="table-auto w-full text-left border-collapse">
          <thead className="bg-gray-200">
            <tr>
              {/* <th className="p-3">#</th> */}
              <th className="p-3">Name</th>
              <th className="p-3">Level</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {levels && levels.length > 0 ? (
              levels.map((level) => (
                <tr key={level.id} className="border-t">
                  {/* <td className="p-3">{level.id}</td> */}
                  <td className="p-3">{level.name}</td>
                  <td className="p-3">{level.level}</td>
                  <td className="p-3">
                    <button
                      className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-300"
                      onClick={() => {
                        setIsModalOpen(true);
                        setModalId(2);
                        setLevelId(level.id);
                      }}
                    >
                      + Add member
                    </button>
                    <button
                      onClick={() => handleApprovalMembers(level.id)}
                      className="px-4 py-2 bg-teal-500 ml-2 text-white rounded hover:bg-teal-300"
                    >
                      View members
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-3 text-center text-gray-500">
                  No levels found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
      {isApprovalMemebersModalOpen ? (
        <ApprovalMembers
          handleMembersState={handleMembersState}
          selectedAprovalMemebers={selectedAprovalMemebers}
        />
      ) : (
        ""
      )}
    </div>
  );
};

export default ApprovalLevels;
