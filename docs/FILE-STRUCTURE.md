# File structure

```
index.html              The page: header, dialogs (settings, feedback), splash
css/style.css           All styling; light/dark tokens; domain colours; animations
js/items.js             The 24 questions, their answers, explanations and sources
js/items-retired.js     Questions replaced in an update, kept so older results still display
js/scoring.js           Accuracy, calibration, Brier score, verdicts (pure, tested)
js/store.js             Local storage, export/import and validation (tested)
js/app.js               Screens, keyboard, file drop/paste, settings, feedback
assets/icon.svg         App icon (favicon); icon-180/512.png for touch and README
tests/*.test.mjs        Node tests: scoring, items, store
tests/make-samples.mjs  Builds the sample attempt files
tests/sample-data/      Importable sample attempts, including broken ones
docs/                   Instructions, system design, this file, review checklist, prompt log, images
DoYouUnderstandHowTheWorldWorks?.md   The project spec
```
