"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { youtubeIdFrom } from "@/lib/products/schema";

/**
 * Click-to-load YouTube player: shows the thumbnail first, so pages stay fast
 * and YouTube sets no cookies until the visitor presses play.
 */
export function YouTubeEmbed({ url, title }: { url: string; title: string }) {
  const id = youtubeIdFrom(url);
  const [playing, setPlaying] = useState(false);
  if (!id) return null;

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-ink">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 h-full w-full" aria-label={`Play video: ${title}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- external thumbnail, no optimisation needed */}
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-16 place-items-center rounded-full bg-red-600 text-white shadow-lg transition group-hover:scale-110">
              <Play className="ml-1 size-7 fill-current" aria-hidden />
            </span>
          </span>
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-left text-sm font-medium text-white">{title}</span>
        </button>
      )}
    </div>
  );
}
