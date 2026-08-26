"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Patient, Treatment } from "@/lib/types";

const DOCTORS = [
  "Dr. Shyamgeeth",
  "Dr. Nithya",
  "Dr. Lakshmi",
  "Dr. Aswathy",
  "Dr. Priyanka",
  "Dr. Prem Lakshmanan Pillai",
  "Dr. Praveen",
  "Dr. Manikandan",
  "Dr. Bhavan Anna",
];

const COMMON_PROCEDURES: { label: string; cost: number }[] = [
  { label: "Consultation", cost: 300 },
  { label: "Scaling & polishing", cost: 1200 },
  { label: "Cavity filling (composite)", cost: 1800 },
  { label: "Root canal treatment", cost: 4500 },
  { label: "Tooth extraction", cost: 1000 },
  { label: "Crown fitting", cost: 5000 },
  { label: "Smile Designing", cost: 15000 },
];

export default function TreatmentForm({
  patients,
  selectedPatientId,
  onSelectPatient,
}: {
  patients: Patient[];
  selectedPatientId?: string | null;
  onSelectPatient?: (id: string) => void;
}) {
  const [patientId, setPatientId] = useState(selectedPatientId || "");
  const [doctorName, setDoctorName] = useState(DOCTORS[0]);
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [oralExamination, setOralExamination] = useState("");
  const [diagnosisPlan, setDiagnosisPlan] = useState("");
  const [treatmentDone, setTreatmentDone] = useState("");
  const [medications, setMedications] = useState("");
  const [nextAppointment, setNextAppointment] = useState("");

  const [xrayFiles, setXrayFiles] = useState<File[]>([]);
  const [beforeFiles, setBeforeFiles] = useState<File[]>([]);
  const [afterFiles, setAfterFiles] = useState<File[]>([]);

  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const [cost, setCost] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const [recentTreatments, setRecentTreatments] = useState<Treatment[]>([]);

  useEffect(() => {
    if (selectedPatientId) {
      setPatientId(selectedPatientId);
    } else if (patients.length > 0 && !patientId) {
      setPatientId(patients[0].id);
    }
  }, [selectedPatientId, patients, patientId]);

  const loadRecent = useCallback(async () => {
    if (!patientId) return;
    const { data, error: fetchErr } = await supabase
      .from("treatments")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });
    if (data) {
      setRecentTreatments(data as Treatment[]);
    }
  }, [patientId]);

  useEffect(() => {
    loadRecent();
  }, [loadRecent, patientId]);

  function handleProcedureSelect(label: string, defaultCost: number) {
    setTreatmentDone(label);
    setCost(String(defaultCost));
    setAmountPaid(String(defaultCost));
  }

  async function uploadFileList(files: File[], folder: string): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
      const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const filePath = `${patientId}/${folder}/${Date.now()}_${cleanName}`;
      const { data, error } = await supabase.storage
        .from("patient-records")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (error) {
        console.error("Storage upload error:", error);
        throw new Error(`Image Upload Error: ${error.message}`);
      }
      if (data) {
        const { data: publicData } = supabase.storage
          .from("patient-records")
          .getPublicUrl(data.path);
        if (publicData?.publicUrl) {
          urls.push(publicData.publicUrl);
        }
      }
    }
    return urls;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId) {
      setError("Please select a patient");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const xrayUrls = await uploadFileList(xrayFiles, "xrays");
      const beforeUrls = await uploadFileList(beforeFiles, "before");
      const afterUrls = await uploadFileList(afterFiles, "after");

      const { error: insertError } = await supabase.from("treatments").insert([
        {
          patient_id: patientId,
          doctor_name: doctorName,
          chief_complaint: chiefComplaint.trim() || null,
          oral_examination: oralExamination.trim() || null,
          diagnosis_plan: diagnosisPlan.trim() || null,
          treatment_name: treatmentDone.trim() || "Consultation / Checkup",
          notes: null,
          cost: cost ? parseFloat(cost) : 0,
          amount_paid: amountPaid ? parseFloat(amountPaid) : 0,
          payment_method: paymentMethod,
          medications: medications.trim() || null,
          next_appointment_date: nextAppointment || null,
          xrays: xrayUrls.length > 0 ? xrayUrls : null,
          before_photos: beforeUrls.length > 0 ? beforeUrls : null,
          after_photos: afterUrls.length > 0 ? afterUrls : null,
        },
      ]);

      if (insertError) throw insertError;

      setJustSaved(true);
      setChiefComplaint("");
      setOralExamination("");
      setDiagnosisPlan("");
      setTreatmentDone("");
      setMedications("");
      setNextAppointment("");
      setCost("");
      setAmountPaid("");
      setXrayFiles([]);
      setBeforeFiles([]);
      setAfterFiles([]);
      await loadRecent();
      setTimeout(() => setJustSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save record");
    } finally {
      setSaving(false);
    }
  }

  const selectedPatientObj = patients.find((p) => p.id === patientId);

  return (
    <>
      {previewImg && (
        <div
          onClick={() => setPreviewImg(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white p-2 rounded-xl shadow-2xl">
            <button
              onClick={() => setPreviewImg(null)}
              className="absolute -top-3 -right-3 bg-stone-900 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow hover:bg-stone-700"
            >
              ✕
            </button>
            <img src={previewImg} alt="Patient Record" className="max-h-[85vh] max-w-full rounded object-contain" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-stone-800">Clinical Visit & Treatment Entry</h2>
                <p className="text-xs text-stone-500">Record clinical details, photos, X-rays & billing.</p>
              </div>
              {selectedPatientObj && (
                <div className="text-right bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
                  <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Active Patient</p>
                  <p className="text-sm font-bold text-stone-900">
                    {selectedPatientObj.op_number ? `[OP ${selectedPatientObj.op_number}] ` : ""}
                    {selectedPatientObj.name}
                  </p>
                </div>
              )}
            </div>

            {error && <div className="p-3 bg-red-50 text-red-600 rounded text-sm font-medium border border-red-200">{error}</div>}
            {justSaved && <div className="p-3 bg-emerald-50 text-emerald-700 rounded text-sm font-medium border border-emerald-200">Visit record with media saved successfully!</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Select Patient *</label>
                <select
                  value={patientId}
                  onChange={(e) => {
                    setPatientId(e.target.value);
                    if (onSelectPatient) onSelectPatient(e.target.value);
                  }}
                  className="w-full p-2.5 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:border-stone-800"
                  required
                >
                  <option value="">-- Select Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.op_number ? `[OP: ${p.op_number}] ` : ""}{p.name} {p.phone ? `(${p.phone})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Attending Doctor *</label>
                <select
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:border-stone-800"
                >
                  {DOCTORS.map((doc) => (
                    <option key={doc} value={doc}>
                      {doc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Chief Complaint</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Toothache upper right molar for 3 days..."
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Oral Examination</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Deep decay with tenderness on percussion #16..."
                  value={oralExamination}
                  onChange={(e) => setOralExamination(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Diagnosis & Treatment Plan</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Irreversible pulpitis 16 / Plan: RCT + Crown"
                  value={diagnosisPlan}
                  onChange={(e) => setDiagnosisPlan(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Treatment Done (Today)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Access opening 16, BMP done, closed dressing"
                  value={treatmentDone}
                  onChange={(e) => setTreatmentDone(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5">Quick Procedures:</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_PROCEDURES.map((p) => (
                  <button
                    type="button"
                    key={p.label}
                    onClick={() => handleProcedureSelect(p.label, p.cost)}
                    className="px-2.5 py-1 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md border border-stone-200"
                  >
                    + {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">📸 Radiographs & Clinical Photos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg border border-stone-200 text-xs">
                  <label className="block font-semibold text-stone-700 mb-1">X-Rays (IOPA / OPG)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setXrayFiles(Array.from(e.target.files || []))}
                    className="w-full text-[11px] text-stone-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:bg-stone-100 hover:file:bg-stone-200"
                  />
                  {xrayFiles.length > 0 && <p className="text-[10px] text-emerald-600 mt-1 font-medium">{xrayFiles.length} file(s) selected</p>}
                </div>

                <div className="bg-white p-3 rounded-lg border border-stone-200 text-xs">
                  <label className="block font-semibold text-stone-700 mb-1">Before Photos (Pre-Op)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setBeforeFiles(Array.from(e.target.files || []))}
                    className="w-full text-[11px] text-stone-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:bg-stone-100 hover:file:bg-stone-200"
                  />
                  {beforeFiles.length > 0 && <p className="text-[10px] text-emerald-600 mt-1 font-medium">{beforeFiles.length} file(s) selected</p>}
                </div>

                <div className="bg-white p-3 rounded-lg border border-stone-200 text-xs">
                  <label className="block font-semibold text-stone-700 mb-1">After Photos (Post-Op)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setAfterFiles(Array.from(e.target.files || []))}
                    className="w-full text-[11px] text-stone-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:bg-stone-100 hover:file:bg-stone-200"
                  />
                  {afterFiles.length > 0 && <p className="text-[10px] text-emerald-600 mt-1 font-medium">{afterFiles.length} file(s) selected</p>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Medications Prescribed</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Cap. Amoxicillin 500mg (1-1-1) x 5d, Tab. Zerodol-SP (1-0-1) x 3d"
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Next Appointment</label>
                <input
                  type="date"
                  value={nextAppointment}
                  onChange={(e) => setNextAppointment(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-800"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Total Fee / Cost (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Amount Paid (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:border-stone-800"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI / GPay">UPI / GPay</option>
                  <option value="Card">Card</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm rounded-lg transition shadow"
            >
              {saving ? "Uploading Media & Saving..." : "Save Clinical Record, Photos & Billing"}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-stone-800">
            Visit History: {selectedPatientObj ? selectedPatientObj.name : "Patient"}
          </h3>
          {recentTreatments.length === 0 ? (
            <p className="text-xs text-stone-400">No previous visit records found for this patient.</p>
          ) : (
            <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">
              {recentTreatments.map((t) => (
                <div key={t.id} className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs space-y-2">
                  <div className="flex justify-between items-center border-b border-stone-200 pb-1">
                    <span className="font-bold text-stone-800">{new Date(t.created_at).toLocaleDateString("en-IN")}</span>
                    <span className="text-stone-500 font-medium">{t.doctor_name || "Doctor"}</span>
                  </div>
                  {t.chief_complaint && (
                    <div>
                      <span className="text-stone-500 font-semibold">CC: </span>
                      <span className="text-stone-800">{t.chief_complaint}</span>
                    </div>
                  )}
                  {t.oral_examination && (
                    <div>
                      <span className="text-stone-500 font-semibold">Exam: </span>
                      <span className="text-stone-800">{t.oral_examination}</span>
                    </div>
                  )}
                  {t.diagnosis_plan && (
                    <div>
                      <span className="text-stone-500 font-semibold">Plan: </span>
                      <span className="text-stone-800">{t.diagnosis_plan}</span>
                    </div>
                  )}
                  {t.treatment_name && (
                    <div>
                      <span className="text-stone-500 font-semibold">Treatment: </span>
                      <span className="text-stone-800 font-medium">{t.treatment_name}</span>
                    </div>
                  )}

                  {(t.xrays?.length || t.before_photos?.length || t.after_photos?.length) ? (
                    <div className="pt-1 space-y-1.5 border-t border-stone-200">
                      {t.xrays && t.xrays.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-stone-600 mb-1">X-Rays:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {t.xrays.map((url, i) => (
                              <img
                                key={i}
                                src={url}
                                alt="X-ray"
                                onClick={() => setPreviewImg(url)}
                                className="w-12 h-12 object-cover rounded border border-stone-300 hover:opacity-80 cursor-pointer shadow-xs"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {t.before_photos && t.before_photos.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-amber-700 mb-1">Before (Pre-Op):</p>
                          <div className="flex flex-wrap gap-1.5">
                            {t.before_photos.map((url, i) => (
                              <img
                                key={i}
                                src={url}
                                alt="Before"
                                onClick={() => setPreviewImg(url)}
                                className="w-12 h-12 object-cover rounded border border-amber-300 hover:opacity-80 cursor-pointer shadow-xs"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {t.after_photos && t.after_photos.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-emerald-700 mb-1">After (Post-Op):</p>
                          <div className="flex flex-wrap gap-1.5">
                            {t.after_photos.map((url, i) => (
                              <img
                                key={i}
                                src={url}
                                alt="After"
                                onClick={() => setPreviewImg(url)}
                                className="w-12 h-12 object-cover rounded border border-emerald-300 hover:opacity-80 cursor-pointer shadow-xs"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {t.medications && (
                    <div>
                      <span className="text-stone-500 font-semibold">Rx: </span>
                      <span className="text-stone-700">{t.medications}</span>
                    </div>
                  )}
                  {t.next_appointment_date && (
                    <div>
                      <span className="text-stone-500 font-semibold">Next Visit: </span>
                      <span className="text-emerald-700 font-medium">{t.next_appointment_date}</span>
                    </div>
                  )}
                  <div className="pt-1 border-t border-stone-200 flex justify-between text-stone-600 font-semibold">
                    <span>Fee: ₹{t.cost || 0}</span>
                    <span className="text-emerald-600">Paid: ₹{t.amount_paid || 0} ({t.payment_method || "Cash"})</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}