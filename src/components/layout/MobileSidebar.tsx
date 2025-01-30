import { useState } from "react";
import { Sidebar as PrimeSidebar } from "primereact/sidebar"; // Renamed import
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { Icon } from "@iconify/react";
import CustomSidebar from "./Sidebar"; // Renamed import
import useAuth from "../../hooks/useAuth";

export default function MobileSidebar() {
  const [visible, setVisible] = useState<boolean>(false);

  // Function to show the sidebar
  const showSidebar = () => setVisible(true);
  const { user } = useAuth();
  return (
    <div className="relative md:hidden">
      {/* Trigger Button */}
      <Button
        onClick={showSidebar}
        icon="pi pi-align-left"
        className="bg-shade"
      />

      <PrimeSidebar
        visible={visible}
        onHide={() => setVisible(false)}
        content={({ hide }) => (
          <div className="min-h-screen flex flex-col bg-white shadow-lg overflow-auto h-screen">
            <div
              id="app-sidebar-2"
              className="flex flex-col h-full  border-r border-gray-200"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <span className="flex items-center gap-2 w-2/3">
                  <Icon icon="lucide:home" className="text-xl text-primary" />
                  <span className="font-semibold text-2xl text-primary">
                    <img src="/logo.jpg" alt="" />
                  </span>
                </span>
                <Button
                  color="red"
                  className="rounded-full"
                  severity="danger"
                  type="button"
                  onClick={(e) => hide(e)}
                  icon="pi pi-times"
                />
              </div>
              <CustomSidebar /> {/* Updated component name */}
              <div className="mt-auto border-t border-gray-200">
                <div className="p-3 flex items-center gap-3">
                  <Avatar
                    image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png"
                    shape="circle"
                  />
                  <span className="font-bold">{`${user.first_name} ${user.last_name}`}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
}
