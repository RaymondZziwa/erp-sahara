import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

const useUserPermissions = (permission: string): boolean => {
  const permissions = useSelector((state: RootState) => state.userAuth.permissions);

  return permissions?.includes(permission) ?? false;
};

export default useUserPermissions;
