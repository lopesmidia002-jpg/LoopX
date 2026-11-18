"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function FeaturedVideoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={containerRef}
      className="bg-black pt-6 md:pt-10 pb-20 md:pb-32 px-6 overflow-hidden relative"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="rounded-3xl overflow-hidden aspect-video relative w-full border border-white/10 shadow-2xl"
        >
          {/* Main Video */}
          <video
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4"
            muted
            autoPlay
            loop
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Bottom Overlay Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6 z-10">
            {/* Left Liquid Glass Approach Card */}
            <div className="liquid-glass rounded-2xl p-6 md:p-8 max-w-md backdrop-blur-md">
              <p className="text-white/50 text-xs tracking-widest uppercase mb-3 font-semibold">
                Nossa Abordagem
              </p>
              <p className="text-white text-sm md:text-base leading-relaxed">
                Acreditamos no poder da narrativa guiada por dados. Cada roteiro nasce de uma pergunta e cada corte é orquestrado para reter a atenção e multiplicar o tempo de exibição no YouTube.
              </p>
            </div>

            {/* Right Explore More Button */}
            <motion.a
              href="#philosophy"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium self-start md:self-auto hover:bg-white/10 transition-colors inline-flex items-center justify-center cursor-pointer shadow-lg"
            >
              Explorar Recursos
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
