import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FileText, CheckCircle, PieChart as PieChartIcon, Search, ShieldAlert, Award } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const CANDIDATES = [
    { id: 1, name: 'Alex Doe', role: 'Backend Python Engineer', status: 'Completed', match: 92, coding: 85, technical: 90, integrity: 98, date: 'Oct 24, 2026' },
    { id: 2, name: 'Sarah Smith', role: 'Backend Python Engineer', status: 'In Progress', match: 88, coding: 95, technical: null, integrity: 100, date: 'Oct 25, 2026' },
    { id: 3, name: 'Michael Johnson', role: 'Fullstack Developer', status: 'Completed', match: 75, coding: 60, technical: 65, integrity: 85, date: 'Oct 22, 2026' }
];

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#ef4444'];

export default function CompanyDashboard() {
    const [activeTab, setActiveTab] = useState('candidates');
    const [selectedCandidate, setSelectedCandidate] = useState(CANDIDATES[0]);

    const renderCandidates = () => (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Candidates List */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input type="text" placeholder="Search Candidates" className="glass-input pl-10 py-3 w-full text-sm" />
                </div>

                <div className="flex flex-col gap-3">
                    {CANDIDATES.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setSelectedCandidate(c)}
                            className={`text-left p-4 rounded-xl border transition-all ${selectedCandidate.id === c.id ? 'glass-panel border-accent/50' : 'bg-black/20 border-white/10 hover:bg-white/5'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-white/90">{c.name}</h4>
                                <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded border border-accent/20">{c.match}% Match</span>
                            </div>
                            <p className="text-xs text-white/50 mb-3">{c.role}</p>
                            <div className="flex justify-between items-center text-xs">
                                <span className={c.status === 'Completed' ? 'text-green-400' : 'text-purple-400'}>{c.status}</span>
                                <span className="text-white/30">{c.date}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Candidate Detailed Report */}
            <div className="w-full lg:w-2/3 glass-panel p-6 lg:p-8 flex flex-col gap-6">
                {selectedCandidate ? (
                    <>
                        <div className="border-b border-white/10 pb-6 flex items-start justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">{selectedCandidate.name}</h2>
                                <p className="text-white/60 mb-2">{selectedCandidate.role}</p>
                                <span className="inline-flex items-center gap-1 text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full"><CheckCircle size={12} /> AI Evaluated</span>
                            </div>
                            <button className="glass-button-primary text-sm px-6 py-2">Shortlist</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-black/20 rounded-xl p-4 border border-white/5 border-t-accent/50 text-center">
                                <span className="block text-white/50 text-xs mb-2 uppercase tracking-wide">Coding Score</span>
                                <span className="text-3xl font-bold text-white">{selectedCandidate.coding || '-'}</span>
                            </div>
                            <div className="bg-black/20 rounded-xl p-4 border border-white/5 border-t-purple-500/50 text-center">
                                <span className="block text-white/50 text-xs mb-2 uppercase tracking-wide">Technical Score</span>
                                <span className="text-3xl font-bold text-white">{selectedCandidate.technical || '-'}</span>
                            </div>
                            <div className="bg-black/20 rounded-xl p-4 border border-white/5 border-t-green-500/50 text-center relative overflow-hidden">
                                <span className="block text-white/50 text-xs mb-2 uppercase tracking-wide">Integrity Score</span>
                                <div className="flex items-center justify-center gap-2">
                                    <span className={`text-3xl font-bold ${selectedCandidate.integrity > 90 ? 'text-green-400' : 'text-red-400'}`}>{selectedCandidate.integrity}</span>
                                    {selectedCandidate.integrity < 90 && <ShieldAlert size={16} className="text-red-400 animate-pulse" />}
                                </div>
                            </div>
                        </div>

                        {selectedCandidate.status === 'Completed' && (
                            <div className="mt-4 flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-1/2 bg-white/5 rounded-xl p-5 border border-white/5">
                                    <h4 className="font-bold text-white/90 text-sm mb-4 flex items-center gap-2"><Award size={16} className="text-accent" /> AI Strengths</h4>
                                    <ul className="text-sm text-white/70 space-y-2 list-disc list-inside">
                                        <li>Excellent grasp of core Python data structures.</li>
                                        <li>Clear communication during code explanations.</li>
                                        <li>Optimized solution for Two-Sum (O(n) time).</li>
                                    </ul>
                                </div>
                                <div className="w-full md:w-1/2 flex flex-col items-center justify-center h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Coding', value: selectedCandidate.coding },
                                                    { name: 'Logic', value: selectedCandidate.technical },
                                                    { name: 'Communication', value: 88 }
                                                ]}
                                                innerRadius={40}
                                                outerRadius={60}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {COLORS.map((color, index) => <Cell key={`cell-${index}`} fill={color} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <span className="text-white/40 text-xs font-medium">Evaluation Breakdown</span>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-white/30 h-64">
                        <Users size={48} className="mb-4 opacity-50" />
                        <p>Select a candidate to view their evaluation report.</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 mt-8 mb-20 z-10 relative">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-purple-400">Company Portal</h1>
                    <p className="text-white/50 mt-2">Manage job postings, review automated screens, and access proctoring analytics.</p>
                </div>

                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setActiveTab('candidates')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'candidates' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                    >
                        <Users size={16} /> Candidates
                    </button>
                    <button
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all text-white/40 hover:text-white/70`}
                    >
                        <FileText size={16} /> Job Postings
                    </button>
                    <button
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all text-white/40 hover:text-white/70`}
                    >
                        <PieChartIcon size={16} /> Analytics
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'candidates' && renderCandidates()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
