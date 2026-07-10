"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshIcon, SpinnerIcon } from "@/components/icons";
import { getBalance } from "@/lib/atlas/client";
import { BALANCE_CRITICAL_THRESHOLD, BALANCE_LOW_THRESHOLD, BALANCE_POLL_INTERVAL_MS } from "@/lib/atlas/config";

export function BalanceBadge() {
  const [value, setValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const balance = await getBalance();
      setValue(balance.value);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initial = setTimeout(refresh, 0);
    const interval = setInterval(refresh, BALANCE_POLL_INTERVAL_MS);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [refresh]);

  const tone =
    value === null
      ? "text-steel"
      : value <= BALANCE_CRITICAL_THRESHOLD
        ? "text-brand-coral"
        : value <= BALANCE_LOW_THRESHOLD
          ? "text-yellow-dark"
          : "text-ink";

  return (
    <div className="flex items-center gap-2 rounded-xl border border-hairline bg-surface px-3 py-1.5">
      <span className="text-xs font-semibold text-steel">Atlas</span>
      <span className={`text-sm font-bold ${tone}`}>
        {error ? "오류" : value === null ? "..." : `$${value.toFixed(2)}`}
      </span>
      <button
        type="button"
        onClick={refresh}
        disabled={loading}
        aria-label="잔액 새로고침"
        title="잔액 새로고침"
        className="flex h-5 w-5 items-center justify-center rounded-full text-steel transition-colors hover:bg-hairline hover:text-ink disabled:opacity-50"
      >
        {loading ? <SpinnerIcon /> : <RefreshIcon />}
      </button>
    </div>
  );
}
