"use client";
/**
 * A link that loads its page in the background as soon as the visitor shows intent: pointing at
 * it, touching it, or tabbing to it. Opening is then close to instant, without preloading every
 * card that scrolls past (prefetch={false} switches off Next's preloading on view).
 * With `pendingSpinner`, the link shows a spinner while its page is still loading after a tap.
 */
import Link, { useLinkStatus } from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, FocusEvent, MouseEvent, TouchEvent } from "react";

type Props = Omit<ComponentProps<typeof Link>, "prefetch" | "href"> & { href: string; pendingSpinner?: boolean };

/** Shown inside the link while its page loads; fades in late, so a quick open never flashes it. */
function PendingSpinner() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span aria-hidden className="link-pending pointer-events-none absolute inset-0 z-10 grid place-items-center rounded-[inherit] bg-white/45">
      <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand-500 border-t-transparent" />
    </span>
  );
}

export default function IntentLink({ href, pendingSpinner = false, children, onMouseEnter, onTouchStart, onFocus, ...rest }: Props) {
  const router = useRouter();
  // Next skips a page it already has, so calling this again is cheap.
  const warm = () => router.prefetch(href);
  return (
    <Link
      href={href}
      prefetch={false}
      onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => { warm(); onMouseEnter?.(e); }}
      onTouchStart={(e: TouchEvent<HTMLAnchorElement>) => { warm(); onTouchStart?.(e); }}
      onFocus={(e: FocusEvent<HTMLAnchorElement>) => { warm(); onFocus?.(e); }}
      {...rest}
    >
      {children}
      {pendingSpinner && <PendingSpinner />}
    </Link>
  );
}
