// The item bank. Every item is a two-choice scenario with one answer backed
// by a published source. options[0] is always the correct one; the app
// shuffles the order on screen. Two choices (not four) so that "Guessing 50%"
// really is a coin flip, which keeps the calibration chart honest.
//
// `illustrative: true` marks items whose numbers are made up to teach a
// method (the source supports the method, not the specific figures).

export const DOMAINS = {
  health:   { name: "Health & medicine",   short: "Health",   family: "people"  },
  people:   { name: "People & emotions",   short: "People",   family: "people"  },
  politics: { name: "Politics & society",  short: "Politics", family: "systems" },
  work:     { name: "Economics & work",    short: "Work",     family: "systems" },
};

export const ITEMS = [
  // ── Health & medicine ──────────────────────────────────────────────
  {
    id: "h1", domain: "health",
    prompt: "A screening test finds 90% of breast cancers and wrongly flags 9% of healthy women. 1% of women screened have cancer. A woman tests positive. How likely is it she has cancer?",
    options: ["About 1 in 10", "About 9 in 10"],
    why: "Picture 1,000 women: 10 have cancer and 9 of them test positive. Of the 990 healthy women, about 89 also test positive. So only 9 of 98 positives are real — about 9%.",
    principle: "When something is rare, false alarms from the many outnumber true hits from the few. Start from the base rate.",
    source: { label: "Gigerenzer et al. (2007), Psychological Science in the Public Interest", url: "https://doi.org/10.1111/j.1539-6053.2008.00033.x" },
  },
  {
    id: "h2", domain: "health",
    prompt: "Worldwide in 2023, which killed more people?",
    options: ["Ischaemic heart disease alone", "HIV/AIDS, tuberculosis and malaria combined"],
    why: "WHO estimates about 9.5 million deaths from ischaemic heart disease in 2023 — 16% of all deaths. HIV, tuberculosis and malaria together killed well under 3 million (UNAIDS and WHO’s TB and malaria reports).",
    principle: "Slow, common, unremarkable causes usually outweigh the ones that make headlines.",
    source: { label: "WHO, The top 10 causes of death (2024)", url: "https://www.who.int/news-room/fact-sheets/detail/the-top-10-causes-of-death" },
  },
  {
    id: "h3", domain: "health", illustrative: true,
    prompt: "A headline says a pill “cuts heart-attack risk by 50%”. In the trial, heart attacks fell from 2 in 100 people to 1 in 100. How many people must take it for one of them to avoid a heart attack?",
    options: ["About 100", "About 2"],
    why: "The absolute drop is 1 in 100, so 100 people take the pill for one to benefit. “50%” is the relative drop (2 → 1), which sounds far bigger.",
    principle: "Ask “50% of what?” Convert relative risk to absolute numbers out of 100 before judging.",
    source: { label: "Gigerenzer et al. (2007) on relative vs absolute risk", url: "https://doi.org/10.1111/j.1539-6053.2008.00033.x" },
  },
  {
    id: "h4", domain: "health",
    prompt: "In the US, life expectancy at birth rose by about 20 years between 1900 and 1950. Mostly because…",
    options: ["Far fewer children and young adults died of infections", "Old people lived much longer"],
    why: "Clean water, sanitation, vaccines and later antibiotics cut deaths from infections, which hit the young hardest. Saving a child adds decades to the average; saving an 80-year-old adds a few years.",
    principle: "An average can move because its low end changed, not its top. Ask which part of the distribution moved.",
    source: { label: "CDC MMWR (1999), Control of Infectious Diseases, 1900–1999", url: "https://www.cdc.gov/mmwr/preview/mmwrhtml/mm4829a1.htm" },
  },
  {
    id: "h5", domain: "health",
    prompt: "For an otherwise healthy adult with a common cold, antibiotics…",
    options: ["Don’t make it end sooner", "Shorten it by a day or two"],
    why: "Colds are caused by viruses; antibiotics act on bacteria. A Cochrane review of randomised trials found no benefit, and more side effects.",
    principle: "Before judging a treatment, ask whether its mechanism can reach the cause.",
    source: { label: "Kenealy & Arroll (2013), Cochrane Review", url: "https://doi.org/10.1002/14651858.CD000247.pub3" },
  },
  {
    id: "h6", domain: "health",
    prompt: "A politician noted 5-year prostate-cancer survival was 82% in the US but 44% in England. Does that show men were less likely to die of prostate cancer in the US?",
    options: ["No — survival rates can differ even if death rates don’t", "Yes — that’s what survival measures"],
    why: "Screening finds cancers earlier (the 5-year clock starts sooner) and finds slow cancers that would never kill. Both raise survival without saving anyone. Prostate-cancer death rates in the two countries were similar.",
    principle: "Compare mortality (deaths per population), not survival (time since diagnosis), when screening differs.",
    source: { label: "Gigerenzer et al. (2007) on the Giuliani statistic", url: "https://doi.org/10.1111/j.1539-6053.2008.00033.x" },
  },

  // ── Politics & society ─────────────────────────────────────────────
  {
    id: "p1", domain: "politics",
    prompt: "Between 1993 and 2022, the US violent-crime rate (FBI data)…",
    options: ["Fell by about half", "Rose"],
    why: "FBI rates fell about 49%, from about 747 to about 381 violent crimes per 100,000 people. Yet in 23 of 27 Gallup polls since 1993, at least 60% of Americans said crime was rising.",
    principle: "News reports events, not rates. Check the trend line before trusting the feeling.",
    source: { label: "Pew Research Center (2024), What the data says about crime in the U.S.", url: "https://www.pewresearch.org/short-reads/2024/04/24/what-the-data-says-about-crime-in-the-us/" },
  },
  {
    id: "p2", domain: "politics",
    prompt: "Since 1990, the share of the world’s people living in extreme poverty has…",
    options: ["More than halved", "Stayed about the same"],
    why: "By the World Bank’s current $3-a-day line it fell from about 44% in 1990 to about 10% today, even as the population grew.",
    principle: "Slow, steady improvements rarely make news, so they are the ones we most underrate.",
    source: { label: "Our World in Data, Poverty (World Bank data)", url: "https://ourworldindata.org/poverty" },
  },
  {
    id: "p3", domain: "politics",
    prompt: "Across six rich countries, people were asked what share of their population are immigrants. Their average guesses were…",
    options: ["Far too high — often double the real share or more", "About right"],
    why: "In the US the average guess was about 36% against a real figure near 10%; every country surveyed overestimated.",
    principle: "What is visible and talked about feels common. Look up the denominator.",
    source: { label: "Alesina, Miano & Stantcheva (2023), Review of Economic Studies", url: "https://doi.org/10.1093/restud/rdac011" },
  },
  {
    id: "p4", domain: "politics",
    prompt: "Americans were asked what share of the other party holds extreme views. Compared with what the other side actually reported, their estimates were…",
    options: ["About double the real share", "Close to the real share"],
    why: "On average people guessed about 55% of the other side held extreme views; the true figure was about 30%. The gap was largest among the most politically engaged.",
    principle: "We meet the other side through its loudest voices. The typical member is quieter than the visible one.",
    source: { label: "More in Common (2019), The Perception Gap", url: "https://perceptiongap.us" },
  },
  {
    id: "p5", domain: "politics",
    prompt: "In 2025, what share of the world’s one-year-olds had received three doses of the diphtheria–tetanus–pertussis vaccine?",
    options: ["About 85%", "About 40%"],
    why: "WHO and UNICEF estimate global DTP3 coverage at 85% in 2025 — about 110 million infants. Most people guess far lower.",
    principle: "Our picture of “the developing world” is often decades out of date.",
    source: { label: "WHO, Immunization coverage fact sheet", url: "https://www.who.int/news-room/fact-sheets/detail/immunization-coverage" },
  },
  {
    id: "p6", domain: "politics",
    prompt: "Roughly what share of the US federal budget goes to foreign aid?",
    options: ["About 1%", "About 15%"],
    why: "Foreign aid is around 1% of federal spending. In a KFF poll, the average American guessed about a quarter.",
    principle: "Before arguing about a cost, find its size relative to the whole.",
    source: { label: "KFF (2015), Americans’ views on the U.S. role in global health", url: "https://www.kff.org/global-health-policy/poll-finding/data-note-americans-views-on-the-u-s-role-in-global-health/" },
  },

  // ── Economics & work ───────────────────────────────────────────────
  {
    id: "w1", domain: "work",
    prompt: "In a negotiation, making the first offer usually…",
    options: ["Helps you — it anchors the final price", "Hurts you — it gives away information"],
    why: "In experiments, final prices sat close to whichever side opened first. The exception: if you know far less about the value than the other side, let them open.",
    principle: "The first number on the table pulls every later number toward it (anchoring).",
    source: { label: "Galinsky & Mussweiler (2001), Journal of Personality and Social Psychology", url: "https://doi.org/10.1037/0022-3514.81.4.657" },
  },
  {
    id: "w2", domain: "work",
    prompt: "When San Francisco extended rent control to more buildings in 1994, the rental housing those landlords offered…",
    options: ["Fell by about 15%", "Stayed about the same"],
    why: "Landlords converted units to condos or rebuilt them to escape control. Tenants already there benefited, but citywide rents rose as supply shrank.",
    principle: "A rule changes what people choose to do. Ask how the people it constrains will respond.",
    source: { label: "Diamond, McQuade & Qian (2019), American Economic Review", url: "https://doi.org/10.1257/aer.20181289" },
  },
  {
    id: "w3", domain: "work",
    prompt: "Students predicted when they would finish their thesis. How many finished by their own best-guess date?",
    options: ["About 30%", "About 70%"],
    why: "Only about 30% made their best guess; on average they took about 56 days against a predicted 34. They even overran their “worst case”.",
    principle: "Planning from the inside imagines the smooth path. Look at how long similar past projects really took (the outside view).",
    source: { label: "Buehler, Griffin & Ross (1994), Journal of Personality and Social Psychology", url: "https://doi.org/10.1037/0022-3514.67.3.366" },
  },
  {
    id: "w4", domain: "work",
    prompt: "When Safelite Glass switched windshield installers from hourly pay to pay per windshield, output per worker…",
    options: ["Rose by about 44%", "Barely changed"],
    why: "About half the gain came from the same people working harder; the other half from who chose to stay and join.",
    principle: "Incentives change both effort and who shows up (selection).",
    source: { label: "Lazear (2000), American Economic Review", url: "https://doi.org/10.1257/aer.90.5.1346" },
  },
  {
    id: "w5", domain: "work",
    prompt: "Day-care centres in Haifa began fining parents who picked up their children late. Late pickups…",
    options: ["Roughly doubled", "Fell sharply"],
    why: "The fine turned a social obligation into a price. Parents no longer felt guilty; they were paying for extra time. Removing the fine didn’t undo it.",
    principle: "Putting a price on something can replace a stronger motive (guilt, duty) with a weaker one.",
    source: { label: "Gneezy & Rustichini (2000), Journal of Legal Studies", url: "https://doi.org/10.1086/468061" },
  },
  {
    id: "w6", domain: "work",
    prompt: "Which predicts job performance better?",
    options: ["A structured interview: same questions, scored the same way", "A free-flowing conversation"],
    why: "In the largest recent re-analysis, structured interviews were the strongest single predictor; unstructured ones were about half as predictive.",
    principle: "Judgement gets better when you fix the questions and the scoring before you meet the person.",
    source: { label: "Sackett et al. (2022), Journal of Applied Psychology", url: "https://doi.org/10.1037/apl0000994" },
  },

  // ── People & emotions ──────────────────────────────────────────────
  {
    id: "s1", domain: "people",
    prompt: "Junior professors predicted being denied tenure would leave them much less happy for years. A few years later, those actually denied were…",
    options: ["About as happy as those who got it", "Much less happy"],
    why: "People overestimate how long bad events will hurt (the impact bias) because they forget how quickly they make sense of setbacks and adapt.",
    principle: "When predicting how you’ll feel, remember that you’ll also cope.",
    source: { label: "Gilbert et al. (1998), Journal of Personality and Social Psychology", url: "https://doi.org/10.1037/0022-3514.75.3.617" },
  },
  {
    id: "s2", domain: "people",
    prompt: "Students walked into a room wearing an embarrassing T-shirt. They guessed about half the room noticed. The real share was…",
    options: ["About a quarter", "About half or more"],
    why: "Wearers guessed 46%; about 23% noticed. We are the centre of our own attention, not other people’s (the spotlight effect).",
    principle: "Others are mostly thinking about themselves. Halve your estimate of how much they notice.",
    source: { label: "Gilovich, Medvec & Savitsky (2000), Journal of Personality and Social Psychology", url: "https://doi.org/10.1037/0022-3514.78.2.211" },
  },
  {
    id: "s3", domain: "people",
    prompt: "After a first conversation with a stranger, people typically…",
    options: ["Underestimate how much the other person liked them", "Overestimate it"],
    why: "Partners liked them more than they thought (the liking gap), across lab chats and real first-year roommates. We dwell on our own awkward moments.",
    principle: "Your inner critic is not the other person. Assume you came across a bit better than it felt.",
    source: { label: "Boothby et al. (2018), Psychological Science", url: "https://doi.org/10.1177/0956797618783714" },
  },
  {
    id: "s4", domain: "people",
    prompt: "When people judge whether someone is lying from how they speak and behave, they are right about…",
    options: ["54% of the time — barely better than a coin", "75% of the time"],
    why: "A review of 206 studies found 54% accuracy on average, and experts were barely better. Liars and truth-tellers look much alike.",
    principle: "Demeanour is weak evidence. Check facts and consistency, not eye contact.",
    source: { label: "Bond & DePaulo (2006), Personality and Social Psychology Review", url: "https://doi.org/10.1207/s15327957pspr1003_2" },
  },
  {
    id: "s5", domain: "people",
    prompt: "Train commuters were asked to talk to a stranger, or to sit alone as usual. Those who talked rated their ride as…",
    options: ["More pleasant", "Less pleasant, as they had predicted"],
    why: "Commuters expected chatting to be worse, and expected strangers not to want to talk. Both predictions were wrong.",
    principle: "We underrate how much others want connection, so we reach out less than would make us happy.",
    source: { label: "Epley & Schroeder (2014), Journal of Experimental Psychology: General", url: "https://doi.org/10.1037/a0037323" },
  },
  {
    id: "s6", domain: "people",
    prompt: "After being insulted, people hit a punching bag while thinking about the person who did it. Afterwards, compared with people who sat quietly, they were…",
    options: ["More aggressive", "Less aggressive — they’d let it out"],
    why: "Venting kept the anger rehearsed. Doing nothing for a few minutes reduced aggression more.",
    principle: "Rehearsing an emotion feeds it. Let arousal fall first, then deal with the cause.",
    source: { label: "Bushman (2002), Personality and Social Psychology Bulletin", url: "https://doi.org/10.1177/0146167202289002" },
  },
];
