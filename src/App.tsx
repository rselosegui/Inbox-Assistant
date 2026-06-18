/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Building2, LayoutDashboard, Mail, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'sonner';
import { AnalysisResult, Tone } from './types';
import AnalyzerPane from './components/AnalyzerPane';
import DashboardPane from './components/DashboardPane';
import SettingsPane from './components/SettingsPane';
import { generateMockHistory } from './lib/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'dashboard' | 'settings'>('analyzer');
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  
  const [config, setConfig] = useState({
    autoDispatch: true,
    dispatchThreshold: 85,
    redactPii: true,
    humanInTheLoop: true,
    storeAnalytics: true,
    modelSelection: 'gemini',
    groundingEnabled: true,
    syncSalesforce: false,
    slackAlerts: true,
  });

  useEffect(() => {
    // Populate with some mock history for the dashboard to look good
    setHistory(generateMockHistory(15));
  }, []);

  const handleAnalizeComplete = (result: Omit<AnalysisResult, 'id' | 'timestamp'>) => {
    const newEntry: AnalysisResult = {
      ...result,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
    };
    
    if (config.storeAnalytics) {
        setHistory(prev => [newEntry, ...prev]);
    }
  };

  const handlePurgeHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-[#fafafc] text-slate-800 font-sans flex flex-col relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="pointer-events-none absolute -top-[40%] -left-[10%] w-[70%] h-[70%] rounded-full bg-violet-400/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-[40%] -right-[10%] w-[70%] h-[70%] rounded-full bg-rose-400/10 blur-[120px]" />

      {/* Top Navigation */}
      <nav className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl px-4 md:px-8 py-4 z-10 sticky top-0 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center border border-violet-200 shadow-md shadow-violet-200/50">
              <span className="text-2xl">✨</span>
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-slate-800 tracking-tight">Lumi</h1>
              <p className="text-xs font-medium text-slate-500 tracking-wide uppercase">Your Friendly Inbox Assistant</p>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 rounded-2xl p-1.5 border border-slate-200 shadow-inner">
            <button
              onClick={() => setActiveTab('analyzer')}
              className={`relative flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors z-10 ${
                activeTab === 'analyzer' 
                  ? 'text-violet-700' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
               {activeTab === 'analyzer' && (
                <motion.div layoutId="nav-pill" className="absolute inset-0 bg-white border border-slate-200 rounded-xl shadow-sm -z-10" />
              )}
              <Mail className="w-4 h-4" />
              <span>Analyzer</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`relative flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors z-10 ${
                activeTab === 'dashboard' 
                  ? 'text-violet-700' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {activeTab === 'dashboard' && (
                <motion.div layoutId="nav-pill" className="absolute inset-0 bg-white border border-slate-200 rounded-xl shadow-sm -z-10" />
              )}
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`relative flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors z-10 ${
                activeTab === 'settings' 
                  ? 'text-violet-700' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {activeTab === 'settings' && (
                <motion.div layoutId="nav-pill" className="absolute inset-0 bg-white border border-slate-200 rounded-xl shadow-sm -z-10" />
              )}
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar z-0 relative">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'analyzer' && <AnalyzerPane onComplete={handleAnalizeComplete} config={config} />}
              {activeTab === 'dashboard' && <DashboardPane history={history} />}
              {activeTab === 'settings' && <SettingsPane config={config} setConfig={setConfig} onPurgeHistory={handlePurgeHistory} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <Toaster 
        theme="light" 
        position="bottom-right" 
        toastOptions={{ 
          style: { 
            background: '#ffffff', 
            border: '1px solid #e2e8f0', 
            color: '#1e293b',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
          } 
        }} 
      />

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(148, 163, 184, 0.5); border-radius: 10px; border: 2px solid #fafafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(100, 116, 139, 0.8); }
      `}} />
    </div>
  );
}
