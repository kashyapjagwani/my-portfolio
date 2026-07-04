import React from "react";

type LogoMarqueeProps = {
  logos: {
    id: string;
    logo: React.ReactNode;
  }[];
};

function Row({
  logos,
  reverse,
}: {
  logos: LogoMarqueeProps["logos"];
  reverse?: boolean;
}) {
  // Repeat several times for density
  const items = [...logos, ...logos, ...logos];

  return (
    <div className="relative overflow-hidden">
      <div
        className={`flex w-max gap-3 ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        }`}
      >
        {items.map((item, i) => (
          <div
            key={`${item.id}-${i}`}
            className="
              flex
              h-36
              w-[220px]
              shrink-0
              items-center
              justify-center
              rounded-lg
              border
              border-white/5
              bg-zinc-900
            "
          >
            {item.logo}
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-linear-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-linear-to-l from-black to-transparent" />
    </div>
  );
}

export function LogoMarquee({ logos }: LogoMarqueeProps) {
  return (
    <section className="bg-black py-6">
      <div className="space-y-3">
        <Row logos={logos} />

        {/* Slight offset creates a more natural pattern */}
        <div className="-translate-x-32">
          <Row logos={logos} reverse />
        </div>
      </div>
    </section>
  );
}
