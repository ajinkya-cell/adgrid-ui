# AI Components — What to Build

> A research-backed list of AI / chatbot components for adgrid-ui. Every piece is built in the same
> machined material as the rest of the system (wells, popouts, top-lit bevels, cut lines) and follows
> the recipe in [`list.md`](list.md): native element underneath, controlled + uncontrolled,
> `forwardRef`, `data-state`, reduced-motion path, registered + demoed.
>
> Researched October 2026 against the main AI UI kits (Vercel AI Elements, prompt-kit,
> assistant-ui, ElevenLabs UI), the Shape of AI pattern catalog, and the shipped products people
> compare against (ChatGPT, Claude, Gemini, Perplexity, Midjourney, v0). Sources at the bottom.

---

## 0. What we already have that this builds on

| Existing | Reused for |
|---|---|
| `ChatFaq` | Its typing dots, word-by-word stream, and "bubble grows from its tail" motion become **Streaming Text** and **Message** below. Don't rewrite this; extract it. |
| `Drawer`, `Sidebar`, `Nav` | Shell for the **Chat Sidebar** and **Thread History**. |
| `Dialog`, `CommandPalette`, `Combobox` | **Model Picker**, slash-command menu, @-mention menu. |
| `Textarea` (to build, Wave 1 of `list.md`) | Base of the **Prompt Input**. Build it first. |
| `Popover`, `Tooltip`, `Kbd`, `Spinner`, `Button` (Wave 1–2 of `list.md`) | Needed by almost everything here. |
| `Progress`, `Meter`, `Sparkline` | **Context Window Meter**, **Token Usage**, generation progress. |
| `PolaroidDevelop` | Its "develop" reveal is a ready-made language for **Image Generation Reveal**. |
| `DotMatrix` / `matrix/` | Thinking / listening indicators. |

---

## 1. The full list

Grouped by where it lives in an AI product. ★ = core (every chat app needs it), ◆ = differentiator
(what makes our kit worth picking over the shadcn-based ones).

### A. Conversation — the thread itself

| # | Component | Tier | What it is / key details |
|---|---|---|---|
| 1 | **Conversation** (Chat Container) | ★ | Scroll container that sticks to the bottom while streaming, stops sticking when the user scrolls up, resumes when they come back. `role="log"`, `aria-live="polite"`. |
| 2 | **Message** | ★ | User vs assistant variants. User = raised popout bubble on the right; assistant = flat, full-width text on the tray (how Claude/ChatGPT do it). Slots: avatar, content, footer, actions. |
| 3 | **Streaming Text** (Response Stream) | ★ | Extracted from `ChatFaq`: words/tokens fade + un-blur in, layout reserved so lines never reflow. Modes: `word`, `char`, `fade`. Screen readers get the final text, not the stream. |
| 4 | **Markdown Renderer** | ★ | Headings, lists, tables (reuse `Table`), inline code, links, blockquotes, styled in system tokens. Must handle *partial* markdown mid-stream without flicker (unclosed `**`, half a table). |
| 5 | **Code Block** | ★ | Well surface, language label in a tray header, copy button, line numbers, optional filename tab, Shiki highlighting with a void-ui theme. Streaming-safe. |
| 6 | **Typing / Thinking Indicator** (Loader) | ★ | Several variants: three dots (from `ChatFaq`), shimmer text ("Thinking…"), dot-matrix pulse, single breathing LED. |
| 7 | **Message Actions** (Action Bar) | ★ | Copy, regenerate, edit, thumbs up/down, read aloud, share. Row of tiny socket buttons; autohide on all but the last message. |
| 8 | **Branch Picker** | ◆ | `‹ 2 / 3 ›` switcher between regenerated or edited versions of a message. |
| 9 | **Edit Message** | ★ | User bubble turns into an inline textarea with Cancel / Send. Sending creates a new branch. |
| 10 | **Scroll-to-Bottom Button** | ★ | Floating socket button that appears when scrolled up during a stream, with an unread dot. |
| 11 | **Message Enter / Exit Motion** ("chat comes and goes") | ◆ | The choreography layer: new messages rise from the composer, deleted ones fold out, regenerated ones cross-fade in place. A shared motion preset all messages use, not one-off animations. |
| 12 | **Empty State / Welcome** | ★ | Greeting + avatar + suggestion chips, shown before the first message. Fades into the thread on first send. |
| 13 | **Error / Retry Message** | ★ | Inline danger state for failed generation, rate limits, network loss. Retry button, never colour-only. |
| 14 | **Stop Generating** | ★ | Usually lives in the Prompt Input (send button turns into a stop square), but also an inline "Stopped" marker on the cut-off message. |

