import React, { useState } from 'react';
import { Settings, Shield, Zap, Database, Lock, Save, CheckCircle2, Brain, Globe, Webhook, MessageSquare, BookOpen, UploadCloud } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export interface SystemConfig {
  autoDispatch: boolean;
  dispatchThreshold: number;
  redactPii: boolean;
  humanInTheLoop: boolean;
  storeAnalytics: boolean;
  modelSelection: string;
  groundingEnabled: boolean;
  syncSalesforce: boolean;
  slackAlerts: boolean;
}

interface SettingsPaneProps {
  config: SystemConfig;
  setConfig: React.Dispatch<React.SetStateAction<SystemConfig>>;
  onPurgeHistory: () => void;
}

export default function SettingsPane({ config, setConfig, onPurgeHistory }: SettingsPaneProps) {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    toast.success('Configuration Saved', {
      description: 'System preferences have been applied globally.',
    });
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      toast.success('File Uploaded', { description: `${e.target.files[0].name} has been added to the Knowledge Base.` });
    }
  };

  const handlePurge = () => {
    onPurgeHistory();
    toast.success('Data Purged', { description: 'All historical analytical logs have been removed.' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-800 tracking-tight">System Preferences</h2>
          <p className="text-sm text-slate-500 mt-1">Manage automations, security rules, and data retention.</p>
        </div>
        <button
          onClick={handleSave}
          className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 text-sm shadow-sm flex items-center ${isSaved ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200' : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-200'}`}
        >
          {isSaved ? <CheckCircle2 className="w-5 h-5 mr-3" /> : <Save className="w-5 h-5 mr-3" />}
          {isSaved ? 'Preferences Saved' : 'Save Changes'}
        </button>
      </div>

      <div className="grid gap-6">
        
        {/* Automation Module */}
        <motion.div variants={itemVariants} className="p-8 bg-white border border-slate-200 hover:border-violet-300 transition-colors rounded-3xl space-y-6 shadow-sm group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center space-x-4 text-slate-800 relative z-10">
            <div className="p-3 bg-violet-100 rounded-2xl">
              <Zap className="w-6 h-6 text-violet-600" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Pipeline Automation</h3>
          </div>
          
          <div className="space-y-4 pt-4 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-800">Auto-Dispatch Responses</h4>
                <p className="text-sm text-slate-500 mt-1">Automatically send replies without human review if confidence is high.</p>
              </div>
              <button
                onClick={() => setConfig({ ...config, autoDispatch: !config.autoDispatch })}
                className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-violet-500/20 ${config.autoDispatch ? 'bg-violet-500' : 'bg-slate-200'}`}
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ${config.autoDispatch ? 'translate-x-[26px]' : 'translate-x-1'}`}
                />
              </button>
            </div>

            {config.autoDispatch && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-6 mt-4 border-t border-slate-100">
                <div className="flex justify-between mb-4">
                  <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">Confidence Threshold (<span className="text-violet-600 font-black">{config.dispatchThreshold}%</span>)</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="99" 
                  value={config.dispatchThreshold}
                  onChange={(e) => setConfig({ ...config, dispatchThreshold: parseInt(e.target.value) })}
                  className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-violet-500 border border-slate-200 shadow-inner" 
                />
                <p className="text-sm text-slate-500 mt-4 leading-relaxed">Only responses meeting or exceeding this confidence score will bypass human review.</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Security Module */}
        <motion.div variants={itemVariants} className="p-8 bg-white border border-slate-200 hover:border-emerald-300 transition-colors rounded-3xl space-y-6 shadow-sm group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center space-x-4 text-slate-800 relative z-10">
            <div className="p-3 bg-emerald-100 rounded-2xl">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Security & Compliance</h3>
          </div>
          
          <div className="space-y-4 pt-4 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-800">Enforce PII Redaction</h4>
                <p className="text-sm text-slate-500 mt-1">Automatically remove sensitive data (credit cards, SSNs) before returning UI payloads.</p>
              </div>
              <button
                onClick={() => setConfig({ ...config, redactPii: !config.redactPii })}
                className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-emerald-500/20 ${config.redactPii ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ${config.redactPii ? 'translate-x-[26px]' : 'translate-x-1'}`}
                />
              </button>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-800">Human-In-The-Loop for High Urgency</h4>
                <p className="text-sm text-slate-500 mt-1">Always require a manual sign-off for priority tier emails.</p>
              </div>
              <button
                onClick={() => setConfig({ ...config, humanInTheLoop: !config.humanInTheLoop })}
                className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-emerald-500/20 ${config.humanInTheLoop ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ${config.humanInTheLoop ? 'translate-x-[26px]' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Data & Analytics */}
        <motion.div variants={itemVariants} className="p-8 bg-white border border-slate-200 hover:border-amber-300 transition-colors rounded-3xl space-y-6 shadow-sm group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center space-x-4 text-slate-800 relative z-10">
            <div className="p-3 bg-amber-100 rounded-2xl">
              <Database className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Data Retention</h3>
          </div>
          
          <div className="space-y-4 pt-4 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-800">Store Historical Analytics</h4>
                <p className="text-sm text-slate-500 mt-1">Keep copies of processed requests to build intelligence operations dashboards.</p>
              </div>
              <button
                onClick={() => setConfig({ ...config, storeAnalytics: !config.storeAnalytics })}
                className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-amber-500/20 ${config.storeAnalytics ? 'bg-amber-500' : 'bg-slate-200'}`}
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ${config.storeAnalytics ? 'translate-x-[26px]' : 'translate-x-1'}`}
                />
              </button>
            </div>
            
            <div className="pt-6 mt-4 border-t border-slate-100">
              <button 
                onClick={handlePurge}
                className="text-sm text-rose-600 hover:text-rose-700 font-bold px-6 py-3 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors shadow-sm"
              >
                Purge All Historical Data
              </button>
            </div>
          </div>
        </motion.div>

        {/* Knowledge Base */}
        <motion.div variants={itemVariants} className="p-8 bg-white border border-slate-200 hover:border-indigo-300 transition-colors rounded-3xl space-y-6 shadow-sm group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center space-x-4 text-slate-800 relative z-10">
            <div className="p-3 bg-indigo-100 rounded-2xl">
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Internal Knowledge Base</h3>
          </div>
          
          <div className="space-y-4 pt-4 relative z-10">
             <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-800">Support Documents</h4>
                <p className="text-sm text-slate-500 mt-1">Upload PDF, TXT, or DOCX files to enrich the intelligence engine's context retrieval.</p>
              </div>
            </div>

            <div className="pt-2">
              <input type="file" id="kb-upload" className="hidden" multiple onChange={handleFileUpload} />
              <label htmlFor="kb-upload" className="border-2 border-dashed border-slate-200 hover:border-indigo-300 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer group/upload">
                <UploadCloud className="w-10 h-10 text-slate-400 group-hover/upload:text-indigo-500 mb-3 transition-colors" />
                <span className="font-bold text-slate-700 group-hover/upload:text-indigo-700 text-base mb-1">Click to upload knowledge files</span>
                <span className="text-sm text-slate-500 font-medium">Drag and drop supported files here</span>
              </label>
            </div>
          </div>
        </motion.div>

        {/* AI Intelligence Engine */}
        <motion.div variants={itemVariants} className="p-8 bg-white border border-slate-200 hover:border-blue-300 transition-colors rounded-3xl space-y-6 shadow-sm group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center space-x-4 text-slate-800 relative z-10">
            <div className="p-3 bg-blue-100 rounded-2xl">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">AI Language Models</h3>
          </div>
          
          <div className="space-y-6 pt-4 relative z-10">
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-800">Primary Inference Model</h4>
                <p className="text-sm text-slate-500 mt-1">Select the core LLM used for analyzing incoming email payloads and drafting responses.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button 
                  onClick={() => setConfig({ ...config, modelSelection: 'gpt4' })}
                  className={`p-4 border rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all ${config.modelSelection === 'gpt4' ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-slate-50'}`}
                >
                   <span className="font-bold text-sm">GPT-4o</span>
                </button>
                <button 
                  onClick={() => setConfig({ ...config, modelSelection: 'claude' })}
                  className={`p-4 border rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all ${config.modelSelection === 'claude' ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-slate-50'}`}
                >
                   <span className="font-bold text-sm">Claude 3.5 Sonnet</span>
                </button>
                <button 
                  onClick={() => setConfig({ ...config, modelSelection: 'gemini' })}
                  className={`p-4 border rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all ${config.modelSelection === 'gemini' ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-slate-50'}`}
                >
                   <span className="font-bold text-sm">Gemini 1.5 Pro</span>
                </button>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-800 flex items-center">
                  <Globe className="w-4 h-4 mr-2 text-slate-500" /> Real-time Web Grounding
                </h4>
                <p className="text-sm text-slate-500 mt-1">Allow the model to perform web searches to gather up-to-date context when responding to inquiries.</p>
              </div>
              <button
                onClick={() => setConfig({ ...config, groundingEnabled: !config.groundingEnabled })}
                className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${config.groundingEnabled ? 'bg-blue-500' : 'bg-slate-200'}`}
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ${config.groundingEnabled ? 'translate-x-[26px]' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </div>
        </motion.div>

        {/* External Webhooks & Sync */}
        <motion.div variants={itemVariants} className="p-8 bg-white border border-slate-200 hover:border-pink-300 transition-colors rounded-3xl space-y-6 shadow-sm group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center space-x-4 text-slate-800 relative z-10">
            <div className="p-3 bg-pink-100 rounded-2xl">
              <Webhook className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">External Integrations</h3>
          </div>
          
          <div className="space-y-4 pt-4 relative z-10">
             <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-800">Forward High-Urgency to Slack</h4>
                <p className="text-sm text-slate-500 mt-1">Automatically send a webhook to your #ops-urgent Slack channel for critical tier emails.</p>
              </div>
              <button
                onClick={() => setConfig({ ...config, slackAlerts: !config.slackAlerts })}
                className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-pink-500/20 ${config.slackAlerts ? 'bg-pink-500' : 'bg-slate-200'}`}
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ${config.slackAlerts ? 'translate-x-[26px]' : 'translate-x-1'}`}
                />
              </button>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-800">Bi-directional Salesforce Sync</h4>
                <p className="text-sm text-slate-500 mt-1">Automatically attach analysis results and summaries to matching records in CRM.</p>
              </div>
              <button
                onClick={() => setConfig({ ...config, syncSalesforce: !config.syncSalesforce })}
                className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-pink-500/20 ${config.syncSalesforce ? 'bg-pink-500' : 'bg-slate-200'}`}
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ${config.syncSalesforce ? 'translate-x-[26px]' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
