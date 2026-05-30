# Food Safety Face-Off

This folder contains the host-led World Food Safety Day Jeopardy game and the board-linked host score sheet.

## Start Here

Run a small local server from this folder:

```bash
python3 -m http.server 8765
```

Then open `http://127.0.0.1:8765/index.html`. The root page redirects directly to `jeopardy-game.html`.

## Core Files

- `index.html` - Redirect entry point for the web game.
- `jeopardy-game.html` - Host-led game board with teams, scoring, used tiles, notes, and Final Jeopardy.
- `host-score-sheet.html` - Board-linked printable host score sheet for backup scoring, wagers, and notes.
- `jeopardy-data.js` - Categories, clues, responses, teaching points, and rules.
- `jeopardy-game.js` / `jeopardy-game.css` - Game behavior and projector-friendly styling.
- `jeopardy-sound.js` / `jeopardy-dialogs.js` - Sound and dialog helpers.
- `styles.css` - Print score sheet styling.
- `safe-food-fast-thinking-jeopardy-game.pptx` - Macro-free clickable PowerPoint version of the game.

## Notes

- The removed campaign generator, digital quiz, QR vendor, and print packet routes are no longer part of this project.
- Materials are for internal associate engagement. Confirm final examples with QSE/site leadership and brand/comms before use.
- Avoid adding confidential formulas, KORE details, audit results, or real site layouts.
