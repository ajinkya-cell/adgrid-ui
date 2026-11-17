How radiumcoders.com makes its background

I downloaded the site's JavaScript and pulled out the source. The background is a custom WebGL2 shader drawn in two passes onto a canvas behind the page. It isn't a video or image, and it isn't built with a library.

1. Layout
- A <canvas> sits behind everything (absolute inset-0 z-0), at 60% opacity in dark mode and 90% in light mode.
- The content is a narrow max-w-3xl column with bg-background/75 backdrop-blur-2xl. You see the shader clearly in the side gutters and as a frosted blur behind the text. That contrast is a big part of why it looks good.
- It only loads on screens ≥ 64rem wide. Phones get a plain background.
- Bonus effect: at the bottom of the screen, 5 stacked backdrop-filter layers (1, 2, 4, 8, 16px), each with a gradient mask, make a progressive blur fade.

2. Pass 1: the glowing ribbons
- Each pixel runs a loop 75 times. Every time round, it bends its coordinate with two sine waves, then rotates, shears and shrinks it slightly.
- On each step it adds a stretched glow, 1 / (distance² + tiny). Stacking 75 bent copies of one ellipse produces those silky, folded light ribbons.
- It adds up the glow and an average hue, and only colours the result at the end. The colour work is in OKLCH (a colour space where equal steps look equally different) over a blue → violet → pink → orange "sunset" range that deliberately skips muddy greens.
- An ACES-style tone curve (the brightness curve film uses) keeps bright areas rich instead of washing out to white. A slow "breathing" zoom keeps it alive.
- In light mode it subtracts colour instead of adding it, so it looks like ink printed on paper rather than light.

3. Pass 2: halftone print texture
- The first pass renders to a texture. A second shader turns it into a rotated halftone dot grid, like newspaper print. Dot size follows brightness, and the dots fade in only where the image is bright.
- Blue-noise dithering (adding fine, evenly spread noise) removes colour banding.

4. Performance work (worth copying)
- Resolution is capped at about 1.5 megapixels and devicePixelRatio (screen pixel density) at 2.
- It requests the low-power GPU.
- It pauses when the tab is hidden or the canvas is off-screen.
- It respects prefers-reduced-motion.
- Theme changes cross-fade smoothly.
- For Diwali, a "festive" switch changes the hues to diya colours.

The ribbon-loop technique is in the same family as XorDev's "turbulence" shaders (sine warps inside a loop with a rotation each step). The halftone pass is a classic print effect; Paper Shaders' Halftone Dots (https://21st.dev/@paper-design/components/halftone-dots) is an open-source version of it.

Ideas for our own version

Copying their shader constants would just make a clone, so these keep the same "generated field → stylised print pass" structure and change both halves:

1. Hand-drawn hatching: a flowing warped-noise field drawn as pen cross-hatching instead of dots: denser strokes where it's brighter, with a slight wobble. This fits the developer-portfolio template best, since it already uses Roughly's hand-drawn marks.
2. Topographic map: a slowly moving height field drawn as contour lines, like a terrain map. The cursor raises a hill under it. It's quiet, technical and very "developer".
3. Engraved metal: a brushed-metal sheen that slowly rotates, drawn as engraved line shading (like banknote art) instead of dots. This matches the void-ui dark machined look.
4. ASCII field: the same ribbon-style glow, but each cell becomes a monospace character ( .:-=+*#%@) tinted by OKLCH hue. A terminal look for a dev portfolio.
5. 1-bit dithered aurora: a soft aurora rendered with ordered (Bayer) dithering in two colours. A retro Mac look that's cheap to run.
6. Interactive twist on any of these: the cursor pushes the field around, scroll position drives time or hue, and the colour range changes per section (e.g. warm for "About", cool for "Projects").

Whichever we choose, I'd reuse their structure: canvas behind a frosted column, the progressive bottom blur, OKLCH colouring, blue-noise dithering, the pausing and resolution caps, and a plain fallback on mobile.

My pick is #1 or #2 for the portfolio template, since they look the most original next to the rest of it. Tell me which one and I'll build it as a component you can preview in the dev server.

Also, the void skill is missing the new developer-portfolio component. Want me to update it now?

Sources: Paper Shaders – Halftone Dots (https://21st.dev/@paper-design/components/halftone-dots), XorDev shader techniques write-up (https://skills.cat/skills/zhanghandong/makepad-component/xor-shader-techniques), Domain-warped noise (https://gamedev.net/shaderlab/23-domain-warped-noise/), WebGL background intro (https://wdf-dev.gitlab.io/articles/webgl-back-00.html), LiU WebGL shader tutorial (https://itn-web.it.liu.se/~stegu76/webglshadertutorial/shadertutorial.html)