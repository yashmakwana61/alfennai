interface AdSlotProps {
  label?: string;
  minHeight: number;
  className?: string;
}

/**
 * Placeholder ad slot with reserved height, so that when a real AdSense unit
 * loads into this space later, it doesn't shift any surrounding content
 * (Cumulative Layout Shift). Once you have an AdSense publisher ID:
 *
 * 1. Add the AdSense loader script to app/layout.tsx <head> (see README).
 * 2. Replace the placeholder <div> below with your <ins class="adsbygoogle">
 *    unit for this slot, keeping the same wrapper's minHeight so the
 *    reserved space stays consistent before the ad loads.
 */
export function AdSlot({ label = "Advertisement", minHeight, className }: AdSlotProps) {
  return (
    <div
      className={`flex w-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-600 ${className ?? ""}`}
      style={{ minHeight }}
      aria-hidden="true"
    >
      {label}
    </div>
  );
}
