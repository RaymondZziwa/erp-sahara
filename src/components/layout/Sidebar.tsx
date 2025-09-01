// @ts-nocheck
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import ROUTES from "../../routes/ROUTES";
import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";
import { PropagateLoader } from "react-spinners";

const Sidebar = () => {
  const services = useSelector((state: RootState) => state?.userAuth?.user?.organisation?.services || [])
  const userPermissions = useSelector((state: RootState) => state.userAuth?.permissions || [])

  const hasService = (serviceId: string) => {
    if (!serviceId) return false;
    return services.some((s) => s.id === serviceId);
  };

  const hasPermission = (permissionName?: string) => {
    if (!permissionName) return true;
    return userPermissions.some((p: any) => p === permissionName);
  };

  const filteredRoutes = ROUTES.filter((route) => {
    const serviceOk = route.serviceId ? hasService(route.serviceId) : true;
    const permissionOk = route.requiredPermission ? hasPermission(route.requiredPermission) : true;
    return serviceOk && permissionOk;
    //return permissionOk;
  });

  const { pathname } = useLocation();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  // Improved isActive function
  const isActive = (routePath: string, isCategory = false) => {
    // Exact match
    if (routePath === pathname) return true;
    
    // For categories, check if any direct child is active
    if (isCategory) {
      const category = ROUTES.find(cat => cat.path === routePath);
      if (!category || !category.sidebarItems) return false;
      
      return category.sidebarItems.some(item => {
        // Check if item path matches (for absolute paths)
        if (item.path === pathname) return true;
        
        // Check if this is a relative path under the category
        if (item.path && pathname.startsWith(`${category.path}/`) && 
            pathname === `${category.path}/${item.path}`) {
          return true;
        }
        
        // Check nested items if they exist
        return item.items?.some(subItem => 
          pathname === `${category.path}${subItem.path}`
        );
      });
    }
    
    return false;
  };

  const hasItems = (category: any) => category.sidebarItems && category.sidebarItems.length > 0;
  const hasNestedItems = (item: any) => item.items && item.items.length > 0;

  // Auto-expand logic
  useEffect(() => {
    const newExpanded: Record<string, boolean> = {};
    
    ROUTES.forEach(category => {
      if (hasItems(category)) {
        const shouldExpand = category.sidebarItems.some(item => {
          if (item.path === pathname) return true;
          if (pathname.startsWith(`${category.path}/`) && 
              pathname === `${category.path}/${item.path}`) {
            return true;
          }
          return item.items?.some(subItem => 
            pathname === `${category.path}${subItem.path}`
          );
        });
        
        newExpanded[category.name] = shouldExpand;
      }
    });
    
    setExpandedCategories(newExpanded);
  }, [pathname]);

  return (
    <div className="flex flex-col h-full bg-[#F2FCFC]">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 min-h-screen border-r border-gray-200">
        <nav className="flex-grow overflow-y-auto px-3 py-4 space-y-1">
          {userPermissions.length === 0 ? (
            <div className="flex justify-center items-center"> <PropagateLoader color="#007f80"/> </div>
          ) : (
            filteredRoutes.map((category) => (
              <div key={category.name} className="relative">
                <div
                  onClick={() => {
                    if (hasItems(category)) {
                      toggleCategory(category.name);
                    }
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                    isActive(category.path, true)
                      ? "bg-shade text-white"
                      : "text-gray-600 hover:bg-shade hover:bg-opacity-20 hover:text-shade"
                  }`}
                >
                  <Link
                    to={category.path}
                    className={`flex items-center flex-grow ${
                      hasItems(category) ? "pointer-events-none" : ""
                    }`}
                    onClick={(e) => {
                      if (hasItems(category)) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <span className="mr-3">{category.icon}</span>
                    <span className="text-sm font-medium">{category.name}</span>
                  </Link>
  
                  {hasItems(category) && (
                    <motion.div
                      animate={{ rotate: expandedCategories[category.name] ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon icon="mdi:chevron-down" className="w-5 h-5" />
                    </motion.div>
                  )}
                </div>
  
                {/* Sub-items with animation */}
                <AnimatePresence>
                  {hasItems(category) && expandedCategories[category.name] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-6 mt-1 space-y-1">
                        {category.sidebarItems.map((item) => {
                          const itemPath = item.path.startsWith('/') 
                            ? item.path 
                            : `${category.path}/${item.path}`;
                          
                          return (
                            <div key={itemPath}>
                              {/* Main sub-item link */}
                              <div
                                onClick={() =>
                                  hasNestedItems(item) ? toggleCategory(item.name) : null
                                }
                                className={`flex items-center justify-between px-3 py-2 rounded text-sm transition-colors cursor-pointer ${
                                  pathname === itemPath || 
                                  (hasNestedItems(item) && item.items.some(subItem => 
                                    pathname === `${category.path}${subItem.path}`
                                  ))
                                    ? "bg-shade text-white"
                                    : "text-gray-600 hover:bg-shade hover:bg-opacity-10 hover:text-shade"
                                }`}
                              >
                                <Link
                                  to={itemPath}
                                  className={`flex items-center flex-grow ${
                                    hasNestedItems(item) ? "pointer-events-none" : ""
                                  }`}
                                  onClick={(e) => {
                                    if (hasNestedItems(item)) {
                                      e.preventDefault();
                                    }
                                  }}
                                >
                                  <span className="mr-2">{item.icon}</span>
                                  {item.name}
                                </Link>
  
                                {hasNestedItems(item) && (
                                  <motion.div
                                    animate={{
                                      rotate: expandedCategories[item.name] ? 180 : 0,
                                    }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <Icon icon="mdi:chevron-down" className="w-4 h-4" />
                                  </motion.div>
                                )}
                              </div>
  
                              {/* Nested children of sub-item */}
                              <AnimatePresence>
                                {hasNestedItems(item) && expandedCategories[item.name] && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="ml-6 space-y-1 overflow-hidden"
                                  >
                                    {item.items.map((subItem: any) => {
                                      const subItemPath = `${category.path}${subItem.path}`;
                                      return (
                                        <Link
                                          key={subItemPath}
                                          to={subItemPath}
                                          className={`flex items-center px-3 py-2 rounded text-sm transition-colors ${
                                            pathname === subItemPath
                                              ? "bg-shade text-white"
                                              : "text-gray-600 hover:bg-shade hover:bg-opacity-10 hover:text-shade"
                                          }`}
                                        >
                                          <span className="mr-2">{subItem.icon}</span>
                                          {subItem.name}
                                        </Link>
                                      );
                                    })}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </nav>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10 shadow-lg">
        <div className="flex justify-around">
          {ROUTES.filter((r) => r.mobile).map((category) => (
            <Link
              key={category.name}
              to={
                hasItems(category)
                  ? category.sidebarItems[0].path.startsWith('/')
                    ? category.sidebarItems[0].path
                    : `${category.path}/${category.sidebarItems[0].path}`
                  : category.path
              }
              className={`flex flex-col items-center py-3 px-4 text-xs transition-colors ${
                isActive(category.path, true)
                  ? "text-shade"
                  : "text-gray-500 hover:text-shade"
              }`}
            >
              <span className="mb-1 text-lg">{category.icon}</span>
              <span className="text-[0.7rem]">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;