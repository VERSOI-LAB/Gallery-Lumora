import StudioLoginForm from "@/components/StudioLoginForm";

export default async function StudioLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirect || "/studio/works";

  return <StudioLoginForm redirectTo={redirectTo} />;
}
