import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  MdDashboard,
  MdExpandMore,
  MdExpandLess,
  MdClose,
  MdSupervisedUserCircle,
  MdInventory,
} from "react-icons/md";
import { FiUsers, FiShield, FiUserCheck, FiUserPlus, FiPackage, FiLayers, FiGrid, FiBox } from "react-icons/fi";
import { HiOutlineUserGroup } from "react-icons/hi";
import { TbRulerMeasure, TbReceipt2 } from "react-icons/tb";
import { cn } from "../../lib/cn";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: <MdDashboard size={18} />,
    path: "/",
  },
  {
    label: "Admin",
    icon: <HiOutlineUserGroup size={18} />,
    children: [
      {
        label: "User Type",
        icon: <FiUserCheck size={16} />,
        path: "/admin/user-type",
      },
      {
        label: "User Creation",
        icon: <FiUsers size={16} />,
        path: "/admin/user-creation",
      },
      {
        label: "User Permission",
        icon: <FiShield size={16} />,
        path: "/admin/user-permission",
      },
    ],
  },
  {
    label: "Master",
    icon: <MdSupervisedUserCircle size={18} />,
    children: [
      {
        label: "Manager",
        icon: <FiUserCheck size={16} />,
        path: "/master/manager",
      },
      {
        label: "Sales Rep",
        icon: <FiUserPlus size={16} />,
        path: "/master/sales-rep",
      },
    ],
  },
  {
    label: "Item Category",
    icon: <MdInventory size={18} />,
    children: [
      {
        label: "Categories",
        icon: <FiLayers size={16} />,
        path: "/item-category/category",
      },
      {
        label: "Groups",
        icon: <FiGrid size={16} />,
        path: "/item-category/group",
      },
      {
        label: "Tax",
        icon: <TbReceipt2 size={16} />,
        path: "/item-category/tax",
      },
      {
        label: "Unit of Measure",
        icon: <TbRulerMeasure size={16} />,
        path: "/item-category/unit-of-measure",
      },
      {
        label: "Packing Type",
        icon: <FiPackage size={16} />,
        path: "/item-category/packing-type",
      },
      {
        label: "Items",
        icon: <FiBox size={16} />,
        path: "/item-category/item",
      },
    ],
  },
];

function NavGroup({ item, onClose }) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
      >
        <span className="flex-shrink-0">{item.icon}</span>
        <span className="flex-1">{item.label}</span>
        <span className="flex-shrink-0 text-white/50">
          {open ? <MdExpandLess size={16} /> : <MdExpandMore size={16} />}
        </span>
      </button>

      {open && (
        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
          {item.children.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-white font-medium"
                    : "text-white/60 hover:bg-white/10 hover:text-white",
                )
              }
            >
              <span className="flex-shrink-0">{child.icon}</span>
              <span>{child.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-sidebar transition-transform duration-300 lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex h-16 flex-shrink-0 items-center justify-between px-5">
        <span className="text-lg font-bold tracking-tight text-white">
          UserModule
        </span>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors lg:hidden"
        >
          <MdClose size={18} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {NAV_ITEMS.map((item) =>
          item.children ? (
            <NavGroup key={item.label} item={item} onClose={onClose} />
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              end
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                )
              }
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ),
        )}
      </nav>
    </aside>
  );
}
