# Coca-Cola World Food Safety Day Generator

This folder contains a local static generator for a premium Coca-Cola World Food Safety Day passport fair campaign.

## Start Here

Open `index.html` in a browser, or run a small local server from this folder:

```bash
python3 -m http.server 8765
```

Then open `http://127.0.0.1:8765/index.html`.

The generator lets you:

- Choose a campaign material or station.
- Launch the full `jeopardy-game.html` web game converted from the Coca-Cola branded PowerPoint.
- Edit the headline, body copy, CTA, kicker, and QR label.
- Choose export size: landscape poster, portrait station sign, digital screen, or passport/card sheet.
- Swap a background image.
- Download the current design as a PNG.
- Open the current PNG in a new tab when browser downloads are limited.
- Print the built-in packet from the browser.

## Core Files

- `index.html` - Generator app and printable packet.
- `campaign-data.js` - Editable campaign copy, prompts, asset paths, station metadata, and answer cues.
- `generator.js` - Canvas renderer, text overlay, image swapping, and PNG export.
- `styles.css` - Premium Coke campaign UI and print styling.
- `digital-quiz.html` - Existing station quiz, still usable as a QR target.
- `jeopardy-game.html` - Host-led World Food Safety Day Jeopardy game with teams, scoring, used tiles, and Final Jeopardy.
- `jeopardy-data.js` - Structured categories, clues, responses, teaching points, and rules extracted from the deck.
- `jeopardy-game.js` / `jeopardy-game.css` - Jeopardy app behavior and projector-friendly styling.
- `assets/generated/` - Generated raster backgrounds used by the app.

## Generated Backgrounds

- `hero-campaign.png`
- `station-spot-risk.png`
- `station-perfect-product.png`
- `station-myth-fact.png`
- `station-allergen-label.png`
- `station-red-flag.png`
- `passport-completion.png`
- `digital-screen.png`

## Notes

- Text is rendered by the generator, not baked into the images, so posters stay readable and editable.
- QR codes are visual placeholders until internal SharePoint, Forms, or hosted quiz links are available.
- Materials are for internal associate engagement. Confirm final examples with QSE/site leadership and brand/comms before printing.
- Avoid adding confidential formulas, KORE details, audit results, or real site layouts to public-facing station materials.
