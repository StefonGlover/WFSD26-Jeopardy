# Food Safety Face-Off

This folder contains the host-led World Food Safety Day Jeopardy game and printable host quick start guide.

## Start Here

Run the included local server from this folder:

```bash
npm run serve
```

Then open `http://127.0.0.1:4178/index.html`. The root page redirects directly to `jeopardy-game.html`.

## Core Files

- `index.html` - Redirect entry point for the web game.
- `jeopardy-game.html` - Host-led game board with teams, scoring, used tiles, notes, and Final Jeopardy.
- `jeopardy-data.js` - Categories, clues, responses, teaching points, and rules.
- `jeopardy-game.js` / `jeopardy-game.css` - Game behavior and projector-friendly styling.
- `jeopardy-sound.js` / `jeopardy-dialogs.js` - Sound and dialog helpers.
- `styles.css` - Printable host quick start styling.
- `safe-food-fast-thinking-jeopardy-game.pptx` - Macro-free clickable PowerPoint version of the game.

## Notes

- The removed campaign generator, digital quiz, QR vendor, and print packet routes are no longer part of this project.
- Materials are for internal associate engagement. Confirm final examples with QSE/site leadership and brand/comms before use.
- Use generic examples only. Do not add confidential formulas, KORE details, audit results, real site layouts, supplier names, active incidents, or unreleased business information.
