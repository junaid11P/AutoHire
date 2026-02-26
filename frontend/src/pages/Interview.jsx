import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Play, Code2, ShieldCheck, TerminalSquare, Video, Mic, CheckCircle } from "lucide-react";
import Editor from "@monaco-editor/react";
import AIInterviewer from "../components/AIInterviewer";

import ProctoringCamera from "../components/ProctoringCamera";

import { useParams } from "react-router-dom";

export default function Interview() {
    const { applicationId } = useParams();
    const [stage, setStage] = useState('aptitude'); // 'aptitude' | 'coding' | 'technical' | 'finished'

    const [questions, setQuestions] = useState([]);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [code, setCode] = useState("# AutoHire Code Editor\n\ndef solution(n, arr):\n    # Write your logic here\n    pass");
    const [talking, setTalking] = useState(false);
    const [output, setOutput] = useState("Execution output will appear here...");
    const [violations, setViolations] = useState([]);
    const [timeLeft, setTimeLeft] = useState(2700); // 45 mins
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Integrity tracking
    const handleViolation = (message) => {
        setViolations(prev => [...prev, { time: new Date().toLocaleTimeString(), message }]);
    };

    const [transcript, setTranscript] = useState("");
    const [aiResponse, setAiResponse] = useState("Hello! I noticed you submitted your code for the Two Sum problem. Can you walk me through the logic of your approach and explain the time complexity?");
    const [isUserTalking, setIsUserTalking] = useState(false);

    // Initial AI greeting and Web Speech API
    useEffect(() => {
        if (stage === 'aptitude') {
            fetchAptitudeQuestions();
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);

        return () => clearInterval(timer);
    }, [stage]);

    const fetchAptitudeQuestions = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8000/api/v1/interviews/aptitude/${applicationId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setQuestions(data.questions || []);
            }
        } catch (e) {
            console.error("Failed to fetch questions", e);
        }
    };

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return console.warn("Browser does not support Speech Recognition");

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onstart = () => setIsUserTalking(true);
        recognition.onresult = async (event) => {
            const current = event.resultIndex;
            const text = event.results[current][0].transcript;
            setTranscript(text);

            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:8000/api/v1/interviews/chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ application_id: applicationId, user_transcript: text })
                });
                if (res.ok) {
                    const data = await res.json();
                    setAiResponse(data.reply_text);
                    speakText(data.reply_text, data.audio_base64, data.lip_sync);
                }
            } catch (e) {
                console.error(e);
            }
        };
        recognition.onend = () => setIsUserTalking(false);
        recognition.start();
    };

    const speakText = (text, audioBase64 = null, lipSyncData = null) => {
        if (audioBase64) {
            try {
                // If we get real TikTok Base64 Audio Back, play it!
                const audio = new Audio("data:audio/mp3;base64," + audioBase64);
                setTalking(true);
                audio.onended = () => {
                    setTalking(false);
                    startListening();
                };
                audio.play();

                if (lipSyncData) {
                    console.log("Mock Rhubarb Data Received: ", lipSyncData);
                    // This is where we'd parse the lipSyncData.mouthCues and pass it to AIInterviewer via ref or state context
                }

                return;
            } catch (e) {
                console.warn("Failed playing TikTok Audio Stream. Falling back to native.", e);
            }
        }

        // Native Browser Voice Synthesis Fallback
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);

        utterance.onstart = () => setTalking(true); // Trigger 3D Avatar jaw movement
        utterance.onend = () => {
            setTalking(false);
            startListening(); // immediately start listening for candidate answer
        };

        synth.speak(utterance);
    };

    useEffect(() => {
        if (stage === 'technical') {
            speakText(aiResponse);
        }
    }, [stage]);

    const handleRunCode = async () => {
        setOutput("Executing code on server...");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8000/api/v1/interviews/execute", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ source_code: code, application_id: applicationId })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.status === "error") setOutput(`Error:\n${data.stderr || data.error}`);
                else setOutput(`Success:\n${data.stdout}`);
            }
        } catch (e) {
            setOutput(`Network error running code.`);
        }
    };

    const submitRound1 = async () => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            // Basic score calculation
            let correct = 0;
            questions.forEach((q, i) => {
                if (answers[i] === q.answer) correct++;
            });
            const aptitudeScore = Math.round((correct / (questions.length || 1)) * 100);
            const codingScore = 80; // Hardcoded for demo until we have test cases
            const proctoringScore = 100 - (violations.length * 5);

            await fetch("http://localhost:8000/api/v1/interviews/submit-round1", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    application_id: applicationId,
                    aptitude_score: aptitudeScore,
                    coding_score: codingScore,
                    proctoring_score: proctoringScore,
                    proctoring_logs: violations.map(v => v.message)
                })
            });
            setStage('technical');
        } catch (e) {
            console.error("Failed to submit round 1", e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitRound2 = async () => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            await fetch("http://localhost:8000/api/v1/interviews/submit-round2", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    application_id: applicationId,
                    technical_score: 85,
                    final_feedback: "Excellent technical knowledge and communication skills.",
                    proctoring_score: 95,
                    proctoring_logs: violations.map(v => v.message)
                })
            });
            setStage('finished');
        } catch (e) {
            console.error("Failed to submit round 2", e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getRoundTitle = () => {
        if (stage === 'aptitude') return "Round 1A: Aptitude & Logic";
        if (stage === 'coding') return "Round 1B: Technical Implementation";
        return "Round 2: AI Technical Interview";
    };

    // --- RENDERERS FOR EACH STAGE ---
    const renderAptitude = () => {
        const q = questions[currentQuestionIdx];
        if (!q) return <div className="text-white/50 text-center py-20">Loading and Generating AI Questions...</div>;

        return (
            <div className="flex flex-col lg:flex-row flex-1 gap-6 items-start justify-center p-4 lg:p-8 overflow-y-auto">
                <div className="w-full lg:w-2/3 glass-panel p-8 rounded-2xl relative shadow-lg">
                    <span className="text-xs font-bold text-accent mb-2 block uppercase tracking-wider">Question {currentQuestionIdx + 1} of {questions.length}</span>
                    <h3 className="text-xl font-bold text-white mb-6 leading-relaxed">{q.question}</h3>

                    <div className="flex flex-col gap-3">
                        {q.options.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => setAnswers({ ...answers, [currentQuestionIdx]: opt })}
                                className={`w-full text-left px-6 py-4 rounded-xl border transition-all font-medium appearance-none ${answers[currentQuestionIdx] === opt ? 'bg-accent/20 border-accent text-white' : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-accent/50'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 flex justify-between">
                        <button
                            disabled={currentQuestionIdx === 0}
                            onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                            className="text-white/40 hover:text-white px-6 py-3 transition-colors disabled:opacity-0"
                        >
                            Previous
                        </button>
                        {currentQuestionIdx < questions.length - 1 ? (
                            <button onClick={() => setCurrentQuestionIdx(prev => prev + 1)} className="glass-button-primary px-8 py-3 outline-none">
                                Next Question
                            </button>
                        ) : (
                            <button onClick={() => setStage('coding')} className="glass-button-primary px-8 py-3 outline-none">
                                Go to Coding Section ➔
                            </button>
                        )}
                    </div>
                </div>

                <div className="w-full lg:w-1/3 flex flex-col gap-4">
                    <ProctoringCamera onViolation={handleViolation} />
                    <div className="glass-panel p-5 rounded-xl border-green-500/20 bg-green-500/5 overflow-y-auto max-h-[300px]">
                        <h4 className="font-semibold text-white/90 text-sm mb-3">Live Integrity Status</h4>
                        <div className="space-y-3 text-sm text-white/70">
                            <div className="flex justify-between items-center"><span className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> Environment</span> <span className="text-green-400 font-medium">Clear</span></div>
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2">
                                    {violations.length === 0 ? <CheckCircle size={14} className="text-green-400" /> : <AlertTriangle size={14} className="text-red-400" />}
                                    Integrity Score
                                </span>
                                <span className={violations.length === 0 ? "text-green-400 font-medium" : "text-red-400 font-bold"}>
                                    {Math.max(0, 100 - (violations.length * 5))}/100
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderCoding = () => (
        <div className="flex flex-col lg:flex-row flex-1 gap-4 overflow-hidden pt-2">
            {/* Left Side: Question context */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4">
                {/* Question Prompt */}
                <div className="flex-1 bg-black/20 rounded-xl p-5 border border-white/10 overflow-y-auto shadow-lg">
                    <h3 className="font-bold text-lg text-white/90 mb-3">Technical Implementation</h3>
                    <p className="text-sm text-white/70 leading-relaxed mb-4">
                        Perform a depth-first search on a directed graph and determine if there is a cycle.
                    </p>
                    <p className="text-sm text-white/70 leading-relaxed mb-4 italic">
                        The solution should be optimized for time and space complexity. Ensure you handle edge cases such as empty graphs.
                    </p>

                    <div className="mt-6 pt-6 border-t border-white/5">
                        <button
                            onClick={submitRound1}
                            disabled={isSubmitting}
                            className="w-full glass-button-primary py-3 outline-none"
                        >
                            {isSubmitting ? "Submitting Round 1..." : "Submit Code & Finalize Round 1"}
                        </button>
                    </div>
                </div>

                {/* Proctoring camera active during coding */}
                <ProctoringCamera onViolation={handleViolation} />
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
                <ProctoringCamera onViolation={handleViolation} />

                <div className="flex-1 bg-black/20 rounded-xl p-5 border border-white/10 overflow-hidden flex flex-col shadow-lg">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                        <Mic size={18} className="text-accent animate-pulse" />
                        <h3 className="font-semibold text-white/90">Live Conversation</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        <div className="bg-white/5 p-4 rounded-xl rounded-tl-none border border-white/5 w-[85%]">
                            <p className="text-xs text-purple-400 font-bold mb-1 tracking-wide uppercase">AI Interviewer</p>
                            <p className="text-sm text-white/90 leading-relaxed">
                                {aiResponse}
                            </p>
                        </div>

                        {(isUserTalking || transcript) && (
                            <div className="bg-accent/10 p-4 rounded-xl rounded-tr-none border border-accent/20 w-[85%] ml-auto">
                                <p className="text-xs text-white/50 font-bold mb-2 text-right tracking-wide uppercase">
                                    {isUserTalking ? "You (Transcribing...)" : "You"}
                                </p>
                                {isUserTalking && !transcript ? (
                                    <div className="flex gap-1.5 items-center justify-end h-4">
                                        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                    </div>
                                ) : (
                                    <p className="text-sm text-white/90 text-right leading-relaxed">{transcript}</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                        <button
                            onClick={submitRound2}
                            disabled={isSubmitting}
                            className="w-full glass-button border-accent text-accent hover:bg-accent/10 py-3 outline-none font-bold"
                        >
                            {isSubmitting ? "Finalizing Session..." : "Finish AI Interview Round"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFinished = () => (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6 border border-green-500/40">
                <CheckCircle className="text-green-400" size={40} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Interview Completed!</h1>
            <p className="text-white/60 max-w-lg mb-8 leading-relaxed">
                Your responses, code implementations, and proctoring logs have been securely submitted to the recruiter.
                AI is now generating your full skill-gap report and final evaluation score.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => navigate('/seeker-dashboard')}
                    className="glass-button-primary px-10 py-4"
                >
                    Back to Dashboard
                </button>
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
                    <span className={`font-mono text-sm ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-accent'}`}>
                        {formatTime(timeLeft)}
                    </span>
                    <Link to="/seeker-dashboard" className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors border border-red-500/20 outline-none">
                        Exit
                    </Link>
                </div>
            </div>

            {stage === 'aptitude' && renderAptitude()}
            {stage === 'coding' && renderCoding()}
            {stage === 'technical' && renderTechnical()}
            {stage === 'finished' && renderFinished()}

        </div>
    );
}