### B. Input — the composer

| # | Component | Tier | What it is / key details |
|---|---|---|---|
| 15 | **Prompt Input** | ★ | Auto-growing well textarea, Enter to send / Shift+Enter newline, send ↔ stop button, disabled while empty. The single most important component in the set. |
| 16 | **Prompt Input Toolbar** | ★ | Bottom tray inside the input: attach, tools, model picker, voice, web-search toggle. Composable slots. |
| 17 | **Attachments** | ★ | File/image chips in the composer and in sent messages: thumbnail, name, size, upload progress, remove. Drag-and-drop zone that lights up the whole input. Paste images from clipboard. |
| 18 | **Suggestion Chips** (Prompt Suggestions) | ★ | Horizontal row of popout pills above or inside the input. Click fills or sends. Also used for **Follow-up suggestions** under a reply. |
| 19 | **Slash Command Menu** | ◆ | Typing `/` opens a `Combobox` list of commands anchored to the caret. |
| 20 | **Mention Menu** (@-context) | ◆ | `@` to attach files, people, docs, or agents as context. Inserts an inline token chip. |
| 21 | **Model Picker** | ★ | Select / dropdown of models with speed / capability badges and a "reasoning effort" sub-control. |
| 22 | **Mode Toggle** | ◆ | Segmented control for Chat · Search · Deep research · Image · Agent. Changes the input's placeholder and accent. |
| 23 | **Prompt Enhancer** | ◆ | Wand button that rewrites the prompt in place with a diff-like shimmer, and an undo. |
| 24 | **Voice Input Button** | ◆ | Mic button that turns into a live waveform while recording; transcript streams into the input. |
| 25 | **Character / Token Counter** | — | Small dim counter in the toolbar; turns warning near the limit. |

### C. Reasoning, tools & agents — showing the work

| # | Component | Tier | What it is / key details |
|---|---|---|---|
| 26 | **Reasoning / Thinking Block** | ★ | Collapsible "Thought for 12s" panel. Streams open while thinking, auto-collapses when the answer starts. Reuses `Accordion`'s chevron socket. |
| 27 | **Chain of Thought / Steps** | ★ | Vertical list of steps with status (pending · running · done · failed), timestamps, and nested detail. Reuses `Timeline` ideas. |
| 28 | **Tool Call Card** | ★ | Shows a tool invocation: name, input params (collapsible JSON well), status, output. States: `pending → running → complete / error`. |
| 29 | **Tool Approval** (Confirmation) | ◆ | Human-in-the-loop: "Agent wants to send an email — Approve / Deny / Always allow". Raised card with the action preview. |
| 30 | **Task / Plan List** | ◆ | Agent's to-do plan with live check-offs as it works (like Claude Code's task list). |
| 31 | **Agent Status Bar** | ◆ | Persistent strip: current step, elapsed time, Stop / Pause. |
| 32 | **Web Search Results** | ★ | Compact strip of searched queries + favicons of sites read, expandable into a list. |
| 33 | **Sources / Citations** | ★ | Numbered inline citation pills `[1]` with hover cards (title, favicon, snippet), plus a "Sources" footer list. |
| 34 | **Context Window Meter** | ◆ | Ring or bar showing tokens used / max, broken down (system, files, conversation). Built on `Meter`. |
| 35 | **Token & Cost Usage** | — | Small readout per message or per thread: input/output tokens, cost, latency. |
| 36 | **Checkpoint** | — | A cut-line marker in the thread you can restore to ("Restore to here"). |

### D. Generated content — artifacts, images, media

