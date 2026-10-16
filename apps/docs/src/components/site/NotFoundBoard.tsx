"use client";

import { useRouter } from "next/navigation";
import { ChalkboardNotFound } from "@adgrid-ui/ui";

// The 404 itself: put the digits back and the board sends you home.
export function NotFoundBoard() {
  const router = useRouter();
  return <ChalkboardNotFound homeHref="/" onSolved={() => router.push("/")} />;
}
