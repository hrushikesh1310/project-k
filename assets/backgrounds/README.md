# Background images

These images are used as **random per-page backgrounds**.

## How it works

- `assets/site.js` picks a random image on each page load.
- It sets the CSS variable `--page-bg-image`.
- `assets/styles.css` uses that variable as the page background.

## Customize

1. Add your own images into this folder (e.g. `bg-6.jpg`).
2. Update the `backgrounds` array in `assets/site.js`.

Tip: Use large images (around 2000px wide) for best quality on big screens.
