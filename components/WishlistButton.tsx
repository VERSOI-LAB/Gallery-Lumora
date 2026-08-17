"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isWishlisted, toggleWishlist, type WishlistKind } from "@/lib/wishlist";
import { supabase } from "@/lib/supabase";

export default function WishlistButton({
  kind,
  itemId,
  className = "",
}: {
  kind: WishlistKind;
  itemId: string;
  className?: string;
}) {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
      if (data.user) isWishlisted(kind, itemId).then(setWishlisted);
    });
    // itemId/kind identify a fixed card instance for its lifetime; no need to re-run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!loggedIn) {
      router.push("/login");
      return;
    }
    setPending(true);
    const prev = wishlisted;
    setWishlisted(!prev);
    try {
      const next = await toggleWishlist(kind, itemId);
      setWishlisted(next);
    } catch {
      setWishlisted(prev);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      aria-label={wishlisted ? "찜 해제" : "찜하기"}
      aria-pressed={wishlisted}
      disabled={pending}
      onClick={handleClick}
      className={`flex h-8 w-8 items-center justify-center bg-paper/90 text-ink transition-opacity hover:opacity-70 disabled:opacity-50 ${className}`}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
        <path d="M12 21s-7.5-4.6-10-9.3C0.3 8 2 4 6 4c2.2 0 3.9 1.3 6 3.6C14.1 5.3 15.8 4 18 4c4 0 5.7 4 4 7.7C19.5 16.4 12 21 12 21z" />
      </svg>
    </button>
  );
}
