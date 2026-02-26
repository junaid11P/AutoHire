import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, Camera, Mic, Maximize, CheckCircle, AlertTriangle } from 'lucide-react';

export default function InterviewSetup() {
    const [camera, setCamera] = useState('pending'); // pending, success, fail
    const [mic, setMic] = useState('pending');
    const [fullscreen, setFullscreen] = useState('pending');
    const navigate = useNavigate();

    const handlePermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (stream) {
                setCamera('success');
                setMic('success');
                stream.getTracks().forEach(track => track.stop()); // stop right away
            }
        } catch (err) {
            setCamera('fail');
            setMic('fail');
        }

        const el = document.documentElement;
        if (el.requestFullscreen) {
            setFullscreen('success');
        }
    };

    const allGood = camera === 'success' && mic === 'success' && fullscreen === 'success';

    return (
        <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 z-10 relative">
            <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none" />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-lg glass-panel p-8 md:p-12 relative overflow-hidden"
            >
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4 border border-accent/40 shadow-lg shadow-accent/20">
                        <Settings className="text-accent animate-spin-slow" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">System Check</h1>
                    <p className="text-sm text-white/50">Ensure proctoring tools are enabled before starting your evaluation.</p>
                </div>

                <div className="space-y-4 mb-8">

                    {/* Camera Check */}
                    <div className="flex justify-between items-center p-4 bg-black/20 rounded-xl border border-white/5">
                        <div className="flex items-center gap-4">
                            <Camera className="text-white/60" size={20} />
                            <span className="text-white/90 font-medium">Camera Access</span>
                        </div>
                        {camera === 'pending' && <span className="text-white/30 text-xs uppercase">Pending</span>}
                        {camera === 'success' && <CheckCircle className="text-green-400" size={20} />}
                        {camera === 'fail' && <AlertTriangle className="text-red-400" size={20} />}
                    </div>

                    {/* Mic Check */}
                    <div className="flex justify-between items-center p-4 bg-black/20 rounded-xl border border-white/5">
                        <div className="flex items-center gap-4">
                            <Mic className="text-white/60" size={20} />
                            <span className="text-white/90 font-medium">Microphone Access</span>
                        </div>
                        {mic === 'pending' && <span className="text-white/30 text-xs uppercase">Pending</span>}
                        {mic === 'success' && <CheckCircle className="text-green-400" size={20} />}
                        {mic === 'fail' && <AlertTriangle className="text-red-400" size={20} />}
                    </div>

                    {/* Fullscreen Check */}
                    <div className="flex justify-between items-center p-4 bg-black/20 rounded-xl border border-white/5">
                        <div className="flex items-center gap-4">
                            <Maximize className="text-white/60" size={20} />
                            <span className="text-white/90 font-medium">Fullscreen API Supported</span>
                        </div>
                        {fullscreen === 'pending' && <span className="text-white/30 text-xs uppercase">Pending</span>}
                        {fullscreen === 'success' && <CheckCircle className="text-green-400" size={20} />}
                        {fullscreen === 'fail' && <AlertTriangle className="text-red-400" size={20} />}
                    </div>

                </div>

                <div className="flex flex-col gap-3">
                    {camera === 'pending' ? (
                        <button
                            onClick={handlePermissions}
                            className="glass-button w-full py-4 text-accent border border-accent/40 bg-accent/10 hover:bg-accent/20"
                        >
                            Run Diagnostics
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/interview')}
                            disabled={!allGood}
                            className={`w-full py-4 rounded-xl flex items-center justify-center font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${allGood ? 'bg-gradient-to-r from-accent to-purple-500 text-white shadow-lg shadow-accent/50 hover:scale-[1.02]' : 'bg-white/10 text-white/40'}`}
                        >
                            {allGood ? "Begin Proctoring & Start" : "Fix Permissions to Continue"}
                        </button>
                    )}

                    <button
                        onClick={() => navigate('/seeker-dashboard')}
                        className="text-white/40 hover:text-white/80 text-sm mt-2 transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </div>

            </motion.div>
        </div>
    );
}
