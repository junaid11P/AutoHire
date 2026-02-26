import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FileText, CheckCircle, PieChart as PieChartIcon, Search, ShieldAlert, Award, Plus, UploadCloud } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const CANDIDATES = [
    { id: 1, name: 'Alex Doe', role: 'Backend Python Engineer', status: 'Completed', match: 92, coding: 85, technical: 90, integrity: 98, date: 'Oct 24, 2026' },
    { id: 2, name: 'Sarah Smith', role: 'Backend Python Engineer', status: 'In Progress', match: 88, coding: 95, technical: null, integrity: 100, date: 'Oct 25, 2026' },
    { id: 3, name: 'Michael Johnson', role: 'Fullstack Developer', status: 'Completed', match: 75, coding: 60, technical: 65, integrity: 85, date: 'Oct 22, 2026' }
];

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#ef4444'];

export default function CompanyDashboard() {
    const [activeTab, setActiveTab] = useState('candidates');
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    // New States for Jobs
    const [jobs, setJobs] = useState([]);
    const [isCreatingJob, setIsCreatingJob] = useState(false);
    const [isLoadingJobs, setIsLoadingJobs] = useState(false);
    const [isParsing, setIsParsing] = useState(false);

    const [jobForm, setJobForm] = useState({
        title: '',
        description: '',
        required_skills: '',
        experience_level: 'Entry',
        dsa_level: 'Easy',
        tech_stack: '',
        interview_difficulty: 'Easy'
    });

    useEffect(() => {
        if (activeTab === 'jobs') {
            fetchJobs();
        } else if (activeTab === 'candidates') {
            fetchCandidates();
        }
    }, [activeTab]);

    const fetchCandidates = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8000/api/v1/applications/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCandidates(data);
                if (data.length > 0 && !selectedCandidate) {
                    setSelectedCandidate(data[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching candidates:', error);
        }
    };

    const fetchJobs = async () => {
        setIsLoadingJobs(true);
        try {
            const res = await fetch('http://localhost:8000/api/v1/jobs/');
            if (res.ok) {
                const data = await res.json();
                const companyId = localStorage.getItem('user_id');
                setJobs(data.filter(job => job.company_id === companyId));
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setIsLoadingJobs(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsParsing(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8000/api/v1/jobs/parse-resume', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setJobForm({
                    title: data.title || '',
                    description: data.description || '',
                    required_skills: Array.isArray(data.required_skills) ? data.required_skills.join(', ') : '',
                    tech_stack: Array.isArray(data.tech_stack) ? data.tech_stack.join(', ') : '',
                    experience_level: data.experience_level || 'Entry',
                    dsa_level: data.dsa_level || 'Easy',
                    interview_difficulty: data.interview_difficulty || 'Easy'
                });
            } else {
                console.error('Failed to parse resume');
            }
        } catch (error) {
            console.error('Error parsing resume:', error);
        } finally {
            setIsParsing(false);
        }
    };

    const handleJobSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...jobForm,
                required_skills: jobForm.required_skills.split(',').map(s => s.trim()).filter(s => s),
                tech_stack: jobForm.tech_stack.split(',').map(s => s.trim()).filter(s => s),
            };

            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8000/api/v1/jobs/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsCreatingJob(false);
                setJobForm({
                    title: '', description: '', required_skills: '',
                    experience_level: 'Entry', dsa_level: 'Easy',
                    tech_stack: '', interview_difficulty: 'Easy'
                });
                fetchJobs();
            }
        } catch (error) {
            console.error('Error creating job:', error);
        }
    };

    const renderCandidates = () => (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Candidates List */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input type="text" placeholder="Search Candidates" className="glass-input pl-10 py-3 w-full text-sm" />
                </div>

                <div className="flex flex-col gap-3">
                    {candidates.length === 0 ? (
                        <div className="text-white/30 text-center py-10">No applicants yet.</div>
                    ) : (
                        candidates.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedCandidate(c)}
                                className={`text-left p-4 rounded-xl border transition-all ${selectedCandidate?.id === c.id ? 'glass-panel border-accent/50' : 'bg-black/20 border-white/10 hover:bg-white/5'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-white/90">{c.seeker_name || "Anonymous Candidate"}</h4>
                                    <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded border border-accent/20">{c.match_percentage}% Match</span>
                                </div>
                                <p className="text-xs text-white/50 mb-3">{c.job_title || "Software Engineer"}</p>
                                <div className="flex justify-between items-center text-xs">
                                    <span className={c.round2_completed ? 'text-green-400' : 'text-purple-400'}>
                                        {c.status}
                                    </span>
                                    <span className="text-white/30">{new Date(c.created_at).toLocaleDateString()}</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Candidate Detailed Report */}
            <div className="w-full lg:w-2/3 glass-panel p-6 lg:p-8 flex flex-col gap-6">
                {selectedCandidate ? (
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-6 border-b border-white/10 pb-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                                {selectedCandidate.seeker_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-1">{selectedCandidate.seeker_name || "Anonymous Candidate"}</h2>
                                        <p className="text-white/50 text-sm">{selectedCandidate.job_title || "Role Evaluation"}</p>
                                    </div>
                                    <button className="glass-button-primary text-sm px-6 py-2">Shortlist</button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center">
                                <p className="text-xs text-white/40 mb-1 uppercase tracking-wider font-bold">Aptitude</p>
                                <p className="text-xl font-bold text-white">{selectedCandidate.round1_scores?.aptitude || 0}%</p>
                            </div>
                            <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center">
                                <p className="text-xs text-white/40 mb-1 uppercase tracking-wider font-bold">Coding</p>
                                <p className="text-xl font-bold text-white">{selectedCandidate.round1_scores?.coding || 0}%</p>
                            </div>
                            <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center">
                                <p className="text-xs text-white/40 mb-1 uppercase tracking-wider font-bold">AI Technical</p>
                                <p className="text-xl font-bold text-white">{selectedCandidate.round2_scores?.technical || 0}%</p>
                            </div>
                            <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center relative overflow-hidden">
                                <p className="text-xs text-white/40 mb-1 uppercase tracking-wider font-bold">Integrity</p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className={`text-xl font-bold ${(selectedCandidate.final_integrity_score || 100) > 90 ? 'text-green-400' : 'text-red-400'}`}>
                                        {selectedCandidate.final_integrity_score || selectedCandidate.round1_scores?.proctoring_score || 100}%
                                    </span>
                                    {(selectedCandidate.final_integrity_score < 90) && <ShieldAlert size={16} className="text-red-400 animate-pulse" />}
                                </div>
                            </div>
                        </div>

                        {selectedCandidate.round2_completed && (
                            <div className="mt-4 flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-1/2 bg-white/5 rounded-xl p-5 border border-white/5">
                                    <h4 className="font-bold text-white/90 text-sm mb-4 flex items-center gap-2"><Award size={16} className="text-accent" /> AI Evaluation</h4>
                                    <p className="text-sm text-white/70 leading-relaxed italic">
                                        "{selectedCandidate.round2_scores?.feedback || "Candidate demonstrated solid problem solving skills and technical depth."}"
                                    </p>
                                </div>
                                <div className="w-full md:w-1/2 flex flex-col items-center justify-center h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Coding', value: selectedCandidate.round1_scores?.coding || 0 },
                                                    { name: 'Technical', value: selectedCandidate.round2_scores?.technical || 0 },
                                                    { name: 'Aptitude', value: selectedCandidate.round1_scores?.aptitude || 0 }
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
                                    <span className="text-white/40 text-xs font-medium">Domain Breakdown</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-white/30 h-64">
                        <Users size={48} className="mb-4 opacity-50" />
                        <p>Select a candidate to view their evaluation report.</p>
                    </div>
                )}
            </div>
        </div >
    );

    const renderJobs = () => (
        <div className="flex flex-col gap-6 mt-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Your Job Postings</h2>
                {!isCreatingJob && jobs.length > 0 && (
                    <button onClick={() => setIsCreatingJob(true)} className="glass-button-primary py-2 px-4 text-sm flex items-center gap-2">
                        <Plus size={16} /> Create New Job
                    </button>
                )}
            </div>

            {isCreatingJob ? (
                <div className="glass-panel p-6 border border-white/20">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Create New Job Listing</h3>

                        <div className="relative">
                            <input
                                type="file"
                                id="resume-upload"
                                className="hidden"
                                accept=".pdf,.docx"
                                onChange={handleFileUpload}
                                disabled={isParsing}
                            />
                            <label
                                htmlFor="resume-upload"
                                className={`flex items-center gap-2 cursor-pointer text-sm py-2 px-4 rounded-lg bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 transition-colors ${isParsing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isParsing ? (
                                    <><span className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" /> Parsing...</>
                                ) : (
                                    <><UploadCloud size={16} /> Auto-fill from Resume (PDF)</>
                                )}
                            </label>
                        </div>
                    </div>

                    <form onSubmit={handleJobSubmit} className="flex flex-col gap-4">
                        <input type="text" placeholder="Job Title" className="glass-input p-3" value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} required />
                        <textarea placeholder="Job Description ( Markdown Supported )" className="glass-input p-3 h-24" value={jobForm.description} onChange={e => setJobForm({ ...jobForm, description: e.target.value })} required />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Required Skills (comma separated)" className="glass-input p-3" value={jobForm.required_skills} onChange={e => setJobForm({ ...jobForm, required_skills: e.target.value })} required />
                            <input type="text" placeholder="Tech Stack (comma separated)" className="glass-input p-3" value={jobForm.tech_stack} onChange={e => setJobForm({ ...jobForm, tech_stack: e.target.value })} required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <select className="glass-input p-3 text-white/70 bg-black" value={jobForm.experience_level} onChange={e => setJobForm({ ...jobForm, experience_level: e.target.value })}>
                                <option value="Entry">Entry Level</option>
                                <option value="Mid">Mid Level</option>
                                <option value="Senior">Senior Level</option>
                            </select>
                            <select className="glass-input p-3 text-white/70 bg-black" value={jobForm.dsa_level} onChange={e => setJobForm({ ...jobForm, dsa_level: e.target.value })}>
                                <option value="Easy">DSA: Easy</option>
                                <option value="Medium">DSA: Medium</option>
                                <option value="Hard">DSA: Hard</option>
                            </select>
                            <select className="glass-input p-3 text-white/70 bg-black" value={jobForm.interview_difficulty} onChange={e => setJobForm({ ...jobForm, interview_difficulty: e.target.value })}>
                                <option value="Easy">Interview: Easy</option>
                                <option value="Medium">Interview: Medium</option>
                                <option value="Hard">Interview: Hard</option>
                            </select>
                        </div>

                        <div className="flex gap-4 mt-4 text-sm">
                            <button type="submit" className="glass-button-primary py-2 px-6">Publish Job</button>
                            <button type="button" onClick={() => setIsCreatingJob(false)} className="glass-button py-2 px-6 hover:bg-white/10 text-white rounded-lg transition-colors border-white/20 border">Cancel</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isLoadingJobs ? (
                        <div className="text-white/50 w-full col-span-2 text-center py-10">Loading jobs...</div>
                    ) : jobs.length > 0 ? (
                        jobs.map(job => (
                            <div key={job.id} className="bg-black/20 border border-white/10 rounded-xl p-5 hover:border-accent/50 transition-colors flex flex-col relative overflow-hidden">
                                <h4 className="text-lg font-bold text-white/90 mb-1 mt-2">{job.title}</h4>
                                <p className="text-sm text-white/50 mb-3">{job.experience_level} &bull; DSA: {job.dsa_level}</p>
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {job.required_skills.slice(0, 3).map((skill, idx) => (
                                        <span key={idx} className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded text-white/60">{skill}</span>
                                    ))}
                                    {job.required_skills.length > 3 && <span className="text-[10px] px-2 py-1 text-white/40">+{job.required_skills.length - 3} more</span>}
                                </div>
                                <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                                    <span className="text-xs font-semibold px-2 py-1 rounded-md border bg-green-500/20 text-green-400 border-green-500/30">
                                        {job.status}
                                    </span>
                                    <span className="text-xs text-white/30">{new Date(job.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 glass-panel p-8 text-center flex flex-col items-center justify-center border-dashed border-2 border-white/20">
                            <FileText size={48} className="text-white/30 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Jobs Posted</h3>
                            <p className="text-white/50 mb-4">You haven't posted any jobs yet.</p>
                            <button onClick={() => setIsCreatingJob(true)} className="glass-button-primary py-2 px-6 text-sm">Create First Job</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderAnalytics = () => (
        <div className="glass-panel p-8 text-center flex flex-col items-center justify-center h-64 border-dashed border-2 border-white/20 mt-4 mb-4">
            <PieChartIcon size={48} className="text-white/30 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Platform Analytics</h3>
            <p className="text-white/50">View deep insights on candidate performance. (Coming soon)</p>
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
                        onClick={() => setActiveTab('jobs')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'jobs' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                    >
                        <FileText size={16} /> Job Postings
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'analytics' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
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
                    {activeTab === 'jobs' && renderJobs()}
                    {activeTab === 'analytics' && renderAnalytics()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
