"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export interface ClipVariant {
  id: string;
  label: string;
  description: string;
  gradientClassName: string;
}

interface ClipReviewModalProps {
  sceneName: string;
  variants: ClipVariant[];
  onClose: () => void;
  onAccept: (variantId: string) => void;
}

export function ClipReviewModal({
  sceneName,
  variants,
  onClose,
  onAccept,
}: ClipReviewModalProps) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id);

  return (
    <div className="fixed inset-0 z-50 bg-ink/10 backdrop-blur-sm">
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-xxl bg-canvas p-10 shadow-xl">
          <h1 className="text-3xl font-bold text-ink">
            Clip Review &amp; Selection - {sceneName}
          </h1>

          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            {variants.map((variant) => (
              <div key={variant.id} className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedId(variant.id)}
                  className={`relative overflow-hidden rounded-xl border-2 transition-colors ${
                    selectedId === variant.id ? "border-brand-blue" : "border-hairline"
                  }`}
                >
                  {selectedId === variant.id && (
                    <span className="absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full bg-green-500 px-5 py-1.5 text-sm font-semibold text-white shadow">
                      Selected
                    </span>
                  )}
                  <div className={`h-56 w-full ${variant.gradientClassName}`} />
                </button>

                <div>
                  <h3 className="text-xl font-bold text-ink">{variant.label}</h3>
                  <p className="mt-1 text-sm text-slate">{variant.description}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" onClick={() => onAccept(variant.id)}>
                    Accept Clip
                  </Button>
                  <Button variant="secondary">Regenerate with prompt edits</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="fixed bottom-6 right-6 rounded-full bg-primary px-6 py-3 text-sm font-medium text-on-primary transition-colors hover:bg-charcoal"
      >
        Close Modal
      </button>
    </div>
  );
}
