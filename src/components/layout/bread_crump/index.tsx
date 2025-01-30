import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

const BreadCrump = ({ name, pageName }: { name: string; pageName: string }) => {
  return (
    <div className="flex bg-white shadow  my-4  justify-between px-8 py-2 rounded-md">
      <h4 className="font-semibold">{name}</h4>
      <div className="flex items-center gap-2">
        <Link to={"/"}>
          <Icon
            icon="solar:home-2-line-duotone"
            fontSize={18}
            className="cursor-pointer"
          />
        </Link>
        <h4 className="bg-shade text-sm px-2  rounded-md text-white">
          {pageName}
        </h4>
      </div>
    </div>
  );
};

export default BreadCrump;
