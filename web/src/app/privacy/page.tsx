import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Rejsy collects, uses, and protects personal data for Messages planning, waitlist signup, accounts, and billing.",
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

export default function PrivacyPage() {
  return (
    <PageShell>
      <p className="font-data text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
        Legal
      </p>
      <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.035em] sm:text-[34px] md:text-[42px]">
        Privacy Policy
      </h1>
      <p className="mt-3 text-[15px] text-[var(--muted)]">
        Last updated: 3 August 2026
      </p>
      <p className="mt-6 text-[15px] leading-[1.7] text-[var(--slate)]">
        This Privacy Policy explains how Rejsy (&ldquo;Rejsy,&rdquo;
        &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects, uses,
        shares, and protects personal data when you use our website, join our
        waitlist, create an account, or message the Rejsy agent in Apple
        Messages. Rejsy helps plan public transport in Denmark through
        conversation — we are not a ticket seller or transport operator.
      </p>

      <nav className="mt-8 rounded-[12px] border border-[var(--line)] bg-white/50 p-4 sm:p-5">
        <p className="font-data text-[10px] uppercase tracking-[0.06em] text-[var(--muted)]">
          On this page
        </p>
        <ul className="mt-3 grid gap-1.5 text-[14px] text-[var(--slate)] sm:grid-cols-2">
          {[
            ["who", "Who we are"],
            ["collect", "Data we collect"],
            ["use", "How we use data"],
            ["share", "Sharing"],
            ["tickets", "Tickets & operators"],
            ["retention", "Retention"],
            ["rights", "Your rights"],
            ["security", "Security"],
            ["children", "Children"],
            ["cookies", "Cookies"],
            ["transfers", "International transfers"],
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
        <Section id="who" title="1. Who we are">
          <p>
            Rejsy is a software product that plans Danish public transport trips
            through an iMessage / Linq agent and related web experiences (including
            our marketing site, waitlist, documentation, map views, and billing
            links). For privacy inquiries, contact us at{" "}
            <a
              href="mailto:privacy@rejsy.app"
              className="font-medium text-[var(--ink)] underline underline-offset-2"
            >
              privacy@rejsy.app
            </a>
            .
          </p>
          <p>
            If you are in the European Economic Area (EEA), United Kingdom, or
            Switzerland, we process personal data in line with applicable data
            protection law, including the EU GDPR where it applies.
          </p>
        </Section>

        <Section id="collect" title="2. Data we collect">
          <p>Depending on how you use Rejsy, we may process:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="font-medium text-[var(--ink)]">
                Messages content.
              </strong>{" "}
              Text and reactions you send to the Rejsy agent (for example trip
              requests, replies like &ldquo;1&rdquo; or &ldquo;3,&rdquo; and
              follow-ups), plus agent replies needed to plan, confirm, remind, and
              send map or purchase links.
            </li>
            <li>
              <strong className="font-medium text-[var(--ink)]">
                Messaging identifiers.
              </strong>{" "}
              Phone number or messaging identifiers provided through Linq /
              Messages so we can send and receive agent messages.
            </li>
            <li>
              <strong className="font-medium text-[var(--ink)]">
                Waitlist and account details.
              </strong>{" "}
              Name, age, and email when you join the waitlist or sign up; profile
              metadata stored with our auth provider when you create an account.
            </li>
            <li>
              <strong className="font-medium text-[var(--ink)]">
                Trip and planning data.
              </strong>{" "}
              Origins, destinations, times, selected options, session or map
              links, and related planning metadata needed to run the service.
            </li>
            <li>
              <strong className="font-medium text-[var(--ink)]">
                Billing data.
              </strong>{" "}
              If you subscribe to Rejsy Plus, Stripe processes payment details.
              We receive subscription status, customer identifiers, and limited
              billing metadata — not your full card number.
            </li>
            <li>
              <strong className="font-medium text-[var(--ink)]">
                Technical data.
              </strong>{" "}
              IP address, device/browser type, approximate location derived from
              IP, pages visited, and diagnostic logs when you use the website or
              related APIs (hosted on providers such as Vercel).
            </li>
          </ul>
          <p>
            We do not intentionally collect special-category data. Please do not
            send sensitive information (health, government IDs, passwords for
            other services) in Messages.
          </p>
        </Section>

        <Section id="use" title="3. How we use data">
          <p>We use personal data to:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Provide trip planning, option lists, confirmations, map links, and
              leave-now / platform reminders via Messages.
            </li>
            <li>
              Operate the waitlist, notify you about launch or product updates
              you opted into, and manage accounts.
            </li>
            <li>
              Enforce free-tier limits (for example a limited number of trip
              plans) and process Plus subscriptions.
            </li>
            <li>
              Maintain security, prevent abuse or quota fraud, debug outages, and
              improve reliability.
            </li>
            <li>
              Comply with law and respond to lawful requests.
            </li>
          </ul>
          <p>
            Where GDPR applies, our bases include performance of a contract (or
            steps prior to contract, such as waitlist signup), legitimate
            interests in running and securing a messaging transit assistant, and
            consent where required (for example certain marketing emails).
          </p>
        </Section>

        <Section id="share" title="4. Sharing">
          <p>
            We do not sell your personal data. We share data only with processors
            and partners needed to run Rejsy, including:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="font-medium text-[var(--ink)]">Linq</strong> —
              messaging delivery for the iMessage agent experience.
            </li>
            <li>
              <strong className="font-medium text-[var(--ink)]">Supabase</strong> —
              authentication, database, and related backend services when
              configured.
            </li>
            <li>
              <strong className="font-medium text-[var(--ink)]">Stripe</strong> —
              payment processing for Rejsy Plus.
            </li>
            <li>
              <strong className="font-medium text-[var(--ink)]">
                Hosting &amp; infrastructure
              </strong>{" "}
              (for example Vercel / cloud hosts) — website, APIs, and logs.
            </li>
            <li>
              <strong className="font-medium text-[var(--ink)]">
                Transit data sources
              </strong>{" "}
              (for example Rejseplanen and similar) — queries needed to return
              schedules, prices, and related planning results. These providers
              receive the trip parameters required for a lookup, not your full
              account profile.
            </li>
          </ul>
          <p>
            Each provider processes data under their own terms and privacy
            notices. We may also disclose information if required by law or to
            protect rights, safety, and the integrity of the service.
          </p>
        </Section>

        <Section id="tickets" title="5. Tickets and transport operators">
          <p>
            Rejsy plans trips and may send links to buy tickets or view routes
            with operators such as DSB, DOT, Movia, or others. When you follow a
            Buy or operator link, that purchase and any payment are between you
            and the operator. Operator apps and websites have their own privacy
            policies. Rejsy does not process card payments for tickets and does
            not act as a carrier.
          </p>
        </Section>

        <Section id="retention" title="6. Retention">
          <p>
            We keep personal data only as long as needed for the purposes above:
            waitlist entries until launch outreach completes or you ask us to
            delete them; account and messaging/trip records while your account is
            active and for a reasonable period afterward for support, abuse
            prevention, and legal obligations; billing records as required by tax
            and accounting rules; and technical logs for shorter operational
            windows unless needed for security investigations.
          </p>
        </Section>

        <Section id="rights" title="7. Your rights">
          <p>
            Depending on where you live, you may have rights to access, correct,
            delete, or export your personal data; object to or restrict certain
            processing; and withdraw consent where processing is consent-based.
            To exercise these rights, email{" "}
            <a
              href="mailto:privacy@rejsy.app"
              className="font-medium text-[var(--ink)] underline underline-offset-2"
            >
              privacy@rejsy.app
            </a>
            . You may also lodge a complaint with your local supervisory
            authority (in Denmark, Datatilsynet).
          </p>
        </Section>

        <Section id="security" title="8. Security">
          <p>
            We use industry-standard safeguards appropriate to a messaging and
            web product (encryption in transit, access controls, and reputable
            processors). No method of transmission or storage is perfectly
            secure; please use Rejsy accordingly.
          </p>
        </Section>

        <Section id="children" title="9. Children">
          <p>
            Rejsy is not directed at children under 13. If you join the waitlist
            or create an account, you confirm you meet the minimum age required
            in your country (and that a parent or guardian consents if required).
            We do not knowingly collect data from children below those ages. If
            you believe we have, contact us and we will delete it.
          </p>
        </Section>

        <Section id="cookies" title="10. Cookies and similar technologies">
          <p>
            Our website may use essential cookies or local storage for session,
            security, and basic preferences. We may use privacy-respecting
            analytics or hosting logs. You can control cookies through your
            browser settings; disabling some cookies may affect site features.
          </p>
        </Section>

        <Section id="transfers" title="11. International transfers">
          <p>
            Some processors may store or process data outside Denmark or the EEA
            (for example in the United States). Where required, we rely on
            appropriate safeguards such as Standard Contractual Clauses or the
            provider&apos;s certified transfer mechanisms.
          </p>
        </Section>

        <Section id="contact" title="12. Changes and contact">
          <p>
            We may update this Privacy Policy from time to time. The &ldquo;Last
            updated&rdquo; date at the top will change when we do. Continued use
            of Rejsy after an update means you acknowledge the revised policy.
          </p>
          <p>
            Questions:{" "}
            <a
              href="mailto:privacy@rejsy.app"
              className="font-medium text-[var(--ink)] underline underline-offset-2"
            >
              privacy@rejsy.app
            </a>
            . Related documents:{" "}
            <a
              href="/terms"
              className="font-medium text-[var(--ink)] underline underline-offset-2"
            >
              Terms of Service
            </a>
            .
          </p>
        </Section>
      </div>
    </PageShell>
  );
}
