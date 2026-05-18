import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  MdDashboard,
  MdExpandMore,
  MdExpandLess,
  MdClose,
  MdSupervisedUserCircle,
} from "react-icons/md";
import { FiUsers, FiShield, FiUserCheck, FiUserPlus } from "react-icons/fi";
import { HiOutlineUserGroup } from "react-icons/hi";
import styles from "./Sidebar.module.css";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: <MdDashboard />,
    path: "/",
  },
  {
    label: "Master",
    icon: <HiOutlineUserGroup />,
    children: [
      {
        label: "User Type",
        icon: <FiUserCheck />,
        path: "/master/user-type",
      },
      {
        label: "User Creation",
        icon: <FiUsers />,
        path: "/master/user-creation",
      },
      {
        label: "User Permission",
        icon: <FiShield />,
        path: "/master/user-permission",
      },
    ],
  },
  {
    label: "Staff",
    icon: <MdSupervisedUserCircle />,
    children: [
      {
        label: "Manager",
        icon: <FiUserCheck />,
        path: "/staff/manager",
      },
      {
        label: "Sales Rep",
        icon: <FiUserPlus />,
        path: "/staff/sales-rep",
      },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const [expandedGroups, setExpandedGroups] = useState(
    () => new Set(["Master"]),
  );

  const toggleGroup = (label) =>
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
      <div className={styles.brand}>
        <button className={styles.closeBtn} onClick={onClose}>
          <MdClose />
        </button>
      </div>
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) =>
          item.children ? (
            <div key={item.label}>
              <button
                className={styles.groupBtn}
                onClick={() => toggleGroup(item.label)}
              >
                <span className={styles.icon}>{item.icon}</span>
                <span className={styles.label}>{item.label}</span>
                <span className={styles.chevron}>
                  {expandedGroups.has(item.label) ? (
                    <MdExpandLess />
                  ) : (
                    <MdExpandMore />
                  )}
                </span>
              </button>
              {expandedGroups.has(item.label) && (
                <div className={styles.subNav}>
                  {item.children.map((child) => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `${styles.navLink} ${isActive ? styles.active : ""}`
                      }
                    >
                      <span className={styles.icon}>{child.icon}</span>
                      <span>{child.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              end
              onClick={onClose}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              <span className={styles.icon}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ),
        )}
      </nav>
    </aside>
  );
}
