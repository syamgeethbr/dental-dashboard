"use client";

import React, { useState, useEffect } from "react";
import PatientForm from "@/components/PatientForm";
import AppointmentsList from "@/components/AppointmentsList";
import TreatmentForm from "@/components/TreatmentForm";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"visits" | "daily_op" | "patients" | "treatment">("visits");
  const [selectedBranch, setSelectedBranch] = useState<string>("Ezhukone");
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  // Fetch all patients
  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (err: any) {
      console.error("Error fetching patients:", err.message);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Filter Patients based on Selected Date for Daily Visits Tab
  const dailyVisitedPatients = patients.filter((patient) => {
    if (!patient.created_at) return false;
    const patientDate = new Date(patient.created_at).toISOString().split("T")[0];
    return patientDate === selectedDate;
  });

  // Filter Patients for All Patients search
  const filteredPatients = patients.filter((patient) => {
    const name = patient.name || patient.patient_name || patient.full_name || "";
    const op = patient.op_number || patient.op_no || "";
    const phone = patient.phone || patient.phone_number || "";
    const q = searchQuery.toLowerCase();

    return (
      name.toLowerCase().includes(q) ||
      op.toLowerCase().includes(q) ||
      phone.toLowerCase().includes(q)
    );
  });

  // Format time (e.g., 10:30 AM)
  const formatTime = (isoString: string) => {
    if (!isoString) return "—";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  return (
    <main className="min-h-screen bg-[#faf8f5] text-stone-800 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-20 px-4 sm:px-8 py-4 flex flex-wrap justify-between items-center shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Dr. Syam's Dental Clinic
          </h1>
          <p className="text-xs text-stone-500 font-medium">Dental Clinic Desk — Doctor Dashboard</p>
        </div>

        {/* Branch Selector */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl shadow-xs mt-2 sm:mt-0">
          <span className="text-xs font-bold text-amber-900">Branch:</span>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-white border border-amber-300 text-amber-950 font-bold text-xs rounded-lg px-2.5 py-1 outline-none cursor-pointer"
          >
            <option value="Ezhukone">Ezhukone</option>
            <option value="Chandanathope">Chandanathope</option>
          </select>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-stone-200 pb-3">
          <button
            onClick={() => setActiveTab("visits")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
              activeTab === "visits"
                ? "bg-[#c86d3b] text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            📋 Daily Visits & Time ({dailyVisitedPatients.length})
          </button>

          <button
            onClick={() => setActiveTab("patients")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
              activeTab === "patients"
                ? "bg-stone-900 text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            👤 Patient Registration
          </button>

          <button
            onClick={() => setActiveTab("daily_op")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
              activeTab === "daily_op"
                ? "bg-stone-900 text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            📅 Daily OP & Slots
          </button>

          <button
            onClick={() => setActiveTab("treatment")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
              activeTab === "treatment"
                ? "bg-stone-900 text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            🦷 Treatment & Billing
          </button>
        </div>

        {/* TAB 1: DAILY VISITS & TIME LOG (NEW FEATURE) */}
        {activeTab === "visits" && (
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-stone-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-stone-100">
              <div>
                <h2 className="text-lg font-bold text-stone-900">
                  Daily Patient Visits & Time Log
                </h2>
                <p className="text-xs text-stone-500">
                  Select any date to see visited patients and arrival times
                </p>
              </div>

              {/* Responsive Date Picker */}
              <div className="flex items-center gap-2 bg-stone-50 border border-stone-300 px-3 py-2 rounded-xl">
                <span className="text-xs font-bold text-stone-600">📅 Date:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-sm font-bold text-stone-800 outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Visit Cards List */}
            <div className="space-y-3">
              {dailyVisitedPatients.length === 0 ? (
                <div className="text-center py-12 text-stone-400">
                  <p className="text-base font-semibold">No patients logged on {selectedDate}</p>
                  <p className="text-xs mt-1">Patients registered on this date will appear here automatically.</p>
                </div>
              ) : (
                dailyVisitedPatients.map((patient, index) => {
                  const name = patient.name || patient.patient_name || patient.full_name || "Patient";
                  const phone = patient.phone || patient.phone_number || "";
                  const time = formatTime(patient.created_at);

                  return (
                    <div
                      key={patient.id || index}
                      className="p-4 border border-stone-200 rounded-xl hover:border-amber-300 hover:bg-amber-50/20 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-stone-100 text-stone-800 text-xs px-2.5 py-0.5 rounded-md font-bold">
                            OP: {patient.op_number || "—"}
                          </span>
                          <span className="font-bold text-base text-stone-900">{name}</span>
                          <span className="text-xs text-stone-500">
                            ({patient.gender || "—"}, {patient.age ? `${patient.age} yrs` : "—"})
                          </span>
                        </div>
                        <div className="text-xs text-stone-600 flex flex-wrap gap-3">
                          <span>📞 {phone || "No phone"}</span>
                          {patient.medical_history && patient.medical_history !== "n/a" && (
                            <span className="text-red-700 font-medium">⚠️ {patient.medical_history}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <span className="text-xs font-bold text-stone-700 bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg">
                          ⏰ {time}
                        </span>
                        {phone && (
                          <a
                            href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs"
                          >
                            💬 WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PATIENTS & REGISTRATION */}
        {activeTab === "patients" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <PatientForm currentBranch={selectedBranch} onPatientAdded={fetchPatients} />
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-stone-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-stone-800">
                    All Patients ({filteredPatients.length})
                  </h2>
                </div>

                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search by Name, OP Number, or Phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-stone-400"
                  />
                </div>

                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {filteredPatients.map((patient) => {
                    const name = patient.name || patient.patient_name || patient.full_name || "Patient";
                    const phone = patient.phone || patient.phone_number || "";

                    return (
                      <div
                        key={patient.id}
                        className="p-3.5 border border-stone-100 rounded-xl hover:border-stone-300 hover:bg-stone-50/50 transition flex justify-between items-center"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="bg-stone-100 text-stone-700 text-xs px-2 py-0.5 rounded font-bold">
                              OP: {patient.op_number || "—"}
                            </span>
                            <span className="font-bold text-sm text-stone-900">{name}</span>
                            <span className="text-xs text-stone-500">({patient.gender || "—"})</span>
                          </div>
                          <div className="text-xs text-stone-500 mt-1">
                            Age: {patient.age || "—"} yrs | Ph: {phone || "—"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DAILY OP & SLOTS */}
        {activeTab === "daily_op" && (
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-stone-200">
            <AppointmentsList />
          </div>
        )}

        {/* TAB 4: TREATMENT & BILLING */}
        {activeTab === "treatment" && (
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-stone-200">
            <TreatmentForm />
          </div>
        )}
      </div>
    </main>
  );
}
