// The item bank. Every item is a two-choice question with one answer backed
// by a published source. options[0] is always the correct one; the app
// shuffles the order on screen. Two choices (not four) so that "Guessing 50%"
// really is a coin flip, which keeps the calibration chart honest.
//
// Since 2026-10-28 the bank aims at base-level "how things work" knowledge a
// competent person in a demanding field would have: how money, healthcare,
// government and people actually behave. Plain wording, no study set-ups in
// the question; the research shows up only in the answer. Replaced items live
// in items-retired.js so older results still display.
//
// `evidence` (6 items) is shown in the second-look round: "strong" points to
// the right answer, "weak" is real but weak evidence for the wrong one.

export const DOMAINS = {
  health:   { name: "Health & medicine",   short: "Health",   family: "people"  },
  people:   { name: "People & emotions",   short: "People",   family: "people"  },
  politics: { name: "Politics & society",  short: "Politics", family: "systems" },
  work:     { name: "Money & work",        short: "Work",     family: "systems" },
};

export const ITEMS = [
  // ── Health & medicine ──────────────────────────────────────────────
  {
    id: "h5", domain: "health",
    evidence: { kind: "strong", text: "A Cochrane review pooled randomised trials of antibiotics for the common cold and found people on antibiotics were no more likely to be cured than people on placebo, and adults taking them had more side effects.", lesson: "Pooled randomised trials are among the strongest evidence there is: they control for chance and for wishful thinking.", source: { label: "Kenealy & Arroll (2013), Cochrane Review of randomised trials", url: "https://pubmed.ncbi.nlm.nih.gov/23733381/" } },
    prompt: "For an otherwise healthy adult with a common cold, antibiotics…",
    options: ["Don’t make it end sooner", "Shorten it by a day or two"],
    why: "Colds are caused by viruses; antibiotics act on bacteria. A Cochrane review of randomised trials found no benefit, and more side effects.",
    principle: "Before judging a treatment, ask whether its mechanism can reach the cause.",
    source: { label: "Kenealy & Arroll (2013), Cochrane Review", url: "https://doi.org/10.1002/14651858.CD000247.pub3" },
  },
  {
    id: "h7", domain: "health",
    evidence: { kind: "weak", text: "Of drugs that reach the last stage of human trials (Phase 3), about 6 in 10 go on to be approved.", lesson: "True, but about the survivors of the earlier stages. Most drugs fail before they ever reach Phase 3.", source: { label: "Wong, Siah & Lo (2019), Biostatistics", url: "https://doi.org/10.1093/biostatistics/kxx069" } },
    prompt: "A new drug starts its first tests in people. How likely is it to end up approved?",
    options: ["About 1 in 7", "About 1 in 2"],
    why: "Across about 21,000 drugs tested from 2000 to 2015, about 14% of those entering human trials were eventually approved. The rest drop out along the way.",
    principle: "Ask what share of attempts succeed, not just whether this one sounds promising. Early-stage promise is cheap.",
    source: { label: "Wong, Siah & Lo (2019), Biostatistics", url: "https://doi.org/10.1093/biostatistics/kxx069" },
  },
  {
    id: "h8", domain: "health",
    prompt: "In the US, the 5% of people with the highest medical bills account for how much of all healthcare spending?",
    options: ["About half", "About a sixth"],
    why: "Spending is extremely concentrated: in 2018 the top 5% of spenders accounted for 48% of all spending, while the bottom half of people accounted for about 3%.",
    principle: "Many costs follow a few cases. Find the heavy tail before averaging.",
    source: { label: "AHRQ, Medical Expenditure Panel Survey, Statistical Brief", url: "https://meps.ahrq.gov/data_files/publications/st533/stat533.shtml" },
  },
  {
    id: "h9", domain: "health",
    prompt: "In the US, what share of prescriptions filled are for generic drugs?",
    options: ["About 9 in 10", "About 4 in 10"],
    why: "About 90% of prescriptions are filled with generics, which work the same as the brand version. Brand drugs are the small share of prescriptions but most of the money.",
    principle: "Count by volume and by money separately. They often tell opposite stories.",
    source: { label: "U.S. FDA, Generic Drugs", url: "https://www.fda.gov/drugs/buying-using-medicine-safely/generic-drugs" },
  },
  {
    id: "h10", domain: "health",
    prompt: "An ad says a drug “halves your risk” of a heart attack. On its own, that tells you…",
    options: ["Little — it depends on how big your risk was to start", "That it’s a big benefit worth taking"],
    why: "If your risk was 2 in 100, halving it means 1 in 100: 100 people take the drug for one to benefit. “Halves” is a relative number; what matters to you is the absolute change.",
    principle: "Ask “half of what?” Turn relative claims into numbers out of 100 before judging.",
    source: { label: "Gigerenzer et al. (2007), Psychological Science in the Public Interest", url: "https://doi.org/10.1111/j.1539-6053.2008.00033.x" },
  },
  {
    id: "h11", domain: "health",
    prompt: "Of early deaths in the US, roughly how many come down to shortfalls in medical care?",
    options: ["About 1 in 10 — behaviour, circumstances and genes matter more", "Most of them"],
    why: "A widely used estimate puts medical-care shortfalls at about 10% of premature deaths. Behaviour (smoking, diet, activity) accounts for about 40%, with genetics, social circumstances and environment making up the rest.",
    principle: "Healthcare treats illness; most health is made outside the doctor’s office.",
    source: { label: "McGinnis, Williams-Russo & Knickman (2002), Health Affairs", url: "https://doi.org/10.1377/hlthaff.21.2.78" },
  },

  // ── Politics & society ─────────────────────────────────────────────
  {
    id: "p1", domain: "politics",
    evidence: { kind: "weak", text: "In 23 of 27 Gallup polls since 1993, at least 60% of Americans said there was more crime in the US than the year before.", lesson: "Polls measure what people believe about crime, not how much crime happened. The FBI’s counts show it fell by about half.", source: { label: "Pew Research Center (2024), summarising Gallup polls", url: "https://www.pewresearch.org/short-reads/2024/04/24/what-the-data-says-about-crime-in-the-us/" } },
    prompt: "Between 1993 and 2022, the US violent-crime rate (FBI data)…",
    options: ["Fell by about half", "Rose"],
    why: "FBI rates fell about 49%, from about 747 to about 381 violent crimes per 100,000 people. Yet in 23 of 27 Gallup polls since 1993, at least 60% of Americans said crime was rising.",
    principle: "News reports events, not rates. Check the trend line before trusting the feeling.",
    source: { label: "Pew Research Center (2024), What the data says about crime in the U.S.", url: "https://www.pewresearch.org/short-reads/2024/04/24/what-the-data-says-about-crime-in-the-us/" },
  },
  {
    id: "p2", domain: "politics",
    evidence: { kind: "strong", text: "World Bank household-survey data, compiled by Our World in Data: the share of people below the $3-a-day poverty line fell from about 44% in 1990 to about 10% in 2025.", lesson: "Surveys of households in most countries, repeated over decades, outweigh any impression from the news.", source: { label: "Our World in Data, Poverty (World Bank household surveys)", url: "https://ourworldindata.org/poverty" } },
    prompt: "Since 1990, the share of the world’s people living in extreme poverty has…",
    options: ["More than halved", "Stayed about the same"],
    why: "By the World Bank’s current $3-a-day line it fell from about 44% in 1990 to about 10% today, even as the population grew.",
    principle: "Slow, steady improvements rarely make news, so they are the ones we most underrate.",
    source: { label: "Our World in Data, Poverty (World Bank data)", url: "https://ourworldindata.org/poverty" },
  },
  {
    id: "p6", domain: "politics",
    prompt: "Roughly what share of the US federal budget goes to foreign aid?",
    options: ["About 1%", "About 15%"],
    why: "Foreign aid is around 1% of federal spending. In a KFF poll, the average American guessed about a quarter.",
    principle: "Before arguing about a cost, find its size relative to the whole.",
    source: { label: "KFF (2015), Americans’ views on the U.S. role in global health", url: "https://www.kff.org/global-health-policy/poll-finding/data-note-americans-views-on-the-u-s-role-in-global-health/" },
  },
  {
    id: "p7", domain: "politics",
    prompt: "What’s the single biggest item in the US federal budget?",
    options: ["Social Security", "Defence"],
    why: "Social Security is over a fifth of federal spending; defence is about an eighth, less than interest on the debt. Add Medicare and Medicaid and most of the budget is payments to people, mainly older people.",
    principle: "A budget is mostly its few biggest lines. Know those before debating the small ones.",
    source: { label: "Congressional Budget Office, The Federal Budget in Fiscal Year 2024", url: "https://www.cbo.gov/publication/61181" },
  },
  {
    id: "p8", domain: "politics",
    prompt: "The top 10% of US earners pay what share of all federal income tax?",
    options: ["More than two-thirds", "About a third"],
    why: "In IRS data for 2022, the top 10% of earners paid 72% of federal income taxes while earning about 49% of all income. (Payroll and other taxes are spread more evenly.)",
    principle: "When people argue about who pays, ask which tax and which share: of income, or of the tax.",
    source: { label: "Tax Foundation (2024), summarising IRS data for 2022", url: "https://taxfoundation.org/data/all/federal/latest-federal-income-tax-data-2025/" },
  },
  {
    id: "p9", domain: "politics",
    prompt: "Of all the bills introduced in a typical recent US Congress, how many become law?",
    options: ["Fewer than 1 in 20", "About 1 in 3"],
    why: "Recent Congresses introduce well over 10,000 bills and enact a few hundred, roughly 1–3%. Most bills are signals to voters or donors, never meant to pass.",
    principle: "A proposal is not a policy. Ask what share of its kind ever happen.",
    source: { label: "GovTrack, Statistics and historical comparison", url: "https://www.govtrack.us/congress/bills/statistics" },
  },

  // ── Money & work ───────────────────────────────────────────────────
  {
    id: "w1", domain: "work",
    prompt: "When you’re negotiating a price, making the first offer usually…",
    options: ["Helps you — it anchors the final price", "Hurts you — it gives away information"],
    why: "In experiments, final prices sat close to whichever side opened first. The exception: if you know far less about the value than the other side, let them open.",
    principle: "The first number on the table pulls every later number toward it (anchoring).",
    source: { label: "Galinsky & Mussweiler (2001), Journal of Personality and Social Psychology", url: "https://doi.org/10.1037/0022-3514.81.4.657" },
  },
  {
    id: "w6", domain: "work",
    prompt: "When hiring, which predicts how well someone will do the job?",
    options: ["A structured interview: same questions, scored the same way", "A free-flowing conversation"],
    why: "In the largest recent re-analysis, structured interviews were the strongest single predictor; unstructured ones were about half as predictive.",
    principle: "Judgement gets better when you fix the questions and the scoring before you meet the person.",
    source: { label: "Sackett et al. (2022), Journal of Applied Psychology", url: "https://doi.org/10.1037/apl0000994" },
  },
  {
    id: "w7", domain: "work",
    prompt: "You invest $10,000 at 7% a year and leave it alone for 30 years. You end up with about…",
    options: ["$76,000", "$31,000"],
    why: "Each year’s growth earns growth too: 10,000 × 1.07³⁰ ≈ 76,000. $31,000 is what you’d get if only the original $10,000 earned 7% each year.",
    principle: "Compounding is slow, then fast. Most of the gain comes in the last third of the time.",
    source: { label: "U.S. SEC, Investor.gov compound interest calculator", url: "https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator" },
  },
  {
    id: "w8", domain: "work",
    prompt: "Of new US businesses (all kinds, not just tech startups), how many are still going five years later?",
    options: ["About half", "About 1 in 10"],
    why: "Government data show about half of new businesses survive five years, and about a third last ten. “9 in 10 fail” is a myth about all businesses.",
    principle: "Check a scary statistic against the official count. Folk numbers drift toward drama.",
    source: { label: "U.S. Bureau of Labor Statistics, Business Employment Dynamics: establishment age and survival", url: "https://www.bls.gov/bdm/bdmage.htm" },
  },
  {
    id: "w9", domain: "work",
    prompt: "For a typical large company, which raises operating profit more?",
    options: ["Raising prices 1%", "Cutting variable costs 1%"],
    why: "In McKinsey’s analysis of an average S&P 1500 company, a 1% price rise (with volume holding steady) lifted operating profit about 8%, roughly 50% more than a 1% cut in variable costs. Price falls straight to profit.",
    principle: "Small changes to the biggest number on the page move the bottom line most. Price is usually that number.",
    source: { label: "Marn, Roegner & Zawada (2003), McKinsey Quarterly, “The power of pricing”", url: "https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/the-power-of-pricing" },
  },
  {
    id: "w10", domain: "work",
    prompt: "Over 15 years, what share of US funds that pick large-company stocks beat a simple S&P 500 index fund?",
    options: ["About 1 in 10", "About half"],
    why: "S&P’s scorecard finds about 9 in 10 actively managed large-cap funds (89.5% to the end of 2024) trailed the index over 15 years, mostly because of fees, and last year’s winners rarely stay on top.",
    principle: "Before paying for skill, check how often skill beats the cheap default over a long stretch.",
    source: { label: "S&P Dow Jones Indices, SPIVA U.S. Scorecard", url: "https://www.spglobal.com/spdji/en/spiva/article/spiva-us/" },
  },

  // ── People & emotions ──────────────────────────────────────────────
  {
    id: "s3", domain: "people",
    evidence: { kind: "strong", text: "Across five studies, including first-year college students rating their dorm mates over several months, people systematically underestimated how much their conversation partners liked them.", lesson: "Five studies, one following real people for months, make a finding hard to dismiss as a lab quirk.", source: { label: "Boothby, Cooney, Sandstrom & Clark (2018), Psychological Science", url: "https://doi.org/10.1177/0956797618783714" } },
    prompt: "You just had a first conversation with someone new. Compared with what you think, they probably liked you…",
    options: ["More", "Less"],
    why: "Partners liked people more than they thought (the liking gap), across lab chats and first-year college dorm mates. We dwell on our own awkward moments.",
    principle: "Your inner critic is not the other person. Assume you came across a bit better than it felt.",
    source: { label: "Boothby et al. (2018), Psychological Science", url: "https://doi.org/10.1177/0956797618783714" },
  },
  {
    id: "s4", domain: "people",
    prompt: "How good are people at telling when someone is lying from their face, voice and body language?",
    options: ["Barely better than a coin flip", "Right about three times in four"],
    why: "A review of 206 research reports found 54% accuracy on average, and experts were barely better. Liars and truth-tellers look much alike.",
    principle: "Demeanour is weak evidence. Check facts and consistency, not eye contact.",
    source: { label: "Bond & DePaulo (2006), Personality and Social Psychology Review", url: "https://doi.org/10.1207/s15327957pspr1003_2" },
  },
  {
    id: "s7", domain: "people",
    prompt: "When you’re furious, “letting it out” (hitting a pillow, yelling) tends to leave you…",
    options: ["Angrier and more aggressive", "Calmer"],
    why: "People who vented on a punching bag while thinking about the person who angered them were more aggressive afterwards than people who sat quietly.",
    principle: "Rehearsing a feeling strengthens it. To cool down, do something that lowers arousal.",
    source: { label: "Bushman (2002), Personality and Social Psychology Bulletin", url: "https://doi.org/10.1177/0146167202289002" },
  },
  {
    id: "s8", domain: "people",
    prompt: "You walk into a room with an embarrassing stain on your shirt. Compared with what you’d guess, the number of people who notice is…",
    options: ["About half as many", "About as many"],
    why: "People wearing an embarrassing T-shirt guessed about half the room noticed; about a quarter did (the spotlight effect).",
    principle: "You are the centre of your own attention, not other people’s.",
    source: { label: "Gilovich, Medvec & Savitsky (2000), Journal of Personality and Social Psychology", url: "https://doi.org/10.1037/0022-3514.78.2.211" },
  },
  {
    id: "s9", domain: "people",
    evidence: { kind: "weak", text: "A famous 2010 study of 450,000 survey answers found that day-to-day emotional wellbeing stopped rising above about $75,000 a year.", lesson: "True, but it used yes/no questions about yesterday. Re-analysing finer data together in 2023, its author and a critic found the plateau only for the least happy fifth of people.", source: { label: "Kahneman & Deaton (2010), PNAS", url: "https://doi.org/10.1073/pnas.1011492107" } },
    prompt: "Above a comfortable income, does more money keep making most people happier day to day?",
    options: ["Yes, though each extra dollar matters less", "No, it levels off around $75,000"],
    why: "In a 2023 joint analysis, Kahneman and Killingsworth found that for most people wellbeing keeps rising with income, roughly by the same amount each time income doubles. Only the least happy fifth plateau.",
    principle: "When a famous finding meets newer, finer data, check which one its own authors now stand behind.",
    source: { label: "Killingsworth, Kahneman & Mellers (2023), PNAS", url: "https://doi.org/10.1073/pnas.2208661120" },
  },
  {
    id: "s10", domain: "people",
    prompt: "At work, asking a colleague for advice tends to make them see you as…",
    options: ["More competent", "Less competent"],
    why: "In experiments, people who asked for advice were rated more competent, especially on hard tasks and when they asked the person judging them. Being asked flatters.",
    principle: "People worry that asking looks weak; to the person asked, it looks like good judgement.",
    source: { label: "Brooks, Gino & Schweitzer (2015), Management Science", url: "https://doi.org/10.1287/mnsc.2014.2054" },
  },
];
