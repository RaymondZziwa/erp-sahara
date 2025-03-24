import logo from "../../assets/images/logos/ltcu.jpeg"

interface HeaderProps {
    title: string
}

const Header: React.FC<HeaderProps> = (props) => {
  return (
    <div className="w-full mb-5">
      <table className="w-full">
        <tr>
          <td className="align-top">
            <img src={logo} alt="Company Logo" className="w-44 h-auto" />
          </td>
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
        </tr>
      </table>
      <p className="text-center font-bold text-xl mt-10">{props.title}</p>
    </div>
  );
};

export default Header;
