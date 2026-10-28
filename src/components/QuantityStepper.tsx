"use client";

import { Minus, Plus } from "lucide-react";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max: number;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex h-12 items-center rounded-full border border-line bg-white">
      <button
        type="button"
        className="grid size-12 place-items-center rounded-full text-ink hover:bg-leaf-50 disabled:opacity-40"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <output className="w-8 text-center font-semibold tabular-nums" aria-live="polite">{value}</output>
      <button
        type="button"
        className="grid size-12 place-items-center rounded-full text-ink hover:bg-leaf-50 disabled:opacity-40"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
