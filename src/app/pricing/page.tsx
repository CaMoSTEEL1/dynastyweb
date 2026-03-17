import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/ui/section-header";
import PricingCard from "@/components/subscription/pricing-card";
import Link from "next/link";

const faqs = [
  {
    question: "What do I get with the free tier?",
    answer:
      "You get one full season with every feature unlocked, including the AI news cycle, press conferences, social reactions, broadcast shows, and recruiting storylines. No credit card required.",
  },
  {
    question: "What happens after my free season ends?",
    answer:
      "The Media Engine core remains free forever. To continue generating premium content like social reactions, press conferences, shows, recruiting storylines, offseason events, and NIL storylines across unlimited seasons, you can upgrade to Premium.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Absolutely. There are no contracts or commitments. Cancel your Premium subscription at any time and you'll retain access through the end of your billing period.",
  },
  {
    question: "Does DynastyWire work with any school?",
    answer:
      "Yes. DynastyWire works with every FBS program in College Football 26. The AI adapts its narratives, media personalities, and storylines to match your school's brand, conference, and prestige level.",
  },
  {
    question: "How does the AI content generation work?",
    answer:
      "After each game, you submit your results and the AI generates a full media cycle: articles, columns, social media reactions, broadcast show segments, and more. Every piece of content is unique and contextual to your dynasty's ongoing narrative.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <SectionHeader title="Pricing" />

        <div className="mt-2 text-center">
          <h1
            className={cn(
              "font-headline text-3xl uppercase tracking-[0.15em] text-ink",
              "sm:text-4xl"
            )}
          >
            Choose Your Plan
          </h1>
          <p className="mt-3 font-serif text-base italic text-ink2">
            Start free. Upgrade when you&apos;re ready.
          </p>
        </div>

        <div className="mt-12">
          <PricingCard />
        </div>

        <div className="mt-20">
          <h2 className="text-center font-headline text-2xl uppercase tracking-wider text-ink">
            Frequently Asked Questions
          </h2>

          <div className="rule-diamond mx-auto my-6 w-full max-w-xs">
            <span className="diamond" />
          </div>

          <div className="mx-auto max-w-2xl space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded border border-dw-border bg-paper2 px-6 py-5"
              >
                <h3 className="font-headline text-sm uppercase tracking-wider text-ink">
                  {faq.question}
                </h3>
                <p className="mt-2 font-serif text-sm leading-relaxed text-ink2">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 text-center">
          <h2 className="font-headline text-2xl uppercase tracking-wider text-ink">
            Ready to Build Your Legacy?
          </h2>
          <p className="mt-2 font-serif text-base italic text-ink2">
            Join thousands of dynasty builders and bring your story to life.
          </p>
          <Link
            href="/signup"
            className={cn(
              "mt-6 inline-block rounded bg-dw-accent px-8 py-3",
              "font-sans text-sm font-semibold uppercase tracking-wider text-white",
              "transition-colors hover:bg-dw-accent2"
            )}
          >
            Start Your Dynasty
          </Link>
        </div>
      </div>

      <footer className="border-t border-dw-border bg-paper px-4 py-8 text-center">
        <p className="font-headline text-sm uppercase tracking-widest text-ink3">
          DynastyWire
        </p>
        <p className="mt-1 font-serif text-xs text-ink3">
          &copy; {new Date().getFullYear()} DynastyWire. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
