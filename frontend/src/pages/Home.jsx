import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import Features from '../components/Features';
import { Briefcase, ArrowRight } from 'lucide-react';

const Home = () => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/v1/jobs/');
                if (res.ok) {
                    const data = await res.json();
                    setJobs(data);
                }
            } catch (error) {
                console.error("Error fetching public jobs:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchJobs();
    }, []);

    return (
        <div className="w-full">
            <Hero />
            <Features />

            {/* Public Job Listings */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 mb-4">
                        Open Opportunites
                    </h2>
                    <p className="text-white/50 max-w-2xl mx-auto">
                        View demo and company-loaded job descriptions. Create an account, upload your resume, and start your AI interview journey today.
                    </p>
                </div>

                {isLoading ? (
                    <div className="text-center text-white/50 py-10">Loading jobs...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map(job => (
                            <div key={job.id} className="glass-panel p-6 border border-white/10 hover:border-accent/50 transition-colors flex flex-col relative overflow-hidden group">
                                <h3 className="text-xl font-bold text-white mb-2">{job.title}</h3>
                                <p className="text-sm text-white/50 mb-4">{job.company_name} &bull; {job.experience_level}</p>

                                <p className="text-white/70 text-sm mb-4 line-clamp-3">
                                    {job.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    {job.required_skills.slice(0, 3).map((skill, idx) => (
                                        <span key={idx} className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded-md text-white/60">{skill}</span>
                                    ))}
                                    {job.required_skills.length > 3 && <span className="text-xs px-2 py-1 text-white/40">+{job.required_skills.length - 3} more</span>}
                                </div>

                                <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                                    <span className="text-xs font-semibold px-2 py-1 rounded-md border text-green-400 bg-green-500/20 border-green-500/30">
                                        {job.status}
                                    </span>
                                    <button
                                        onClick={() => navigate('/auth')}
                                        className="text-sm glass-button-primary py-2 px-4 rounded-lg flex items-center gap-2 group-hover:scale-105 transition-transform"
                                    >
                                        Apply to Sign Up <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {jobs.length === 0 && (
                            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-10 text-white/50">
                                No active job listings found right now. Check back later!
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
