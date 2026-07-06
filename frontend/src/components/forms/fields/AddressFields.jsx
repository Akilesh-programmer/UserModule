import { useState, useEffect } from "react";
import SearchSelect from "../../common/SearchSelect";
import InputField from "../../common/InputField";
import { fetchActiveCountries } from "../../../api/countryApi";
import { fetchActiveStates } from "../../../api/stateApi";
import { fetchActiveCities } from "../../../api/cityApi";
import { fetchActivePincodes } from "../../../api/pincodeApi";
import { fetchActiveAreas } from "../../../api/areaApi";

export default function AddressFields({ form, onChange, errors = {} }) {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    fetchActiveCountries().then((r) => setCountries(r.data || [])).catch((err) => console.error("Failed to load countries:", err));
  }, []);

  useEffect(() => {
    if (form.countryId) {
      fetchActiveStates(form.countryId).then((r) => setStates(r.data || [])).catch((err) => console.error("Failed to load states:", err));
    } else { setStates([]); }
  }, [form.countryId]);

  useEffect(() => {
    if (form.stateId) {
      fetchActiveCities(form.stateId).then((r) => setCities(r.data || [])).catch((err) => console.error("Failed to load cities:", err));
    } else { setCities([]); }
  }, [form.stateId]);

  useEffect(() => {
    if (form.cityId) {
      fetchActivePincodes(form.cityId).then((r) => setPincodes(r.data || [])).catch((err) => console.error("Failed to load pincodes:", err));
    } else { setPincodes([]); }
  }, [form.cityId]);

  useEffect(() => {
    if (form.pincodeId) {
      fetchActiveAreas(form.pincodeId).then((r) => setAreas(r.data || [])).catch((err) => console.error("Failed to load areas:", err));
    } else { setAreas([]); }
  }, [form.pincodeId]);

  const handleCascade = (e) => {
    const { name, value } = e.target;
    const resets = {};
    if (name === "countryId") Object.assign(resets, { stateId: "", cityId: "", pincodeId: "", areaId: "" });
    if (name === "stateId") Object.assign(resets, { cityId: "", pincodeId: "", areaId: "" });
    if (name === "cityId") Object.assign(resets, { pincodeId: "", areaId: "" });
    if (name === "pincodeId") Object.assign(resets, { areaId: "" });
    Object.entries({ ...resets, [name]: value }).forEach(([k, v]) => {
      onChange({ target: { name: k, value: v } });
    });
  };

  return (
    <div className="grid grid-cols-2 gap-1.5">
      <SearchSelect
        label="Country"
        name="countryId"
        value={form.countryId || ""}
        onChange={handleCascade}
        options={countries.map((c) => ({ value: c._id, label: c.name }))}
        error={errors.countryId}
        placeholder="Select country"
        className="col-span-2 sm:col-span-1"
      />
      <SearchSelect
        label="State"
        name="stateId"
        value={form.stateId || ""}
        onChange={handleCascade}
        options={states.map((s) => ({ value: s._id, label: s.name }))}
        error={errors.stateId}
        placeholder="Select state"
        className="col-span-2 sm:col-span-1"
      />
      <SearchSelect
        label="City"
        name="cityId"
        value={form.cityId || ""}
        onChange={handleCascade}
        options={cities.map((c) => ({ value: c._id, label: c.name }))}
        error={errors.cityId}
        placeholder="Select city"
        className="col-span-2 sm:col-span-1"
      />
      <SearchSelect
        label="Pincode"
        name="pincodeId"
        value={form.pincodeId || ""}
        onChange={handleCascade}
        options={pincodes.map((p) => ({ value: p._id, label: p.code }))}
        error={errors.pincodeId}
        placeholder="Select pincode"
        className="col-span-2 sm:col-span-1"
      />
      <SearchSelect
        label="Area"
        name="areaId"
        value={form.areaId || ""}
        onChange={onChange}
        options={areas.map((a) => ({ value: a._id, label: a.name }))}
        error={errors.areaId}
        placeholder="Select area"
        className="col-span-2 sm:col-span-1"
      />
      <InputField
        label="Street / Door No"
        name="street"
        value={form.street || ""}
        onChange={onChange}
        placeholder="Street address"
        className="col-span-2 sm:col-span-1"
      />
    </div>
  );
}
