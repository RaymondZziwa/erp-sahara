//@ts-nocheck
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import ROUTES from "../../routes/ROUTES";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const { pathname } = useLocation();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (path: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const isActive = (routePath: string) => {
    return (
      routePath === pathname ||
      (pathname.split("/").length > 2 && 
       pathname.startsWith(routePath + "/"))
    );
  };

  const hasSubItems = (item: any) => {
    return item.sidebarItems.some((subItem: any) => subItem.items?.length > 0);
  };

  return (
    <div className="flex flex-col h-full bg-[#F2FCFC]">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 min-h-screen border-r border-gray-200">
        <nav className="flex-grow overflow-y-auto px-3 py-4 space-y-1">
          {ROUTES.filter(r => !r.hidden).map((item) => (
            <div key={item.path} className="relative">
              <div
                onClick={() => hasSubItems(item) && toggleExpand(item.path)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  hasSubItems(item) ? 'cursor-pointer' : ''
                } ${
                  isActive(item.path)
                    ? "bg-shade text-white"
                    : "text-gray-600 hover:bg-shade hover:bg-opacity-20 hover:text-shade"
                }`}
              >
                <Link
                  to={item.path}
                  className={`flex items-center flex-grow ${
                    hasSubItems(item) ? 'pointer-events-none' : ''
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
                
                {hasSubItems(item) && (
                  <motion.div
                    animate={{ rotate: expandedItems[item.path] ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon 
                      icon="mdi:chevron-down" 
                      className="w-5 h-5"
                    />
                  </motion.div>
                )}
              </div>

              {/* Dropdown items with smooth animation */}
              <AnimatePresence>
                {expandedItems[item.path] && hasSubItems(item) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-6 mt-1 space-y-1">
                      {item.sidebarItems.map((subItem) => (
                        subItem.items.filter(nested => !nested.hidden).map((nestedItem) => (
                          <motion.div
                            key={nestedItem.path}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Link
                              to={item.path + subItem.path + nestedItem.path}
                              className={`flex items-center px-3 py-2 rounded text-sm transition-colors ${
                                pathname === item.path + subItem.path + nestedItem.path
                                  ? "bg-shade text-white"
                                  : "text-gray-600 hover:bg-shade hover:bg-opacity-10 hover:text-shade"
                              }`}
                            >
                              <span className="mr-2">{nestedItem.icon}</span>
                              {nestedItem.name}
                            </Link>
                          </motion.div>
                        ))
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10 shadow-lg">
        <div className="flex justify-around">
          {/* //@ts-nocheck */}
          {ROUTES.filter(r => !r.hidden && r.mobile).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-3 px-4 text-xs transition-colors ${
                isActive(item.path) 
                  ? "text-shade" 
                  : "text-gray-500 hover:text-shade"
              }`}
            >
              <span className="mb-1 text-lg">{item.icon}</span>
              <span className="text-[0.7rem]">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;