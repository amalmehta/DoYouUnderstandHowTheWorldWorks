# Instructions

## Use it
Open the [live page](https://amalmehta.github.io/DoYouUnderstandHowTheWorldWorks/) and press **Start**.

| Key | Does |
|---|---|
| Enter | Start (on the home screen) |
| A / B | Choose an answer |
| 1–4 | How sure: Guessing 50%, Leaning 65%, Fairly sure 80%, Certain 95% |
| Backspace | Go back one question |
| H | Past attempts |
| ⌘, | Settings |

Progress saves after every question; close the tab and **Resume** later.

**Your data.** Everything is kept in this browser's local storage. *Export* saves a JSON file. *Upload*, dragging that file anywhere onto the page, or pasting it with ⌘V brings it back (duplicates are skipped). *Delete all* in Settings wipes it.

## Run locally
Needs Python 3 (for a static server) and Node 18+ (for tests only). No install step.

```bash
npm start          # serves on http://localhost:8642
npm test           # scoring, item bank and import tests
npm run samples    # regenerate tests/sample-data/*.json
```

Try the sample files in `tests/sample-data/` by dropping them onto the page: `overconfident.json`, `underconfident.json`, `people-blind-spot.json`, `history-three.json`, and the two that should fail politely (`corrupt.json`, `wrong-app.json`).

## Edit the questions
All items are in `js/items.js`. Keep two options with the correct one first, a `why`, a `principle` and a `source` with a working URL. `npm test` checks the shape (24 items, 6 per domain). Old attempts keep their raw choices, so they re-score after an edit.

## Deploy
GitHub Pages serves the `main` branch root. Push to `main` and it updates within a minute.
