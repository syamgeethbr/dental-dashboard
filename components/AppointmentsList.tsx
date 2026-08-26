"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Appointment, AppointmentStatus, Patient } from "@/lib/types";
import AllergyBadge from "@/components/AllergyBadge";

const STATUS_OPTIONS: AppointmentStatus[] = [
  "Waiting",
  "In Progress",
  "Completed",
  "Cancelled",
];

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  Waiting: "bg-amber-100 text-amber-800 border-amber-300",
  "In Progress": "bg-sky-100 text-sky-800 border-sky-300",
  Completed: "bg-emerald-100 text-emerald-800 border-emerald-300",
  Cancelled: "bg-stone-200 text-stone-600 border-stone-300",
};

export default function AppointmentsList({
  patients,
  onUpdated,
}: {
  patients: Patient[];
  onUpdated?: () => void;
}) {
  const getTodayStr = () => new Date().toISOString().split("T")[0];

  const [filterDate, setFilterDate] = useState(getTodayStr);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [patientId, setPatientId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(getTodayStr);
  const [appointmentTime, setAppointmentTime] = useState("10:00");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load appointments for selected filter date & upcoming
  const loadAppointments = useCallback(async () => {
    setLoading(true);

    const { data: dateData } = await supabase
      .from("appointments")
      .select("*, patients(id, name, phone, allergies, op_number)")
      .eq("appointment_date", filterDate)
      .order("appointment_time", { ascending: true });

    if (dateData) {
      setAppointments(dateData as Appointment[]);
    }

    const { data: allData } = await supabase
      .from("appointments")
      .select("*, patients(id, name, phone, allergies, op_number)")
      .gte("appointment_date", getTodayStr())
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    if (allData) {
      setAllAppointments(allData as Appointment[]);
    }

    setLoading(false);
  }, [filterDate]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const todayApps = useMemo(() => {
    const today = getTodayStr();
    return allAppointments.filter((a) => a.appointment_date === today);
  }, [allAppointments]);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId) {
      setFormError("Please select a patient");
      return;
    }
    setSaving(true);
    setFormError(null);

    const { error } = await supabase.from("appointments").insert([
      {
        patient_id: patientId,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        reason: reason.trim() || null,
        status: "Waiting",
      },
    ]);

    if (error) {
      setFormError(error.message);
    } else {
      setReason("");
      loadAppointments();
      if (onUpdated) onUpdated();
    }
    setSaving(false);
  }

  async function handleStatusChange(id: string, newStatus: AppointmentStatus) {
    await supabase
      .from("appointments")
      .update({ status: newStatus })
      .eq("id", id);
    loadAppointments();
  }

  function sendWhatsAppReminder(app: Appointment) {
    const patientName = app.patients?.name || "Patient";
    const phone = app.patients?.phone?.replace(/[^0-9]/g, "");

    if (!phone) {
      alert("No phone number found for this patient!");
      return;
    }

    const formattedPhone = phone.length === 10 ? `91${phone}` : phone;

    let timeFormatted = app.appointment_time;
    try {
      const [h, m] = app.appointment_time.split(":");
      const d = new Date();
      d.setHours(parseInt(h, 10), parseInt(m, 10));
      timeFormatted = d.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    } catch (_) {}

    const message = `Hello ${patientName},\nThis is a reminder regarding your dental appointment at *Dr. Syam's Dental Clinic* scheduled for *${app.appointment_date}* at *${timeFormatted}*${app.reason ? ` for ${app.reason}` : ""}.\n\nFor location details and any other assistance please contact: 9497364345\nThank you!`;

    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  }

  return (
    <div className="space-y-6">
      {/* 🔔 Today's Quick Notification & Summary Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-stone-100 p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/20 text-amber-400 p-2.5 rounded-lg text-lg">
            📅
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-100">
              Today&apos;s Appointments: {todayApps.length} Patient{todayApps.length !== 1 ? "s" : ""} Scheduled
            </h2>
            <p className="text-xs text-stone-300 mt-0.5">
              {todayApps.length === 0
                ? "No patients booked for today yet."
                : todayApps
                    .map(
                      (a) =>
                        `${a.patients?.name || "Patient"} (${a.appointment_time})`
                    )
                    .join(" • ")}
            </p>
          </div>
        </div>

        <button
          onClick={() => setFilterDate(getTodayStr())}
          className="text-xs bg-amber-600 hover:bg-amber-500 text-white font-semibold px-3.5 py-1.5 rounded-lg transition shrink-0 self-start md:self-auto"
        >
          View Today&apos;s List
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Book a slot form */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-stone-800">Book a slot</h2>
          <p className="text-xs text-stone-500">
            Schedule future or daily OP visits.
          </p>

          {formError && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded text-xs">
              {formError}
            </div>
          )}

          <form onSubmit={handleBook} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                Patient *
              </label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:border-stone-800"
                required
              >
                <option value="">-- Select Patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.op_number ? `[OP ${p.op_number}] ` : ""}
                    {p.name} {p.phone ? `(${p.phone})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-800"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase mb-1">
                Reason / Procedure (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. RCT 2nd sitting, Crown cementation..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-stone-800"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm rounded-lg transition shadow"
            >
              {saving ? "Booking..." : "Book Appointment"}
            </button>
          </form>
        </div>

        {/* Daily OP List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-stone-800">
                Daily OP list ({appointments.length})
              </h2>
              <p className="text-xs text-stone-500">
                Scheduled visits & queue status for the selected date.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-600">Select Date:</span>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="p-1.5 border border-stone-300 rounded-lg text-xs bg-stone-50 focus:bg-white focus:outline-none font-semibold text-stone-800"
              />
            </div>
          </div>

          {loading && (
            <p className="text-xs text-stone-400">Loading appointments...</p>
          )}

          {!loading && appointments.length === 0 && (
            <div className="p-8 text-center bg-stone-50 rounded-lg border border-dashed border-stone-200 text-stone-400 text-xs">
              No appointments booked for {filterDate}. Use the form on the left to schedule.
            </div>
          )}

          <div className="space-y-3">
            {appointments.map((app) => (
              <div
                key={app.id}
                className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-stone-400 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-stone-800 text-white font-mono text-xs px-2 py-0.5 rounded font-bold">
                      {app.appointment_time}
                    </span>
                    <span className="font-bold text-stone-900 text-sm">
                      {app.patients?.name || "Patient"}
                    </span>
                    <AllergyBadge text={app.patients?.allergies} />
                  </div>

                  <div className="text-stone-600 text-xs flex flex-wrap gap-x-4">
                    {app.patients?.phone && (
                      <span>Ph: <strong>{app.patients.phone}</strong></span>
                    )}
                    {app.reason && (
                      <span className="text-stone-700 italic">
                        Reason: &ldquo;{app.reason}&rdquo;
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={() => sendWhatsAppReminder(app)}
                    title="Send WhatsApp Reminder to Patient"
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                  >
                    <span>💬</span>
                    <span>WhatsApp</span>
                  </button>

                  <select
                    value={app.status}
                    onChange={(e) =>
                      handleStatusChange(app.id, e.target.value as AppointmentStatus)
                    }
                    className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${
                      STATUS_COLORS[app.status] || "bg-stone-100 text-stone-700"
                    }`}
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}