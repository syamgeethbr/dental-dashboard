"use client";

import React, { useState, useEffect } from "react";
import PatientForm from "@/components/PatientForm";
import AppointmentsList from "@/components/AppointmentsList";
import TreatmentForm from "@/components/TreatmentForm";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"patients" | "treatment">("patients");
  const [selectedBranch, setSelectedBranch] = useState<string>("Ezhukone");
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("branch", selectedBranch)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (err: any) {
      console.error("Error fetching patients:", err.message);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [selectedBranch]);

  const filteredPatients = patients.filter((patient) => {
    const q = searchQuery.toLowerCase();
    return (
      (patient.full_name && patient.full_name.toLowerCase().includes(q)) ||
      (patient.op_number && patient.op_number.toLowerCase().includes(q)) ||
      (patient.phone_number && patient.phone_number.toLowerCase().includes(q))
    );
  });

  return (
    <main className="min-h-screen bg-[#faf8f5] text-stone-800 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10 px-6 py-4 flex flex-wrap justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Dr. Syam's Dental Clinic
          </h1>
          <p className="text-xs text-stone-500 font-medium">Dental Clinic Desk — Doctor Dashboard</p>
        </div>

        {/* Live Active Branch Selector */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl shadow-sm mt-2 sm:mt-0">
          <span className="text-xs font-bold text-amber-900">Branch:</span>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-white border border-amber-300 text-amber-950 font-bold text-xs rounded-lg px-2.5 py-1 outline-none shadow-inner cursor-pointer"
          >
            <option value="Ezhukone">Ezhukone</option>
            <option value="Chandanathope">Chandanathope</option>
          </select>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 border-b border-stone-200 pb-2">
          <button
            onClick={() => setActiveTab("patients")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === "patients"
                ? "bg-stone-900 text-white shadow-sm"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            Patients
          </button>
          <button
            onClick={() => setActiveTab("treatment")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === "treatment"
                ? "bg-stone-900 text-white shadow-sm"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            Treatment & Billing
          </button>
        </div>

        {activeTab === "patients" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Registration Form */}
            <div className="lg:col-span-6">
              <PatientForm
                branch={selectedBranch}
                setBranch={setSelectedBranch}
                onSuccess={fetchPatients}
              />
            </div>

            {/* Right: Patient List */}
            <div className="lg:col-span-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-stone-800">
                    All Patients ({filteredPatients.length})
                  </h2>
                  <span className="text-xs text-stone-400 font-medium">
                    Branch: {selectedBranch}
                  </span>
                </div>

                {/* Search Box */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search by Name, OP No, or Phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-stone-400"
                  />
                </div>

                {/* Patient Cards */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {filteredPatients.length === 0 ? (
                    <p className="text-sm text-stone-400 text-center py-6">
                      No patients found for this branch.
                    </p>
                  ) : (
                    filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        onClick={() => setSelectedPatient(patient)}
                        className="p-3.5 border border-stone-100 rounded-xl hover:border-stone-300 hover:bg-stone-50/50 transition cursor-pointer flex justify-between items-start"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="bg-stone-100 text-stone-700 text-xs px-2 py-0.5 rounded font-bold">
                              OP: {patient.op_number || "—"}
                            </span>
                            <span className="font-bold text-sm text-stone-800">
                              {patient.full_name}
                            </span>
                            <span className="text-xs text-stone-500">
                              ({patient.gender || "—"})
                            </span>
                          </div>
                          <div className="text-xs text-stone-500 mt-1">
                            Age: {patient.age || "—"} yrs | Ph: {patient.phone_number || "—"}
                          </div>
                          {patient.medical_history && (
                            <div className="text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded mt-1.5 inline-block">
                              Med History: {patient.medical_history}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <TreatmentForm branch={selectedBranch} />
          </div>
        )}
      </div>
    </main>
  );
}
