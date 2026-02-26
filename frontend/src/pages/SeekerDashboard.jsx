import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, FileText, UploadCloud, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DEMO_JOBS = [
    { id: 1, title: 'Senior React Developer', company: 'TechNova', location: 'Remote', status: 'Open', match: 92 },
    { id: 2, title: 'Backend Python Engineer', company: 'DataSync Inc.', location: 'New York, NY', status: 'Applied', match: 85 },
    { id: 3, title: 'Fullstack Developer', company: 'CloudCore', location: 'San Francisco, CA', status: 'Open', match: 78 }
];

export default function SeekerDashboard() {
    const [activeTab, setActiveTab] = useState('profile');
    const navigate = useNavigate();

    const handleStartInterview = () => {
        navigate('/setup');
    };

    const renderProfile = () => (
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-1/3 glass-panel p-6 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center shadow-lg shadow-accent/80 mb-4">
                    <span className="font-bold text-white text-3xl">AD</span>
                </div>
                <h3 className="text-xl font-bold text-white">Alex Doe</h3>
                <p className="text-white/60 text-sm mb-6">Software Engineer</p>

                <div className="w-full bg-black/20 rounded-xl p-4 border border-white/10 mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white/70">Profile Completeness</span>
                        <span className="text-sm text-accent font-bold">85%</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <div className="bg-accent h-full w-[85%] rounded-full"></div>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-2/3 flex flex-col gap-6">
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><FileText size={18} className="text-accent" /> Resume Upload</h3>
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-accent/50 hover:bg-white/5 transition-all cursor-pointer">
                        <UploadCloud size={32} className="text-white/40 mb-3" />
                        <h4 className="text-white font-medium mb-1">Upload Updated Resume</h4>
                        <p className="text-white/50 text-sm">PDF or DOCX up to 5MB</p>
                        <button className="glass-button-primary mt-4 py-2 text-sm px-6">Select File</button>
                    </div>
                </div>

                <div className="glass-panel p-6 border-green-500/20 bg-green-500/5">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><CheckCircle size={18} className="text-green-400" /> AI Extracted Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {['React', 'Node.js', 'Python', 'Tailwind CSS', 'Docker', 'MongoDB', 'FastAPI'].map(skill => (
                            <span key={skill} className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-sm font-medium">
                                {skill}
                            </span>
                        ))}
                    </div>
                    <p className="text-xs text-white/50 mt-4 italic">Skills automatically extracted from your last resume upload via MarkItDown.</p>
                </div>
            </div>
        </div>
    );

    const renderJobs = () => (
        <div className="glass-panel p-6 flex flex-col gap-4">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Briefcase size={20} className="text-accent" /> Recommended Jobs</h3>
            <p className="text-white/50 text-sm mb-6">AI matched based on your resume embeddings.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DEMO_JOBS.map(job => (
                    <div key={job.id} className="bg-black/20 border border-white/10 rounded-xl p-5 hover:border-accent/50 transition-colors flex flex-col relative overflow-hidden">
                        {job.match > 80 && (
                            <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg">
                                {job.match}% AI Match
                            </div>
                        )}
                        <h4 className="text-lg font-bold text-white/90 mb-1 mt-2">{job.title}</h4>
                        <p className="text-sm text-white/50 mb-4">{job.company} &bull; {job.location}</p>

                        <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${job.status === 'Applied' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-white/5 text-white/60 border-white/10'}`}>
                                {job.status}
                            </span>
                            {job.status === 'Applied' ? (
                                <button onClick={handleStartInterview} className="text-xs glass-button-primary py-1.5 px-4 rounded-md">
                                    Start Interview
                                </button>
                            ) : (
                                <button className="text-xs glass-button py-1.5 px-4 rounded-md hover:bg-white/10">
                                    Apply Now
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 mt-8 mb-20">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Job Seeker Portal</h1>
                    <p className="text-white/50 mt-2">Manage your profile, browse jobs, and complete AI interviews.</p>
                </div>

                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                    >
                        <User size={16} /> Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('jobs')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'jobs' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                    >
                        <Briefcase size={16} /> Job Board
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
                    {activeTab === 'profile' ? renderProfile() : renderJobs()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
