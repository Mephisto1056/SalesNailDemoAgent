'use client';

import React, { useState, useEffect } from 'react';
import { GameState, NPC, Card } from '@/types';
import { GameLayout } from '@/components/GameLayout';
import { NPCCard } from '@/components/NPCCard';
import { ActionCard } from '@/components/ActionCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

  // Mock Initial State (Ideally this comes from Phase 1 Init)
  const MOCK_INITIAL_STATE: GameState = {
    language: 'cn', // Default to Chinese as requested
    game_mode: 'quick',
    difficulty_multiplier: 1,
    company_profile: "TechCorp Solutions - AI Analytics Platform",
    current_project: { 
      id: '1', 
      title: 'Enterprise AI Rollout', 
      summary: 'Deploying AI across global marketing teams.',
      org_description_stages: [
          "Stage 1: Publicly, TechCorp is expanding aggressively into new markets.",
          "Stage 2: Internally, there is a conflict between legacy IT and the new Digital Transformation team.",
          "Stage 3: The CEO has given an ultimatum: show results by Q4 or face restructuring."
      ]
    },
    current_stage: 'Discovery',
    turn_count: 0,
    max_turns: 3,
    action_points: 0,
    max_action_points: 10,
    status: 'active',
    npcs: [
      { id: 'npc_1', role_type: 'Economic_Buyer', title: 'CFO', name: 'Sarah Chen', name_cn: '陈莎拉', title_cn: '首席财务官', gender: 'Female', avatar: '/avatars/关键决策人_1_女.png', avatar_prompt: '', personality: 'Cost-focused, Skeptical', personality_cn: '注重成本，多疑', trust_score: 1, hidden_agenda: 'Budget cuts pending', dialogues: ["I don't have much time.", "What's the ROI?", "Our budget is tight.", "We tried this before.", "I need a guarantee.", "If this fails, I'm out."], status: 'Hostile', is_key_decision_maker: true },
      { id: 'npc_2', role_type: 'Technical_Buyer', title: 'CTO', name: 'Mike Ross', name_cn: '麦克·罗斯', title_cn: '首席技术官', gender: 'Male', avatar: '/avatars/关键决策人_2_男.png', avatar_prompt: '', personality: 'Security-obsessed, Detail-oriented', personality_cn: '痴迷安全，注重细节', trust_score: 2, hidden_agenda: 'Previous vendor failed security audit', status: 'Neutral', is_key_decision_maker: true },
      { id: 'npc_3', role_type: 'Coach', title: 'VP Marketing', name: 'Jenny Lin', name_cn: '林珍妮', title_cn: '市场副总裁', gender: 'Female', avatar: '/avatars/参与决策人_3_女.png', avatar_prompt: '', personality: 'Enthusiastic, Visionary', personality_cn: '热情，有远见', trust_score: 3, hidden_agenda: 'Needs a quick win for promotion', status: 'Neutral', is_key_decision_maker: true },
      { id: 'npc_4', role_type: 'Staff', title: 'Exec Assistant', name: 'Tom Wambsgans', name_cn: '汤姆·温布斯甘斯', title_cn: '行政助理', gender: 'Male', avatar: '/avatars/非决策人_4_男.png', avatar_prompt: '', personality: 'Nervous', personality_cn: '紧张', trust_score: 2, hidden_agenda: 'Scared of Sarah', status: 'Neutral', is_key_decision_maker: false },
      { id: 'npc_5', role_type: 'Gatekeeper', title: 'Receptionist', name: 'Pam Beesly', name_cn: '帕姆·比斯利', title_cn: '前台', gender: 'Female', avatar: '/avatars/非决策人_5_女.png', avatar_prompt: '', personality: 'Friendly', personality_cn: '友好', trust_score: 3, hidden_agenda: 'Bored', status: 'Neutral', is_key_decision_maker: false },
    ],
    history: [],
    opportunities: [],
    solution: {
      features: [],
      quality_score: 10,
      history: []
    }
  };
  
  const MOCK_HAND: Card[] = [
    { id: 'card_1', type: 'Interaction', name: 'SPIN Question', description: 'Ask Situation/Problem questions.', target_required: true, stage_unlock: ['Discovery'], cost: 2, name_cn: 'SPIN 提问', description_cn: '询问背景/痛点问题', type_cn: '互动' },
    { id: 'card_2', type: 'Interaction', name: 'Social Event', description: 'Build relationship informally.', target_required: true, stage_unlock: ['Discovery'], cost: 3, name_cn: '社交活动', description_cn: '非正式场合建立关系', type_cn: '互动' },
    { id: 'card_3', type: 'Opportunity', name: 'Identify Need', description: 'Formalize a hidden pain point.', target_required: true, stage_unlock: ['Discovery', 'Validation'], cost: 2, name_cn: '确认需求', description_cn: '正式确认客户隐性痛点', type_cn: '商机' },
    { id: 'card_4', type: 'Scheme', name: 'Tailor Solution', description: 'Add specific features to proposal.', target_required: false, stage_unlock: ['Validation'], cost: 3, name_cn: '定制方案', description_cn: '针对需求增加方案特性', type_cn: '策略' },
    { id: 'card_5', type: 'Demonstrate', name: 'Product Demo', description: 'Pitch solution to stakeholder.', target_required: true, stage_unlock: ['Closing'], cost: 5, name_cn: '产品演示', description_cn: '向利益相关者演示方案', type_cn: '演示' },
  ];
  
  // Locked cards for demo version visualization
  const LOCKED_CARDS: Card[] = [
    { id: 'locked_1', type: 'Interaction', name: 'Executive Briefing', description: 'High-level strategic alignment meeting.', target_required: false, stage_unlock: [], cost: 4, name_cn: '高层汇报', description_cn: '高层战略对齐会议', type_cn: '互动' },
    { id: 'locked_2', type: 'Scheme', name: 'Custom Prototype', description: 'Tailored demo for specific use cases.', target_required: false, stage_unlock: [], cost: 5, name_cn: '定制原型', description_cn: '针对特定场景的原型演示', type_cn: '策略' },
    { id: 'locked_3', type: 'Interaction', name: 'Golf Weekend', description: 'Deep relationship building event.', target_required: false, stage_unlock: [], cost: 6, name_cn: '高尔夫周末', description_cn: '深度关系建立活动', type_cn: '互动' },
    { id: 'locked_4', type: 'Demonstrate', name: 'Contract Negotiation', description: 'Finalize terms and conditions.', target_required: false, stage_unlock: [], cost: 3, name_cn: '合同谈判', description_cn: '敲定最终条款与条件', type_cn: '演示' },
  ];

