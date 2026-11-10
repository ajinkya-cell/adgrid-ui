"use client";

import { useEffect, useState } from "react";
import { cn } from "../../../lib/utils";
import { FG, MUTED, Section } from "../parts";

function greetingFor(hour: number) {
  if (hour < 5) return "Hello, night owl";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Greets the visitor by their own time of day. Says "Hello" until mounted so SSR matches. */
export function About({ paragraphs }: { paragraphs: string[] }) {
  const [greeting, setGreeting] = useState("Hello");
  useEffect(() => setGreeting(greetingFor(new Date().getHours())), []);

  if (!paragraphs.length) return null;
  return (
    <Section id="about" title="About">
      <div className={cn("max-w-[65ch] space-y-3 text-[15px] leading-relaxed", MUTED)}>
        <p className={cn("font-medium", FG)}>{greeting} 👋</p>
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </Section>
  );
}
