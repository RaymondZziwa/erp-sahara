import { Link, useLocation } from "react-router-dom";
import ROUTES from "../../routes/ROUTES";

const Sidebar = () => {
  const { pathname } = useLocation();

  return (
    <div className="bg-bg">
      <div className="flex flex-col lg:flex-row  h-full mt-2 ">
        <div className="lg:w-fit w-full lg:static flex flex-col lg:flex-col bg-[#F2FCFC] h-full min-h-screen px-2 p-2">
          <ol
            role="list"
            className=" grid grid-cols-3 md:grid-cols-1 max-h-dvh min-w-32"
          >
            {ROUTES.filter((r) => !r.hidden).map((sidebarItem) => (
              <Link
                to={sidebarItem.path}
                className={`relative px-2 py-1  flex items-center  transition-colors duration-300 rounded ${
                  (pathname.split("/").length <= 2
                    ? ""
                    : sidebarItem.path.includes(
                        "/" + pathname.split("/")[1]
                      )) || sidebarItem.path == pathname
                    ? "bg-shade text-white my-2 "
                    : "bg-inherit hover:bg-shade hover:text-white"
                } `}
                key={sidebarItem.name}
              >
                <li key={sidebarItem.path}>
                  <div className="flex items-center gap-1 p-2">
                    <div
                      className={` ${
                        (pathname.split("/").length <= 2
                          ? ""
                          : sidebarItem.path.includes(
                              "/" + pathname.split("/")[1]
                            )) || sidebarItem.path == pathname
                          ? "bg-shade text-white"
                          : ""
                      } `}
                    >
                      {sidebarItem.icon}
                    </div>
                    <h4 className="text-sm ">{sidebarItem.name}</h4>
                  </div>
                </li>
              </Link>
            ))}
          </ol>
        </div>
        <div className="p-2 max-h-[100vh] overflow-y-auto">
        <div role="list" className="py-2">
          {ROUTES.filter(
            (route) => route.path === "/" + pathname.split("/")[1]
          ).map((sidebarItem) => (
            <div
              key={sidebarItem.path}
              className={`${
                sidebarItem.sidebarItems.length == 1 &&
                sidebarItem.sidebarItems[0].items.length == 1 &&
                "hidden"
              }`}
            >
              {sidebarItem.sidebarItems.map((item) => (
                <div key={item.path} className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">{item.name}</h4>
                  <ol role="list" className="md:pl-4 rounded">
                    {item.items.map(
                      (nestedItem) =>
                        !nestedItem?.hidden && (
                          <Link
                            key={nestedItem.path}
                            to={sidebarItem.path + item.path + nestedItem.path}
                          >
                            <li
                              key={nestedItem.path}
                              className={`flex items-center gap-2 py-2 md:px-4 px-1 ${
                                pathname ===
                                sidebarItem.path + item.path + nestedItem.path
                                  ? "text-shade "
                                  : " hover:bg-shade hover:text-white text-gray-600 hover:rounded"
                              }`}
                            >
                              <div
                                className={` ${
                                  pathname ===
                                  sidebarItem.path + item.path + nestedItem.path
                                    ? "text-shade "
                                    : " hover:bg-shade hover:text-white hover:rounded"
                                }`}
                              >
                                {nestedItem.icon}
                              </div>
                              <span className="text-sm">{nestedItem.name}</span>
                            </li>
                          </Link>
                        )
                    )}
                  </ol>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Sidebar;
