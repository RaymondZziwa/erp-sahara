import { useNavigate } from "react-router-dom";

const ToBeUpdated = () => {
  const navigate = useNavigate();

  const handleNavigateHome = () => {
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-lg text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">To Be Updated</h1>
        <p className="text-gray-600 mb-6">
          This page is currently under construction. Please check back later for
          updates.
        </p>
        <button
          onClick={handleNavigateHome}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Navigate to Home
        </button>
      </div>
    </div>
  );
};

export default ToBeUpdated;