| # | Component | Tier | What it is / key details |
|---|---|---|---|
| 37 | **Image Generation Card** | ★ | The image placeholder while generating. Reserve aspect ratio, then a reveal: noise → blur-up → sharp (a "develop" like `PolaroidDevelop`, or a top-down scanline). Determinate progress when available. |
| 38 | **Image Grid / Variations** | ★ | 2×2 grid of results (Midjourney-style) with per-image actions: upscale, vary, download, use as reference. |
| 39 | **Image Lightbox / Viewer** | ★ | Full-screen `Dialog` with zoom, the prompt shown below, download, regenerate. |
| 40 | **Image Generation Panel** | ◆ | The full studio form: prompt, negative prompt, aspect-ratio picker (visual rectangles), style presets, seed, steps, count. Reuses `SegmentedControl`, `WheelPicker`, knobs. |
| 41 | **Aspect Ratio Picker** | ◆ | Row of little outlined rectangles (1:1, 4:3, 16:9, 9:16). Small but nice. |
| 42 | **Style Preset Picker** | ◆ | Visual cards with thumbnails (Photo, Anime, 3D, Sketch…). |
| 43 | **Inpainting Mask Canvas** | — | Brush over part of an image to regenerate it. Advanced; do last. |
| 44 | **Before / After Compare** | — | Drag slider between original and edited image. |
| 45 | **Artifact / Canvas Panel** | ◆ | Side panel that opens next to the chat for a generated doc, code, or app. Tabs for Preview / Code, version switcher, copy / download. (Claude Artifacts, ChatGPT Canvas.) |
| 46 | **Artifact Card** (inline) | ★ | The compact card in the thread that opens the panel: icon, title, type, "Open". |
| 47 | **Live Preview / JSX Preview** | — | Sandboxed iframe rendering generated HTML/React. |
| 48 | **Diff View** | — | Shows what the AI changed in code or text. Green/red in muted system tones. |
| 49 | **Audio Player / TTS Player** | — | For read-aloud and generated audio: waveform scrubber, speed. |

### E. Voice

| # | Component | Tier | What it is / key details |
|---|---|---|---|
| 50 | **Voice Orb** | ◆ | The "agent is alive" centrepiece. States: idle, listening, thinking, speaking, each with its own motion; reacts to audio volume. Do ours as a machined/glass sphere, not a gradient blob. |
| 51 | **Live Waveform** | ◆ | Bars reacting to mic input in real time (Web Audio `AnalyserNode`). |
| 52 | **Bar Visualizer** | — | Fixed bar-count visualizer for agent output. |
| 53 | **Voice Conversation Bar** | ◆ | Bottom bar during a call: mute, end, live transcript, timer. |
| 54 | **Live Transcript** | — | Streaming captions with the current word highlighted. |

### F. Chat shell — sidebar & chrome

| # | Component | Tier | What it is / key details |
|---|---|---|---|
| 55 | **Chat Sidebar** (Thread History) | ★ | Built on `Sidebar`/`Nav`: New chat button, search, threads grouped Today / Yesterday / Previous 7 days, pinned section, rename / delete / share menu per row, user profile at the bottom. Collapses to an icon rail. |
| 56 | **Thread List Item** | ★ | Title with fade-out overflow, active state as the gliding segment, hover reveals a `⋯` menu, inline rename. |
| 57 | **Floating Chat Widget** | ★ | The website support bubble: launcher button bottom-right with unread badge → expands into a compact chat window (spring from the corner). Very requested; good gallery piece. |
| 58 | **Docked Assistant Panel** | ◆ | Copilot-style panel docked to the right of an app (resizable), for "ask about this page". |
| 59 | **Chat Header** | ★ | Thread title (editable), model badge, share, more menu. |
| 60 | **Projects / Folders** | — | Group threads under a project with its own files and instructions. |
| 61 | **Share Dialog** | — | Create public link, toggle "include future messages". |
| 62 | **Inline AI Popover** | ◆ | Select text anywhere → small floating bar "Ask AI / Explain / Rewrite / Translate". Works outside a chat. |
| 63 | **AI Command Bar** | ◆ | `CommandPalette` variant where the query is answered by AI with streamed text below the results. |

### G. Identity & trust

| # | Component | Tier | What it is / key details |
|---|---|---|---|
| 64 | **AI Avatar** | ★ | Assistant avatar with a state ring (idle / thinking / speaking). |
| 65 | **Disclosure / Caveat Line** | ★ | "AI can make mistakes. Check important info." under the input. |
| 66 | **Feedback Form** | — | After thumbs-down: reason chips + optional text. |
| 67 | **Memory Indicator** | — | "Memory updated" toast + chip that opens what was saved. |
| 68 | **Incognito / Temporary Chat Toggle** | — | Switch that changes the shell's accent and shows a banner. |
| 69 | **Rate Limit / Usage Banner** | — | "You've used 80% of your messages" with a `Progress` bar and reset time. |

---

## 2. Build order

Same rule as `list.md`: later pieces reuse earlier ones. Finish the `list.md` Wave 1 foundations
(Button, Kbd, Spinner, Textarea, Popover) first.

### Wave 1 — A working chat (MVP)

