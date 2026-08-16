import AdminSiteMediaForm from "@/components/AdminSiteMediaForm";
import { getSiteAssets } from "@/lib/queries";

export default async function AdminMediaPage() {
  const assets = await getSiteAssets();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">사이트 미디어</h1>
      <AdminSiteMediaForm assets={assets} />
    </div>
  );
}
