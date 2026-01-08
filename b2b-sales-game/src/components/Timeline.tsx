'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { KeyNode } from '@/types';

interface TimelineProps {
  nodes: KeyNode[];
}

export function Timeline({ nodes }: TimelineProps) {
  if (!nodes || nodes.length === 0) return null;

  // Sort by turn just in case
  const sortedNodes = [...nodes].sort((a, b) => a.turn - b.turn);

  return (
    <div className="relative border-l-2 border-slate-700 ml-4 pl-8 py-4 space-y-12">
      {sortedNodes.map((node, idx) => (
        <motion.div 
          key={idx} 
          className="relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.2 }}
        >
          {/* Node Dot */}
          <div className={`absolute -left-[41px] top-1 w-6 h-6 rounded-full border-4 border-slate-900 
            ${node.result === 'Positive' ? 'bg-green-500' : node.result === 'Negative' ? 'bg-red-500' : 'bg-slate-500'}`} 
          />
          
          <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-slate-400 font-mono uppercase">Turn {node.turn}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full 
                    ${node.result === 'Positive' ? 'bg-green-900/30 text-green-400' : node.result === 'Negative' ? 'bg-red-900/30 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
                    {node.result}
                </span>
            </div>
            <h4 className="text-lg font-bold text-white mb-1">
                {node.action_name} 
                {node.npc_name && <span className="text-slate-400 font-normal ml-2">to {node.npc_name}</span>}
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
                {node.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
