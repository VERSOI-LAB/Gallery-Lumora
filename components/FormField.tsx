export default function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-medium tracking-wide text-ink-soft uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}
