import { motion } from 'framer-motion';
import {
    Code2,
    BrainCircuit,
    ShieldCheck,
    Video,
    FileSearch,
    Database
} from 'lucide-react';

const features = [
    {
        title: "AI Interactive Avatar",
        description: "Engage candidates with a fully animated 3D avatar that lip-syncs and asks dynamic technical questions.",
        icon: <Video className="w-8 h-8 text-accent" />,
        delay: 0.1
    },
    {
        title: "Live Coding Editor",
        description: "Built-in Monaco editor supporting Python, Java, C++, and JS with Dockerized execution.",
        icon: <Code2 className="w-8 h-8 text-purple-400" />,
        delay: 0.2
    },
    {
        title: "Advanced Proctoring",
        description: "Client-side tracking for face, eye gaze (WebGazer), tab switches, and integrity scoring.",
        icon: <ShieldCheck className="w-8 h-8 text-green-400" />,
        delay: 0.3
    },
    {
        title: "Smart Resume RAG",
        description: "Automatic resume parsing with MarkItDown and LangChain RAG for context-aware questions.",
        icon: <FileSearch className="w-8 h-8 text-blue-400" />,
        delay: 0.4
    },
    {
        title: "Llama 3.3 Reasoning",
        description: "Powered by Groq's 70B Llama 3.3 model for instantaneous and accurate candidate evaluation.",
        icon: <BrainCircuit className="w-8 h-8 text-orange-400" />,
        delay: 0.5
    },
    {
        title: "High-Performance Data",
        description: "MongoDB Atlas Vector Search seamlessly stores embeddings and multimedia interview results.",
        icon: <Database className="w-8 h-8 text-pink-400" />,
        delay: 0.6
    }
];

const Features = () => {
    return (
        <section id="features" className="py-24 relative z-10 border-t border-white/5 mt-20 md:mt-0 xl:mt-0 lg:mt-0">
            <div className="text-center mb-16">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60"
                >
                    Powerful Tech Stack
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-4 text-white/50 max-w-2xl mx-auto text-lg"
                >
                    AutoHire brings together the absolute best in frontend visuals, robust backend Python processing, and state-of-the-art open-source AI.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-20">
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: feature.delay }}
                        className="glass-panel p-8 group hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
                    >
                        {/* Background Glow on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-accent/0 to-accent/0 group-hover:from-accent/10 group-hover:to-purple-500/10 transition-colors duration-500 rounded-2xl -z-10" />

                        <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl border border-white/10">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-semibold mb-3 text-white/90 tracking-wide">{feature.title}</h3>
                        <p className="text-white/60 leading-relaxed text-sm">
                            {feature.description}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Features;
