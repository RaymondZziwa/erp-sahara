import { imageURL } from "../../utils/api";

interface HeaderProps {
  title: string;
  date: string;
}

const Header: React.FC<HeaderProps> = (props) => {
  const currentProfile = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") ?? "").user.organisation
    : null;
  return (
    <div className="w-full mb-5 -mt-14">
      <div className="flex flex-row items-center justify-center gap-12">
      <div className="flex items-center justify-between w-full mb-1">
        {/* Logo on the left */}
        <div className="flex-shrink-0 mt-10">
          <img
            src={`${imageURL}/${currentProfile?.logo}`}
            alt="Company Logo"
            className="w-24 h-auto"
          />
        </div>

        <div className="mt-4 text-right">
          <td className="align-top">
            <h2 className="text-md font-bold">
              {currentProfile.organisation_name}
            </h2>

            <h2 className="text-sm">
              REG. No. AFF-KTV-MPN-MC-2023-93
          </h2> 
          <h2 className="text-sm">P.O BOX 251</h2>
            <h2 className="text-md font-bold">{currentProfile.address}</h2>
            <p className="text-sm">
              {currentProfile.organisation_email}
            </p>
            <p className="text-xs">{currentProfile.website}</p>
            <p className="text-xs">TIN. NA 102-778-057</p>
          </td>
        </div>
      </div>
    </div>
      <p className="text-center font-bold text-lg mt-2">
        {props.date && 
          `For the period ending ${props.date}`
        }
        
      </p>
      <p className="text-center font-bold text-xl mt-10">{props.title}</p>
    </div>
  );
};

export default Header;
