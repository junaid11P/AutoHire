import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Camera, Mic, Maximize, CheckCircle, AlertTriangle, User, Eye, ShieldCheck, Monitor, Volume2 } from 'lucide-react';
import ProctoringCamera from '../components/ProctoringCamera';

export default function InterviewSetup() {
    const [step, setStep] = useState(1); // 1: Permissions, 2: Face & Body, 3: Eye Tracking, 4: Voice, 5: Screen
    const [camera, setCamera] = useState('pending');
    const [mic, setMic] = useState('pending');
    const [fullscreen, setFullscreen] = useState('pending');
    const [isScreenShared, setIsScreenShared] = useState(false);
    const [calibrationProgress, setCalibrationProgress] = useState(0);
    const { applicationId } = useParams();
    const navigate = useNavigate();

    const handlePermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (stream) {
                setCamera('success');
                setMic('success');
                stream.getTracks().forEach(track => track.stop());
            }
        } catch (err) {
            setCamera('fail');
            setMic('fail');
        }

        const el = document.documentElement;
        if (el.requestFullscreen) {
            setFullscreen('success');
        } else {
            setFullscreen('fail');
        }

        if (camera === 'success' && mic === 'success' && fullscreen === 'success') {
            // Move to next step manually or wait for click
        }
    };

    const handleNextStep = () => {
        if (step === 1 && (camera !== 'success' || mic !== 'success')) {
            alert("Please enable Camera and Microphone permissions first.");
            return;
        }
        setStep(prev => prev + 1);
    };

    const handlePrevStep = () => {
        setStep(prev => Math.max(1, prev - 1));
    };

    const startScreenShare = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            if (stream) {
                setIsScreenShared(true);
                // Keep track of stream to ensure it doesn't stop
                stream.getVideoTracks()[0].onended = () => {
                    setIsScreenShared(false);
                };
            }
        } catch (err) {
            console.error("Screen share denied", err);
            setIsScreenShared(false);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Step 1: System Permissions</h2>
            <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-black/20 rounded-xl border border-white/5">
                    <div className="flex items-center gap-4">
                        <Camera className="text-white/60" size={20} />
                        <span className="text-white/90 font-medium">Camera Access</span>
                    </div>
                    {camera === 'pending' ? <span className="text-white/30 text-xs">PENDING</span> : <CheckCircle className="text-green-400" size={20} />}
                </div>
                <div className="flex justify-between items-center p-4 bg-black/20 rounded-xl border border-white/5">
                    <div className="flex items-center gap-4">
                        <Mic className="text-white/60" size={20} />
                        <span className="text-white/90 font-medium">Microphone Access</span>
                    </div>
                    {mic === 'pending' ? <span className="text-white/30 text-xs">PENDING</span> : <CheckCircle className="text-green-400" size={20} />}
                </div>
                <div className="flex justify-between items-center p-4 bg-black/20 rounded-xl border border-white/5">
                    <div className="flex items-center gap-4">
                        <Maximize className="text-white/60" size={20} />
                        <span className="text-white/90 font-medium">Fullscreen Support</span>
                    </div>
                    {fullscreen === 'pending' ? <span className="text-white/30 text-xs">PENDING</span> : <CheckCircle className="text-green-400" size={20} />}
                </div>
            </div>
            {camera === 'pending' && (
                <button onClick={handlePermissions} className="glass-button-primary w-full py-4 mt-6">Run Diagnostics</button>
            )}
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4 flex flex-col items-center">
            <h2 className="text-xl font-bold text-white mb-2">Step 2: Facial & Body Calibration</h2>
            <p className="text-xs text-white/50 mb-4 text-center">Stay within the green bounding box and keep your shoulders aligned.</p>
            <div className="w-full max-w-[320px]">
                <ProctoringCamera />
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-4">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3 }}
                    className="bg-accent h-full"
                    onAnimationComplete={() => setCalibrationProgress(1)}
                />
            </div>
            <p className="text-[10px] text-accent animate-pulse">Analyzing position...</p>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-4 flex flex-col items-center relative min-h-[250px] justify-center">
            <h2 className="text-xl font-bold text-white mb-2">Step 3: Eye Tracking Calibration</h2>
            <p className="text-xs text-white/50 mb-6 text-center">Follow the moving dot with your eyes without moving your head.</p>

            <motion.div
                animate={{
                    x: [0, 100, -100, 0],
                    y: [0, -80, 80, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-10 h-10 rounded-full bg-accent absolute shadow-lg shadow-accent/50 border-4 border-white/20"
            />

            <div className="mt-auto w-full pt-20">
                <p className="text-center text-xs text-white/40">Calibrating iris movement vectors...</p>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-2">Step 4: Voice Baseline</h2>
            <div className="bg-black/40 p-6 rounded-2xl border border-accent/20 text-center">
                <p className="text-white/40 text-xs mb-4 uppercase tracking-widest font-bold">Please read this clearly:</p>
                <h3 className="text-lg font-medium text-white leading-relaxed italic">
                    "I am Alex Doe, and I am ready to begin the AI interview evaluation. I confirm that I am the sole person taking this assessment."
                </h3>
                <div className="mt-6 flex justify-center">
                    <div className="flex gap-1 h-6 items-end">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <motion.div
                                key={i}
                                animate={{ height: [8, Math.random() * 24, 8] }}
                                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                className="w-1 bg-accent rounded-full"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep5 = () => (
        <div className="space-y-4 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Step 5: Final Security</h2>
            <div className="flex flex-col items-center gap-6 p-8 glass-panel bg-white/5 border-dashed border-2 border-white/10">
                <Monitor size={48} className={isScreenShared ? "text-green-400" : "text-white/20"} />
                <div>
                    <h3 className="font-bold text-white">Full Screen Sharing</h3>
                    <p className="text-sm text-white/50">Mandatory to prevent unauthorized window switching.</p>
                </div>
                {!isScreenShared ? (
                    <button onClick={startScreenShare} className="glass-button border-accent text-accent py-2 px-6">Initiate Screen Share</button>
                ) : (
                    <div className="flex items-center gap-2 text-green-400 font-bold bg-green-400/10 px-4 py-2 rounded-lg border border-green-400/20">
                        <CheckCircle size={16} /> Screen Connected
                    </div>
                )}
            </div>
        </div>
    );

    const canContinue = () => {
        if (step === 1) return camera === 'success' && mic === 'success' && fullscreen === 'success';
        if (step === 5) return isScreenShared;
        return true;
    };

    return (
        <div className="min-h-[90vh] flex flex-col items-center justify-center p-4 z-10 relative">
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none" />

            <div className="w-full max-w-2xl flex flex-col gap-6">

                {/* Progress Indicators */}
                <div className="flex justify-between items-center px-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div key={s} className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${step >= s ? 'bg-accent border-accent text-white shadow-lg shadow-accent/50' : 'bg-white/5 border-white/10 text-white/20'}`}>
                                {step > s ? <CheckCircle size={14} /> : s}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-tighter ${step >= s ? 'text-accent' : 'text-white/20'}`}>
                                {['Check', 'Body', 'Eyes', 'Voice', 'Final'][s - 1]}
                            </span>
                        </div>
                    ))}
                </div>

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-panel p-8 md:p-12 relative overflow-hidden flex flex-col min-h-[450px]"
                >
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {step === 1 && renderStep1()}
                                {step === 2 && renderStep2()}
                                {step === 3 && renderStep3()}
                                {step === 4 && renderStep4()}
                                {step === 5 && renderStep5()}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="flex gap-4 mt-10 pt-6 border-t border-white/10">
                        {step > 1 && (
                            <button onClick={handlePrevStep} className="flex-1 py-4 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5">
                                Back
                            </button>
                        )}
                        <button
                            onClick={step === 5 ? () => navigate(`/interview/${applicationId}`) : handleNextStep}
                            disabled={!canContinue()}
                            className={`flex-[2] py-4 rounded-xl flex items-center justify-center font-extrabold transition-all disabled:opacity-30 disabled:cursor-not-allowed ${canContinue() ? 'bg-gradient-to-r from-accent to-purple-500 text-white shadow-lg shadow-accent/50 hover:scale-[1.02]' : 'bg-white/10 text-white/40'}`}
                        >
                            {step === 5 ? "Start Assessment ➔" : "Next Procedure"}
                        </button>
                    </div>
                </motion.div>

                <div className="flex items-center justify-center gap-2 text-white/30 text-xs">
                    <ShieldCheck size={14} />
                    AES-256 Encrypted Proctoring Environment
                </div>
            </div>
        </div>
    );
}
