"use client";

import { useEffect, useRef } from "react";
import { submitReferralVisit, type ReferralSource } from "@/lib/queries";

function classifySource(hostname: string): ReferralSource {
  if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) return "youtube";
  if (hostname.includes("instagram.com")) return "instagram";
  if (hostname.includes("facebook.com") || hostname.includes("fb.com")) return "facebook";
  if (hostname.includes("blog.naver.com")) return "naver_blog";
  return "other";
}

// Logs where a visit came from (YouTube/Instagram/Facebook/네이버 블로그) so
// /admin/traffic can show inbound traffic sources. Runs once per full page
// load — mounted in the root layout, which only remounts on a hard navigation.
export default function ReferralTracker() {
  const logged = useRef(false);

  useEffect(() => {
    if (logged.current) return;
    logged.current = true;

    const referrer = document.referrer;
    if (!referrer) return;

    let referrerHost: string;
    try {
      referrerHost = new URL(referrer).hostname;
    } catch {
      return;
    }
    if (referrerHost === window.location.hostname) return;

    submitReferralVisit({
      source: classifySource(referrerHost),
      referrerUrl: referrer,
      landingPath: window.location.pathname,
    }).catch(() => {});
  }, []);

  return null;
}
