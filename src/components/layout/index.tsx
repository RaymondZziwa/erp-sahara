import { useState } from "react";
import { ToastContainer } from "react-toastify";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex w-full h-screen bg-bg">
      <ToastContainer />
      {/* Mobile Sidebar Button */}
      <button
        className="md:hidden fixed top-4 left-4 bg-white p-2 rounded-lg shadow-lg z-50"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform md:translate-x-0 bg-white shadow-lg md:relative z-40`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-col w-full h-full md:w-4/4">
        <Header />

        <div className="bg-bg flex-1 h-0 rounded-2xl m-auto w-full overflow-auto px-4">
          <div className="max-w-8xl mx-auto w-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
