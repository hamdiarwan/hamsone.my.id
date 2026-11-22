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
