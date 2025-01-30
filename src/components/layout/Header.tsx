import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import malePic from "../../assets/images/male.jpg";
import femalePic from "../../assets/images/female.jpg";
import MobileSidebar from "./MobileSidebar";
const SettingsPage = () => {
  const { user, logOutHandler } = useAuth();
  const settings = [
    { name: "My Invoices", path: "/settings/invoices" },
    { name: "Profile", path: "/settings/profile" },
    { name: "Account Settings", path: "/settings/account" },
    { name: "Notifications", path: "/settings/notifications" },
    { name: "Privacy", path: "/settings/privacy" },
    { name: "Help", path: "/settings/help" },
  ];

  return (
    <div className="bg-white shadow-md rounded-lg p-4 w-60">
      <div className="flex items-center mb-4">
        <img
          src={user.first_name == "male" ? malePic : femalePic}
          alt="User"
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="ml-3">
          <div className="text-gray-800 font-semibold">{user.first_name}</div>
          <div className="text-gray-500 text-sm">{user.email}</div>
        </div>
      </div>
      {settings.map((setting) => (
        <Link
          to={setting.path}
          key={setting.path}
          className="block text-gray-800 hover:text-blue-600 transition-colors mb-2"
        >
          {setting.name}
        </Link>
      ))}
      <button
        onClick={logOutHandler}
        className="text-red-500 hover:text-red-700 mt-4 w-full text-left"
      >
        Sign out
      </button>
    </div>
  );
};

const Header = () => {
  return (
    <div className="flex items-center mx-8 pt-4 pb-2 justify-between border-b pr-3 py-2 ">
      <div className="flex items-center space-x-4 justify-between w-full">
        <MobileSidebar />

        <div className="flex gap-2">
          <Icon icon="mdi-light:magnify" fontSize={24} />
          <Icon icon="solar:widget-3-line-duotone" fontSize={24} />
        </div>

        <div className="flex gap-2">
          <Icon
            icon="mdi-light:magnify"
            fontSize={24}
            className="text-blue-500 hover:text-blue-700 transition-all duration-300"
          />
          <Icon
            icon="solar:widget-3-line-duotone"
            fontSize={24}
            className="text-green-500 hover:text-green-700 transition-all duration-300"
          />
          <Icon
            icon="mdi-light:home"
            fontSize={24}
            className="text-red-500 hover:text-red-700 transition-all duration-300"
          />
          <Icon
            icon="mdi-light:account"
            fontSize={24}
            className="text-yellow-500 hover:text-yellow-700 transition-all duration-300"
          />
        </div>
      </div>
      <div className="relative group">
        <div className="flex items-center space-x-2 cursor-pointer">
          <Icon icon="solar:user-line-duotone" fontSize={24} />
          <Icon icon="solar:alt-arrow-down-line-duotone" fontSize={12} />
        </div>
        <div className="z-50 invisible absolute right-0 -mt-2 w-60 bg-white border border-gray-200 shadow-lg rounded-lg  group-hover:visible">
          <SettingsPage />
        </div>
      </div>
    </div>
  );
};

export default Header;
