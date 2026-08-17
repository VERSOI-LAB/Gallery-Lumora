"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ArtistAvatar from "./ArtistAvatar";
import { buttonClasses } from "@/lib/ui";
import { downloadCsv } from "@/lib/csv";
import { adminDeleteArtist } from "@/lib/adminActions";
import type { Artist } from "@/lib/types";

export default function AdminArtistList({ artists: initial }: { artists: Artist[] }) {
  const [artists, setArtists] = useState(initial);
  const [keyword, setKeyword] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  const term = keyword.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!term) return artists;
    return artists.filter(
      (a) => a.name.toLowerCase().includes(term) || a.tagline.toLowerCase().includes(term)
    );
  }, [artists, term]);

  async function remove(id: string) {
    if (!confirm("이 작가를 삭제하시겠습니까? 로그인 계정이 연결되어 있거나 작품·굿즈·주문 이력이 있으면 삭제할 수 없습니다."))
      return;
    setPendingId(id);
    setErrorId(null);
    try {
      await adminDeleteArtist(id);
      setArtists((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setErrorId(id);
    } finally {
      setPendingId(null);
    }
  }

  function exportCsv() {
    downloadCsv(
      `lumora-artists-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map((a) => ({
        이름: a.name,
        영문명: a.nameEn,
        소개: a.tagline,
        정산비율: a.artistSplitRate,
        커미션접수: a.commission.accepting ? "Y" : "N",
      }))
    );
  }

  if (artists.length === 0) {
    return <p className="text-sm text-ink-faint">등록된 작가가 없습니다.</p>;
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="이름, 소개로 검색"
          className="h-10 flex-1 min-w-[200px] border border-line-strong bg-paper-raised px-3 text-sm outline-patina"
        />
        <button
          type="button"
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className={`${buttonClasses("ghost", "sm")} disabled:opacity-40`}
        >
          CSV 내보내기
        </button>
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-ink-faint">검색 결과가 없습니다.</p>
      ) : (
        <div className="divide-y divide-line border-y border-line">
          {filtered.map((artist) => (
            <div key={artist.id}>
              <div className="flex items-center gap-4 py-4">
                <div className="h-14 w-14 flex-none overflow-hidden border border-line">
                  <ArtistAvatar
                    avatarUrl={artist.avatarUrl}
                    hue={artist.hue}
                    seed={artist.slug}
                    className="h-full w-full"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/artists/${artist.id}`}
                      className="truncate text-sm font-medium text-ink hover:underline"
                    >
                      {artist.name}
                    </Link>
                    {artist.commission.accepting && (
                      <span className="flex-none border border-patina px-1.5 py-0.5 text-[10px] text-patina">
                        커미션 접수중
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-ink-soft">{artist.tagline}</div>
                </div>

                <Link
                  href={`/admin/artists/${artist.id}`}
                  className="flex-none text-xs text-ink-soft hover:text-ink hover:underline"
                >
                  상세보기
                </Link>
                <Link
                  href={`/admin/artists/${artist.id}/edit`}
                  className="flex-none text-xs text-ink-soft hover:text-ink hover:underline"
                >
                  수정
                </Link>
                <button
                  type="button"
                  disabled={pendingId === artist.id}
                  onClick={() => remove(artist.id)}
                  className="flex-none text-xs text-red-600 hover:underline disabled:opacity-40"
                >
                  삭제
                </button>
              </div>
              {errorId === artist.id && (
                <p className="pb-3 text-xs text-red-600">
                  삭제하지 못했습니다. 로그인 계정, 작품, 굿즈, 커미션 이력이 있는지 확인해주세요.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
