import LoginForm from "@/components/LoginForm";
import { safeNextPath } from "@/lib/loginRedirect";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <LoginForm next={safeNextPath(next)} />;
}
