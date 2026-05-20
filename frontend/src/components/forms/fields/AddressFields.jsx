import InputField from "../../common/InputField";

export default function AddressFields({ form, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <InputField
        label="Street"
        name="street"
        value={form.street}
        onChange={onChange}
        placeholder="Street / Door No"
        wrapperClassName="sm:col-span-2"
      />
      <InputField
        label="City"
        name="city"
        value={form.city}
        onChange={onChange}
        placeholder="City"
      />
      <InputField
        label="State"
        name="state"
        value={form.state}
        onChange={onChange}
        placeholder="State"
      />
      <InputField
        label="Pincode"
        name="pincode"
        value={form.pincode}
        onChange={onChange}
        placeholder="Pincode"
        maxLength={6}
      />
    </div>
  );
}
