# Manual review checklist

What the automated tests can't check. Tick each on a real device.

**Feel and smoothness**
- [ ] Opening animation: icon springs in, page eases up, under a second; with Reduce Motion on (system or Settings), a plain fade
- [ ] Choosing an answer highlights it instantly; confidence row fades in without moving anything else
- [ ] Picking a confidence moves to the next question with no flicker
- [ ] Results page scrolls smoothly; review items open without jumps

**Looks**
- [ ] Light and dark mode: every screen, both dialogs, toast, drop overlay, chart
- [ ] Phone width (375 px): no sideways scroll; confidence buttons in a 2×2 grid
- [ ] Both equations in "How it's scored" render typeset (needs the KaTeX CDN), legible in dark mode
- [ ] Icon looks right in the browser tab and when added to a phone's home screen

**Content (the most important part)**
- [ ] Read every item's question, answer, why and source. Fix or cut anything you think is wrong or unfair
- [ ] Click every source link once
- [ ] Read the six second-look snippets: do the strong ones feel strong and the weak ones honestly weak, not misleading?
- [ ] Take it as someone who switches on every piece of evidence: does the result say "defers"?

**Live services**
- [ ] Feedback: copies your text and opens a new GitHub issue page
- [ ] GitHub Pages URL loads and fonts appear
