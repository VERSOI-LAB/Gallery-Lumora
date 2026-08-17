"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { buttonClasses } from "@/lib/ui";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordConfirmForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // The recovery link may have already been consumed by the time this
    // component mounts, in which case a session already exists — allow
    // resetting in that case too instead of waiting forever for the event.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      setError("비밀번호를 변경하지 못했습니다. 링크가 만료되었을 수 있습니다.");
      return;
    }
    setDone(true);
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 1500);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-sm px-5 py-16 md:px-0">
        <h1 className="mb-2 font-display text-2xl">변경 완료</h1>
        <p className="text-sm text-ink-soft">비밀번호가 변경되었습니다. 잠시 후 이동합니다.</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-sm px-5 py-16 md:px-0">
        <h1 className="mb-2 font-display text-2xl">비밀번호 재설정</h1>
        <p className="text-sm text-ink-faint">
          링크를 확인하는 중입니다. 이메일의 재설정 링크를 통해 접속했는지 확인해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-5 py-16 md:px-0">
      <h1 className="mb-2 font-display text-2xl">새 비밀번호 설정</h1>
      <p className="mb-8 text-sm text-ink-faint">사용하실 새 비밀번호를 입력해주세요.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-[11px] tracking-wide text-ink-soft uppercase">
            새 비밀번호
          </span>
          <input
            required
            minLength={6}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
          />
        </label>

        <button type="submit" disabled={submitting} className={`w-full ${buttonClasses("primary")}`}>
          {submitting ? "변경 중..." : "비밀번호 변경"}
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </form>
    </div>
  );
}
