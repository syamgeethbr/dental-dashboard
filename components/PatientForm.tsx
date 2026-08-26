"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function PatientForm({ onRegistered }: { onRegistered?: () => void }) {
  const [form, setForm] = useState({
    op_number: "",
    name: "",
    age: "",
    gender: "Male",
    phone: "",
    address: "",
    medical_history: "",
    allergies: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Patient Name is required");
      return;
    }

    setSaving(true);
    setError(null);

    const { error: insertError } = await supabase.from("patients").insert([
      {
        op_number: form.op_number.trim() || null,
        name: form.name.trim(),
        age: form.age ? parseInt(form.age, 10) : null,
        gender: form.gender,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        medical_history: form.medical_history.trim() || null,
        allergies: form.allergies.trim() || null,
      },
    ]);

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setForm({
      op_number: "",
      name: "",
      age: "",
      gender: "Male",
      phone: "",
      address: "",
      medical_history: "",
      allergies: "",
    });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 3000);
    if (onRegistered) onRegistered();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
      <h2 className="text-lg font-bold text-stone-800">New Patient</h2>
      <p className="text-xs text-stone-500">Register a patient once — their record carries into appointments and treatments.</p>

      {error && <div className="p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
      {justSaved && <div className="p-3 bg-emerald-50 text-emerald-700 rounded text-sm">Patient registered successfully!</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">OP Number</label>
          <input
            type="text"
            placeholder="e.g. OP-101"
            value={form.op_number}
            onChange={(e) => update("op_number", e.target.value)}
            className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-800"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Full Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Anjali Menon"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-800"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Age</label>
          <input
            type="number"
            placeholder="32"
            value={form.age}
            onChange={(e) => update("age", e.target.value)}
            className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-800"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Sex / Gender</label>
          <select
            value={form.gender}
            onChange={(e) => update("gender", e.target.value)}
            className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-800 bg-white"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Phone</label>
          <input
            type="tel"
            placeholder="+91 98xxxxxxxx"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-800"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Address</label>
        <textarea
          rows={2}
          placeholder="House name, Street, Place..."
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
          className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-800"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Medical History</label>
        <textarea
          rows={2}
          placeholder="Diabetes, hypertension, prior surgeries..."
          value={form.medical_history}
          onChange={(e) => update("medical_history", e.target.value)}
          className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-800"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Allergies</label>
        <input
          type="text"
          placeholder="Penicillin, Latex, NSAIDs..."
          value={form.allergies}
          onChange={(e) => update("allergies", e.target.value)}
          className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-800"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm rounded-lg transition"
      >
        {saving ? "Registering Patient..." : "Register Patient"}
      </button>
    </form>
  );
}