import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Rejsy terms of service — Messages transit planning, waitlist, free tier, Plus billing, and operator ticket handoff.",
};

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[var(--ink)] sm:text-[19px]">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-[15px] leading-[1.7] text-[var(--slate)]">
        {children}
      </div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <PageShell>
      <p className="font-data text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
        Legal
      </p>
      <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.035em] sm:text-[34px] md:text-[42px]">
        Terms of Service
      </h1>
      <p className="mt-3 text-[15px] text-[var(--muted)]">
        Last updated: 3 August 2026
      </p>
      <p className="mt-6 text-[15px] leading-[1.7] text-[var(--slate)]">
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and
        use of Rejsy — including our website (rejsy.app and related domains),
        waitlist, documentation, map experiences, and the Rejsy agent in Apple
        Messages via Linq (together, the &ldquo;Service&rdquo;). By using the
        Service, joining the waitlist, creating an account, or messaging Rejsy,
        you agree to these Terms. If you do not agree, do not use the Service.
      </p>

      <nav className="mt-8 rounded-[12px] border border-[var(--line)] bg-white/50 p-4 sm:p-5">
        <p className="font-data text-[10px] uppercase tracking-[0.06em] text-[var(--muted)]">
          On this page
        </p>
        <ul className="mt-3 grid gap-1.5 text-[14px] text-[var(--slate)] sm:grid-cols-2">
          {[
            ["service", "The Service"],
            ["eligibility", "Eligibility"],
            ["waitlist", "Waitlist & accounts"],
            ["plans", "Free tier & Plus"],
            ["operators", "Operators & tickets"],
            ["accuracy", "Schedules & accuracy"],
            ["acceptable", "Acceptable use"],
            ["ip", "Intellectual property"],
            ["disclaimers", "Disclaimers"],
            ["liability", "Limitation of liability"],
            ["termination", "Termination"],
            ["law", "Governing law"],
            ["contact", "Contact"],
          ].map(([id, label]) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="underline decoration-[var(--line)] underline-offset-2 hover:text-[var(--ink)] hover:decoration-[var(--ink)]/30"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-10 space-y-10">
        <Section id="service" title="1. The Service">
          <p>
            Rejsy is a conversational transport assistant for public travel in
            Denmark. Through Messages you can request trips in plain language,
            receive route options, lock a choice, open a map link, receive
            leave-now reminders (including platform information when available),
            and follow links to purchase tickets with transport operators.
          </p>
          <p>
            Rejsy is software and messaging automation. We are{" "}
            <strong className="font-medium text-[var(--ink)]">
              not a carrier, ticket retailer, or travel agency
            </strong>
            . Tickets, fares, and carriage are provided solely by operators such
            as DSB, metro, S-tog, Movia, DOT, Øresundståg, and others.
          </p>
          <p>
            Features may change as we iterate. Some capabilities (including
            deeper operator account integrations) may be labeled as coming soon
            and are not guaranteed until generally available.
          </p>
        </Section>

        <Section id="eligibility" title="2. Eligibility">
          <p>
            You must be able to form a binding contract under applicable law. If
            you are under the age of majority where you live, you may use Rejsy
            only with involvement of a parent or guardian as required. The
            Service is designed primarily for iPhone Messages / Linq; other
            clients may not be supported.
          </p>
        </Section>

        <Section id="waitlist" title="3. Waitlist and accounts">
          <p>
            Joining the waitlist (name, age, email) requests early access or
            updates; it does not guarantee a launch date, invite, or particular
            feature set. If you create an account, you are responsible for
            accurate information and for keeping login credentials confidential.
            You must promptly update details that are wrong or outdated.
          </p>
        </Section>

        <Section id="plans" title="4. Free tier and Rejsy Plus">
          <p>
            Unless we state otherwise, new users receive a limited free
            allowance of trip plans (currently three). After the free allowance,
            continued planning may require Rejsy Plus. Plus is billed monthly
            through Stripe (currently advertised as 29 kr/mo on our pricing
            page). Prices and limits may change; we will communicate material
            changes through the Service or website.
          </p>
          <p>
            Payments are processed by Stripe. You authorize Stripe to charge
            your payment method for the subscription. You may cancel through the
            Stripe customer portal after purchase; access continues through the
            then-current paid period unless otherwise stated. Taxes may apply.
            Chargebacks or payment disputes may result in suspension.
          </p>
        </Section>

        <Section id="operators" title="5. Operators, maps, and tickets">
          <p>
            When Rejsy sends a map link or a &ldquo;Buy on DSB&rdquo; (or other
            operator) link, you leave our conversational flow and deal with that
            third party. Their terms, privacy practices, availability, and
            refund rules apply to the purchase and journey. Rejsy does not
            guarantee that a Buy link will complete, that inventory remains
            available, or that operator apps will function without interruption.
          </p>
        </Section>

        <Section id="accuracy" title="6. Schedules, prices, and reminders">
          <p>
            Planning results depend on third-party data sources (including
            Rejseplanen and related feeds). Times, prices, platforms, delays,
            cancellations, and transfer walking times can be wrong, incomplete,
            or out of date. Leave-now reminders are best-effort estimates (for
            example about 25 minutes before departure) and may fail to send or
            arrive late due to network, device, or messaging provider issues.
          </p>
          <p>
            Always verify critical details in official operator channels before
            you travel. Rejsy is an assistant, not a substitute for published
            timetables or station information.
          </p>
        </Section>

        <Section id="acceptable" title="7. Acceptable use">
          <p>You agree not to:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Abuse, scrape, overload, or reverse engineer the Service or agent.
            </li>
            <li>
              Circumvent free-tier limits, create fake accounts, or automate
              quota farming.
            </li>
            <li>
              Send unlawful, harassing, or harmful content through the agent.
            </li>
            <li>
              Use Rejsy to violate operator rules, ticketing conditions, or
              applicable law.
            </li>
            <li>
              Interfere with other users&apos; access or our infrastructure.
            </li>
          </ul>
          <p>
            We may suspend or terminate access if we reasonably believe you
            breached these Terms or pose a security or abuse risk.
          </p>
        </Section>

        <Section id="ip" title="8. Intellectual property">
          <p>
            Rejsy, including branding, website design, copy, software, and
            documentation, is owned by us or our licensors. You receive a
            limited, non-exclusive, non-transferable right to use the Service for
            personal, non-commercial trip planning unless we agree otherwise in
            writing. Operator names, logos, and trademarks belong to their
            respective owners and are used only for identification.
          </p>
        </Section>

        <Section id="disclaimers" title="9. Disclaimers">
          <p>
            THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS
            AVAILABLE.&rdquo; TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE
            DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY,
            FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. We do not
            warrant uninterrupted or error-free operation, perfect schedule
            accuracy, or that reminders will always arrive in time for your trip.
          </p>
        </Section>

        <Section id="liability" title="10. Limitation of liability">
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, REJSY AND ITS CONTRIBUTORS
            WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
            OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, LOST DATA, MISSED
            CONNECTIONS, FARES, OR TRAVEL COSTS, ARISING FROM YOUR USE OF THE
            SERVICE OR RELIANCE ON PLANNING OUTPUT — EVEN IF ADVISED OF THE
            POSSIBILITY.
          </p>
          <p>
            Our aggregate liability for claims relating to the Service will not
            exceed the greater of (a) the amounts you paid us for Plus in the
            three months before the claim or (b) 500 DKK. Some jurisdictions do
            not allow certain limitations; in those cases our liability is
            limited to the fullest extent permitted.
          </p>
        </Section>

        <Section id="termination" title="11. Termination">
          <p>
            You may stop using Rejsy at any time and may request account or
            waitlist deletion as described in our Privacy Policy. We may modify,
            suspend, or discontinue the Service (or any part of it) with or
            without notice. Provisions that by nature should survive (including
            disclaimers, limitations of liability, and IP ownership) will
            survive termination.
          </p>
        </Section>

        <Section id="law" title="12. Governing law">
          <p>
            These Terms are governed by the laws of Denmark, without regard to
            conflict-of-law rules. Courts in Copenhagen shall have exclusive
            jurisdiction, except where mandatory consumer protections in your
            country of residence require otherwise.
          </p>
        </Section>

        <Section id="contact" title="13. Changes and contact">
          <p>
            We may update these Terms periodically. The &ldquo;Last
            updated&rdquo; date will change when we do. Material changes may also
            be highlighted on the website or via email/Messages when appropriate.
            Continued use after changes take effect constitutes acceptance.
          </p>
          <p>
            Questions about these Terms:{" "}
            <a
              href="mailto:legal@rejsy.app"
              className="font-medium text-[var(--ink)] underline underline-offset-2"
            >
              legal@rejsy.app
            </a>
            . Privacy matters:{" "}
            <a
              href="mailto:privacy@rejsy.app"
              className="font-medium text-[var(--ink)] underline underline-offset-2"
            >
              privacy@rejsy.app
            </a>
            . See also our{" "}
            <a
              href="/privacy"
              className="font-medium text-[var(--ink)] underline underline-offset-2"
            >
              Privacy Policy
            </a>
            .
          </p>
        </Section>
      </div>
    </PageShell>
  );
}
