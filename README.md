# HamsOne Portfolio

Bot & Website Developer — portfolio site for hamsone.my.id.

## Local preview

This is a plain static site with no build step or package install:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Open the served page over HTTP (ES modules do not work over `file://`).
There are no configured pre-commit hooks.

## Hero scene

- `hamdi-avatar.js` builds the toy-like Hamdi likeness from `avatar.gif`.
- `hero-scene.js` supplies the desk, lighting, shared render loop, and parallax.
- `hamdi-avatar.js` also owns the shared seated/standing joints, breathing,
  typing, and blink rig. Reduced motion resets all idle motion.
- `about-scene.js` carries the same scene/renderer/avatar from the workspace
  into the standing cyan hologram, with a scroll-linked scan and camera orbit.
- `hero.css` and `about.css` preserve the approved hero and About framing.
- `portfolio.css` carries the cream/navy/green visual system through the
  real project case studies, service tiles, demos, testimonials and contact.
  Both light and dark palettes are supported; the fresh default is cream.
- `navigation.css` / `navigation.js` provide the responsive hamburger menu
  at 1100px and below, before translated desktop labels become crowded.
- `assets/hamdi-desk.svg` is the always-available static fallback, including
  when JavaScript, WebGL, or module loading fails.
- `assets/hamdi-hologram.svg` provides the equivalent static About fallback;
  the bio and skills are ordinary readable HTML regardless of WebGL support.
- Three.js r160 and its license are vendored in `assets/vendor/`.

The scene does not capture touch input. It caps resolution and frame rate,
pauses offscreen/in background tabs, and renders a still frame for reduced
motion. Verify desktop/mobile, reduced motion, and WebGL-disabled fallback
when changing it.

For About verification, scroll from the desk through the complete 000–100
profile reveal and back. Check the standing pose, camera orbit, connected
joints, native touch scroll, readable EN/ID cards, and navigation at 390px
and 768px. With reduced motion the character/camera/scan are still (100),
and there is no continuous hero/About RAF loop. Disable the scene module
or lose its WebGL context to check both static illustrations.

© 2026 HamsOne, All Rights Reserved.

## Portfolio interactions

Project shots and their privacy/simulation captions are preserved. Service
tiles are native links that prefill the inquiry platform; without JavaScript
they still lead to Contact. The inquiry only opens a prefilled WhatsApp draft.
The existing testimonial endpoint and submission payload are unchanged.

Verify EN/ID, both themes, keyboard service selection, process buttons,
rating selection, testimonial loading/submission, and WhatsApp draft content.
Enable Do Not Track and block POST requests in browser tests: visit counting
and testimonial submissions otherwise write to a live Google Apps Script.
Use an intercepted response for submission tests, never publish test data.
Reduced motion stops terminal typing, coverflow/testimonial auto-advance,
marquee/reveals and magnetic pointer motion as well as the 3D scene.

## Motion polish

`motion.css` / `motion.js` progressively enhance the same readable HTML:

- Finite entrances, reveals and UI transitions share a 720ms expo-out curve.
  The existing continuous avatar, typing and ticker loops keep their cadence.
- Lenis 1.3.15 is pinned locally in `assets/vendor/` with its MIT license.
  It loads only above 1100px with a fine, hover-capable pointer, when reduced
  motion is off. Only unmodified vertical wheel input is smoothed; touch,
  keyboard, anchor links, scrollbar dragging and nested controls stay native.
  It updates actual `window.scrollY`, not a virtual wrapper, so About keeps
  its existing scan/orbit calculation. Failed loading leaves native scrolling.
- The hero letters, role, copy, actions and avatar enter in sequence. A failed
  enhancement never hides the hero for longer than the 1.8s fail-safe.
- Section headings and cards reveal individually. Desktop panels have a
  bounded 64px sticky hold; tall panels pin at their bottom so all content
  stays reachable. About's internal sticky scene is unchanged. Stacking,
  parallax, tilt, magnets and spotlights are disabled on phone/tablet layouts.
- The existing capability ticker is reused between Hero and About. Native
  cursors and instant access are kept instead of an optional cursor/preloader.
- Reduced motion cancels active entrance/reveal animations, destroys Lenis,
  reveals all content and disables sticky stacking and pointer motion.

Verify first-load entrances and wheel smoothing in both themes, then use a
touch-capable phone context to confirm non-canceled native touch scrolling.
Scroll About forward/back and compare its counter to actual scroll geometry;
also check deep links, reverse navigation, reduced-motion changes, no-JS/
blocked-module/WebGL fallbacks, nested controls, overflow and keyboard access.
Use DNT and block POSTs as described above; do not send real inquiries.
