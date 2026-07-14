import { useState, useEffect } from "react";
import {
  MdPeople,
  MdStorefront,
  MdShoppingCart,
  MdTrendingUp,
  MdLocalShipping,
  MdAccountBalanceWallet,
  MdAssignmentReturn,
  MdLogin,
  MdMap,
} from "react-icons/md";
import { FiUserPlus } from "react-icons/fi";
import { fetchDashboardStats } from "../api/dashboardApi";
import toast from "react-hot-toast";

export default function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats()
      .then((r) => {
        setStats(r.data || null);
      })
      .catch(() => {
        toast.error("Failed to fetch dashboard metrics");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const statCards = [
    {
      label: "Sales Rep",
      value: stats?.salesRepCount ?? 0,
      icon: <FiUserPlus size={22} />,
      gradient: "from-indigo-500 to-indigo-600",
      bgLight: "bg-indigo-50",
      textColor: "text-indigo-600",
    },
    {
      label: "Dealers",
      value: stats?.dealerCount ?? 0,
      icon: <MdStorefront size={22} />,
      gradient: "from-violet-500 to-violet-600",
      bgLight: "bg-violet-50",
      textColor: "text-violet-600",
    },
    {
      label: "Shops",
      value: stats?.shopCount ?? 0,
      icon: <MdStorefront size={22} />,
      gradient: "from-blue-500 to-blue-600",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Order Receipt",
      value: stats?.orderReceiptCount ?? 0,
      icon: <MdShoppingCart size={22} />,
      gradient: "from-emerald-500 to-emerald-600",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      label: "Secondary Sales",
      value: stats?.secondarySalesCount ?? 0,
      icon: <MdTrendingUp size={22} />,
      gradient: "from-cyan-500 to-cyan-600",
      bgLight: "bg-cyan-50",
      textColor: "text-cyan-600",
    },
    {
      label: "Order Dispatch",
      value: stats?.orderDispatchCount ?? 0,
      icon: <MdLocalShipping size={22} />,
      gradient: "from-amber-500 to-amber-600",
      bgLight: "bg-amber-50",
      textColor: "text-amber-600",
    },
    {
      label: "Income (2026)",
      value: `₹${(stats?.incomeTotal ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      icon: <MdAccountBalanceWallet size={22} />,
      gradient: "from-green-500 to-green-600",
      bgLight: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Sales Return",
      value: `₹${(stats?.returnsTotal ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      icon: <MdAssignmentReturn size={22} />,
      gradient: "from-rose-500 to-rose-600",
      bgLight: "bg-rose-50",
      textColor: "text-rose-600",
    },
    {
      label: "Login Sessions",
      value: "0",
      icon: <MdLogin size={22} />,
      gradient: "from-slate-500 to-slate-600",
      bgLight: "bg-slate-50",
      textColor: "text-slate-600",
    },
    {
      label: "Market",
      value: stats?.marketCount ?? 0,
      icon: <MdMap size={22} />,
      gradient: "from-purple-500 to-purple-600",
      bgLight: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ];

  return (
    <div className="page-enter">
      {/* Welcome Banner */}
      <div
        className="rounded-2xl px-6 py-5 mb-6 shadow-md"
        style={{
          background:
            "linear-gradient(135deg, #6366f1 0%, #4f46e5 40%, #7c3aed 100%)",
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Welcome to SalesForce
            </h1>
            <p className="text-indigo-200 text-sm mt-1">
              Your sales management overview at a glance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-white/15 backdrop-blur-sm border border-white/20">
              <span className="text-xs font-medium text-white">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {loading
          ? Array.from({ length: 10 }).map((_, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-xl bg-white border border-gray-100 p-4 shadow-sm h-32 animate-pulse flex flex-col justify-between"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-16" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
              </div>
            ))
          : statCards.map((stat) => (
              <div
                key={stat.label}
                className="stats-card relative overflow-hidden rounded-xl bg-white border border-gray-100 p-4 shadow-sm"
              >
                {/* Decorative gradient accent */}
                <div
                  className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.gradient}`}
                />

                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${stat.bgLight} flex items-center justify-center ${stat.textColor}`}
                  >
                    {stat.icon}
                  </div>
                </div>

                <div>
                  <p className="text-2xl font-bold text-gray-900 tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-xs font-medium text-gray-500 mt-0.5 uppercase tracking-wide">
                    {stat.label}
                  </p>
                </div>

                {/* Subtle background decoration */}
                <div
                  className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full ${stat.bgLight} opacity-40`}
                />
              </div>
            ))}
      </div>

      {/* Quick Summary Bar */}
      <div className="mt-6 rounded-xl bg-white border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-500 to-purple-600" />
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            Quick Summary
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-white border border-indigo-100/50">
            <MdPeople className="text-indigo-500" size={20} />
            <div>
              <p className="text-xs text-gray-500">Total Users</p>
              <p className="text-sm font-bold text-gray-900">
                {loading ? "..." : (stats?.salesRepCount || 0) + (stats?.dealerCount || 0)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-white border border-emerald-100/50">
            <MdShoppingCart className="text-emerald-500" size={20} />
            <div>
              <p className="text-xs text-gray-500">Total Orders</p>
              <p className="text-sm font-bold text-gray-900">
                {loading ? "..." : stats?.orderReceiptCount || 0}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-white border border-amber-100/50">
            <MdLocalShipping className="text-amber-500" size={20} />
            <div>
              <p className="text-xs text-gray-500">Dispatched</p>
              <p className="text-sm font-bold text-gray-900">
                {loading ? "..." : stats?.orderDispatchCount || 0}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-rose-50 to-white border border-rose-100/50">
            <MdAssignmentReturn className="text-rose-500" size={20} />
            <div>
              <p className="text-xs text-gray-500">Returns Value</p>
              <p className="text-sm font-bold text-gray-900 font-mono">
                {loading ? "..." : `₹${(stats?.returnsTotal || 0).toLocaleString("en-IN")}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
