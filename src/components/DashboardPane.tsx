import React, { useMemo, useState } from 'react';
import { AnalysisResult } from '../types';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { Database, AlertTriangle, Layers, Clock, Smile, Search, Filter } from 'lucide-react';

interface DashboardPaneProps {
  history: AnalysisResult[];
}

export default function DashboardPane({ history }: DashboardPaneProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  
  // Apply Search and Filters to history
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.originalText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.entities && item.entities.some(e => e.toLowerCase().includes(searchTerm.toLowerCase())));
        
      const matchesUrgency = urgencyFilter === 'all' || item.urgency === urgencyFilter;
      const matchesDept = deptFilter === 'all' || item.department === deptFilter;
      
      return matchesSearch && matchesUrgency && matchesDept;
    });
  }, [history, searchTerm, urgencyFilter, deptFilter]);

  // Calculate stats based on FILTERED history
  const stats = useMemo(() => {
    if (!filteredHistory.length) return null;

    const totalProcessed = filteredHistory.length;
    const avgSentiment = filteredHistory.reduce((acc, curr) => acc + curr.sentimentScore, 0) / totalProcessed;
    const highUrgencyCount = filteredHistory.filter(h => h.urgency === 'high').length;

    // Department Distribution for Pie
    const deptCount = filteredHistory.reduce((acc, curr) => {
      acc[curr.department] = (acc[curr.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const deptData = Object.entries(deptCount).map(([name, value]) => ({
      name: name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      value
    }));

    // Urgency Data for Bar
    const urgencyCount = filteredHistory.reduce((acc, curr) => {
      acc[curr.urgency] = (acc[curr.urgency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const urgencyData = [
      { name: 'Low', count: urgencyCount['low'] || 0 },
      { name: 'Medium', count: urgencyCount['medium'] || 0 },
      { name: 'High', count: urgencyCount['high'] || 0 },
    ];

    return { totalProcessed, avgSentiment: avgSentiment.toFixed(1), highUrgencyCount, deptData, urgencyData };
  }, [filteredHistory]);

  const handleExportCSV = () => {
    if (!history.length) return;
    
    const headers = ['Timestamp', 'Department', 'Urgency', 'Sentiment', 'Language', 'Entities'];
    const rows = history.map(h => [
        h.timestamp,
        h.department,
        h.urgency,
        h.sentimentScore,
        h.originalLanguage,
        `"${h.entities.join(', ')}"`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `opscore_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Exported', { description: 'Your intelligence report has been downloaded.' });
  };

  const URGENCY_COLORS = { 'Low': '#10b981', 'Medium': '#f59e0b', 'High': '#ef4444' };

  if (!stats || filteredHistory.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h2 className="text-2xl font-bold font-display text-slate-800 whitespace-nowrap">Dashboard</h2>
          
          <div className="flex-1 max-w-xl mx-auto md:mx-4 flex items-center space-x-2">
             <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                   type="text" 
                   placeholder="Search entries, keywords, entities..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full bg-white border border-slate-200 text-slate-700 text-base rounded-2xl pl-11 pr-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-300 shadow-sm transition-all"
                />
             </div>
             
             <div className="relative flex items-center space-x-2 bg-white border border-slate-200 rounded-2xl px-3 py-0.5 text-base text-slate-500 shadow-sm">
                <Filter className="w-4 h-4 shrink-0 text-violet-500" />
                <select 
                   value={urgencyFilter}
                   onChange={(e) => setUrgencyFilter(e.target.value)}
                   className="bg-transparent border-none outline-none py-2 text-slate-700 font-medium cursor-pointer"
                >
                    <option value="all">Urgency: All</option>
                    <option value="high">Urgency: High</option>
                    <option value="medium">Urgency: Medium</option>
                    <option value="low">Urgency: Low</option>
                </select>
             </div>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-32 text-center bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="w-24 h-24 bg-violet-50 flex items-center justify-center rounded-full mb-6">
             <span className="text-5xl">📊</span>
          </div>
          <h3 className="text-xl font-display font-bold text-slate-800 mb-2">Nothing to see here... yet!</h3>
          <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">Try adjusting your search filters or analyzing a few more emails to see the dashboard.</p>
          <button 
            onClick={() => { setSearchTerm(''); setUrgencyFilter('all'); setDeptFilter('all'); }} 
            className="px-6 py-3 bg-violet-100 hover:bg-violet-200 text-violet-800 rounded-2xl text-sm font-bold transition-all shadow-sm"
          >
            Clear All Filters
          </button>
        </motion.div>
      </motion.div>
    );
  }

  const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ec4899'];

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
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl font-bold font-display text-slate-800 whitespace-nowrap self-start md:self-auto">Dashboard</h2>
        
        <div className="flex-1 w-full max-w-xl mx-auto md:mx-4 flex flex-col md:flex-row items-stretch md:items-center space-y-2 md:space-y-0 md:space-x-2">
           <div className="relative flex-1 group">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
              <input 
                 type="text" 
                 placeholder="Search entries, keywords, entities..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-white border border-slate-200 text-slate-700 text-base rounded-2xl pl-11 pr-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-300 shadow-sm transition-all"
              />
           </div>
           
           <div className="flex flex-row space-x-2 w-full md:w-auto">
             <div className="flex-1 md:flex-none relative flex items-center space-x-2 bg-white border border-slate-200 rounded-2xl px-3 py-0.5 text-base text-slate-500 shadow-sm">
                <Filter className="w-4 h-4 shrink-0 text-violet-500" />
                <select 
                   value={urgencyFilter}
                   onChange={(e) => setUrgencyFilter(e.target.value)}
                   className="bg-transparent border-none outline-none py-2 text-slate-700 font-medium cursor-pointer w-full text-sm sm:text-base"
                >
                    <option value="all">Urgency: All</option>
                    <option value="high">Urgency: High</option>
                    <option value="medium">Urgency: Medium</option>
                    <option value="low">Urgency: Low</option>
                </select>
             </div>
             
             <div className="flex-1 md:flex-none relative flex items-center space-x-2 bg-white border border-slate-200 rounded-2xl px-3 py-0.5 text-base text-slate-500 shadow-sm md:hidden lg:flex">
                <select 
                   value={deptFilter}
                   onChange={(e) => setDeptFilter(e.target.value)}
                   className="bg-transparent border-none outline-none py-2 text-slate-700 font-medium cursor-pointer w-full max-w-full md:max-w-[120px] text-sm sm:text-base"
                >
                    <option value="all">Dept: All</option>
                    <option value="technical_support">Tech Support</option>
                    <option value="billing_and_finance">Billing</option>
                    <option value="sales_and_partnerships">Sales</option>
                    <option value="legal_and_compliance">Legal</option>
                </select>
             </div>
           </div>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto space-x-3 shrink-0 self-start md:self-auto">
            <button 
              onClick={handleExportCSV}
              className="text-sm font-bold text-violet-700 bg-violet-100 hover:bg-violet-200 px-4 py-2.5 rounded-xl transition-all flex items-center shadow-sm"
            >
              Export CSV
            </button>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 uppercase tracking-widest px-3 py-1.5 rounded-full border border-slate-200 shadow-inner">
              Last 7 Days
            </span>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="bg-white border border-slate-200 p-4 sm:p-6 rounded-3xl flex items-start justify-between shadow-sm hover:shadow-md transition-all overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-500 tracking-wide uppercase mb-1">Total Processed</p>
            <h3 className="text-4xl font-display font-bold text-slate-800 tracking-tight">{stats.totalProcessed}</h3>
          </div>
          <div className="p-4 bg-violet-100 rounded-2xl text-violet-600 relative z-10 group-hover:scale-110 transition-transform">
            <Layers className="w-6 h-6" />
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-white border border-slate-200 p-4 sm:p-6 rounded-3xl flex items-start justify-between shadow-sm hover:shadow-md transition-all overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-500 tracking-wide uppercase mb-1">High Urgency Alerts</p>
            <h3 className="text-4xl font-display font-bold text-rose-500 tracking-tight">{stats.highUrgencyCount}</h3>
          </div>
          <div className="p-4 bg-rose-100 rounded-2xl text-rose-500 relative z-10 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white border border-slate-200 p-4 sm:p-6 rounded-3xl flex items-start justify-between shadow-sm hover:shadow-md transition-all overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-500 tracking-wide uppercase mb-1">Avg Sentiment</p>
            <div className="flex items-baseline space-x-2">
               <h3 className="text-4xl font-display font-bold text-slate-800 tracking-tight">{stats.avgSentiment}</h3>
               <span className="text-sm font-medium text-slate-400">/ 5</span>
            </div>
          </div>
          <div className="p-4 bg-emerald-100 rounded-2xl text-emerald-600 relative z-10 group-hover:scale-110 transition-transform">
            <Smile className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie schema */}
        <motion.div variants={itemVariants} className="bg-white border border-slate-200 p-4 sm:p-6 rounded-3xl min-h-[300px] flex flex-col shadow-sm">
          <h3 className="text-sm font-bold tracking-wide text-slate-500 uppercase mb-6 flex items-center"><Database className="w-4 h-4 mr-2" /> Department Routing</h3>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.deptData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="transparent"
                >
                  {stats.deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            {stats.deptData.map((entry, index) => (
               <div key={entry.name} className="flex items-center text-xs font-medium">
                 <span className="w-3 h-3 rounded-full mr-2 shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                 <span className="text-slate-600">{entry.name}</span>
               </div>
            ))}
          </div>
        </motion.div>

        {/* Bar schema */}
        <motion.div variants={itemVariants} className="bg-white border border-slate-200 p-4 sm:p-6 rounded-3xl min-h-[300px] flex flex-col shadow-sm">
          <h3 className="text-sm font-bold tracking-wide text-slate-500 uppercase mb-6 flex items-center"><AlertTriangle className="w-4 h-4 mr-2" /> Urgency Distribution</h3>
          <div className="flex-1">
             <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.urgencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9', opacity: 0.6 }}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {stats.urgencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={URGENCY_COLORS[entry.name as keyof typeof URGENCY_COLORS]} />
                    ))}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* History Log Table */}
      <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
           <h3 className="text-sm font-bold tracking-wide text-slate-500 uppercase flex items-center"><Layers className="w-4 h-4 mr-2" /> Recent Operations</h3>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="text-xs font-semibold text-slate-500 uppercase bg-slate-50/80 tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Mood</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 pointer-events-none">
              {filteredHistory.slice(0, 10).map((run) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  key={run.id} 
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs font-medium">
                    <div className="flex items-center">
                       <Clock className="w-3.5 h-3.5 mr-2 text-violet-400" />
                       {format(parseISO(run.timestamp), 'MMM dd, HH:mm')}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800 tracking-tight">
                    {run.department.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide border shadow-sm ${
                      run.urgency === 'high' ? 'text-rose-700 bg-rose-100 border-rose-200' :
                      run.urgency === 'medium' ? 'text-amber-700 bg-amber-100 border-amber-200' :
                      'text-emerald-700 bg-emerald-100 border-emerald-200'
                    }`}>
                      {run.urgency}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-baseline space-x-1">
                      <span className="font-display font-bold text-lg text-slate-800">{run.sentimentScore}</span>
                      <span className="text-slate-400 text-xs font-medium">/ 5</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
