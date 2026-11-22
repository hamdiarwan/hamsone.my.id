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
- `hero-scene.js` supplies the desk, lighting, idle motion, and parallax.
- `hero.css` is scoped to the Phase 1 hero; lower sections are unchanged.
- `navigation.css` / `navigation.js` provide the responsive hamburger menu
  at 1100px and below, before translated desktop labels become crowded.
- `assets/hamdi-desk.svg` is the always-available static fallback, including
  when JavaScript, WebGL, or module loading fails.
- Three.js r160 and its license are vendored in `assets/vendor/`.

The scene does not capture touch input. It caps resolution and frame rate,
pauses offscreen/in background tabs, and renders a still frame for reduced
motion. Verify desktop/mobile, reduced motion, and WebGL-disabled fallback
when changing it.

© 2026 HamsOne, All Rights Reserved.
