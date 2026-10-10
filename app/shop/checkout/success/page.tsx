import { Suspense } from "react";
import MerchCheckoutSuccessClient from "@/components/MerchCheckoutSuccessClient";

export const dynamic = "force-dynamic";

export default function MerchCheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-lg px-5 py-24 text-center md:px-0" />}>
      <MerchCheckoutSuccessClient />
    </Suspense>
  );
}
