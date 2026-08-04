"use client";

import { useEffect, useState } from "react";

/* Rotates every 7000ms. Three quotes, verbatim from the handoff, all
 * attributed "— from our field notes, KNUST greenhouse".
 *
 * Accessibility (additive — the handoff has no guidance here): the rotator
 * sits in a role="status" region so assistive tech is informed of the change
 * without an interruptive alert, and the decorative quote mark above is
 * aria-hidden. A polite live region does not force an announcement every 7s
 * the way aria-live="assertive" would. */

const QUOTES = [
  {
    text: "The bar told me before I even walked out to check.",
    by: "— from our field notes, KNUST greenhouse",
  },
  {
    text: "Ten seconds apart, every reading — the LCD never stops counting.",
    by: "— from our field notes, KNUST greenhouse",
  },
  {
    text: "The pump turned on before I even reached for my phone.",
    by: "— from our field notes, KNUST greenhouse",
  },
];

export function QuoteRotator() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % QUOTES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const quote = QUOTES[index]!;

  return (
    <div
      key={index}
      role="status"
      data-gg-anim="1"
      className="animate-quote border-leaf max-w-115 flex flex-col gap-5 border-l-2 pl-7"
    >
      <div className="font-accent text-quote leading-quote font-normal text-white italic">
        {quote.text}
      </div>
      <div className="tracking-slight text-base text-white/65">{quote.by}</div>
    </div>
  );
}
