"use client";

import { useState } from "react";
import { buttonClasses } from "@/lib/ui";
import { adminUpdateOrderStaffNote } from "@/lib/adminActions";

export default function OrderNoteEditor({
  kind,
  orderId,
  initialNote,
}: {
  kind: "artwork" | "merch";
  orderId: string;
  initialNote: string;
}) {
  const [note, setNote] = useState(initialNote);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await adminUpdateOrderStaffNote(kind, orderId, note);
      setSaved(true);
    } catch {
      setError("저장하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-line p-4 sm:col-span-2">
      <p className="mb-3 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
        내부 메모 (스태프 전용)
      </p>
      <textarea
        rows={3}
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setSaved(false);
        }}
        placeholder="예: 고객이 배송 지연 요청, 파손 이력 있음 등"
        className="w-full border border-line-strong bg-paper-raised px-3 py-2 text-sm outline-patina"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          disabled={saving || note === initialNote}
          onClick={handleSave}
          className={buttonClasses("ghost", "sm")}
        >
          {saving ? "저장 중..." : "메모 저장"}
        </button>
        {saved && <span className="text-xs text-patina">저장되었습니다.</span>}
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    </div>
  );
}
