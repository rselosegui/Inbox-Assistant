import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertCircle, 
  Clock, 
  Smile, 
  MessageSquare, 
  Hash,
  Send,
  Loader2,
  Code2,
  FileText,
  Building2,
  Settings,
  UploadCloud,
  CheckCircle2,
  ListTodo,
  Languages,
  ShieldAlert,
  Target,
  BookOpen,
  Scan
} from 'lucide-react';
import { AnalysisResult, Tone } from '../types';
import { toast } from 'sonner';

import { SystemConfig } from './SettingsPane';

interface AnalyzerPaneProps {
  onComplete: (result: Omit<AnalysisResult, 'id' | 'timestamp'>) => void;
  config: SystemConfig;
}

export default function AnalyzerPane({ onComplete, config }: AnalyzerPaneProps) {
  const [emailText, setEmailText] = useState('');
  const [tone, setTone] = useState<Tone>('professional');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<Omit<AnalysisResult, 'id' | 'timestamp'> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'ui' | 'json'>('ui');
  const [isDragging, setIsDragging] = useState(false);
  
  // State for the auto-response editing
  const [editableResponse, setEditableResponse] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadingSteps = ['Encrypting payload...', 'Running NLP models...', 'Extracting entities...', 'Scoring sentiment...', 'Drafting response...'];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.eml')) {
        const text = await file.text();
        setEmailText(text);
        toast.success('File Loaded', { description: `${file.name} ready for analysis.` });
      } else {
        setError('Please drop a compatible .txt or .eml file.');
        toast.error('Upload Error', { description: 'Please drop a compatible .txt or .eml file.' });
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const text = await file.text();
      setEmailText(text);
      toast.success('File Loaded', { description: `${file.name} ready for analysis.` });
    }
  };

  const handleAnalyze = async () => {
    if (!emailText.trim()) return;
    
    setIsAnalyzing(true);
    setLoadingStep(0);
    setError(null);
    setResult(null);
    setIsSent(false);
    
    const scanInterval = setInterval(() => {
      setLoadingStep(prev => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 800);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailText, tone, config })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze email');
      }
      
      const analysisData = { ...data, originalText: emailText };
      setResult(analysisData);
      setEditableResponse(data.autoResponse);
      onComplete(analysisData);
      
      if (config.autoDispatch && data.confidenceScore && data.confidenceScore >= config.dispatchThreshold) {
        setIsSent(true);
        toast.success('Auto-Dispatched', { description: `Response sent automatically (Confidence: ${data.confidenceScore}%)` });
      } else {
        toast.success('Analysis Complete', { description: 'Payload processing successful.' });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      toast.error('Analysis Failed', { description: err.message || 'An unexpected error occurred.' });
    } finally {
      setIsAnalyzing(false);
      clearInterval(scanInterval);
    }
  };

  const handleSendResponse = () => {
    // Mock sending process
    setIsSent(true);
    toast.success('Response Dispatched', { description: 'The reply has been queued for delivery.' });
  };

  const handleRewrite = async (instruction: string) => {
    if (!editableResponse.trim()) return;
    setIsRewriting(true);
    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textToRewrite: editableResponse, instruction })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to rewrite');
      }
      setEditableResponse(data.rewrittenText);
      toast.success('Text Rewritten', { description: 'Response has been updated successfully.' });
    } catch (err: any) {
       console.error("Rewrite failed:", err);
       toast.error('Rewrite Failed', { description: err.message || 'Could not rewrite response.' });
    } finally {
      setIsRewriting(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'low': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getDepartmentName = (dept: string) => {
    return dept.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
      
      {/* Input Pane */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between h-10">
          <h2 className="text-sm font-bold tracking-tight text-slate-800">Incoming Message</h2>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-slate-500 font-medium">Desired Tone:</span>
            <select 
              value={tone} 
              onChange={(e) => setTone(e.target.value as Tone)}
              className="bg-white border text-sm font-semibold border-slate-200 text-violet-700 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
            >
              <option value="professional">Professional</option>
              <option value="empathetic">Empathetic</option>
              <option value="direct">Direct</option>
              <option value="technical">Technical</option>
            </select>
          </div>
        </div>
        
        <div 
          className="relative flex-1 min-h-[300px] md:min-h-[450px]"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <textarea
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            placeholder="Drop a customer email here, and let's see what we can do! ✨"
            className={`w-full h-full min-h-[300px] md:min-h-[450px] p-6 md:p-8 bg-white border border-slate-200 rounded-3xl text-base text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-300 resize-none transition-all shadow-sm ${isDragging ? 'bg-violet-50' : 'hover:bg-slate-50'}`}
            disabled={isAnalyzing}
          />
          
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center z-10 border border-slate-200"
              >
                <div className="w-20 h-20 relative flex items-center justify-center mb-6">
                   <div className="absolute inset-0 border-t-4 border-violet-400 rounded-full animate-spin"></div>
                   <div className="absolute inset-3 border-r-4 border-rose-400 rounded-full animate-[spin_1.5s_reverse_infinite]"></div>
                   <span className="text-3xl">🤔</span>
                </div>
                <h3 className="text-xl font-display font-bold text-slate-800 mb-2 tracking-tight">Thinking...</h3>
                <p className="text-sm font-medium text-violet-600 h-5 px-4 bg-violet-100 rounded-full py-0.5 flex items-center">
                   {loadingSteps[loadingStep]}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {emailText.length === 0 && !isDragging && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-70">
              <div className="w-24 h-24 bg-violet-50 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                 <span className="text-4xl">📝</span>
              </div>
              <p className="text-slate-500 font-bold tracking-wide">Ready for analysis</p>
              <p className="text-sm text-slate-400 mt-1 font-medium">Paste text or drag & drop a file</p>
            </div>
          )}

          {isDragging && (
            <div className="absolute inset-0 pointer-events-none rounded-3xl border-4 border-violet-300 border-dashed m-1 flex items-center justify-center bg-violet-50/50 backdrop-blur-[2px] z-10 transition-all">
              <div className="flex flex-col items-center bg-white text-violet-600 py-4 px-8 rounded-2xl shadow-xl shadow-violet-200/50 border border-violet-100">
                <UploadCloud className="w-8 h-8 mb-3 text-violet-500 animate-bounce" />
                <span className="font-bold text-base">Drop it right there!</span>
              </div>
            </div>
          )}

          {/* Hidden File Input for click to upload */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept=".txt,.eml"
            className="hidden" 
          />
          {emailText.length === 0 && !isDragging && (
             <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-violet-300 rounded-xl text-sm font-bold text-violet-600 transition-colors flex items-center shadow-sm hover:shadow-md"
              >
                <FileText className="w-4 h-4 mr-2" />
                Browse Files
             </button>
          )}

        </div>
        
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !emailText.trim()}
          className="flex items-center justify-center w-full py-4 px-6 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-violet-200 hover:shadow-violet-300 group relative overflow-hidden text-lg"
        >
          {!isAnalyzing && !!emailText.trim() && (
            <motion.div className="absolute inset-0 bg-white/20" initial={{ x: '-100%', skewX: -15 }} animate={{ x: '200%' }} transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }} />
          )}
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 mr-3 animate-spin relative z-10" />
              <span className="relative z-10 tracking-wide">Thinking...</span>
            </>
          ) : (
            <>
              <span className="text-xl mr-3 group-hover:scale-110 transition-transform relative z-10">🪄</span>
              <span className="relative z-10 tracking-wide">Analyze Magic</span>
            </>
          )}
        </button>
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-sm flex items-start space-x-3 shadow-sm">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}
      </div>

      {/* Output Pane */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between h-10">
          <h2 className="text-sm font-bold tracking-tight text-slate-800">Analysis Results</h2>
          {result && (
            <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200 shadow-inner">
              <button
                onClick={() => setViewMode('ui')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
                  viewMode === 'ui' ? 'bg-white text-violet-700 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Structured</span>
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
                  viewMode === 'json' ? 'bg-white text-violet-700 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Code2 className="w-3 h-3" />
                <span>JSON Raw</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 bg-white border border-slate-200 rounded-3xl overflow-hidden relative min-h-[500px] shadow-sm">
          {!result && !isAnalyzing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <span className="text-4xl">✨</span>
              </div>
              <h3 className="text-xl font-display font-bold text-slate-800 mb-2">Ready to Analyze</h3>
              <p className="text-sm font-medium text-slate-500 max-w-sm">Drop an email on the left and Lumi will extract the key information for you.</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-violet-600 bg-white/80 z-10 backdrop-blur-md">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p className="text-sm font-medium tracking-wide">Reading carefully...</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {result && viewMode === 'ui' && (
              <motion.div
                key="ui-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { staggerChildren: 0.1 } }}
                exit={{ opacity: 0 }}
                className="p-8 space-y-8 overflow-y-auto absolute inset-0 custom-scrollbar flex flex-col"
              >
                {/* Top Metrics Row */}
                {result.isPiiDetected && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start space-x-3 p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 shadow-sm">
                    <ShieldAlert className="w-10 h-10 mt-1 shrink-0 p-2 bg-white rounded-full shadow-sm text-rose-500" />
                    <div className="flex-1">
                      <h4 className="text-base font-bold tracking-tight">Sensitive Info Hidden</h4>
                      <p className="text-sm mt-1 text-rose-600/80 leading-relaxed">Lumi noticed some personal information in this email and has flagged it for privacy.</p>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-white hover:bg-slate-50 transition-colors border border-slate-200 hover:border-violet-300 flex flex-col space-y-3 relative group overflow-hidden shadow-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center text-slate-500 space-x-2 relative z-10 font-medium">
                      <Target className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs uppercase tracking-wider">Confidence</span>
                    </div>
                    <div className="flex items-baseline space-x-1 relative z-10">
                      <span className="text-3xl font-display font-bold text-slate-800">{result.confidenceScore || 95}</span>
                      <span className="text-sm font-medium text-slate-400">%</span>
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-white hover:bg-slate-50 transition-colors border border-slate-200 hover:border-violet-300 flex flex-col space-y-3 shadow-sm">
                    <div className="flex items-center text-slate-500 space-x-2 font-medium">
                      <Building2 className="w-4 h-4 text-violet-500" />
                      <span className="text-xs uppercase tracking-wider">Department</span>
                    </div>
                    <div className="text-base font-bold text-slate-800 tracking-tight">
                      {getDepartmentName(result.department)}
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-white hover:bg-slate-50 transition-colors border border-slate-200 hover:border-violet-300 flex flex-col space-y-3 col-span-2 md:col-span-1 shadow-sm">
                    <div className="flex items-center text-slate-500 space-x-2 font-medium">
                      <AlertCircle className="w-4 h-4 hover:text-rose-500 transition-colors" />
                      <span className="text-xs uppercase tracking-wider">Priority</span>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${getUrgencyColor(result.urgency).replace('bg-', 'bg-opacity-10 text-').replace('border-', 'border-opacity-20 ')} bg-${result.urgency === 'High' ? 'rose' : result.urgency === 'Medium' ? 'amber' : 'emerald'}-100 text-${result.urgency === 'High' ? 'rose' : result.urgency === 'Medium' ? 'amber' : 'emerald'}-700 shadow-sm`}>
                        {result.urgency}
                      </span>
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-white hover:bg-slate-50 transition-colors border border-slate-200 hover:border-violet-300 flex flex-col space-y-3 shadow-sm">
                    <div className="flex items-center text-slate-500 space-x-2 font-medium">
                      <Smile className="w-4 h-4 text-amber-500" />
                      <span className="text-xs uppercase tracking-wider">Mood</span>
                    </div>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-display font-bold text-slate-800">{result.sentimentScore}</span>
                      <span className="text-sm font-medium text-slate-400">/ 5</span>
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-white hover:bg-slate-50 transition-colors border border-slate-200 hover:border-violet-300 flex flex-col space-y-3 shadow-sm">
                    <div className="flex items-center text-slate-500 space-x-2 font-medium">
                      <Languages className="w-4 h-4 text-blue-500" />
                      <span className="text-xs uppercase tracking-wider">Language</span>
                    </div>
                    <div className="text-lg font-display font-bold text-slate-800">
                      {result.originalLanguage}
                    </div>
                  </motion.div>

                </div>

                {/* Translation Display (if applicable) */}
                {result.englishTranslation && result.englishTranslation.trim() !== '' && result.originalLanguage.toLowerCase() !== 'en' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="flex items-center space-x-2 text-slate-600">
                      <Languages className="w-5 h-5 text-blue-500" />
                      <h3 className="text-base font-bold tracking-tight">English Translation</h3>
                    </div>
                    <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 text-slate-700 text-base leading-relaxed whitespace-pre-wrap italic shadow-sm relative">
                      <span className="absolute top-4 left-4 text-4xl text-blue-200 font-serif leading-none">"</span>
                      <span className="relative z-10">{result.englishTranslation}</span>
                      <span className="absolute bottom-[-10px] right-4 text-4xl text-blue-200 font-serif leading-none">"</span>
                    </div>
                  </motion.div>
                )}

                {/* Action Items */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <ListTodo className="w-5 h-5 text-violet-500" />
                    <h3 className="text-base font-bold tracking-tight">To-Do List</h3>
                  </div>
                  <div className="grid gap-3">
                    {result.actionItems && result.actionItems.length > 0 ? (
                      result.actionItems.map((item, i) => (
                        <div key={i} className="flex items-start space-x-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-violet-300 hover:shadow-md transition-all group">
                          <div className="mt-0.5 min-w-[32px] w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-sm text-violet-600 font-bold group-hover:bg-violet-500 group-hover:text-white transition-colors shadow-sm">
                            {i + 1}
                          </div>
                          <span className="text-base text-slate-700 leading-relaxed pt-1 font-medium">{item}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-500 italic px-4">No specific action items needed! 🎉</span>
                    )}
                  </div>
                </motion.div>

                {/* Suggested Articles */}
                {result.suggestedArticles && result.suggestedArticles.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="flex items-center space-x-2 text-slate-600">
                      <BookOpen className="w-5 h-5 text-violet-500" />
                      <h3 className="text-base font-bold tracking-tight">Helpful Knowledge Base Articles</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.suggestedArticles.map((article, i) => (
                        <a 
                          key={i} 
                          href={`#${article.url}`}
                          className="flex items-center space-x-4 p-4 rounded-2xl bg-white hover:bg-violet-50/50 border border-slate-200 hover:border-violet-300 transition-all duration-300 group shadow-sm hover:shadow-md"
                        >
                          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center group-hover:scale-105 transition-all">
                            <BookOpen className="w-5 h-5 text-violet-600" />
                          </div>
                          <span className="text-base font-medium text-slate-700 group-hover:text-violet-700 truncate">{article.title}</span>
                        </a>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Entities Extracted */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Hash className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-base font-bold tracking-tight">Extracted Details</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.entities.length > 0 ? (
                      result.entities.map((entity, i) => (
                        <span key={i} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm border border-emerald-200 font-medium shadow-sm">
                          {entity}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic px-4">No specific details identified.</span>
                    )}
                  </div>
                </motion.div>

                {/* Interactive Draft Response Area */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-8 border-t border-slate-200 flex-1 flex flex-col relative pb-4">

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-2 text-slate-600">
                      <MessageSquare className="w-5 h-5 text-blue-500" />
                      <h3 className="text-base font-bold tracking-tight">Draft Response</h3>
                    </div>
                    
                    {!isSent && (
                      <div className="flex items-center space-x-2">
                         <button 
                             onClick={() => handleRewrite('Make it shorter and more concise')}
                             disabled={isRewriting}
                             className="text-[13px] font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-violet-300 px-4 py-2 rounded-xl transition-all disabled:opacity-50 shadow-sm"
                         >Shorter</button>
                         <button 
                             onClick={() => handleRewrite('Make it highly professional and corporate')}
                             disabled={isRewriting}
                             className="text-[13px] font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-violet-300 px-4 py-2 rounded-xl transition-all disabled:opacity-50 shadow-sm"
                         >Professional</button>
                         <button 
                             onClick={() => handleRewrite('Make it highly empathetic and apologetic')}
                             disabled={isRewriting}
                             className="text-[13px] font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-violet-300 px-4 py-2 rounded-xl transition-all disabled:opacity-50 shadow-sm"
                         >Empathetic</button>
                      </div>
                    )}
                  </div>
                  
                  <div className="relative flex-1 flex flex-col group">
                    <textarea
                      value={editableResponse}
                      onChange={(e) => setEditableResponse(e.target.value)}
                      disabled={isSent || isRewriting}
                      className={`flex-1 w-full min-h-[180px] p-6 rounded-2xl bg-white border border-slate-200 text-slate-700 text-base leading-relaxed resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 transition-all disabled:opacity-70 shadow-sm custom-scrollbar ${isRewriting ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-300'}`}
                    />
                    {isRewriting && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[2px] rounded-2xl">
                         <div className="flex items-center space-x-3 bg-white px-5 py-3 rounded-full border border-slate-200 shadow-lg">
                            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                            <span className="text-sm font-bold text-slate-700">Polishing...</span>
                         </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-4">
                    {isSent ? (
                      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center text-emerald-700 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-200 shadow-sm">
                        <CheckCircle2 className="w-5 h-5 mr-3" />
                        <span className="text-base font-bold">Response Sent Successfully</span>
                      </motion.div>
                    ) : (
                      <button
                        onClick={handleSendResponse}
                        className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold transition-all duration-300 text-base shadow-lg shadow-emerald-200 hover:shadow-emerald-300 flex items-center group cursor-pointer"
                      >
                        <span className="mr-3">Send Reply</span>
                        <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </button>
                    )}
                  </div>
                </motion.div>

              </motion.div>
            )}

            {result && viewMode === 'json' && (
              <motion.div
                key="json-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 p-8 overflow-auto custom-scrollbar bg-slate-50 relative"
              >
                <div className="sticky top-0 flex justify-end mb-4 z-10">
                  <button 
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
                    className="text-sm font-medium text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm transition-colors"
                  >
                    Copy to Clipboard
                  </button>
                </div>
                <pre className="text-sm font-mono text-slate-700 selection:bg-slate-200/50">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
