"use client";

import React, { useState, useEffect } from "react";
import PatientForm from "@/components/PatientForm";
import AppointmentsList from "@/components/AppointmentsList";
import TreatmentForm from "@/components/TreatmentForm";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"daily_op" | "patients" | "treatment">("patients");
  const [selectedBranch, setSelectedBranch] = useState<string>("Ezhukone");
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  // Fetch Patients based on Selected Branch
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

  // Filter Patients
  const filteredPatients = patients.filter((patient) => {
    const name = patient.full_name || patient.patient_name || patient.name || "";
    const op = patient.op_number || patient.op_no || "";
    const phone = patient.phone_number || patient.phone || "";
    const q = searchQuery.toLowerCase();

    return (
      name.toLowerCase().includes(q) ||
      op.toLowerCase().includes(q) ||
      phone.toLowerCase().includes(q)
    );
  });

  return (
    <main className="min-h-screen bg-[#faf8f5] text-stone-800 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-20 px-6 py-4 flex flex-wrap justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Dr. Syam's Dental Clinic
          </h1>
          <p className="text-xs text-stone-500 font-medium">Dental Clinic Desk — Doctor Dashboard</p>
        </div>

        {/* Live Active Branch Selector */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl shadow-sm mt-2 sm:mt-0">
          <span className="text-xs font-bold text-amber-900">Active Branch:</span>
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
        <div className="flex flex-wrap gap-2 mb-6 border-b border-stone-200 pb-3">
          <button
            onClick={() => setActiveTab("patients")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === "patients"
                ? "bg-stone-900 text-white shadow-sm"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            👤 Patients & Records
          </button>

          <button
            onClick={() => setActiveTab("daily_op")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === "daily_op"
                ? "bg-stone-900 text-white shadow-sm"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            📅 Daily OP & Appointments
          </button>

          <button
            onClick={() => setActiveTab("treatment")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === "treatment"
                ? "bg-stone-900 text-white shadow-sm"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            🦷 Treatment & Billing
          </button>
        </div>

        {/* Tab 1: Patients & Registration */}
        {activeTab === "patients" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <PatientForm
                branch={selectedBranch}
                setBranch={setSelectedBranch}
                onSuccess={fetchPatients}
              />
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-stone-800">
                    Patient Directory ({filteredPatients.length})
                  </h2>
                  <span className="text-xs bg-stone-100 text-stone-600 font-semibold px-2.5 py-1 rounded-full">
                    {selectedBranch} Branch
                  </span>
                </div>

                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search by Name, OP Number, or Phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-stone-400 shadow-sm"
                  />
                </div>

                <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
                  {filteredPatients.length === 0 ? (
                    <div className="text-center py-10 text-stone-400 text-sm">
                      No patients registered in {selectedBranch} branch yet.
                    </div>
                  ) : (
                    filteredPatients.map((patient) => {
                      const displayName =
                        patient.full_name ||
                        patient.patient_name ||
                        patient.name ||
                        "Unnamed Patient";
                      const op = patient.op_number || patient.op_no || "—";
                      const phone = patient.phone_number || patient.phone || "—";

                      return (
                        <div
                          key={patient.id}
                          onClick={() => setSelectedPatient(patient)}
                          className="p-4 border border-stone-200 rounded-xl hover:border-amber-400 hover:bg-amber-50/30 transition cursor-pointer flex justify-between items-center shadow-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="bg-amber-100 text-amber-900 text-xs px-2 py-0.5 rounded-md font-bold">
                                OP: {op}
                              </span>
                              <span className="font-bold text-base text-stone-900">
                                {displayName}
                              </span>
                              <span className="text-xs text-stone-500 font-medium">
                                ({patient.gender || "—"}, {patient.age ? `${patient.age} yrs` : "—"})
                              </span>
                            </div>
                            <div className="text-xs text-stone-600 mt-1.5 flex gap-4">
                              <span>📞 {phone}</span>
                              {patient.address && <span>📍 {patient.address}</span>}
                            </div>
                            {patient.medical_history && (
                              <div className="text-xs text-red-800 bg-red-50 border border-red-100 px-2 py-0.5 rounded mt-2 inline-block font-medium">
                                ⚠️ History: {patient.medical_history}
                              </div>
                            )}
                          </div>
                          <span className="text-xs bg-stone-900 text-white font-medium px-3 py-1.5 rounded-lg hover:bg-stone-700">
                            View Details →
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Daily OP & Appointments */}
        {activeTab === "daily_op" && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            {AppointmentsList ? (
              <AppointmentsList branch={selectedBranch} />
            ) : (
              <p className="text-stone-400">Loading Appointments...</p>
            )}
          </div>
        )}

        {/* Tab 3: Treatment & Billing */}
        {activeTab === "treatment" && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            {TreatmentForm ? (
              <TreatmentForm branch={selectedBranch} patient={selectedPatient} />
            ) : (
              <p className="text-stone-400">Loading Treatments...</p>
            )}
          </div>
        )}
      </div>

      {/* Patient Details Full Modal (Opens when clicked on any patient) */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in duration-150">
            <div className="bg-stone-900 text-white p-5 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  OP: {selectedPatient.op_number || selectedPatient.op_no || "—"}
                </span>
                <h3 className="text-xl font-bold">
                  {selectedPatient.full_name || selectedPatient.patient_name || selectedPatient.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-stone-400 hover:text-white text-2xl leading-none px-2"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-stone-100">
                <div>
                  <span className="text-xs text-stone-400 block font-semibold">Age & Gender</span>
                  <p className="font-bold text-stone-800">
                    {selectedPatient.age || "—"} yrs / {selectedPatient.gender || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-stone-400 block font-semibold">Branch</span>
                  <p className="font-bold text-amber-900">{selectedPatient.branch || selectedBranch}</p>
                </div>
              </div>

              <div className="pb-3 border-b border-stone-100">
                <span className="text-xs text-stone-400 block font-semibold">Phone Number</span>
                <div className="flex items-center justify-between mt-1">
                  <p className="font-bold text-stone-800">{selectedPatient.phone_number || selectedPatient.phone || "—"}</p>
                  {(selectedPatient.phone_number || selectedPatient.phone) && (
                    <a
                      href={`https://wa.me/${(selectedPatient.phone_number || selectedPatient.phone).replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs"
                    >
                      💬 WhatsApp
                    </a>
                  )}
                </div>
              </div>

              <div className="pb-3 border-b border-stone-100">
                <span className="text-xs text-stone-400 block font-semibold">Address</span>
                <p className="font-medium text-stone-700 mt-1">{selectedPatient.address || "No address provided"}</p>
              </div>

              <div className="pb-3 border-b border-stone-100">
                <span className="text-xs text-stone-400 block font-semibold">Medical History</span>
                <p className="font-semibold text-red-700 mt-1">
                  {selectedPatient.medical_history || "None recorded"}
                </p>
              </div>

              <div>
                <span className="text-xs text-stone-400 block font-semibold">Allergies</span>
                <p className="font-semibold text-amber-800 mt-1">
                  {selectedPatient.allergies || "None"}
                </p>
              </div>
            </div>

            <div className="bg-stone-50 p-4 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setSelectedPatient(null)}
                className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold px-5 py-2 rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
