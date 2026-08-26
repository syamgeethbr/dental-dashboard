export type Branch = 'Ezhukone' | 'Chandanathope';

export interface Patient {
  id: string;
  created_at: string;
  op_number: string;
  full_name: string;
  age: number | null;
  gender: string | null;
  phone: string;
  medical_history: string | null;
  allergies: string | null;
  branch: Branch;
}

export interface Appointment {
  id: string;
  created_at: string;
  patient_id: string;
  appointment_date: string;
  slot_time: string;
  status: 'Waiting' | 'In Progress' | 'Completed' | 'Cancelled';
  notes: string | null;
  branch: Branch;
  patients?: Patient;
}

export interface Treatment {
  id: string;
  created_at: string;
  patient_id: string;
  procedure_name: string;
  tooth_number: string | null;
  cost: number;
  prescription: string | null;
  notes: string | null;
  branch: Branch;
  patients?: Patient;
}