const TEXTS = {
  en: {
    round: 'Round',
    ap: 'AP',
    keyStakeholders: 'Key Stakeholders',
    opportunities: 'Opportunities',
    yourHand: 'Your Hand',
    endRound: 'End Round',
    finishGame: 'Finish Game',
    play: 'Play',
    selectTarget: 'Select a Target NPC above ⬆️',
    solutionQuality: 'Solution Quality',
    noOpp: 'No opportunities revealed yet. Talk to NPCs to discover needs.',
    used: 'Used',
    dealWon: '🏆 Deal Won!',
    dealLost: '💀 Deal Lost',
    noDecision: '😐 No Decision',
    analysis: "The sales cycle has ended. Let's analyze your performance.",
    viewReport: 'View Analysis Report',
    startGame: 'Start Game'
  },
  cn: {
    round: '轮次',
    ap: '行动点',
    keyStakeholders: '关键决策人',
    opportunities: '商机',
    yourHand: '手牌',
    endRound: '结束回合',
    finishGame: '结束游戏',
    play: '打出',
    selectTarget: '请在上方选择目标 NPC ⬆️',
    solutionQuality: '方案质量',
    noOpp: '暂无商机。请与 NPC 对话以发现需求。',
    used: '使用了',
    dealWon: '🏆 赢得订单！',
    dealLost: '💀 丢单',
    noDecision: '😐 无结果',
    analysis: '销售周期已结束。正在生成分析报告...',
    viewReport: '查看分析报告',
    startGame: '开始游戏'
  }
};

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>(MOCK_INITIAL_STATE);
  const [hand, setHand] = useState<Card[]>(MOCK_HAND);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isLoaded, setIsLoaded] = useState(false); // To prevent hydration mismatch if we used localStorage in initial state
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  
  const t = TEXTS[gameState.language] || TEXTS['en'];

  const toggleLanguage = () => {
      setGameState(prev => ({
          ...prev,
          language: prev.language === 'en' ? 'cn' : 'en'
      }));
  };

  // Load game state from localStorage on mount
  useEffect(() => {
    const storedState = localStorage.getItem('gameState');
    if (storedState) {
      try {
        setGameState(JSON.parse(storedState));
      } catch (e) {
        console.error("Failed to parse stored game state", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Auto-save game state to localStorage
  useEffect(() => {
    if (isLoaded && gameState.turn_count > 0) {
      localStorage.setItem('gameState', JSON.stringify(gameState));
    }
  }, [gameState, isLoaded]);

  // Chat auto-scroll
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.history]);

  if (!isLoaded) return null; // Or a loading spinner

  const handleCardClick = (card: Card) => {
    if (gameState.turn_count === 0) return;
    if (selectedCard?.id === card.id) {
      setSelectedCard(null); // Deselect
    } else {
      setSelectedCard(card);
    }
  };

  const handleNPCSelect = async (npcId: string) => {
    if (gameState.turn_count === 0) return;
    if (!selectedCard || isProcessing) return;
    
    if (selectedCard.target_required) {
      await executeTurn(selectedCard, npcId);
    }
  };

  // Handle global cards (no specific target)
  const handleGlobalPlay = async () => {
      if (gameState.turn_count === 0) return;
      if (!selectedCard || isProcessing || selectedCard.target_required) return;
      await executeTurn(selectedCard);
  }

  const executeTurn = async (card: Card, targetNpcId?: string) => {
    setIsProcessing(true);
    
    // Optimistic UI update (optional, maybe just showing loading state)
    // We don't add to history here immediately to avoid flicker, or add as 'pending'
    // For now, let's just rely on isProcessing state
    
    try {
      const response = await fetch('/api/game/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameState,
          playerAction: {
            card_id: card.id,
            target_npc_id: targetNpcId
          },
          cardCost: card.cost + (targetNpcId && card.cost_per_target ? card.cost_per_target : 0),
          cardName: card.name
        })
      });

      const data = await response.json();

      if (data.newState) {
        setGameState(data.newState);
        setSelectedCard(null);
      }
    } catch (error) {
      console.error("Turn failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNextRound = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/game/next-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameState })
      });
      const data = await response.json();
      if (data.newState) {
        setGameState(data.newState);
      }
    } catch (error) {
      console.error("Next round failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const startGame = async () => {
    setIsProcessing(true);
    // Simulate first round start (or just bump turn to 1 and give AP)
    // In a real scenario, this might call an API to initialize the scenario properly.
    // For now, let's just update the local state to start Round 1.
    
    // Wait a bit for effect
    await new Promise(resolve => setTimeout(resolve, 500));

    setGameState(prev => ({
        ...prev,
        turn_count: 1,
        action_points: prev.max_action_points,
        // Add initial system message
        history: [
            ...prev.history,
            {
                role: 'system',
                content: prev.language === 'en' ? 'Game Started. Good luck!' : '游戏开始。祝你好运！',
                timestamp: Date.now()
            }
        ]
    }));
    setIsProcessing(false);
  };

  return (
    <GameLayout>
      <div className={`flex flex-col lg:flex-row h-full gap-4 lg:gap-6 transition-all duration-500 ${gameState.turn_count === 0 ? 'grayscale opacity-80 pointer-events-none' : ''}`}>
        {/* Left Column: NPCs (Top) and Cards (Bottom) */}
        <div className="flex-1 flex flex-col gap-4 min-w-0 h-full overflow-y-auto lg:overflow-hidden pb-20 lg:pb-0">
          
          {/* Header: Stats */}
          <div className="flex gap-4">
            <div className="flex-1 bg-white/5 rounded-xl border border-white/10 p-3 flex justify-between items-center relative group">
                {/* Language Toggle */}
                <button 
                    onClick={toggleLanguage}
                    className="absolute top-2 right-2 text-[10px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-slate-300 pointer-events-auto"
                >
                    {gameState.language === 'en' ? '中文' : 'English'}
                </button>

                <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">{t.round} {gameState.turn_count} / {gameState.max_turns}</span>
                    <span className="text-xl font-bold text-yellow-400">{gameState.action_points} {t.ap}</span>
                </div>
                <div className="flex gap-2 items-center mt-4">
                   {/* End Game Button (Always Visible) */}
                   <button 
                     onClick={() => {
                        // Using browser confirm as a simple safeguard
                        if (confirm(gameState.language === 'en' ? 'End the game now and see analysis?' : '立即结束游戏并查看分析报告？')) {
                            setGameState(prev => ({ ...prev, status: 'no_decision' }));
                        }
                     }}
                     className="text-xs bg-red-900/50 hover:bg-red-800 border border-red-700 text-red-200 px-2 py-1 rounded transition-colors pointer-events-auto"
                   >
                     {t.finishGame}
                   </button>
                   
                   {gameState.status === 'active' && gameState.turn_count > 0 && (
                      <button 
                        onClick={() => {
                           if (gameState.action_points > 0) {
                               if (!confirm(gameState.language === 'en' ? 'You still have Action Points. End round anyway?' : '您还有剩余行动点。确定要结束本回合吗？')) {
                                   return;
                               }
                           }
                           handleNextRound();
                        }}
                        className={`text-xs px-2 py-1 rounded text-white transition-colors pointer-events-auto ${
                            gameState.action_points === 0 
                                ? 'bg-yellow-600 hover:bg-yellow-500 animate-pulse' 
                                : 'bg-slate-700 hover:bg-slate-600 border border-slate-600'
                        }`}
                      >
                        {gameState.turn_count >= gameState.max_turns ? t.finishGame : t.endRound}
                      </button>
                   )}
                   <div className="text-2xl">⚡</div>
                </div>
            </div>
             <div className="flex-1 bg-white/5 rounded-xl border border-white/10 p-3 flex justify-between items-center">
                <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">{t.solutionQuality}</span>
                    <span className="text-xl font-bold text-cyan-400">{gameState.solution?.quality_score ?? 0}%</span>
                </div>
                <div className="text-2xl">💎</div>
            </div>
          </div>

          {/* 1. Top Left: Personnel/NPCs & Opportunities */}
          <div className="flex-[2] flex flex-col lg:flex-row gap-4 min-h-0 shrink-0 lg:shrink">
            {/* NPCs */}
            <div className="flex-1 overflow-x-auto lg:overflow-y-auto bg-white/5 rounded-xl border border-white/10 p-4 min-h-[300px] lg:min-h-0">
                <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider sticky left-0">{t.keyStakeholders}</h3>
                <div className="flex lg:grid lg:grid-cols-1 xl:grid-cols-2 gap-4 lg:justify-items-center min-w-max lg:min-w-0 pb-4 lg:pb-0">
                    {gameState.npcs.map(npc => (
                    <NPCCard
                        key={npc.id}
                        npc={npc}
                        onSelect={handleNPCSelect}
                        isSelected={selectedCard?.target_required && selectedCard?.id ? false : false}
                        revealed={npc.trust_score > 60}
                    />
                    ))}
                </div>
            </div>

            {/* Opportunities */}
            <div className="w-full lg:w-1/3 overflow-y-auto bg-white/5 rounded-xl border border-white/10 p-4 shrink-0 max-h-[200px] lg:max-h-none">
                 <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">{t.opportunities}</h3>
                 <div className="flex flex-col gap-3">
                    {gameState.opportunities.length === 0 && (
                         <div className="text-xs text-slate-500 text-center mt-10">{t.noOpp}</div>
                    )}
                    {gameState.opportunities.map(opp => (
                        <div key={opp.id} className={`p-3 rounded-lg border ${opp.status === 'achieved' ? 'bg-green-900/20 border-green-500/50' : opp.status === 'revealed' ? 'bg-blue-900/20 border-blue-500/50' : 'bg-slate-800 border-slate-700 opacity-50'}`}>
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-bold text-white">{opp.title}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${opp.status === 'achieved' ? 'bg-green-500 text-black' : 'bg-blue-500 text-white'}`}>
                                    {opp.status}
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-300">{opp.description}</p>
                        </div>
                    ))}
                 </div>
            </div>
          </div>

          {/* 2. Bottom Left: Action Cards */}
          <div className="flex-1 bg-white/5 rounded-xl border border-white/10 relative p-4 overflow-y-auto lg:overflow-y-auto min-h-[300px] lg:min-h-0">
             <div className="sticky top-0 z-30 flex justify-between items-center mb-4 bg-gradient-to-b from-slate-900/80 to-transparent pb-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.yourHand}</h3>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 justify-items-center relative z-10 pb-20">
                <AnimatePresence>
                  {hand.map(card => (
                    <div key={card.id} className={selectedCard?.id === card.id ? 'ring-4 ring-green-500 rounded-xl transition-all' : ''}>
                       <ActionCard
                          card={card}
                          onClick={handleCardClick}
                          disabled={isProcessing || gameState.status !== 'active' || card.cost > gameState.action_points}
                       />
                    </div>
                  ))}

                  {/* Locked Cards for Demo Version */}
                  {LOCKED_CARDS.map(card => (
                    <div key={card.id} className="relative opacity-60 grayscale pointer-events-none">
                       <ActionCard card={card} disabled={true} />
                       <div className="absolute inset-0 flex items-center justify-center z-20">
                          <div className="bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded border border-white/20 text-center backdrop-blur-sm transform -rotate-12">
                            FULL VERSION<br/>ONLY
                          </div>
                       </div>
                    </div>
                  ))}
                </AnimatePresence>
             </div>

              {/* Action Prompts / Buttons - Floating at Bottom now */}
              <div className="absolute bottom-6 left-0 w-full flex justify-center z-40 pointer-events-none">
                  {/* Global Play Button */}
                  {selectedCard && !selectedCard.target_required && !isProcessing && gameState.status === 'active' && gameState.turn_count > 0 && (
                     <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-green-600 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-green-500 pointer-events-auto"
                        onClick={handleGlobalPlay}
                     >
                       {t.play} "{gameState.language === 'en' ? selectedCard.name : selectedCard.name_cn || selectedCard.name}"
                     </motion.button>
                  )}
                  
                  {/* Target Prompt */}
                  {selectedCard && selectedCard.target_required && !isProcessing && gameState.status === 'active' && gameState.turn_count > 0 && (
                     <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-white bg-black/80 px-4 py-2 rounded-full backdrop-blur-md border border-white/20"
                     >
                       {t.selectTarget}
                     </motion.div>
                  )}
              </div>
          </div>

        </div>

        {/* 3. Right Column: Dialogue Log */}
        <div className="w-full lg:w-[400px] flex-shrink-0 h-[400px] lg:h-full flex flex-col order-first lg:order-last mb-4 lg:mb-0">
          <div className="flex-1 bg-black/50 rounded-xl border border-white/10 p-4 overflow-y-auto backdrop-blur-sm relative flex flex-col">
            <div className="absolute top-0 right-0 left-0 p-2 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-start rounded-t-xl">
                <span className="text-xs text-slate-400 font-mono">LOG_ID: {gameState.turn_count}</span>
                <span className="text-xs text-blue-400 font-bold px-2 py-1 bg-blue-900/30 rounded border border-blue-500/30">{gameState.current_stage} Phase</span>
            </div>
            
            <div className="flex flex-col gap-4 mt-8 pb-4">
               {gameState.history.length === 0 && gameState.turn_count > 0 && (
                 <div className="text-slate-400 italic text-center mt-20 text-sm">
                    {gameState.language === 'en' ? 
                        <>System Ready.<br/>Select an action to initiate sales protocol.</> : 
                        <>系统就绪。<br/>请选择一个行动以启动销售流程。</>
                    }
                 </div>
               )}
               {gameState.history.map((log, idx) => {
                 // Skip 'user' logs if we want to focus on NPC/System responses, OR style them differently.
                 // User requested: "Right side should be conversation with NPC"
                 // Let's keep user logs but make them subtle actions.
                 if (log.role === 'user') return null;
                 // Actually user action is implicit in the "Used Card" label of the NPC response usually.
                 // But sometimes we have system messages.

                 const isSystem = log.role === 'system' || !log.metadata?.npc_id;
                 const npc = log.metadata?.npc_id ? gameState.npcs.find(n => n.id === log.metadata?.npc_id) : null;
                 
                 if (isSystem) {
                     return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-slate-500 italic text-center my-2 px-4"
                        >
                            {log.content}
                        </motion.div>
                     );
                 }

                 return (
                   <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 mb-4"
                   >
                      {/* Avatar */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-xs border border-white/20 shadow-lg overflow-hidden">
                          {npc ? (
                              <>
                                  <img
                                    src={npc.avatar || `/avatars/${npc.id}.png`}
                                    alt={npc.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                  <span className="hidden">{npc.name.charAt(0)}</span>
                              </>
                          ) : '?'}
                      </div>

                      <div className="flex flex-col gap-1 max-w-[85%]">
                          <div className="flex items-baseline gap-2">
                              <span className="text-xs font-bold text-slate-300">{npc?.name_cn && npc?.name_cn !== npc?.name ? npc.name_cn : npc?.name || 'Unknown'}</span>
                              <span className="text-[10px] text-slate-500 uppercase">{npc?.title_cn && npc?.title_cn !== npc?.title ? npc.title_cn : npc?.title}</span>
                          </div>
                          
                          {/* Bubble */}
                          <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-white/10 text-sm text-slate-200 shadow-md">
                              "{log.content}"
                          </div>

                          {/* Metadata / Action Used */}
                          {log.metadata?.action_card_name && (
                              <div className="self-start text-[10px] text-slate-500 flex items-center gap-1 mt-1 bg-black/20 px-2 py-0.5 rounded-full">
                                  <span>⚡ {t.used}</span>
                                  <span className="font-bold text-slate-400">{log.metadata.action_card_name}</span>
                              </div>
                          )}
                      </div>
                   </motion.div>
                 );
               })}
               {isProcessing && (
                 <div className="self-start flex items-center gap-2 text-slate-400 text-sm p-2">
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75" />
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150" />
                 </div>
               )}
               <div ref={chatEndRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Start Game Overlay (Round 0) */}
      {gameState.turn_count === 0 && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
              <motion.button
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-2xl font-bold px-12 py-4 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.5)] border-2 border-blue-400 backdrop-blur-md"
              >
                  {t.startGame}
              </motion.button>
          </div>
      )}

      {/* Game Over Overlay */}
      {gameState.status !== 'active' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800 p-8 rounded-2xl border border-white/20 max-w-md text-center"
          >
            <h2 className="text-4xl font-bold mb-4">
              {gameState.status === 'won' ? t.dealWon :
               gameState.status === 'lost' ? t.dealLost : t.noDecision}
            </h2>
            <p className="text-slate-300 mb-6">
              {t.analysis}
            </p>
            <button
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-bold transition-colors"
              onClick={() => {
                 localStorage.setItem('gameHistory', JSON.stringify(gameState.history));
                 router.push('/game/report');
              }}
            >
              {t.viewReport}
            </button>
          </motion.div>
        </div>
      )}
    </GameLayout>
  );
}
