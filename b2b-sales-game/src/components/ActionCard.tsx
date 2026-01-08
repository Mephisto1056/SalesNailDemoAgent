import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card as CardType } from '@/types';
import { cn } from '@/lib/utils';
import { MessageSquare, Target, Lightbulb, Presentation, Users } from 'lucide-react';

interface ActionCardProps {
  card: CardType;
  onClick?: (card: CardType) => void;
  disabled?: boolean;
}

export function ActionCard({ card, onClick, disabled }: ActionCardProps) {
  const randomTilt = useMemo(() => Math.random() * 2 - 1, []);

  const getIcon = () => {
    switch (card.type) {
      case 'Interaction': return <MessageSquare className="w-5 h-5 text-blue-400" />;
      case 'Opportunity': return <Target className="w-5 h-5 text-amber-400" />;
      case 'Scheme': return <Lightbulb className="w-5 h-5 text-purple-400" />;
      case 'Demonstrate': return <Presentation className="w-5 h-5 text-red-400" />;
      default: return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getTypeColor = () => {
    switch (card.type) {
      case 'Interaction': return 'border-blue-500/50 bg-blue-950/30';
      case 'Opportunity': return 'border-amber-500/50 bg-amber-950/30';
      case 'Scheme': return 'border-purple-500/50 bg-purple-950/30';
      case 'Demonstrate': return 'border-red-500/50 bg-red-950/30';
      default: return 'border-slate-500 bg-slate-900';
    }
  };

  return (
    <motion.div
      className={cn(
        "w-40 h-56 rounded-xl border-2 p-3 flex flex-col cursor-pointer relative overflow-hidden transition-colors backdrop-blur-md",
        getTypeColor(),
        disabled ? "opacity-50 cursor-not-allowed grayscale" : "hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
      )}
      onClick={() => !disabled && onClick?.(card)}
      whileHover={!disabled ? { y: -20, rotate: randomTilt, zIndex: 10 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      {/* Card Header */}
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] uppercase tracking-wider font-bold opacity-70">
            {card.type_cn && card.type_cn !== card.type ? card.type_cn : card.type}
        </span>
        {getIcon()}
      </div>

      {/* Card Title */}
      <h3 className="font-bold text-sm text-white mb-2 leading-tight">
          {card.name_cn && card.name_cn !== card.name ? card.name_cn : card.name}
      </h3>

      {/* Card Description */}
      <p className="text-xs text-slate-300 leading-snug flex-grow">
        {card.description_cn && card.description_cn !== card.description ? card.description_cn : card.description}
      </p>

      {/* Footer / Target Info */}
      <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-slate-400 flex justify-between items-center">
        <span>{card.target_required ? "🎯 需指定目标" : "🌍 全局"}</span>
        <span className="font-mono font-bold text-yellow-400 bg-yellow-950/50 px-1.5 py-0.5 rounded border border-yellow-500/30">
            ⚡ {card.cost}{card.cost_per_target ? ` + ${card.cost_per_target}/人` : ''} 行动点
        </span>
      </div>

      {/* Background Decoration */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
    </motion.div>
  );
}
