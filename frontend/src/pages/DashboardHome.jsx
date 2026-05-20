import { useAuth } from "../context/AuthContext";

export default function DashboardHome() {
  const { user } = useAuth();

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Welcome back, {user?.username}!
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          You are logged in as{" "}
          <span className="font-medium text-gray-700">
            {user?.userType || "User"}
          </span>
          .
        </p>
      </div>
    </div>
  );
}
