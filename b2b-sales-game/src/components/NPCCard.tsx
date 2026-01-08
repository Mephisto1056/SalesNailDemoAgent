import React from 'react';
import { motion } from 'framer-motion';
import { NPC } from '@/types';
import { cn } from '@/lib/utils';

interface NPCCardProps {
  npc: NPC;
  onSelect?: (npcId: string) => void;
  isSelected?: boolean;
  revealed?: boolean; // Whether the KDM status is revealed
}

export function NPCCard({ npc, onSelect, isSelected, revealed = false }: NPCCardProps) {
  // Simple visual mapping for mood/status (Scale 0-5)
  const getStatusColor = (trust: number) => {
    if (trust <= 1) return 'bg-red-500';
    if (trust <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Determine border color based on KDM status (if revealed or cheat mode)
  const isKDM = npc.is_key_decision_maker;
  
  return (
    <motion.div
      className={cn(
        "relative w-40 h-56 rounded-lg border-2 p-3 flex flex-col items-center gap-2 transition-all cursor-pointer bg-slate-800/80 backdrop-blur-sm overflow-hidden",
        isSelected 
          ? "border-blue-400 ring-2 ring-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.5)]" 
          : "border-slate-600 hover:border-slate-400",
        // Optional: Golden glow for KDMs if revealed
        // revealed && isKDM ? "shadow-[0_0_15px_rgba(234,179,8,0.3)] border-yellow-600/50" : ""
      )}
      onClick={() => onSelect?.(npc.id)}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Role Badge */}
      <span className={cn(
        "px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider mb-1 truncate max-w-full",
        isKDM ? "bg-yellow-900/50 text-yellow-200 border border-yellow-700/50" : "bg-slate-700 text-slate-300"
      )}>
        {npc.role_type.replace('_', ' ')}
      </span>

      {/* Avatar Placeholder */}
      <div className="relative w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-600 shrink-0">
        {/* Load avatar from npc.avatar property */}
        <img
            src={npc.avatar || `/avatars/${npc.id}.png`}
            alt={npc.name}
            className="w-full h-full object-cover"
            onError={(e) => {
                // Hide image on error and show fallback icon
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
        />
        
        {/* Fallback Icon (Hidden by default, shown on error) */}
        <span className="text-2xl hidden absolute inset-0 flex items-center justify-center bg-slate-700">
            {/* Different icons for rough role categories */}
            {npc.role_type.includes('Economic') ? '💰' :
             npc.role_type.includes('Technical') ? '💻' :
             npc.role_type.includes('Coach') ? '🤝' : '👤'}
        </span>
        
        {/* KDM Star Indicator (Hidden unless revealed) */}
        {isKDM && revealed && (
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] border border-slate-800" title="Key Decision Maker">
                ⭐
            </div>
        )}
      </div>

      {/* Name & Status */}
      <div className="text-center w-full">
        <h3 className="font-bold text-white text-xs truncate" title={npc.name}>{npc.name_cn && npc.name_cn !== npc.name ? npc.name_cn : npc.name}</h3>
        <p className="text-[10px] text-slate-400 truncate" title={npc.title}>{npc.title_cn && npc.title_cn !== npc.title ? npc.title_cn : npc.title}</p>
        {npc.personality_cn && (
            <p className="text-[9px] text-slate-500 truncate mt-1">{npc.personality_cn}</p>
        )}
      </div>

      {/* Trust Bar */}
      <div className="w-full mt-auto">
        <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
          <span>信任度</span>
          <span>{npc.trust_score} / 5</span>
        </div>
        <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <motion.div 
            className={cn("h-full transition-colors duration-500", getStatusColor(npc.trust_score))}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (npc.trust_score / 5) * 100)}%` }}
          />
        </div>
      </div>
      
      {/* Status Badge */}
      <div className={cn(
        "absolute top-2 right-2 w-2 h-2 rounded-full",
        npc.status === 'Hostile' ? "bg-red-500" :
        npc.status === 'Friendly' ? "bg-green-500" : "bg-slate-500"
      )} title={npc.status} />

    </motion.div>
  );
}
