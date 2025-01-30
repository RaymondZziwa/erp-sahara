import { ReactElement } from "react";

export interface Route {
  name: string;
  icon: ReactElement;
  path: string;
  sidebarItems: SidebarItem[];
  hidden?: boolean;
}

interface SidebarItem {
  name: string;
  icon: ReactElement;
  path: string;
  items: Item[];
}

interface Item {
  name: string;
  icon: ReactElement;
  path: string;
  element: React.ReactNode | null;
  hidden?: boolean;
}
