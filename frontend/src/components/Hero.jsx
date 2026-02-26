import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle, Briefcase, FileText, ArrowRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DEMO_JOBS = [
    {
        id: 1,
        title: "Senior React Developer",
        company: "TechNova",
        location: "Remote",
        tags: ["React", "TypeScript", "Tailwind"],
    },
    {
        id: 2,
        title: "Backend Python Engineer",
        company: "DataSync Inc.",
        location: "New York, NY",
        tags: ["Python", "FastAPI", "MongoDB"],
    },
    {
        id: 3,
        title: "Fullstack Developer",
        company: "CloudCore",
        location: "San Francisco, CA",
        tags: ["MERN", "Docker", "AWS"],
    }
];

const Hero = () => {
    const navigate = useNavigate();
    const [selectedJob, setSelectedJob] = useState(null);
    const [uploadStep, setUploadStep] = useState(0); // 0: Hidden, 1: Upload, 2: Parsing, 3: Success Setup
    const fileInputRef = useRef(null);
    const [parsedData, setParsedData] = useState(null);

    const handleTryInterview = (job) => {
        setSelectedJob(job);
        setUploadStep(1);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            // Simulate upload & parsing
            setUploadStep(2);
            setTimeout(() => {
                setParsedData({
                    name: "Alex Doe",
                    email: "alex.doe@example.com",
                    skills: selectedJob.tags,
                    experience: "4 Years",
                });
                setUploadStep(3);
            }, 2500);
        }
    };

    const handleStartDemo = () => {
        setUploadStep(0);
        // Navigate to the auth page or theoretically start demo
        navigate('/interview');
    };

    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 min-h-screen flex items-center z-10">
            {/* Background glow effects */}
            <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/20 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">

                {/* Left: Text Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex flex-col gap-6"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel w-max mb-2">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs font-medium text-white/80 uppercase tracking-wider">Now with Llama 3.3 70B</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
                        Next-Gen <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-purple-400 to-indigo-300">
                            AI Interviews
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-white/70 max-w-xl leading-relaxed mix-blend-screen">
                        Automate technical hiring with instant resume parsing and real-time proctored AI evaluations.
                        Try a live demo job below to see how our RAG pipeline dynamically structures your interview!
                    </p>

                    {/* Stats */}
                    <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-8 text-white/40">
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-white/80">99%</span>
                            <span className="text-xs uppercase tracking-wider">Accuracy</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-white/80">50+</span>
                            <span className="text-xs uppercase tracking-wider">Languages</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-white/80">24/7</span>
                            <span className="text-xs uppercase tracking-wider">Availability</span>
                        </div>
                    </div>
                </motion.div>

                {/* Right: Demo Jobs Board */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="relative"
                >
                    <div className="glass-panel p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                            <Briefcase className="text-accent" size={24} />
                            <h2 className="text-2xl font-semibold text-white">Live Trial Jobs</h2>
                        </div>

                        <div className="flex flex-col gap-4">
                            {DEMO_JOBS.map((job, idx) => (
                                <motion.div
                                    key={job.id}
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-black/20 border border-white/10 rounded-xl p-5 hover:border-accent/50 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                                >
                                    <div>
                                        <h3 className="text-lg font-bold text-white/90">{job.title}</h3>
                                        <p className="text-sm text-white/50">{job.company} &bull; {job.location}</p>
                                        <div className="flex gap-2 mt-3 flex-wrap">
                                            {job.tags.map(tag => (
                                                <span key={tag} className="px-2 py-1 bg-white/5 disabled:opacity-50 text-[10px] uppercase font-semibold text-white/70 rounded border border-white/10">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleTryInterview(job)}
                                        className="whitespace-nowrap glass-button bg-accent/20 hover:bg-accent/40 border-accent/30 text-accent text-sm py-2 px-4 shadow-none"
                                    >
                                        Try Interview
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Resume Upload & Parsing Modal */}
            <AnimatePresence>
                {uploadStep > 0 && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => uploadStep !== 2 && setUploadStep(0)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="glass-panel relative w-full max-w-lg p-8 z-10 border-accent/30 overflow-hidden"
                        >
                            {/* Step 1: Upload */}
                            {uploadStep === 1 && (
                                <div className="text-center flex flex-col items-center">
                                    <FileText className="text-accent w-16 h-16 mb-4" />
                                    <h3 className="text-2xl font-bold text-white mb-2">Upload Your Resume</h3>
                                    <p className="text-white/60 text-sm mb-8">
                                        We will parse your resume using MarkItDown and generate a custom {selectedJob.title} interview instantly.
                                    </p>

                                    <input
                                        type="file"
                                        accept=".pdf,.docx"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="glass-button-primary w-full py-4 flex items-center justify-center gap-2 text-lg"
                                    >
                                        <UploadCloud />
                                        Select PDF/DOCX
                                    </button>
                                    <button onClick={() => setUploadStep(0)} className="mt-4 text-white/40 hover:text-white/80 text-sm transition-colors">
                                        Cancel Trial
                                    </button>
                                </div>
                            )}

                            {/* Step 2: Parsing Animation */}
                            {uploadStep === 2 && (
                                <div className="text-center flex flex-col items-center py-8">
                                    <div className="relative w-24 h-24 mb-6">
                                        <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
                                        <div className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                                        <FileText className="absolute inset-0 m-auto text-accent w-8 h-8 animate-pulse" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 animate-pulse">Running RAG Pipeline...</h3>
                                    <p className="text-white/50 text-sm">Extracting embeddings & matching job requirements.</p>
                                </div>
                            )}

                            {/* Step 3: Success & Details */}
                            {uploadStep === 3 && parsedData && (
                                <div className="text-center flex flex-col items-center">
                                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle className="text-green-400 w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Resume Parsed Successfully!</h3>
                                    <p className="text-white/60 text-sm mb-6">We've pre-filled your profile for the demo interview.</p>

                                    <div className="w-full bg-black/20 rounded-xl p-4 text-left border border-white/10 mb-8">
                                        <div className="flex items-center gap-3 mb-3 border-b border-white/10 pb-2">
                                            <User className="text-accent" size={16} />
                                            <span className="font-semibold text-white/90">{parsedData.name}</span>
                                        </div>
                                        <div className="text-sm text-white/60 mb-1"><strong className="text-white/80">Goal:</strong> {selectedJob.title}</div>
                                        <div className="text-sm text-white/60"><strong className="text-white/80">Skills Detected:</strong> {parsedData.skills.join(", ")}</div>
                                    </div>

                                    <button
                                        onClick={handleStartDemo}
                                        className="glass-button-primary w-full py-3.5 flex items-center justify-center gap-2"
                                    >
                                        Login to Start Interview <ArrowRight size={18} />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default Hero;
