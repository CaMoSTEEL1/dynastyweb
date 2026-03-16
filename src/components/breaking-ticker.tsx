import { cn } from "@/lib/utils";

const tickerItems = [
  "Dynasty Mode just got real.",
  "Welcome to DynastyWire — where every game writes a headline.",
  "The Wire never sleeps.",
  "Your story starts here.",
];

export default function BreakingTicker() {
  const separator = (
    <span className="mx-4 text-white/50 select-none" aria-hidden="true">
      &#9670;
    </span>
  );

  const renderItems = () =>
    tickerItems.map((item, i) => (
      <span key={i} className="inline-flex items-center">
        <span className="font-serif text-sm text-white/90 whitespace-nowrap">
          {item}
        </span>
        {separator}
      </span>
    ));

  return (
    <div
      className={cn(
        "w-full bg-dw-accent overflow-hidden",
        "flex items-center h-9 md:h-10"
      )}
    >
      <div
        className={cn(
          "shrink-0 flex items-center px-3 md:px-4 h-full",
          "bg-dw-accent border-r border-white/20"
        )}
      >
        <span
          className={cn(
            "font-headline uppercase text-white font-bold",
            "text-xs md:text-sm tracking-wider"
          )}
        >
          Breaking
        </span>
      </div>

      <div className="relative overflow-hidden flex-1 h-full flex items-center">
        <div className="ticker-scroll flex items-center">
          {renderItems()}
          {renderItems()}
        </div>
      </div>
    </div>
  );
}
