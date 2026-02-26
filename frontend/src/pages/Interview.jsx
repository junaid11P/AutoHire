import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Play, Code2, ShieldCheck, TerminalSquare, Video, Mic, CheckCircle } from "lucide-react";
import Editor from "@monaco-editor/react";
import AIInterviewer from "../components/AIInterviewer";

const CameraFeed = () => (
    <div className="bg-black/40 rounded-xl border border-white/10 p-3 overflow-hidden relative shadow-lg">
        <div className="absolute top-4 left-4 flex gap-2 z-10">
            <div className="bg-red-500/20 text-red-400 font-semibold px-2 py-0.5 rounded text-[10px] border border-red-500/30 flex items-center gap-1 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                REC
            </div>
            <div className="bg-green-500/20 text-green-400 font-semibold px-2 py-0.5 rounded text-[10px] border border-green-500/30 flex items-center gap-1 backdrop-blur-md">
                <CheckCircle size={10} />
                Tracking Active
            </div>
        </div>
        <div className="h-40 md:h-48 w-full bg-[#111] rounded-lg flex flex-col items-center justify-center text-white/30 border border-white/5 relative overflow-hidden">
            {/* Mock face mesh overlay box */}
            <div className="absolute inset-0 border-[1px] border-green-500/20 rounded-lg m-6" style={{ clipPath: 'polygon(10% 0, 90% 0, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0 90%, 0 10%)' }}></div>
            <Video size={32} className="mb-2 opacity-50" />
            <span className="text-xs">Proctoring Camera Feed</span>
        </div>
    </div>
);

