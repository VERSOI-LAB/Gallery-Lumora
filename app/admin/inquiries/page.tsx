import AdminInquiriesList from "@/components/AdminInquiriesList";
import { getGeneralInquiries } from "@/lib/queries";

export default async function AdminInquiriesPage() {
  const inquiries = await getGeneralInquiries();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">문의 관리</h1>
      <AdminInquiriesList inquiries={inquiries} />
    </div>
  );
}
