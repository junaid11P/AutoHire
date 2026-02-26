import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, FileText, UploadCloud, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SeekerDashboard() {
    const [activeTab, setActiveTab] = useState('profile');
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [applications, setApplications] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [extractedSkills, setExtractedSkills] = useState([]);

    useEffect(() => {
        fetchUserProfile();
        fetchApplications();
    }, []);

    useEffect(() => {
        if (activeTab === 'jobs') {
            fetchJobs();
        }
    }, [activeTab]);

    const fetchUserProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await fetch('http://localhost:8000/api/v1/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUserProfile(data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const fetchApplications = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await fetch('http://localhost:8000/api/v1/applications/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setApplications(data);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    };

    const fetchJobs = async () => {
        setIsLoadingJobs(true);
        try {
            const res = await fetch('http://localhost:8000/api/v1/jobs/');
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setIsLoadingJobs(false);
        }
    };

    const handleApplyJob = async (jobId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/auth');
            return;
        }

        try {
            const res = await fetch('http://localhost:8000/api/v1/applications/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    job_id: jobId,
                    match_percentage: Math.floor(Math.random() * (95 - 65 + 1) + 65) // Demo Match Score
                })
            });

            if (res.ok) {
                const appData = await res.json();
                // Instantly navigate to setup flow since they applied
                navigate(`/setup/${appData.id}`);
            } else {
                console.error("Failed to apply");
                alert("Failed to apply for job. Ensure your profile is complete.");
            }
        } catch (error) {
            console.error('Error applying:', error);
        }
    };

    const handleStartInterview = (appId) => {
        navigate(`/setup/${appId}`);
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8000/api/v1/resume/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setExtractedSkills(data.parsed_profile.skills || []);
                alert("Resume uploaded and parsed successfully!");
                fetchUserProfile(); // Refresh profile to see any updates
            } else {
                console.error("Failed to upload resume");
            }
        } catch (error) {
            console.error("Error uploading resume:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const renderProfile = () => (
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-1/3 glass-panel p-6 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center shadow-lg shadow-accent/80 mb-4">
                    <span className="font-bold text-white text-3xl">
                        {userProfile?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </span>
                </div>
                <h3 className="text-xl font-bold text-white">{userProfile?.name || 'User'}</h3>
                <p className="text-white/60 text-sm mb-6">{userProfile?.email || 'Email not available'}</p>

                <div className="w-full bg-black/20 rounded-xl p-4 border border-white/10 mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white/70">Applications Sent</span>
                        <span className="text-sm text-accent font-bold">{applications.length}</span>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-2/3 flex flex-col gap-6">
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><FileText size={18} className="text-accent" /> Resume Upload</h3>

                    <input
                        type="file"
                        id="resume-upload"
                        className="hidden"
                        accept=".pdf,.docx"
                        onChange={handleResumeUpload}
                        disabled={isUploading}
                    />

                    <label
                        htmlFor="resume-upload"
                        className={`border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-accent/50 hover:bg-white/5 transition-all cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isUploading ? (
                            <div className="flex flex-col items-center">
                                <span className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
                                <h4 className="text-white font-medium">Parsing and Indexing Resume...</h4>
                            </div>
                        ) : (
                            <>
                                <UploadCloud size={32} className="text-white/40 mb-3" />
                                <h4 className="text-white font-medium mb-1">Upload Your ATS Resume</h4>
                                <p className="text-white/50 text-sm">PDF or DOCX (MarkItDown will process)</p>
                                <div className="glass-button-primary mt-4 py-2 text-sm px-6">Select File</div>
                            </>
                        )}
                    </label>
                </div>

                {(extractedSkills.length > 0) && (
                    <div className="glass-panel p-6 border-green-500/20 bg-green-500/5">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><CheckCircle size={18} className="text-green-400" /> AI Extracted Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {extractedSkills.map((skill, index) => (
                                <span key={index} className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-sm font-medium">
                                    {skill}
                                </span>
                            ))}
                        </div>
                        <p className="text-xs text-white/50 mt-4 italic">Skills automatically extracted via Llama 3 for intelligent matching.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderJobs = () => (
        <div className="glass-panel p-6 flex flex-col gap-4">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Briefcase size={20} className="text-accent" /> Recommended Jobs</h3>
            <p className="text-white/50 text-sm mb-6">AI matched based on your resume embeddings.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoadingJobs ? (
                    <div className="text-white/50 w-full col-span-3 text-center py-10">Loading jobs...</div>
                ) : jobs.length > 0 ? (
                    jobs.map(job => {
                        const hasApplied = applications.some(app => app.job_id === job.id);
                        return (
                            <div key={job.id} className="bg-black/20 border border-white/10 rounded-xl p-5 hover:border-accent/50 transition-colors flex flex-col relative overflow-hidden">
                                <h4 className="text-lg font-bold text-white/90 mb-1 mt-2">{job.title}</h4>
                                <p className="text-sm text-white/50 mb-3">{job.company_name} &bull; {job.experience_level}</p>

                                <div className="flex flex-wrap gap-1 mb-4">
                                    {job.required_skills.slice(0, 3).map((skill, idx) => (
                                        <span key={idx} className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded text-white/60">{skill}</span>
                                    ))}
                                    {job.required_skills.length > 3 && <span className="text-[10px] px-2 py-1 text-white/40">+{job.required_skills.length - 3} more</span>}
                                </div>

                                <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-md border text-green-400 bg-green-500/20 border-green-500/30`}>
                                        {job.status}
                                    </span>
                                    {hasApplied ? (
                                        <button
                                            onClick={() => {
                                                const app = applications.find(a => a.job_id === job.id);
                                                handleStartInterview(app?.id);
                                            }}
                                            className="text-xs glass-button-primary py-1.5 px-4 rounded-md hover:bg-accent/80 transition-colors"
                                        >
                                            Start Interview
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleApplyJob(job.id)}
                                            className="text-xs glass-button-primary py-1.5 px-4 rounded-md hover:bg-accent/80 transition-colors"
                                        >
                                            Apply Now
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-3 text-center py-10 text-white/50">
                        No active job listings found.
                    </div>
                )}
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
