import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VeloVide — Crie Vídeos Documentais e Top 10 com IA em Minutos",
  description: "A plataforma definitiva de automação de vídeos cinematográficos para canais dark do YouTube. Roteiro, narração hiper-realista, curadoria 4K, efeitos Ken Burns e publicação em 1 clique.",
  keywords: ["youtube dark", "automação de vídeo", "ia de vídeo", "gerador de roteiro", "documentários automáticos", "canal dark", "velovide"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark scroll-smooth">
      <body className="bg-background text-slate-100 antialiased selection:bg-brand-500/30 selection:text-brand-300 relative min-h-screen">
        {/* Fixed Top Loading Accent Bar */}
        <div className="top-loader-bar" />
        
        {/* Subtle Ambient Aurora */}
        <div className="aurora-glow" />
        
        {/* 64px Grid with Radial Mask */}
        <div className="fixed inset-0 bg-cinematic-grid pointer-events-none z-0" />
        
        {/* Main Content wrapper */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
