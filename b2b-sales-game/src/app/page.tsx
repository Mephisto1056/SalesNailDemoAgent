'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GameMode } from '@/types';

const TEXTS = {
  en: {
    title: 'Sales Simulator',
    subtitle: 'Test your B2B sales skills against AI decision makers.',
    industry: 'Your Company Industry',
    product: 'Your Product Description',
    target: 'Target Customer',
    gameMode: 'Game Mode',
    modeQuick: '⚡ Quick Simulation (Standard)',
    modeQuickDesc: '3 Rounds • 10 AP/Round • Normal Difficulty • ~20 mins',
    modeDetailed: '🧠 Deep Dive (Hard)',
    modeDetailedDesc: '3 Rounds • 20 AP/Round • Hard Difficulty (0.5x Trust) • ~60 mins',
    start: 'Start Simulation 🚀',
    generating: 'Generating Scenario...',
    placeholderIndustry: 'e.g. Cybersecurity',
    placeholderProduct: 'e.g. Zero-trust network access solution',
    placeholderTarget: 'e.g. Large Financial Institution'
  },
  cn: {
    title: 'B2B 销售模拟器',
    subtitle: '与 AI 决策人进行真实的销售博弈',
    industry: '你的公司/行业',
    product: '你的产品描述',
    target: '目标客户',
    gameMode: '游戏模式',
    modeQuick: '⚡ 快速模拟 (标准)',
    modeQuickDesc: '3 回合 • 10 行动点/轮 • 正常难度 • 约 20 分钟',
    modeDetailed: '🧠 深度博弈 (困难)',
    modeDetailedDesc: '3 回合 • 20 行动点/轮 • 困难难度 (好感度减半) • 约 60 分钟',
    start: '开始模拟 🚀',
    generating: '正在生成场景...',
    placeholderIndustry: '例如：网络安全',
    placeholderProduct: '例如：零信任网络访问方案',
    placeholderTarget: '例如：大型金融机构'
  }
};

const DEFAULTS = {
  en: {
    industry: 'SaaS AI',
    product: 'Predictive Analytics Platform',
    target: 'Fortune 500 Retailer'
  },
  cn: {
    industry: '人工智能 SaaS',
    product: '预测性分析平台',
    target: '财富500强零售企业'
  }
};

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'en' | 'cn'>('cn');
  const [gameMode, setGameMode] = useState<GameMode>('quick');
  // Initialize with CN defaults as default language is CN
  const [formData, setFormData] = useState(DEFAULTS.cn);

  const t = TEXTS[language];



  // Switch defaults when language changes
  React.useEffect(() => {
     setFormData(DEFAULTS[language]);
  }, [language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/game/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, language, gameMode })
      });

      if (!res.ok) throw new Error('Failed to generate scenario');

      const initialState = await res.json();
      
      // Save to localStorage to pass to the Game page
      localStorage.setItem('gameState', JSON.stringify(initialState));
      
      router.push('/game');
    } catch (error) {
      console.error(error);
      alert('Error generating scenario. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 font-sans text-white">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-slate-900/80 backdrop-blur-md border border-slate-800 p-8 rounded-2xl relative z-10 shadow-2xl"
      >
        {/* Language Toggle */}
        <div className="absolute top-4 right-4">
            <button
                type="button"
                onClick={() => setLanguage(l => l === 'en' ? 'cn' : 'en')}
                className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-slate-300 transition-colors"
            >
                {language === 'en' ? '中文' : 'English'}
            </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
            {t.title}
          </h1>
          <p className="text-slate-400 text-sm">
            {t.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t.gameMode}</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setGameMode('quick')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  gameMode === 'quick' 
                    ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500' 
                    : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="font-bold text-white mb-1">{t.modeQuick}</div>
                <div className="text-xs text-slate-400">{t.modeQuickDesc}</div>
              </button>

              <button
                type="button"
                onClick={() => setGameMode('detailed')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  gameMode === 'detailed' 
                    ? 'bg-purple-600/20 border-purple-500 ring-1 ring-purple-500' 
                    : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="font-bold text-white mb-1">{t.modeDetailed}</div>
                <div className="text-xs text-slate-400">{t.modeDetailedDesc}</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t.industry}</label>
            <input 
              type="text"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.industry}
              onChange={e => setFormData({...formData, industry: e.target.value})}
              placeholder={t.placeholderIndustry}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t.product}</label>
            <input 
              type="text"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.product}
              onChange={e => setFormData({...formData, product: e.target.value})}
              placeholder={t.placeholderProduct}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t.target}</label>
            <input 
              type="text"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.target}
              onChange={e => setFormData({...formData, target: e.target.value})}
              placeholder={t.placeholderTarget}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t.generating}
              </>
            ) : (
              t.start
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
