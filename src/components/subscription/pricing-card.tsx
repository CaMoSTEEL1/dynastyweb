import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import Link from "next/link";

interface FeatureItem {
  label: string;
  included: boolean;
}

interface TierConfig {
  name: string;
  price: string;
  period: string;
  description: string;
  features: FeatureItem[];
  cta: string;
  href: string;
  highlighted: boolean;
}

const tiers: TierConfig[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description:
      "1 Full Season with all features unlocked. The Media Engine stays free forever.",
    features: [
      { label: "Full AI News Cycle", included: true },
      { label: "Game Recaps & Articles", included: true },
      { label: "Press Conferences", included: true },
      { label: "Social Reactions", included: true },
      { label: "Broadcast Shows", included: true },
      { label: "Recruiting Storylines", included: true },
      { label: "1 Season Included", included: true },
      { label: "Unlimited Seasons", included: false },
      { label: "Offseason Events", included: false },
      { label: "NIL Storylines", included: false },
    ],
    cta: "Get Started",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "$5",
    period: "/month",
    description:
      "Full access to every feature across unlimited seasons. The complete DynastyWire experience.",
    features: [
      { label: "Full AI News Cycle", included: true },
      { label: "Game Recaps & Articles", included: true },
      { label: "Press Conferences", included: true },
      { label: "Social Reactions", included: true },
      { label: "Broadcast Shows", included: true },
      { label: "Recruiting Storylines", included: true },
      { label: "Unlimited Seasons", included: true },
      { label: "Offseason Events", included: true },
      { label: "NIL Storylines", included: true },
      { label: "Priority Generation", included: true },
    ],
    cta: "Upgrade Now",
    href: "/signup",
    highlighted: true,
  },
];

export default function PricingCard() {
  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
      {tiers.map((tier) => (
        <div
          key={tier.name}
          className={cn(
            "flex flex-col rounded border p-6",
            tier.highlighted
              ? "border-dw-accent bg-paper2 shadow-lg"
              : "border-dw-border bg-paper"
          )}
        >
          {tier.highlighted && (
            <div className="mb-4 -mt-6 -mx-6 rounded-t bg-dw-accent px-4 py-1.5 text-center">
              <span className="font-sans text-xs font-bold uppercase tracking-widest text-white">
                Most Popular
              </span>
            </div>
          )}

          <h3 className="font-headline text-2xl uppercase tracking-wider text-ink">
            {tier.name}
          </h3>

          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-headline text-4xl text-ink">
              {tier.price}
            </span>
            <span className="font-serif text-sm text-ink3">{tier.period}</span>
          </div>

          <p className="mt-3 font-serif text-sm leading-relaxed text-ink2">
            {tier.description}
          </p>

          <div className="rule-diamond my-5 w-full max-w-[80px]">
            <span className="diamond" />
          </div>

          <ul className="flex-1 space-y-2.5">
            {tier.features.map((feature) => (
              <li key={feature.label} className="flex items-center gap-2.5">
                {feature.included ? (
                  <Check className="h-4 w-4 shrink-0 text-dw-green" />
                ) : (
                  <X className="h-4 w-4 shrink-0 text-ink3/40" />
                )}
                <span
                  className={cn(
                    "font-serif text-sm",
                    feature.included ? "text-ink" : "text-ink3/60"
                  )}
                >
                  {feature.label}
                </span>
              </li>
            ))}
          </ul>

          <Link
            href={tier.href}
            className={cn(
              "mt-6 block rounded py-2.5 text-center",
              "font-sans text-sm font-semibold uppercase tracking-wider",
              "transition-opacity hover:opacity-90",
              tier.highlighted
                ? "bg-dw-accent text-white"
                : "border border-dw-border bg-paper2 text-ink hover:bg-paper3"
            )}
          >
            {tier.cta}
          </Link>
        </div>
      ))}
    </div>
  );
}
