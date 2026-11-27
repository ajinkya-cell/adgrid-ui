import { playClickVoice, DETENT_CLICK, VOID_BUTTON_CLICK, type ClickVoice } from "../../../lib/click-voices";

let ctx: AudioContext | null = null;

/** One shared AudioContext for every control on the page; silent if the browser blocks it. */
export function click(voice: ClickVoice = DETENT_CLICK): void {
  if (typeof window === "undefined") return;
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    ctx ??= new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    playClickVoice(ctx, voice);
  } catch {
    // Audio is a garnish; never let it break a control.
  }
}

export { DETENT_CLICK, VOID_BUTTON_CLICK };
