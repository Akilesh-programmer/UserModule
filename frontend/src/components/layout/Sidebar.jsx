import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  MdDashboard,
  MdExpandMore,
  MdExpandLess,
  MdClose,
  MdSupervisedUserCircle,
  MdInventory,
  MdLocationOn,
  MdStorefront,
  MdPublic,
  MdReceiptLong,
  MdBusiness,
  MdStore,
  MdBolt,
  MdBusinessCenter,
} from "react-icons/md";
import { FiUsers, FiShield, FiUserCheck, FiUserPlus, FiPackage, FiLayers, FiGrid, FiBox, FiMap, FiMapPin, FiTag, FiFileText, FiFile, FiShoppingCart, FiClipboard, FiTruck } from "react-icons/fi";
import { HiOutlineUserGroup } from "react-icons/hi";
import { TbRulerMeasure, TbReceipt2, TbBuildingStore } from "react-icons/tb";
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
      { label: "User Type", icon: <FiUserCheck size={15} />, path: "/admin/user-type" },
      { label: "User Creation", icon: <FiUsers size={15} />, path: "/admin/user-creation" },
      { label: "User Permission", icon: <FiShield size={15} />, path: "/admin/user-permission" },
    ],
  },
  {
    label: "Master",
    icon: <MdSupervisedUserCircle size={18} />,
    children: [
      { label: "Company", icon: <MdBusiness size={15} />, path: "/master/company" },
      { label: "Country", icon: <MdPublic size={15} />, path: "/master/country" },
      { label: "State", icon: <FiMap size={15} />, path: "/master/state" },
      { label: "City", icon: <MdLocationOn size={15} />, path: "/master/city" },
      { label: "Pincode", icon: <FiMapPin size={15} />, path: "/master/pincode" },
      { label: "Area", icon: <FiMapPin size={15} />, path: "/master/area" },
      { label: "Manager", icon: <FiUserCheck size={15} />, path: "/master/manager" },
      { label: "Sales Rep", icon: <FiUserPlus size={15} />, path: "/master/sales-rep" },
      { label: "Dealer", icon: <TbBuildingStore size={15} />, path: "/master/dealer" },
      { label: "Market", icon: <MdStorefront size={15} />, path: "/master/market" },
      { label: "Shop Type", icon: <MdStore size={15} />, path: "/master/shop-type" },
      { label: "Expense Type", icon: <MdReceiptLong size={15} />, path: "/master/expense-type" },
    ],
  },
  {
    label: "Item Category",
    icon: <MdInventory size={18} />,
    children: [
      { label: "Categories", icon: <FiLayers size={15} />, path: "/item-category/category" },
      { label: "Groups", icon: <FiGrid size={15} />, path: "/item-category/group" },
      { label: "Tax", icon: <TbReceipt2 size={15} />, path: "/item-category/tax" },
      { label: "Unit of Measure", icon: <TbRulerMeasure size={15} />, path: "/item-category/unit-of-measure" },
      { label: "Packing Type", icon: <FiPackage size={15} />, path: "/item-category/packing-type" },
      { label: "Items", icon: <FiBox size={15} />, path: "/item-category/item" },
      { label: "Schemes", icon: <FiTag size={15} />, path: "/item-category/scheme" },
      { label: "Scheme PDF", icon: <FiFileText size={15} />, path: "/item-category/scheme-pdf" },
      { label: "Application PDF", icon: <FiFile size={15} />, path: "/item-category/application-pdf" },
    ],
  },
  {
    label: "Operations",
    icon: <MdBusinessCenter size={18} />,
    children: [
      { label: "Stock Entry", icon: <FiPackage size={15} />, path: "/operations/stock-entry" },
      { label: "Order Receipt", icon: <FiShoppingCart size={15} />, path: "/operations/order-receipt" },
      { label: "Order Management", icon: <FiClipboard size={15} />, path: "/operations/order-management" },
      { label: "Secondary Sales", icon: <FiTruck size={15} />, path: "/operations/secondary-sales" },
    ],
  },
];

function NavGroup({ item, onClose }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="space-y-0.5">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-white/60 hover:bg-white/8 hover:text-white/90 transition-all duration-150"
      >
        <span className="flex-shrink-0 text-white/50">{item.icon}</span>
        <span className="flex-1 text-[13px]">{item.label}</span>
        <span className="flex-shrink-0 text-white/30 transition-transform duration-200" style={{ transform: open ? "rotate(0)" : "rotate(-90deg)" }}>
          <MdExpandMore size={16} />
        </span>
      </button>

      <div
        className="overflow-hidden transition-all duration-250"
        style={{ maxHeight: open ? "600px" : "0", opacity: open ? 1 : 0 }}
      >
        <div className="ml-3 pl-3 border-l border-white/8 space-y-0.5 pb-1">
          {item.children.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13px] transition-all duration-150",
                  isActive
                    ? "bg-primary text-white font-semibold nav-active-glow"
                    : "text-white/55 hover:bg-white/8 hover:text-white/90",
                )
              }
            >
              <span className="flex-shrink-0">{child.icon}</span>
              <span>{child.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex w-[260px] flex-col transition-transform duration-300 lg:relative lg:translate-x-0",
        "shadow-sidebar",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
      style={{ background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)" }}
    >
      {/* Brand */}
      <div className="flex h-16 flex-shrink-0 items-center justify-between px-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-button">
            <MdBolt size={18} className="text-white" />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-white">
            SalesForce
          </span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-white/40 hover:bg-white/10 hover:text-white transition-colors"
        >
          <MdClose size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 py-3 space-y-1">
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
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary text-white font-semibold nav-active-glow"
                    : "text-white/60 hover:bg-white/8 hover:text-white/90",
                )
              }
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ),
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/[0.06]">
        <p className="text-[10px] text-white/20 text-center tracking-wider uppercase">
          SalesForce v1.0
        </p>
      </div>
    </aside>
  );
}
