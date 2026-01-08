import React from 'react';
import { motion } from 'framer-motion';

interface GameLayoutProps {
  children: React.ReactNode;
  bgImage?: string;
}

export function GameLayout({ children, bgImage }: GameLayoutProps) {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900 text-white font-sans">
      {/* Background Layer */}
      <motion.div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: bgImage ? `url(${bgImage})` : undefined }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 1 }}
      />

      {/* Cyberpunk Grid Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Vignette */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 pointer-events-none" />

      {/* Content Layer */}
      <div className="relative z-10 w-full h-full flex flex-col max-w-7xl mx-auto p-2 lg:p-4">
        {children}
      </div>
    </div>
  );
}