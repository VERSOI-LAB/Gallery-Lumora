"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as fabric from "fabric";
import type { Artwork } from "@/lib/types";

const CANVAS_SIZE = 500;
const TEXT_COLORS = ["#1a1a1a", "#ffffff", "#c0392b", "#2c6e49", "#2b4c8c", "#b7862a"];

export interface MerchCanvasEditorHandle {
  /** Rasterizes the design (artwork + text layers only — see note on CORS
   * below) to a PNG blob for upload. Returns null if the canvas isn't ready. */
  exportPng: () => Promise<Blob | null>;
}

/** The customization surface for template merch products (see
 * MerchTemplateDetail): a product background photo with a Fabric.js canvas
 * on top where the customer arranges their chosen artwork and optional text.
 *
 * Only one artwork image may be on the canvas at a time (keeps royalty
 * attribution to a single artist unambiguous — see merch_orders.artwork_id).
 * Free file upload isn't offered; only artworks picked via MerchArtworkPicker
 * can be added, so every design traces back to a real Lumora artist. */
const MerchCanvasEditor = forwardRef<
  MerchCanvasEditorHandle,
  {
    backgroundImageUrl: string | null;
    artwork: Artwork | null;
    onRequestArtwork: () => void;
    onArtworkRemoved: () => void;
  }
>(function MerchCanvasEditor({ backgroundImageUrl, artwork, onRequestArtwork, onArtworkRemoved }, ref) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const artworkObjectRef = useRef<fabric.FabricImage | null>(null);
  const onArtworkRemovedRef = useRef(onArtworkRemoved);
  onArtworkRemovedRef.current = onArtworkRemoved;

  useEffect(() => {
    if (!canvasElRef.current) return;
    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      backgroundColor: "#f4f2ee",
    });
    fabricCanvasRef.current = canvas;

    canvas.on("object:removed", (e) => {
      if (e.target === artworkObjectRef.current) {
        artworkObjectRef.current = null;
        onArtworkRemovedRef.current();
      }
    });

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
      artworkObjectRef.current = null;
    };
  }, []);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    if (!backgroundImageUrl) {
      canvas.backgroundImage = undefined;
      canvas.requestRenderAll();
      return;
    }
    let active = true;
    fabric.FabricImage.fromURL(backgroundImageUrl, { crossOrigin: "anonymous" }).then((img) => {
      if (!active || !fabricCanvasRef.current) return;
      const scale = Math.min(CANVAS_SIZE / (img.width ?? 1), CANVAS_SIZE / (img.height ?? 1));
      img.set({
        originX: "center",
        originY: "center",
        left: CANVAS_SIZE / 2,
        top: CANVAS_SIZE / 2,
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false,
      });
      canvas.backgroundImage = img;
      canvas.requestRenderAll();
    });
    return () => {
      active = false;
    };
  }, [backgroundImageUrl]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    if (artworkObjectRef.current) {
      canvas.remove(artworkObjectRef.current);
      artworkObjectRef.current = null;
    }
    if (!artwork || !artwork.imageUrls[0]) return;
    let active = true;
    fabric.FabricImage.fromURL(artwork.imageUrls[0], { crossOrigin: "anonymous" }).then((img) => {
      if (!active || !fabricCanvasRef.current) return;
      const targetWidth = CANVAS_SIZE * 0.55;
      const scale = targetWidth / (img.width ?? targetWidth);
      img.set({
        originX: "center",
        originY: "center",
        left: CANVAS_SIZE / 2,
        top: CANVAS_SIZE / 2,
        scaleX: scale,
        scaleY: scale,
      });
      artworkObjectRef.current = img;
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.requestRenderAll();
    });
    return () => {
      active = false;
    };
  }, [artwork]);

  function addText() {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const text = new fabric.Textbox("텍스트를 입력하세요", {
      left: CANVAS_SIZE / 2,
      top: CANVAS_SIZE / 2,
      originX: "center",
      originY: "center",
      fontSize: 28,
      fill: TEXT_COLORS[0],
      width: 220,
      textAlign: "center",
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
  }

  function deleteSelected() {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    canvas.remove(active);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }

  function resetCanvas() {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    canvas.remove(...canvas.getObjects());
    canvas.discardActiveObject();
    artworkObjectRef.current = null;
    onArtworkRemovedRef.current();
    canvas.requestRenderAll();
  }

  useImperativeHandle(ref, () => ({
    async exportPng() {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return null;
      // The product background photo is sourced from Marpple's CDN, which
      // doesn't grant our page permission to read pixel data back out of the
      // canvas (no CORS headers) — drawing it "taints" the canvas and
      // toDataURL() throws. So we hide the background for the export and
      // rasterize only the artwork + text layers (all same-origin, from our
      // own Supabase storage), which is also the meaningful "what did the
      // customer design" record for admin/customer order views.
      const hadBackground = canvas.backgroundImage;
      const hadBackgroundColor = canvas.backgroundColor;
      canvas.discardActiveObject();
      canvas.backgroundImage = undefined;
      canvas.backgroundColor = "#ffffff";
      canvas.renderAll();
      let dataUrl: string;
      try {
        dataUrl = canvas.toDataURL({ format: "png", multiplier: 2 });
      } finally {
        canvas.backgroundImage = hadBackground;
        canvas.backgroundColor = hadBackgroundColor;
        canvas.renderAll();
      }
      const res = await fetch(dataUrl);
      return res.blob();
    },
  }));

  return (
    <div>
      <div className="relative mx-auto" style={{ width: CANVAS_SIZE, maxWidth: "100%" }}>
        <canvas ref={canvasElRef} className="border border-line-strong" />
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={onRequestArtwork} className="border border-line-strong px-3 py-1.5 text-xs text-ink-soft hover:text-ink">
          {artwork ? "작품 변경" : "작품 추가"}
        </button>
        <button type="button" onClick={addText} className="border border-line-strong px-3 py-1.5 text-xs text-ink-soft hover:text-ink">
          텍스트 추가
        </button>
        <button type="button" onClick={deleteSelected} className="border border-line-strong px-3 py-1.5 text-xs text-ink-soft hover:text-ink">
          선택 삭제
        </button>
        <button type="button" onClick={resetCanvas} className="border border-line-strong px-3 py-1.5 text-xs text-ink-soft hover:text-ink">
          초기화
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-ink-faint">
        오브젝트를 드래그해 위치를 옮기고, 모서리를 끌어 크기·회전을 조절할 수 있습니다.
      </p>
      <p className="mt-1 text-center text-[11px] text-red-600 italic">
        모든 이미지의 저작권은 작가에게 있으며, 무단 복제 및 타사 굿즈 주문 제작 시 저작권법(제136조)에 따라 법적 처벌을 받을 수 있습니다.
      </p>
    </div>
  );
});

export default MerchCanvasEditor;
