"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface PatientFormProps {
  onPatientAdded?: () => void;
  onSuccess?: () => void;
  currentBranch?: string;
  branch?: string;
}

export default function PatientForm({
  onPatientAdded,
  onSuccess,
  currentBranch,
  branch,
}: PatientFormProps) {
  const [opNumber, setOpNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [allergies, setAllergies] = useState("");
  const [loading, setLoading] = useState(false);

  const activeBranch = currentBranch || branch || "Ezhukone";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      alert("Please enter patient name");
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        patient_name: fullName.trim(),
        full_name: fullName.trim(),
        gender: gender || "Male",
        phone: phone.trim() || null,
        phone_number: phone.trim() || null,
        address: address.trim() || null,
        medical_history: medicalHistory.trim() || "n/a",
        allergies: allergies.trim() || null,
        branch: activeBranch,
      };

      if (opNumber.trim()) {
        payload.op_number = opNumber.trim();
        payload.op_no = opNumber.trim();
      }

      if (age.trim()) {
        payload.age = parseInt(age, 10);
      }

      const { data, error } = await supabase.from("patients").insert([payload]).select();

      if (error) {
        console.error("Supabase insert error:", error);
        alert("Registration failed: " + error.message);
        return;
      }

      alert("Patient registered successfully!");

      setOpNumber("");
      setFullName("");
      setAge("");
      setPhone("");
      setAddress("");
      setMedicalHistory("");
      setAllergies("");

      if (onPatientAdded) onPatientAdded();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Error submitting form:", err);
      alert("An unexpected error occurred: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
      <h2 className="text-xl font-bold text-stone-800 mb-4">Patient Registration</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">OP Number</label>
            <input
              type="text"
              placeholder="e.g. OP-101"
              value={opNumber}
              onChange={(e) => setOpNumber(e.target.value)}
              className="w-full border border-stone-200 rounded-lg p-2.5 text-sm outline-none focus:border-stone-400 bg-stone-50/50"
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
              className="w-full border border-stone-200 rounded-lg p-2.5 text-sm outline-none focus:border-stone-400 bg-stone-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Age</label>
            <input
              type="number"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full border border-stone-200 rounded-lg p-2.5 text-sm outline-none focus:border-stone-400 bg-stone-50/50"
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
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-stone-200 rounded-lg p-2.5 text-sm outline-none focus:border-stone-400 bg-stone-50/50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">Address</label>
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border border-stone-200 rounded-lg p-2.5 text-sm outline-none focus:border-stone-400 bg-stone-50/50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">Medical History</label>
          <input
            type="text"
            placeholder="e.g. Diabetic, Hypertension..."
            value={medicalHistory}
            onChange={(e) => setMedicalHistory(e.target.value)}
            className="w-full border border-stone-200 rounded-lg p-2.5 text-sm outline-none focus:border-stone-400 bg-stone-50/50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">Allergies (if any)</label>
          <input
            type="text"
            placeholder="e.g. Penicillin, Latex..."
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            className="w-full border border-stone-200 rounded-lg p-2.5 text-sm outline-none focus:border-stone-400 bg-stone-50/50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#c86d3b] hover:bg-[#b05d2e] text-white font-semibold py-3 rounded-xl transition duration-200 shadow-sm cursor-pointer disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register Patient"}
        </button>
      </form>
    </div>
  );
}
