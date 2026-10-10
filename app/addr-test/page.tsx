"use client";
import { useState } from "react";
import AddressSearchField from "@/components/AddressSearchField";
export default function Page() {
  const [v, setV] = useState("");
  const [checked, setChecked] = useState(false);
  return (
    <div className="p-8">
      <label className="block">
        <input type="checkbox" id="cb" checked={checked} onChange={() => setChecked((c) => !c)} />
        <AddressSearchField onChange={setV} />
      </label>
      <p id="out">{v}</p>
      <p id="cbstate">{String(checked)}</p>
    </div>
  );
}
