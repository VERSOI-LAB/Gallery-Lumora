export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 h-7 w-40 bg-line" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 border-y border-line bg-paper-raised" />
        ))}
      </div>
    </div>
  );
}
