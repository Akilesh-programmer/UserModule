import { useState, useEffect } from "react";
import InputField from "../../common/InputField";
import SelectField from "../../common/SelectField";
import { fetchActiveStates } from "../../../api/stateApi";
import { fetchCitiesByState } from "../../../api/cityApi";
import { fetchPincodesByCity } from "../../../api/pincodeApi";
import { fetchAreasByPincode } from "../../../api/areaApi";

export default function AddressFields({ form, onChange, errors = {} }) {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    fetchActiveStates().then((r) => setStates(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.stateId) {
      fetchCitiesByState(form.stateId).then((r) => setCities(r.data || [])).catch(() => {});
    } else {
      setCities([]);
    }
  }, [form.stateId]);

  useEffect(() => {
    if (form.cityId) {
      fetchPincodesByCity(form.cityId).then((r) => setPincodes(r.data || [])).catch(() => {});
    } else {
      setPincodes([]);
    }
  }, [form.cityId]);

  useEffect(() => {
    if (form.pincodeId) {
      fetchAreasByPincode(form.pincodeId).then((r) => setAreas(r.data || [])).catch(() => {});
    } else {
      setAreas([]);
    }
  }, [form.pincodeId]);

  const handleCascade = (e) => {
    const { name, value } = e.target;
    const resets = {};
    if (name === "stateId") {
      resets.cityId = "";
      resets.pincodeId = "";
      resets.areaId = "";
    } else if (name === "cityId") {
      resets.pincodeId = "";
      resets.areaId = "";
    } else if (name === "pincodeId") {
      resets.areaId = "";
    }
    onChange({ target: { name, value } });
    Object.entries(resets).forEach(([k, v]) => {
      onChange({ target: { name: k, value: v } });
    });
  };

  return (
    <div className="grid grid-cols-1 gap-2">
      <SelectField
        label="State"
        name="stateId"
        value={form.stateId || ""}
        onChange={handleCascade}
        options={states.map((s) => ({ value: s._id, label: s.name }))}
        error={errors.stateId}
        placeholder="Select state"
      />
      <SelectField
        label="City"
        name="cityId"
        value={form.cityId || ""}
        onChange={handleCascade}
        options={cities.map((c) => ({ value: c._id, label: c.name }))}
        error={errors.cityId}
        placeholder="Select city"
      />
      <SelectField
        label="Pincode"
        name="pincodeId"
        value={form.pincodeId || ""}
        onChange={handleCascade}
        options={pincodes.map((p) => ({ value: p._id, label: p.code }))}
        error={errors.pincodeId}
        placeholder="Select pincode"
      />
      <SelectField
        label="Area"
        name="areaId"
        value={form.areaId || ""}
        onChange={onChange}
        options={areas.map((a) => ({ value: a._id, label: a.name }))}
        error={errors.areaId}
        placeholder="Select area"
      />
      <InputField
        label="Street"
        name="street"
        value={form.street || ""}
        onChange={onChange}
        placeholder="Street / Door No"
      />
    </div>
  );
}
