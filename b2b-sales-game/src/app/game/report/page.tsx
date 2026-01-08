'use client';

import React, { useEffect, useState } from 'react';
import { GameLayout } from '@/components/GameLayout';
import { AnalysisReport } from '@/types';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Timeline } from '@/components/Timeline';
import { TrustChart } from '@/components/TrustChart';

export default function ReportPage() {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchReport = async () => {
      // In a real app, we would pass the history ID or use a state management store (Zustand) to get history.
      // For this demo, we'll simulate passing history via localStorage or just mock it if empty.
      const historyStr = localStorage.getItem('gameHistory');
      
      if (!historyStr) {
         // Redirect if no history
         router.push('/game');
         return;
      }

      try {
        const history = JSON.parse(historyStr);
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ history })
        });
        const data = await res.json();
        setReport(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [router]);

  if (loading) {
    return (
      <GameLayout>
         <div className="flex flex-col items-center justify-center h-full">
           <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
           <h2 className="text-xl text-blue-400 font-bold animate-pulse">AI Coach Analyzing Performance...</h2>
         </div>
      </GameLayout>
    );
  }

  if (!report) return null;

  return (
    <GameLayout>
      <div className="max-w-6xl mx-auto w-full h-full overflow-y-auto pb-20 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 border border-slate-700 p-8 rounded-2xl backdrop-blur-md"
        >
          <h1 className="text-3xl font-bold mb-8 text-center text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Sales Performance Report
          </h1>

          <div className="flex gap-8 flex-col lg:flex-row">
              {/* Left Column: Stats & Feedback */}
              <div className="flex-1">
                  {/* Scores Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <ScoreCard title="Logic & Methodology" score={report.scores.logic} color="text-blue-400" />
                    <ScoreCard title="Empathy & Trust" score={report.scores.empathy} color="text-pink-400" />
                    <ScoreCard title="Closing Skills" score={report.scores.closing} color="text-amber-400" />
                  </div>

                  {/* Trust Trend Chart */}
                  {report.trust_trends && report.trust_trends.length > 0 && (
                    <div className="bg-slate-800/30 p-6 rounded-xl border border-white/5 mb-8">
                      <h3 className="text-xl font-bold text-slate-200 border-b border-slate-700 pb-2 mb-4">Trust Trends</h3>
                      <TrustChart data={report.trust_trends} />
                    </div>
                  )}

                  {/* Markdown Feedback */}
                  <div className="prose prose-invert max-w-none bg-slate-800/30 p-6 rounded-xl border border-white/5">
                    <h3 className="text-xl font-bold text-slate-200 border-b border-slate-700 pb-2 mb-4">Coach's Feedback</h3>
                    <div className="whitespace-pre-wrap text-slate-300 leading-relaxed text-sm">
                       {report.feedback_markdown}
                    </div>
                  </div>
              </div>

              {/* Right Column: Timeline */}
              <div className="flex-1">
                 <h3 className="text-xl font-bold text-slate-200 mb-6">Key Moments</h3>
                 {report.key_nodes ? (
                    <Timeline nodes={report.key_nodes} />
                 ) : (
                    <div className="text-slate-500 italic">No key moments identified.</div>
                 )}
              </div>
          </div>

          <div className="mt-12 text-center flex justify-center gap-4">
            <button 
              onClick={() => router.push('/game')}
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full transition-colors font-bold border border-white/10"
            >
              Start New Simulation
            </button>
            <button 
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full transition-colors font-bold shadow-lg"
            >
              Return to Home
            </button>
          </div>

        </motion.div>
      </div>
    </GameLayout>
  );
}

function ScoreCard({ title, score, color }: { title: string, score: number, color: string }) {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center flex flex-col items-center">
      <div className={`text-4xl font-black mb-2 ${color}`}>{score}</div>
      <div className="text-sm text-slate-400 uppercase tracking-wider font-bold">{title}</div>
    </div>
  );
}
