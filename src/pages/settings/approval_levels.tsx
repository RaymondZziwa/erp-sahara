import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import AddLevelModal from './modals/create_level';
import useLevels from '../../hooks/levels/useLevels';
import AddStaffToApprovalLevelModal from './modals/add_staff_to_level';

const ApprovalLevels = () => {
 const levels = useSelector((state: RootState) => state.levels.data)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [levelId, setLevelId] = useState(0)
  const [modalId, setModalId] = useState(0)
  const {refresh} = useLevels()

  useEffect(()=> {
    if(!levels) {
        refresh()
    }
  },[])
  
  return (
    <div className="p-6">
      <ToastContainer />
      <div className='flex flex-row justify-between items-center mb-2'>
        <h1 className="text-2xl font-bold mb-4">Approval Level Settings</h1>
        <button
            onClick={() => {
                setIsModalOpen(true)
                setModalId(1)
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
              <th className="p-3">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">Level</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {levels.length > 0 ? (
              levels.map((level) => (
                <tr key={level.id} className="border-t">
                  <td className="p-3">{level.id}</td>
                  <td className="p-3">{level.name}</td>
                  <td className="p-3">{level.level}</td>
                  <td className="p-3">
                    <button 
                        className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-300"
                        onClick={() => {
                            setIsModalOpen(true)
                            setModalId(2)
                            setLevelId(level.id)
                        }}
                    >
                        + Add member
                    </button>
                    <button className="px-4 py-2 bg-teal-500 ml-2 text-white rounded hover:bg-teal-300">View members</button>
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

      {(isModalOpen && modalId === 1) && (
        <AddLevelModal setIsModalOpen={setIsModalOpen} refresh={refresh} />
      )}
      {(isModalOpen && modalId === 2) && (
        <AddStaffToApprovalLevelModal setIsModalOpen={setIsModalOpen} refresh={refresh} levelId={levelId} />
      )}
    </div>
  );
};

export default ApprovalLevels;
