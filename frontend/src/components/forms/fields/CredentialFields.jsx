import InputField from "../../common/InputField";
import PasswordInput from "../../common/PasswordInput";

export default function CredentialFields({ form, errors, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-3">
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
      <PasswordInput
        label="Password"
        required
        name="password"
        value={form.password}
        onChange={onChange}
        error={errors.password}
        placeholder="Min 8 chars, 1 uppercase, 1 number"
        autoComplete="new-password"
      />
      <PasswordInput
        label="Confirm Password"
        required
        name="confirmPassword"
        value={form.confirmPassword}
        onChange={onChange}
        error={errors.confirmPassword}
        placeholder="Repeat password"
        autoComplete="new-password"
      />
    </div>
  );
}
