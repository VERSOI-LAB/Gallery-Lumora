import StudioNav from "@/components/StudioNav";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-6xl px-5 md:px-8">
      <StudioNav />
      <div className="min-w-0 flex-1 py-8 pb-24 md:pl-8 md:pb-8">{children}</div>
    </div>
  );
}
