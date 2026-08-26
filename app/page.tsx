"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Patient, Appointment, Treatment, Branch } from "@/lib/types";
import PatientForm from "@/components/PatientForm";
import AppointmentsList from "@/components/AppointmentsList";
import TreatmentForm from "@/components/TreatmentForm";

export default function Dashboard() {
  const [branch, setBranch] = useState<Branch>("Ezhukone");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const [patientsRes, apptsRes, treatsRes] = await Promise.all([
      supabase
        .from("patients")
        .select("*")
        .eq("branch", branch)
        .order("created_at", { ascending: false }),
      supabase
        .from("appointments")
        .select("*, patients(*)")
        .order("slot_time", { ascending: true }),
      supabase
        .from("treatments")
        .select("*, patients(*)")
        .order("created_at", { ascending: false }),
    ]);

    if (patientsRes.data) setPatients(patientsRes.data as Patient[]);
    if (apptsRes.data) setAppointments(apptsRes.data as Appointment[]);
    if (treatsRes.data) setTreatments(treatsRes.data as Treatment[]);

    setLoading(false);
  }, [branch]);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("realtime-dashboard")
      .on("postgres_changes", { event: "*", schema: "public" }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [branch, fetchData]);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header & Branch Switcher */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Dr. Syam's Dental Clinic</h1>
          <p className="text-sm text-stone-500">Doctor & Clinic Management Dashboard</p>
        </div>

        {/* Branch Toggle Buttons */}
        <div className="flex bg-stone-100 p-1.5 rounded-xl border border-stone-200">
          <button
            onClick={() => setBranch("Ezhukone")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              branch === "Ezhukone"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            📍 Ezhukone Branch
          </button>
          <button
            onClick={() => setBranch("Chandanathope")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              branch === "Chandanathope"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            📍 Chandanathope Branch
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form & Patient List */}
        <div className="space-y-6">
          <PatientForm onPatientAdded={fetchData} currentBranch={branch} />

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
            <h3 className="font-semibold text-stone-800 flex justify-between items-center">
              <span>{branch} Patients</span>
              <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                {patients.length} total
              </span>
            </h3>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {patients.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedPatientId === p.id
                      ? "border-amber-500 bg-amber-50/50"
                      : "border-stone-100 bg-stone-50 hover:bg-stone-100"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm text-stone-900">{p.full_name}</p>
                    <span className="text-xs text-stone-400 font-mono">{p.op_number}</span>
                  </div>
                  {p.allergies && (
                    <span className="inline-block mt-1 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                      ⚠️ {p.allergies}
                    </span>
                  )}
                </div>
              ))}
              {patients.length === 0 && !loading && (
                <p className="text-xs text-stone-400 py-4 text-center">No patients registered in {branch} yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Appointments & Treatments */}
        <div className="lg:col-span-2 space-y-6">
          <AppointmentsList
            appointments={appointments}
            onUpdate={fetchData}
          />

          <TreatmentForm
            selectedPatient={selectedPatient}
            treatments={treatments}
            onTreatmentAdded={fetchData}
          />
        </div>
      </div>
    </main>
  );
}