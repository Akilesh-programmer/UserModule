import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import InputField from "../components/common/InputField";
import PasswordInput from "../components/common/PasswordInput";
import Button from "../components/common/Button";
import { MdBolt } from "react-icons/md";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = "Username is required";
    if (!form.password) errs.password = "Password is required";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await login(form);
      toast.success("Login successful");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 px-6">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-button">
            <MdBolt size={22} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">SalesForce</span>
        </div>

        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-1.5 text-sm text-gray-500">Sign in to your account to continue</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card ring-1 ring-gray-100 p-7">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <InputField
                label="Username"
                type="text"
                name="username"
                id="username"
                placeholder="Enter your username"
                value={form.username}
                onChange={handleChange}
                error={errors.username}
                autoComplete="username"
              />
            </div>
            <div>
              <PasswordInput
                label="Password"
                name="password"
                id="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="mt-2 w-full"
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

