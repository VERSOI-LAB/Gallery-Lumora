"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/** 카카오(다음) 우편번호 서비스 — 무료, 별도 키 없음. https://postcode.map.daum.net/guide */
const POSTCODE_SCRIPT_URL =
  "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

interface PostcodeResult {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
  address: string;
  buildingName: string;
  apartment: "Y" | "N";
}

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: PostcodeResult) => void;
        width?: string;
        height?: string;
      }) => { embed: (element: HTMLElement) => void };
    };
  }
}

let postcodeScriptPromise: Promise<void> | null = null;

function loadPostcodeScript(): Promise<void> {
  if (window.daum?.Postcode) return Promise.resolve();
  if (!postcodeScriptPromise) {
    postcodeScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = POSTCODE_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        postcodeScriptPromise = null;
        reject(new Error("우편번호 서비스를 불러오지 못했습니다."));
      };
      document.head.appendChild(script);
    });
  }
  return postcodeScriptPromise;
}

function formatAddress(zonecode: string, base: string, detail: string): string {
  if (!base) return "";
  const trimmedDetail = detail.trim();
  return `(${zonecode}) ${base}${trimmedDetail ? ` ${trimmedDetail}` : ""}`;
}

/** 배송지 입력 — "주소 찾기"로 우편번호·기본주소를 고르고 상세주소만 직접 입력합니다.
 * 결과는 "(우편번호) 기본주소 상세주소" 한 줄 문자열로 onChange에 전달합니다(주소를 고르기
 * 전에는 빈 문자열). 처음 값을 바꾸려면 부모에서 key를 바꿔 다시 마운트하세요. */
export default function AddressSearchField({
  onChange,
}: {
  onChange: (address: string) => void;
}) {
  const [zonecode, setZonecode] = useState("");
  const [baseAddress, setBaseAddress] = useState("");
  const [detail, setDetail] = useState("");
  const [open, setOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    loadPostcodeScript()
      .then(() => {
        if (cancelled || !layerRef.current || !window.daum) return;
        new window.daum.Postcode({
          width: "100%",
          height: "100%",
          oncomplete: (data) => {
            const base = data.roadAddress || data.address || data.jibunAddress;
            const building =
              data.apartment === "Y" && data.buildingName
                ? ` (${data.buildingName})`
                : "";
            const nextBase = `${base}${building}`;
            setZonecode(data.zonecode);
            setBaseAddress(nextBase);
            setOpen(false);
            onChangeRef.current(formatAddress(data.zonecode, nextBase, detail));
            setTimeout(() => detailRef.current?.focus(), 0);
          },
        }).embed(layerRef.current);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setLoadError(err.message);
        setOpen(false);
      });
    return () => {
      cancelled = true;
    };
    // detail은 주소를 고른 순간의 값만 쓰면 되므로 의존성에서 제외합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          readOnly
          tabIndex={-1}
          value={zonecode}
          placeholder="우편번호"
          className="h-10 w-28 border border-line-strong bg-paper-raised px-3 text-sm text-ink-soft"
        />
        <button
          type="button"
          onClick={() => {
            setLoadError(null);
            setOpen(true);
          }}
          className="h-10 border border-line-strong px-4 text-sm text-ink hover:bg-paper-raised"
        >
          주소 찾기
        </button>
      </div>
      <input
        readOnly
        tabIndex={-1}
        value={baseAddress}
        placeholder="주소 찾기 버튼을 눌러 주소를 검색해주세요"
        onClick={() => !baseAddress && setOpen(true)}
        className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm text-ink-soft"
      />
      <input
        ref={detailRef}
        type="text"
        value={detail}
        disabled={!baseAddress}
        onChange={(e) => {
          setDetail(e.target.value);
          onChange(formatAddress(zonecode, baseAddress, e.target.value));
        }}
        placeholder="상세주소 (동·호수 등)"
        className="h-10 w-full border border-line-strong bg-paper-raised px-3 text-sm outline-patina disabled:text-ink-faint"
      />
      {loadError && <p className="text-xs text-red-600">{loadError}</p>}

      {/* 결제 폼의 Field가 <label>이라, 레이어를 label 밖(body)에 그려 바깥 클릭이 체크박스 등을 건드리지 않게 합니다. */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
            onClick={() => setOpen(false)}
          >
            <div
              className="flex h-[520px] max-h-full w-full max-w-md flex-col bg-paper"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <span className="text-sm font-semibold">주소 찾기</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-xs text-ink-soft hover:text-ink"
                >
                  닫기
                </button>
              </div>
              <div ref={layerRef} className="min-h-0 flex-1" />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
