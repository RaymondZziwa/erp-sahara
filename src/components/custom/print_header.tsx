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
    <div className="w-full mb-5">
      <div className="flex flex-row items-center justify-center gap-12">
        <div>
          <img
            src={`${imageURL}/${currentProfile?.logo}`}
            alt="Company Logo"
            className="w-44 h-auto"
          />
        </div>
        <div>
          <td className="align-top text-center">
            <h2 className="text-xl font-bold">
              {currentProfile.organisation_name}
            </h2>

            {/* <h2 className="text-xl font-bold">
              REG. No. AFF-KTV-MPN-MC-2023-93 P.O BOX 251
            </h2> */}
            <h2 className="text-xl font-bold">{currentProfile.address}</h2>
            <hr className="my-2" />
            <p className="text-sm">
              Email: {currentProfile.organisation_email}
            </p>
            <p className="text-sm">Website: {currentProfile.website}</p>
            {/* <p className="text-sm">TIN. NA 102-778-057</p> */}
          </td>
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
