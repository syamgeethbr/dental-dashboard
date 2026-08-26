export type Patient = {
  id: string;
  name: string;
  op_number: string | null;
  gender: string | null;
  address: string | null;
  age: number | null;
  phone: string | null;
  medical_history: string | null;
  allergies: string | null;
  created_at: string;
};

export type AppointmentStatus = "Waiting" | "In Progress" | "Completed" | "Cancelled";

export type Appointment = {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  reason: string | null;
  status: AppointmentStatus;
  created_at: string;
  patients?: Pick<Patient, "id" | "name" | "phone" | "allergies">;
};

export type Treatment = {
  id: string;
  patient_id: string;
  doctor_name: string | null;
  chief_complaint: string | null;
  oral_examination: string | null;
  diagnosis_plan: string | null;
  treatment_name: string;
  notes: string | null;
  cost: number | null;
  amount_paid: number | null;
  payment_method: string | null;
  medications: string | null;
  next_appointment_date: string | null;
  xrays: string[] | null;
  before_photos: string[] | null;
  after_photos: string[] | null;
  created_at: string;
};