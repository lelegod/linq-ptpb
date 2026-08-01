export const copy = {
  name: "Rejsy",
  /** H1 segments — brand rendered italic in Hero */
  meet: "Meet",
  brand: "Rejsy",
  meetRest: ", your favorite transport planner",
  subhead:
    "Add Rejsy like a contact. Text where you're going — it plans, hands you the ticket, and tells you when to walk out the door.",
  proactiveLine: "It texts you 25 min before — platform included. You didn't ask.",
  announcement: "Denmark's transit, in Messages",
  cta: "Text your Rejsy",
  ctaShort: "Text Rejsy",
  ctaLong: "Text Rejsy in Messages",
  ctaExplore: "How it works",
  ctaNote: "3 free trips · no card · opens Messages",
  qrHint: "scan to open Messages",
  agentDisplay: "+16695776525",
  navProduct: "Product",
  navResources: "Resources",
  navLogin: "Login",
  navStart: "Get Started",
  navPricing: "Pricing",
  navGetStarted: "Get Started",
  productLabel: "Product",
  productHeading: "One agent that handles the trip for you",
  productSub:
    "Four texts. One trip. Integrations for DSB and more are coming.",
  integrationsHeading: "Integrations coming",
  integrationsBody:
    "Connect your DSB account and more — planning stays in Messages; tickets stay with the operators.",
  problemLabel: "(0) The problem",
  problemHeading: "Four apps. One trip.",
  problemBody:
    "Denmark's transit stack is split across planners and ticket apps. Rejsy collapses that into one iMessage thread.",
  problemApps: ["Rejseplanen", "DSB", "DOT", "Movia"] as const,
  problemResult: "aarhus tomorrow around 9",
  problemCaption: "Fig. 0  Fragmentation → one blue bubble.",
  bentoLabel: "(1) Everything it does",
  bentoHeading: "Four apps, one thread.",
  bentoCaption: "Fig. 1  Five capabilities, one conversation.",
  pricingEyebrow:
    "Cheaper than one København→Aarhus ticket, for every trip you ever take.",
  plusCta: "Unlock after 3 trips",
  plusNote: "Paywall hits on the 4th plan — open the link Rejsy texts you",
  coverageLabel: "🇩🇰 works across denmark",
  coverageOps: "dsb · s-tog · metro · movia · dot · øresundståg",
  footerLeft: "cursor · linq · vibe coding network",
  footerRight: "copenhagen · aug 2026",
  annotation: "Sent without being asked",
  replay: "↻ replay",
  reminderLeadMin: 25,
  loginTitle: "Log in to Rejsy",
  loginSub: "Save trips and connect integrations when they ship.",
  onboardingWelcome: "Welcome to Rejsy",
  onboardingNamePrompt: "What's your name?",
  onboardingAgePrompt: "How old are you?",
  onboardingAgeSub: "A quick detail so we can set up your account.",
  onboardingContinue: "Continue",
  onboardingLater: "Set up later",
  onboardingTerms:
    "By continuing, you agree to our Terms of Service and Privacy Policy.",
  onboardingEmailTitle: "How should we reach you?",
  onboardingEmailSub:
    "Get a magic link — we'll save your name and age to your account.",
} as const;

export const productMenu = [
  {
    href: "/product",
    title: "How it works",
    description: "Plan, pick a route, map & Buy on DSB, leave-now",
  },
  {
    href: "/product#integrations",
    title: "Integrations",
    description: "DSB account and more — coming soon",
  },
  {
    href: "/product#coverage",
    title: "Coverage",
    description: "DSB, S-tog, metro, Movia, DOT, Øresund",
  },
] as const;

export const resourcesMenu = [
  {
    href: "/docs",
    title: "Docs",
    description: "Guides and references",
    icon: "docs" as const,
  },
  {
    href: "/faq",
    title: "FAQs",
    description: "Frequently Asked Questions",
    icon: "faq" as const,
  },
] as const;

export const howItWorks = [
  {
    step: "01",
    title: "Plan by text",
    you: "aarhus tomorrow around 9",
    rejsy: "københavn h → aarhus h — 3 options",
  },
  {
    step: "02",
    title: "Pick a route",
    you: "3",
    rejsy: "locked in — 10:03 · 89 kr · dsb",
  },
  {
    step: "03",
    title: "Map & Buy on DSB",
    you: null,
    rejsy: "🗺️ see route · Buy on DSB →",
  },
  {
    step: "04",
    title: "Leave-now ping",
    you: null,
    rejsy: "🕘 leave in 25 min — platform 3, københavn h",
  },
] as const;

export const docsGuide = [
  {
    title: "Text Rejsy",
    body: "Open Messages on your iPhone and text Rejsy (or scan the QR on the homepage). Say where you're going in plain language — “aarhus tomorrow around 9” is enough.",
  },
  {
    title: "Pick a route",
    body: "Rejsy replies with a short list of options: times, operator, and price. Reply with the number you want, or react 🔽 if you want later departures.",
  },
  {
    title: "Open the map card",
    body: "After you lock a trip, Rejsy sends a map link so you can see the route. Use Buy on DSB (or the operator link) to purchase in the official app — Rejsy doesn't sell tickets.",
  },
  {
    title: "Leave-now reminder",
    body: "About 25 minutes before departure, Rejsy texts you unprompted with when to leave, which station, and the platform when available.",
  },
  {
    title: "Free tier → Plus",
    body: "You get 3 free trip plans. On the 4th, Rejsy texts a Stripe checkout link for Rejsy Plus at 29 kr/mo — unlimited planning, same Messages flow.",
  },
] as const;

export const faqs = [
  {
    q: "Does Rejsy work across Denmark?",
    a: "Yes. Rejsy plans trips across Denmark's rail and local transit stack — DSB, S-tog, metro, Movia, DOT, Øresundståg, and more as coverage expands.",
  },
  {
    q: "Do I need an iPhone and Linq?",
    a: "Rejsy is built for the iMessage / Linq agent experience. Text the Rejsy number from Messages on iPhone (or scan the QR). Android SMS support may come later.",
  },
  {
    q: "What's included in the free tier?",
    a: "3 trip plans with booking hand-off and leave-now reminders. No card required to start. After three plans, you'll be offered Rejsy Plus.",
  },
  {
    q: "When do leave-now reminders arrive?",
    a: "About 25 minutes before departure — with station and platform when we have them. You don't have to ask; Rejsy pings you proactively.",
  },
  {
    q: "How does Rejsy Plus billing work?",
    a: "Plus is 29 kr/mo via Stripe. When you hit the free limit, Rejsy texts a secure checkout link. Cancel anytime from the Stripe customer portal after upgrade.",
  },
  {
    q: "What about privacy?",
    a: "We only use what you send in Messages and what you save at signup (like your name and email) to run the product. We don't sell your trip data. Operator tickets stay with DSB and others — Rejsy plans and reminds.",
  },
  {
    q: "What is the DSB handoff?",
    a: "Rejsy finds the trip; buying happens in the official DSB (or operator) flow via a Buy link. Integrations to connect your DSB account directly are coming — planning stays in Messages either way.",
  },
] as const;
