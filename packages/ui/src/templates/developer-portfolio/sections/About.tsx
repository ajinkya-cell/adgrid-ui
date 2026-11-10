"use client";

import { useEffect, useState } from "react";
import { cn } from "../../../lib/utils";
import { Roughly } from "../../../animated/Roughly";
import { FG, MUTED, Section, useMarker } from "../parts";

function greetingFor(hour: number) {
  if (hour < 5) return "Hello, night owl";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** A paragraph with one clause highlighted by hand; <mark> keeps the meaning without the drawing. */
function Paragraph({ text, highlight }: { text: string; highlight?: string }) {
  const marker = useMarker();
  const at = highlight ? text.indexOf(highlight) : -1;
  if (!highlight || at < 0) return <p>{text}</p>;
  return (
    <p>
      {text.slice(0, at)}
      <mark className={cn("bg-transparent", FG)}>
        {/* 15px body text → padding [2, 4] */}
        <Roughly.Highlight color={marker.color} opacity={marker.opacity} padding={[2, 4]} animationDelay={300}>
          {highlight}
        </Roughly.Highlight>
      </mark>
      {text.slice(at + highlight.length)}
    </p>
  );
}

/** Greets the visitor by their own time of day. Says "Hello" until mounted so SSR matches. */
export function About({ paragraphs, highlight }: { paragraphs: string[]; highlight?: string }) {
  const [greeting, setGreeting] = useState("Hello");
  useEffect(() => setGreeting(greetingFor(new Date().getHours())), []);

  if (!paragraphs.length) return null;
  // Only the first paragraph that contains the clause gets the mark.
  const markedIndex = highlight ? paragraphs.findIndex((p) => p.includes(highlight)) : -1;
  return (
    <Section id="about" title="About">
      {/* isolate: the marker draws behind the text and must not slip behind the page background */}
      <div className={cn("isolate max-w-[65ch] space-y-3 text-[15px] leading-relaxed", MUTED)}>
        <p className={cn("font-medium", FG)}>{greeting} 👋</p>
        {paragraphs.map((paragraph, i) => (
          <Paragraph key={paragraph} text={paragraph} highlight={i === markedIndex ? highlight : undefined} />
        ))}
      </div>
    </Section>
  );
}
