"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Patient } from "@/lib/types";
import PatientForm from "@/components/PatientForm";
import AppointmentsList from "@/components/AppointmentsList";
import TreatmentForm from "@/components/TreatmentForm";
import AllergyBadge from "@/components/AllergyBadge";

type Tab = "appointments" | "patients" | "treatments";

const TABS: { id: Tab; label: string }[] = [
  { id: "appointments", label: "Daily OP" },
  { id: "patients", label: "Patients" },
  { id: "treatments", label: "Treatment & billing" },
];

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("patients");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [patientsError, setPatientsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadPatients = useCallback(async () => {
    setLoadingPatients(true);
    setPatientsError(null);
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setPatientsError(error.message);
    } else {
      setPatients((data as Patient[]) || []);
    }
    setLoadingPatients(false);
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const filteredPatients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => {
      const matchName = p.name?.toLowerCase().includes(q);
      const matchPhone = p.phone?.toLowerCase().includes(q);
      const matchOp = p.op_number?.toLowerCase().includes(q);
      return matchName || matchPhone || matchOp;
    });
  }, [patients, searchQuery]);

  function handleOpenPatientTreatment(patientId: string) {
    setSelectedPatientId(patientId);
    setTab("treatments");
  }

  return (
    <main className="min-h-screen bg-stone-100 text-stone-900 pb-16 font-sans">
      <header className="border-b border-stone-200 bg-stone-50/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-stone-900">
              Dr. Syam&apos;s Dental Clinic
            </h1>
            <p className="text-xs font-serif italic tracking-wider text-amber-800/90 font-medium mt-0.5">
              ✦ Chandanathope &bull; Ezhukone ✦
            </p>
          </div>
          <div className="text-xs font-mono text-stone-500 uppercase">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </div>
        </div>

        <nav className="max-w-6xl mx-auto px-4 flex gap-2 border-t border-stone-200/60 pt-2 pb-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                tab === t.id
                  ? "bg-stone-900 text-stone-50 shadow-sm"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="max-w-6xl mx-auto px-4 pt-6">
        {tab === "appointments" && (
          <AppointmentsList patients={patients} onUpdated={loadPatients} />
        )}

        {tab === "patients" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PatientForm onRegistered={loadPatients} />

            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-stone-800">
                    All patients ({patients.length})
                  </h2>
                  <p className="text-xs text-stone-500">
                    Click any patient card to open treatment record & history.
                  </p>
                </div>
              </div>

              {/* Patient Search Input Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Search by Name, OP No, or Phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2.5 pl-3 border border-stone-300 rounded-lg text-sm bg-stone-50 focus:bg-white focus:outline-none focus:border-stone-800 transition shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-700 bg-stone-200 rounded-full px-1.5 py-0.5"
                  >
                    ✕
                  </button>
                )}
              </div>

              {loadingPatients && (
                <p className="text-xs text-stone-400">Loading patients...</p>
              )}
              {patientsError && (
                <p className="text-xs text-red-500">Error: {patientsError}</p>
              )}

              {filteredPatients.length === 0 && !loadingPatients && (
                <div className="p-4 text-center bg-stone-50 rounded-lg border border-dashed border-stone-200 text-stone-400 text-xs">
                  No patient found matching &ldquo;{searchQuery}&rdquo;
                </div>
              )}

              <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                {filteredPatients.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleOpenPatientTreatment(p.id)}
                    className="p-3.5 bg-stone-50 hover:bg-amber-50/50 cursor-pointer rounded-lg border border-stone-200 hover:border-stone-400 transition space-y-2 shadow-xs group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {p.op_number && (
                          <span className="bg-stone-800 text-white font-mono text-[10px] px-1.5 py-0.5 rounded font-semibold">
                            OP: {p.op_number}
                          </span>
                        )}
                        <span className="font-bold text-stone-900 text-sm group-hover:text-amber-950">
                          {p.name}
                        </span>
                        {p.gender && (
                          <span className="text-stone-500 text-xs">({p.gender})</span>
                        )}
                      </div>
                      <AllergyBadge text={p.allergies} />
                    </div>

                    <div className="text-stone-600 flex flex-wrap gap-x-4 text-[11px]">
                      {p.age && <span>Age: <strong>{p.age} yrs</strong></span>}
                      {p.phone && <span>Ph: <strong>{p.phone}</strong></span>}
                    </div>

                    {p.address && (
                      <div className="text-stone-600 text-[11px]">
                        <span className="font-semibold text-stone-700">Address: </span>
                        {p.address}
                      </div>
                    )}

                    {p.medical_history && (
                      <div className="text-amber-800 text-[11px] bg-amber-50 p-1.5 rounded border border-amber-200">
                        <span className="font-semibold">Med History: </span>
                        {p.medical_history}
                      </div>
                    )}

                    <div className="pt-1 flex justify-end">
                      <span className="text-[11px] font-semibold text-stone-600 group-hover:text-stone-900 flex items-center gap-1">
                        Open History & Treatment ➔
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "treatments" && (
          <TreatmentForm
            patients={patients}
            selectedPatientId={selectedPatientId}
            onSelectPatient={(id) => setSelectedPatientId(id)}
          />
        )}
      </div>
    </main>
  );
}
