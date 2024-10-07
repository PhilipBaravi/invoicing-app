import { FC } from "react";
import { PanelRightOpen, LayoutDashboard, UserSearch, FolderKanban, UserPen, LogIn } from 'lucide-react';
import { motion } from "framer-motion";  // Using Framer Motion for animation

interface SideBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Employee', icon: UserSearch },
  { name: 'Product', icon: FolderKanban },
  { name: 'Profile', icon: UserPen },
  { name: 'Login', icon: LogIn },
];

const SideBar: FC<SideBarProps> = ({ onClose }) => {
  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 w-[23.75rem] h-screen bg-stone-50 dark:bg-stone-950 flex flex-col border-r dark:border-stone-400 light:border-stone-700 z-50"
    >
      <PanelRightOpen
        className="ml-auto cursor-pointer light:text-stone-950 dark:text-stone-50 mt-[20px] mr-[20px]"
        onClick={onClose}
      />
      <div className="flex flex-col items-start gap-[20px] p-6">
        <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-5xl">Overview</h1>
        <ul className="w-full">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.name}
                className="leading-7 [&:not(:first-child)]:mt-2 text-lg flex items-center gap-[10px] px-2 py-2 rounded-md hover:bg-accent transition-all cursor-pointer"
              >
                <Icon className="light:text-stone-950 dark:text-stone-50" />
                {item.name}
              </li>
            );
          })}
        </ul>
      </div>
    </motion.div>
  );
};

export default SideBar;
