"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function courseSlugFromPath(path: string) {
  const match = path.match(/^\/(?:aluno\/cursos|cursos|checkout)\/([^/]+)/);
  return match ? match[1] : undefined;
}

// Logs one PageView row per page visit and keeps its durationSec updated
// while the tab is actually visible — mounted once in the root layout so it
// tracks every route the visitor lands on, logged in or not.
export function PageViewTracker() {
  const pathname = usePathname();
  const idRef = useRef<string | null>(null);
  const secondsRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    idRef.current = null;
    secondsRef.current = 0;

    fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, courseSlug: courseSlugFromPath(pathname) }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.id) idRef.current = data.id;
      })
      .catch(() => {});

    function flush(useBeacon: boolean) {
      if (!idRef.current || secondsRef.current <= 0) return;
      const payload = JSON.stringify({ durationSec: secondsRef.current });
      if (useBeacon && navigator.sendBeacon) {
        navigator.sendBeacon(
          `/api/analytics/pageview/${idRef.current}`,
          new Blob([payload], { type: "application/json" })
        );
      } else {
        fetch(`/api/analytics/pageview/${idRef.current}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    }

    const tick = setInterval(() => {
      if (document.visibilityState === "visible") secondsRef.current += 1;
    }, 1000);
    const flushInterval = setInterval(() => flush(false), 10000);

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") flush(true);
    }
    function handlePageHide() {
      flush(true);
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      cancelled = true;
      clearInterval(tick);
      clearInterval(flushInterval);
      flush(true);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [pathname]);

  return null;
}
