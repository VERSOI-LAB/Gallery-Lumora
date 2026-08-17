"use client";

import { useState } from "react";
import { adminUpdateSiteAsset } from "@/lib/adminActions";
import { uploadMedia } from "@/lib/queries";
import type { SiteAssetKey } from "@/lib/types";

const ASSETS: {
  key: SiteAssetKey;
  label: string;
  hint: string;
  kind: "video" | "image";
}[] = [
  { key: "home_hero_video", label: "홈 화면 영상", hint: "홈페이지 최상단 배경 영상", kind: "video" },
  { key: "about_hero_video", label: "About 영상", hint: "About 페이지 최상단 배경 영상", kind: "video" },
  {
    key: "shop_main_image",
    label: "Shop 메인사진",
    hint: "Shop 페이지 캐러셀에 표시될 대표 사진",
    kind: "image",
  },
];

export default function AdminSiteMediaForm({
  assets: initialAssets,
}: {
  assets: Record<SiteAssetKey, string | null>;
}) {
  const [assets, setAssets] = useState(initialAssets);
  const [pendingKey, setPendingKey] = useState<SiteAssetKey | null>(null);
  const [errorKey, setErrorKey] = useState<SiteAssetKey | null>(null);

  async function handleUpload(key: SiteAssetKey, file: File) {
    setPendingKey(key);
    setErrorKey(null);
    try {
      const ext = file.name.split(".").pop() || (file.type.startsWith("video") ? "mp4" : "jpg");
      const url = await uploadMedia(`hero/${key}.${ext}`, file);
      await adminUpdateSiteAsset(key, url);
      setAssets((prev) => ({ ...prev, [key]: url }));
    } catch {
      setErrorKey(key);
    } finally {
      setPendingKey(null);
    }
  }

  return (
    <div className="max-w-2xl space-y-10">
      {ASSETS.map((asset) => (
        <div key={asset.key} className="border-b border-line pb-8 last:border-b-0">
          <p className="mb-1 text-sm font-medium text-ink">{asset.label}</p>
          <p className="mb-3 text-xs text-ink-faint">{asset.hint}</p>

          {assets[asset.key] &&
            (asset.kind === "video" ? (
              <video
                src={assets[asset.key]!}
                controls
                muted
                className="mb-3 aspect-video w-full max-w-md border border-line object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={assets[asset.key]!}
                alt=""
                className="mb-3 aspect-video w-full max-w-md border border-line object-cover"
              />
            ))}

          <input
            type="file"
            accept={asset.kind === "video" ? "video/*" : "image/*"}
            disabled={pendingKey === asset.key}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(asset.key, file);
            }}
            className="block w-full text-sm text-ink-soft file:mr-3 file:border file:border-line-strong file:bg-paper-raised file:px-3 file:py-2 file:text-sm file:text-ink"
          />
          {pendingKey === asset.key && <p className="mt-2 text-xs text-patina">업로드 중...</p>}
          {errorKey === asset.key && (
            <p className="mt-2 text-xs text-red-600">업로드에 실패했습니다. 다시 시도해주세요.</p>
          )}
        </div>
      ))}
    </div>
  );
}
