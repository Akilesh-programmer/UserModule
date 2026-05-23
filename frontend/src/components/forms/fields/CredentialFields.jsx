import InputField from "../../common/InputField";

export default function CredentialFields({ form, errors, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <InputField
        label="Username"
        required
        name="username"
        value={form.username}
        onChange={onChange}
        error={errors.username}
        placeholder="Choose a username"
        autoComplete="off"
      />
      <InputField
        label="Password"
        required
        name="password"
        type="password"
        value={form.password}
        onChange={onChange}
        error={errors.password}
        placeholder="Min 8 chars, 1 uppercase, 1 number"
        autoComplete="new-password"
      />
      <InputField
        label="Confirm Password"
        required
        name="confirmPassword"
        type="password"
        value={form.confirmPassword}
        onChange={onChange}
        error={errors.confirmPassword}
        placeholder="Repeat password"
        autoComplete="new-password"
      />
    </div>
  );
}
