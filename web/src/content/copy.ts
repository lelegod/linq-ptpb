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
  navLogin: "Login",
  navStart: "Start",
  navPricing: "Pricing",
  navGetStarted: "Text Rejsy",
  productLabel: "Product",
  productHeading: "How it works",
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
} as const;

export const productMenu = [
  {
    href: "#product",
    title: "How it works",
    description: "Plan, pick a route, map & Buy on DSB, leave-now",
  },
  {
    href: "#integrations",
    title: "Integrations",
    description: "DSB account and more — coming soon",
  },
  {
    href: "#pricing",
    title: "Pricing",
    description: "3 free trips, then Rejsy Plus",
  },
  {
    href: "#coverage",
    title: "Coverage",
    description: "DSB, S-tog, metro, Movia, DOT, Øresund",
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
