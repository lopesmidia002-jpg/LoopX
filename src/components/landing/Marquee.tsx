"use client";

import React from "react";

const MARQUEE_ITEMS = [
  "ROTEIROS COM RETENÇÃO PSICOLÓGICA",
  "NARRAÇÃO NEURAL HIPER-REALISTA",
  "CURADORIA AUTOMÁTICA EM 4K",
  "LEGENDAS DINÂMICAS PALAVRA A PALAVRA",
  "MOVIMENTO KEN BURNS & PARALLAX 2.5D",
  "MIXAGEM DE ÁUDIO COM AUTO-DUCKING",
  "PUBLICAÇÃO EM 1 CLIQUE NO YOUTUBE",
  "100% MONETIZÁVEL PELO YOUTUBE",
  "SEM MOSTRAR O ROSTO",
  "RENDERIZAÇÃO ULTRA-RÁPIDA 1080P",
];

export default function Marquee() {
  return (
    <div className="relative w-full overflow-hidden py-4 bg-[#12161f] border-y border-surface-border/70">
      {/* Side gradient fade masks */}
      <div className="absolute top-0 left-0 bottom-0 w-24 bg-gradient-to-r from-[#12161f] to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-l from-[#12161f] to-transparent z-10 pointer-events-none" />

      <div className="animate-infinite-marquee flex items-center whitespace-nowrap">
        {/* Double array for seamless loop */}
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, index) => (
          <div key={index} className="inline-flex items-center gap-6 mx-5">
            <span className="text-xs sm:text-sm font-bold tracking-widest text-slate-300 uppercase">
              {item}
            </span>
            <span className="text-brand-400 text-xs select-none">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
