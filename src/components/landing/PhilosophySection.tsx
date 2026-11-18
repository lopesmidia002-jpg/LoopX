"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function PhilosophySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section
      id="philosophy"
      ref={containerRef}
      className="bg-black py-28 md:py-40 px-6 overflow-hidden relative"
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading: Inovação x Visão */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-8xl text-white tracking-tight mb-16 md:mb-24 font-sans"
        >
          Inovação{" "}
          <span className="font-serif italic text-white/40">x</span>{" "}
          Visão
        </motion.h2>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: Video in rounded-3xl overflow-hidden aspect-[4/3] */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="rounded-3xl overflow-hidden aspect-[4/3] relative w-full border border-white/10 shadow-2xl bg-neutral-950"
          >
            <video
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
              muted
              autoPlay
              loop
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </motion.div>

          {/* Right: Two text blocks separated by a w-full h-px bg-white/10 divider */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col justify-center"
          >
            {/* Block 1 */}
            <div>
              <p className="text-white/40 text-xs tracking-widest uppercase mb-4 font-semibold">
                Escolha seu nicho
              </p>
              <p className="text-white/70 text-base md:text-lg leading-relaxed">
                Todo grande canal dark nasce da interseção entre disciplina de dados e visão criativa arrojada. Operamos nessa encruzilhada, transformando ideias ousadas em narrativas magnéticas que geram receita em dólar.
              </p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-white/10 my-8 md:my-10" />

            {/* Block 2 */}
            <div>
              <p className="text-white/40 text-xs tracking-widest uppercase mb-4 font-semibold">
                Molde a sua audiência
              </p>
              <p className="text-white/70 text-base md:text-lg leading-relaxed">
                Acreditamos que os vídeos mais lucrativos surgem quando a curiosidade humana se alia à automação inteligente. Nosso pipeline foi desenhado para revelar histórias fascinantes e transformá-las em retenção ininterrupta.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
