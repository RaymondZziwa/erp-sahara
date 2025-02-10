import { useNavigate } from "react-router-dom";
import PosModal from "./modal";
import PosNavbar from "./nav/top_nav";
import { useState } from "react";

const POS = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const queryHandler = (input: string) => {
    setSearchQuery(input)
  }

  return (
        <div className="fixed inset-0 flex -mt-12 items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-100 p-6 rounded-lg shadow-lg min-h-screen min-w-full">
            <PosNavbar onClose={()=> navigate('/inventory')} onSearch={queryHandler} />
            <PosModal query={searchQuery}/>
          </div>
        </div>
  );
};

export default POS;
