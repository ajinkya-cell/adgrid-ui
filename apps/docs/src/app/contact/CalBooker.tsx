"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
import { CONTACT } from "./contact.config";

const NAMESPACE = "void-contact";

// The cal.com booker, inline, themed to sit flat on the page's tray surface.
export function CalBooker() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cal = await getCalApi({ namespace: NAMESPACE });
      if (cancelled) return;
      cal("ui", {
        theme: "dark",
        layout: "month_view",
        hideEventTypeDetails: false,
        cssVarsPerTheme: {
          light: {},
          dark: {
            "cal-brand": "#f5f5f5",
            "cal-brand-emphasis": "#ffffff",
            "cal-brand-text": "#0a0a0a",
            "cal-bg": "#0c0c0d",
            "cal-bg-muted": "#151516",
            "cal-bg-subtle": "#1b1b1d",
            "cal-bg-emphasis": "#1f1f21",
            "cal-border": "rgba(255,255,255,0.08)",
            "cal-border-subtle": "rgba(255,255,255,0.06)",
            "cal-border-booker": "rgba(255,255,255,0.06)",
            "cal-text": "#f5f5f5",
            "cal-text-emphasis": "#f5f5f5",
            "cal-text-subtle": "#a3a3a3",
            "cal-text-muted": "#737373",
          },
        },
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Cal
      namespace={NAMESPACE}
      calLink={CONTACT.calLink}
      config={{ layout: "month_view", theme: "dark" }}
      style={{ width: "100%", height: "100%", overflow: "auto" }}
    />
  );
}