export default function Interview() {
    const [stage, setStage] = useState('aptitude'); // 'aptitude' | 'coding' | 'technical'

    const [code, setCode] = useState("# AutoHire Code Editor\n\ndef twoSum(nums, target):\n    # Write your solution here\n    pass");
    const [talking, setTalking] = useState(false);
    const [output, setOutput] = useState("Execution output will appear here...");

    // Mock conversation script for technical round
    useEffect(() => {
        if (stage !== 'technical') return;

        let timer1 = setTimeout(() => {
            setTalking(true);
        }, 2000);
        let timer2 = setTimeout(() => {
            setTalking(false);
        }, 8000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        }
    }, [stage]);

    const handleRunCode = () => {
        setOutput("Executing code inside Docker container...\n\nStatus: Error\nLine 4: 'pass' statement found. Please implement the logic.");
    };

    const getRoundTitle = () => {
        if (stage === 'aptitude') return "Round 1A: Aptitude & Logic";
        if (stage === 'coding') return "Round 1B: Technical Implementation";
        return "Round 2: AI Technical Interview";
    };

    // --- RENDERERS FOR EACH STAGE ---
    const renderAptitude = () => (
        <div className="flex flex-col lg:flex-row flex-1 gap-6 items-start justify-center p-4 lg:p-8 overflow-y-auto">
            <div className="w-full lg:w-2/3 glass-panel p-8 rounded-2xl relative shadow-lg">
                <span className="text-xs font-bold text-accent mb-2 block uppercase tracking-wider">Question 1 of 15</span>
                <h3 className="text-2xl font-bold text-white mb-6">What is the time complexity of searching in a perfectly balanced binary search tree?</h3>

                <div className="flex flex-col gap-3">
                    {['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'].map((opt, i) => (
                        <button key={i} className="w-full text-left px-6 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-accent/50 transition-colors text-white/80 font-medium appearance-none">
                            {opt}
                        </button>
                    ))}
                </div>

                <div className="mt-8 flex justify-end">
                    <button onClick={() => setStage('coding')} className="glass-button-primary px-8 py-3 outline-none">
                        Submit & Next Section
                    </button>
                </div>
            </div>

            <div className="w-full lg:w-1/3 flex flex-col gap-4">
                <CameraFeed />
                <div className="glass-panel p-5 rounded-xl border-green-500/20 bg-green-500/5">
                    <h4 className="font-semibold text-white/90 text-sm mb-3">Live Integrity Status</h4>
                    <div className="space-y-3 text-sm text-white/70">
                        <div className="flex justify-between items-center"><span className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> Environment</span> <span className="text-green-400 font-medium">Clear</span></div>
                        <div className="flex justify-between items-center"><span className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> Eye Focus</span> <span className="text-green-400 font-medium">Centered</span></div>
                        <div className="flex justify-between items-center"><span className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> Head Pose</span> <span className="text-green-400 font-medium">Stable</span></div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderCoding = () => (
        <div className="flex flex-col lg:flex-row flex-1 gap-4 overflow-hidden pt-2">
            {/* Left Side: Question context */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4">
                {/* Question Prompt */}
                <div className="flex-1 bg-black/20 rounded-xl p-5 border border-white/10 overflow-y-auto shadow-lg">
                    <h3 className="font-bold text-lg text-white/90 mb-3">Two Sum Problem</h3>
                    <p className="text-sm text-white/70 leading-relaxed mb-4">
                        Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.
                    </p>
                    <p className="text-sm text-white/70 leading-relaxed mb-4">
                        You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.
                    </p>

                    <div className="mt-6 pt-6 border-t border-white/5">
                        <button onClick={() => setStage('technical')} className="w-full glass-button-primary py-3 outline-none">
                            Submit Code & Continue
                        </button>
                    </div>
                </div>

                {/* Proctoring camera active during coding */}
                <CameraFeed />
            </div>

            {/* Right Side: Monaco Code Editor */}
            <div className="w-full lg:w-2/3 flex flex-col gap-4">
                <div className="flex-1 rounded-xl overflow-hidden border border-white/10 relative shadow-lg bg-[#1e1e1e]">
                    <div className="bg-[#2d2d2d] w-full px-4 py-2 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/60 text-sm font-mono">
                            <Code2 size={16} /> main.py
                        </div>
                        <button
                            onClick={handleRunCode}
                            className="flex items-center gap-2 bg-green-500/80 hover:bg-green-500 transition-colors text-white text-xs font-bold px-4 py-1.5 rounded outline-none"
                        >
                            <Play size={12} fill="white" /> Run Code
                        </button>
                    </div>
                    <div className="h-[calc(100%-40px)] w-full">
                        <Editor
                            height="100%"
                            defaultLanguage="python"
                            theme="vs-dark"
                            value={code}
                            onChange={(value) => setCode(value)}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                padding: { top: 16 }
                            }}
                        />
                    </div>
                </div>

                {/* Output Terminal */}
                <div className="h-[150px] bg-black/40 rounded-xl border border-white/10 flex flex-col overflow-hidden shadow-lg">
                    <div className="bg-white/5 px-4 py-2 flex items-center gap-2 text-white/60 text-xs font-mono border-b border-white/5">
                        <TerminalSquare size={14} /> Output Console
                    </div>
                    <div className="p-4 text-xs font-mono text-white/80 whitespace-pre-wrap overflow-y-auto">
                        {output}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTechnical = () => (
        <div className="flex flex-col lg:flex-row flex-1 gap-4 overflow-hidden pt-2">
            {/* Left Side: 3D Avatar */}
            <div className="w-full lg:w-1/2 flex flex-col gap-4">
                {/* 3D Interviewer Viewport */}
                <div className="flex-1 w-full rounded-xl overflow-hidden relative shadow-lg">
                    <AIInterviewer talking={talking} loading={false} isMuted={false} />
                </div>
            </div>

            {/* Right Side: Proctoring + UI Transcript */}
            <div className="w-full lg:w-1/2 flex flex-col gap-4">
                <CameraFeed />

                <div className="flex-1 bg-black/20 rounded-xl p-5 border border-white/10 overflow-hidden flex flex-col shadow-lg">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                        <Mic size={18} className="text-accent animate-pulse" />
                        <h3 className="font-semibold text-white/90">Live Conversation</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        <div className="bg-white/5 p-4 rounded-xl rounded-tl-none border border-white/5 w-[85%]">
                            <p className="text-xs text-purple-400 font-bold mb-1 tracking-wide uppercase">AI Interviewer</p>
                            <p className="text-sm text-white/90 leading-relaxed">
                                Hello! I noticed you submitted your code for the Two Sum problem. Can you walk me through the logic of your approach and explain the time complexity?
                            </p>
                        </div>
                        {talking && (
                            <div className="bg-accent/10 p-4 rounded-xl rounded-tr-none border border-accent/20 w-[85%] ml-auto">
                                <p className="text-xs text-white/50 font-bold mb-2 text-right tracking-wide uppercase">You (Transcribing...)</p>
                                <div className="flex gap-1.5 items-center justify-end h-4">
                                    <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                    <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                    <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                        <button className="w-full glass-button border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 py-3 outline-none">
                            End Interview
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] mt-4 mb-8 w-full rounded-2xl overflow-hidden glass-panel p-4 gap-4 max-w-[1400px] mx-auto z-20 relative">
            <div className="flex items-center justify-between px-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 flex items-center gap-2">
                        <ShieldCheck className="text-green-400" size={24} />
                        Proctored Session
                    </h2>
                    <span className="text-sm font-medium text-white/60 px-4 py-1.5 bg-black/20 rounded-full border border-white/5">
                        {getRoundTitle()}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-red-300">45:00</span>
                    <Link to="/" className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors border border-red-500/20 outline-none">
                        Exit
                    </Link>
                </div>
            </div>

            {stage === 'aptitude' && renderAptitude()}
            {stage === 'coding' && renderCoding()}
            {stage === 'technical' && renderTechnical()}

        </div>
    );
}
