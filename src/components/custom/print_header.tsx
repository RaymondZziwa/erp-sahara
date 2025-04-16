//@ts-nocheck
import saharaLogo from "../../assets/images/sahara.jpeg";
import latcuLogo from "../../assets/images/logos/ltcu.jpeg";
import { org } from "../../utils/api";
interface HeaderProps {
  title: string;
  date: string;
}

const Header: React.FC<HeaderProps> = (props) => {
  return (
    <div className="w-full mb-5">
      <div className="flex flex-col items-center justify-center gap-12">
        <div>
          <img
            src={org === "latcu" ? latcuLogo : saharaLogo}
            alt="Company Logo"
            className="w-44 h-auto"
          />
        </div>
        <div>
          {org === "sahara" ? (
            <td className="align-top text-center">
              <h2 className="text-xl font-bold">SAHARA TANGAWIZI TEA</h2>
              <h2 className="text-lg font-bold">
                MALCOM SSEMA BUSINESS SOLUTIONS LTD
              </h2>
              <h2 className="text-xl font-bold">NATETE-MUTUNDWE</h2>
            </td>
          ) : (
            <td className="align-top text-center">
              <h2 className="text-xl font-bold">
                LAKE TANGANYIKA CO-OPERATIVE UNION LIMITED
              </h2>

              <h2 className="text-xl font-bold">
                REG. No. AFF-KTV-MPN-MC-2023-93 P.O BOX 251
              </h2>
              <h2 className="text-xl font-bold">MPANDA-KATAVI</h2>
              <hr className="my-2" />
              <p className="text-sm">
                Email: latcu-mpanda@gmail.com | info@latcu.co.tz
              </p>
              <p className="text-sm">Website: www.latcu.co.tz</p>
              <p className="text-sm">TIN. NA 102-778-057</p>
            </td>
          )}
        </div>
        <p className="text-center font-bold text-lg mt-10">For the period {props.date}</p>
      </div>
      <p className="text-center font-bold text-xl mt-10">{props.title}</p>
    </div>
  );
};

export default Header;
