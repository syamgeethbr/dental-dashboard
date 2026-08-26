"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Branch } from "@/lib/types";

interface PatientFormProps {
  onPatientAdded: () => void;
  currentBranch: Branch;
}

export default function PatientForm({ onPatientAdded, currentBranch }: PatientFormProps) {
  const [fullName, setFullName] = useState("");
  const [opNumber, setOpNumber] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [phone, setPhone] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [allergies, setAllergies] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setLoading(true);
    const { error } = await supabase.from("patients").insert([
      {
        op_number: opNumber.trim() || `OP-${Date.now().toString().slice(-4)}`,
        full_name: fullName.trim(),
        age: age ? parseInt(age) : null,
        gender,
        phone: phone.trim(),
        medical_history: medicalHistory.trim() || null,
        allergies: allergies.trim() || null,
        branch: currentBranch,
      },
    ]);

    setLoading(false);

    if (!error) {
      setFullName("");
      setOpNumber("");
      setAge("");
      setPhone("");
      setMedicalHistory("");
      setAllergies("");
      onPatientAdded();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 space-y-4">
      <div className="flex justify-between items-center border-b border-stone-100 pb-3">
        <h3 className="font-semibold text-stone-800">New Patient Registration</h3>
        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
          {currentBranch} Branch
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">OP Number</label>
          <input
            type="text"
            placeholder="e.g. OP-101"
            value={opNumber}
            onChange={(e) => setOpNumber(e.target.value)}
            className="w-full p-2.5 text-sm border rounded-xl border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">Full Name *</label>
          <input
            type="text"
            required
            placeholder="Patient Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-2.5 text-sm border rounded-xl border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">Age</label>
          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full p-2.5 text-sm border rounded-xl border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full p-2.5 text-sm border rounded-xl border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-stone-600 mb-1">Phone Number</label>
          <input
            type="tel"
            placeholder="+91..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2.5 text-sm border rounded-xl border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-stone-600 mb-1">Medical History</label>
          <input
            type="text"
            placeholder="e.g. Diabetic, Hypertensive..."
            value={medicalHistory}
            onChange={(e) => setMedicalHistory(e.target.value)}
            className="w-full p-2.5 text-sm border rounded-xl border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-stone-600 mb-1">Allergies (if any)</label>
          <input
            type="text"
            placeholder="e.g. Penicillin, Latex..."
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            className="w-full p-2.5 text-sm border rounded-xl border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 rounded-xl transition-all shadow-sm"
      >
        {loading ? "Registering..." : "Register Patient"}
      </button>
    </form>
  );
}