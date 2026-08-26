export default function AllergyBadge({ allergies }: { allergies: string | null | undefined }) {
  if (!allergies || !allergies.trim()) return null;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-clay bg-clay-light px-2 py-0.5 text-xs font-semibold text-clay align-middle"
      title={`Allergies: ${allergies}`}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-clay" />
      Allergy
    </span>
  );
}
