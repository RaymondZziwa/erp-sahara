import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { ToastContainer } from "react-toastify";

const Layout = () => {
  return (
    <div className="flex w-full h-screen bg-bg ">
      <ToastContainer />
      <div className="hidden md:block w-1/4">
        <Sidebar />
      </div>
      <div className="flex flex-col md:w-full h-full w-3/4">
        <Header />
        <div className="bg-bg flex-1 h-0 rounded-2xl  md:px-4 mx-2 md:m-4 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
