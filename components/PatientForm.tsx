"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface PatientFormProps {
  onSuccess?: () => void;
  branch: string;
  setBranch: (branch: string) => void;
}

export default function PatientForm({ onSuccess, branch, setBranch }: PatientFormProps) {
  const [opNumber, setOpNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [allergies, setAllergies] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) {
      alert("Please enter patient name");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.from("patients").insert([
        {
          op_number: opNumber || null,
          full_name: fullName,
          age: age ? parseInt(age, 10) : null,
          gender: gender,
          phone_number: phoneNumber,
          address: address,
          medical_history: medicalHistory,
          allergies: allergies,
          branch: branch,
        },
      ]);

      if (error) throw error;

      alert("Patient registered successfully!");
      setOpNumber("");
      setFullName("");
      setAge("");
      setPhoneNumber("");
      setAddress("");
      setMedicalHistory("");
      setAllergies("");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-stone-800">New Patient Registration</h2>
        
        {/* Clickable Branch Dropdown */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg shadow-sm">
          <span className="text-xs font-semibold text-amber-900">Branch:</span>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="bg-white border border-amber-300 rounded px-2 py-0.5 text-xs font-bold text-amber-900 focus:outline-none cursor-pointer"
          >
            <option value="Ezhukone">Ezhukone</option>
            <option value="Chandanathope">Chandanathope</option>
          </select>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">OP Number</label>
            <input
              type="text"
              placeholder="e.g. OP-101"
              value={opNumber}
              onChange={(e) => setOpNumber(e.target.value)}
              className="w-full border border-stone-200 rounded-lg p-2.5 text-sm outline-none focus:border-stone-400"
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
              className="w-full border border-stone-200 rounded-lg p-2.5 text-sm outline-none focus:border-stone-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Age</label>
            <input
              type="number"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full border border-stone-200 rounded-lg p-2.5 text-sm outline-none focus:border-stone-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full border border-stone-200 rounded-lg p-2.5 text-sm outline-none focus:border-stone-400 bg-white"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">Phone Number</label>
          <input
            type="text"
            placeholder="+91..."
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full border border-stone-200 rounded-lg p-2.5 text-sm outline-none focus:border-stone-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">Address</label>
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border border-stone-200 rounded-lg p-2.5 text-sm outline-none focus:border-stone-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">Medical History</label>
          <input
            type="text"
            placeholder="e.g. Diabetic, Hypertensive..."
            value={medicalHistory}
            onChange={(e) => setMedicalHistory(e.target.value)}
            className="w-full border border-stone-200 rounded-lg p-2.5 text-sm outline-none focus:border-stone-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">Allergies (if any)</label>
          <input
            type="text"
            placeholder="e.g. Penicillin, Latex..."
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            className="w-full border border-stone-200 rounded-lg p-2.5 text-sm outline-none focus:border-stone-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#c86d3b] hover:bg-[#b05d2e] text-white font-semibold py-3 rounded-xl transition duration-200 shadow-sm"
        >
          {loading ? "Registering..." : "Register Patient"}
        </button>
      </form>
    </div>
  );
}
