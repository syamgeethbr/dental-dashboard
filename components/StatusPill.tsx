import { AppointmentStatus } from "@/lib/types";

const styles: Record<AppointmentStatus, string> = {
  Waiting: "bg-[#F3EEDD] text-[#8A6D1D] border-[#E3D6A4]",
  "In Progress": "bg-sage-light text-sage-dark border-sage",
  Completed: "bg-[#E3E8E6] text-[#3A4A47] border-[#B9C4C0]",
  Cancelled: "bg-clay-light text-clay border-clay",
};

export default function StatusPill({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}