✅ Built (`packages/ui/src/ai/`): **Streaming Text**, **Typing Indicator**, **Message**,
**Conversation** (includes the scroll-to-bottom key) and **Prompt Input**. Demos in
`apps/docs/src/components/presentation/AiChatDemos.tsx`, under the "AI" group in `/present`.
✅ Second batch: **Markdown**, **Code Block**, **Message Actions**, **Prompt Suggestions** and
**Chat Sidebar** (pulled forward from Wave 2). The Chat Sidebar demo is a full app: sidebar + chat.

Streaming Text (extract from `ChatFaq`) → Typing Indicator → Message → Markdown Renderer →
Code Block → Conversation → Prompt Input → Message Actions → Scroll-to-Bottom → Empty State with
Suggestion Chips.

*Outcome:* a demo page that is a full, good-looking chat.

### Wave 2 — The sidebar and the "comes and goes"

Chat Sidebar → Thread List Item → Chat Header → Message Enter/Exit Motion → Edit Message →
Branch Picker → Error/Retry → Floating Chat Widget.

### Wave 3 — Showing the work (agent UI)

Reasoning Block → Chain of Thought / Steps → Tool Call Card → Tool Approval → Task/Plan List →
Sources/Citations → Web Search Results → Context Window Meter.

### Wave 4 — Image generation

Image Generation Card (the reveal) → Image Grid → Lightbox → Aspect Ratio Picker → Style Preset
Picker → Image Generation Panel.

### Wave 5 — Composer power-ups

Attachments → Prompt Input Toolbar → Model Picker → Mode Toggle → Slash Command Menu →
Mention Menu → Prompt Enhancer.

### Wave 6 — Voice

Live Waveform → Voice Input Button → Voice Orb → Voice Conversation Bar → Live Transcript.

### Wave 7 — Artifacts & extras

Artifact Card → Artifact/Canvas Panel → Diff View → Docked Assistant Panel → Inline AI Popover →
AI Command Bar → the remaining "—" items as needed.

---

## 3. Gallery showpieces

If we only build a handful for the gallery first, these sell the kit best:

1. **Full Chat Demo** — Wave 1 + sidebar, scripted conversation that plays on its own.
2. **Image Generation Card** — the develop/scanline reveal is very visual.
3. **Voice Orb** — the machined-glass take is something no shadcn kit has.
4. **Reasoning + Tool Call sequence** — scripted agent run with steps checking off.
5. **Floating Chat Widget** — the launcher-to-window spring.

---

## 4. Rules specific to AI components

- **Headless data, styled shell.** Components take plain props (`messages`, `status`, `parts`);
  don't couple to any SDK. Provide a small adapter example for the Vercel AI SDK `useChat`.
- **Streaming must never reflow.** Reserve space (final width for text, aspect ratio for images).
- **Every state is explicit.** `idle · submitted · streaming · done · error · stopped` via
  `data-state`, so motion and styling key off one attribute.
- **Accessibility.** Thread is `role="log"`; announce completed messages, not every token; all
  icon buttons need `aria-label`; reduced motion swaps streams and reveals for a plain fade.
- **Demo without an API key.** Every demo runs on scripted fake streams, so the docs site needs no
  backend.

---

## Sources

- [Vercel AI Elements](https://github.com/vercel/ai-elements) · [docs](https://elements.ai-sdk.dev) · [Vercel Academy guide](https://vercel.com/academy/ai-sdk/ai-elements) · [21st.dev listing](https://21st.dev/@vercel/library/ai-elements.md)
- [prompt-kit](https://21st.dev/@ibelick/library/prompt-kit.md) (ibelick)
- [assistant-ui primitives](https://www.assistant-ui.com/docs/api-reference/primitives.md) · [BranchPicker](https://www.assistant-ui.com/docs/primitives/branch-picker) · [ActionBar](https://www.assistant-ui.com/docs/primitives/action-bar.mdx)
- [ElevenLabs UI](https://elevenlabs.io/blog/elevenlabs-ui) (orb, waveform, voice agent components)
- [Shape of AI](https://www.shapeof.ai) — pattern catalog (wayfinders, inputs, tuners, governors, trust builders, identifiers)
- [AI UX Playground patterns](https://www.aiuxplayground.com/patterns) · [Cloudscape: artifact previews](https://cloudscape.design/patterns/genai/artifact-previews)
- [Framer AI Image Loader 02](https://www.framer.com/marketplace/components/ai-image-loader-02/) (image-generation reveal reference)
