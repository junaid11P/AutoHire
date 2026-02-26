import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, UserCircle, Briefcase, Mail, Lock, User, Eye, EyeOff, Code2 } from 'lucide-react';

const Auth = () => {
    const [role, setRole] = useState('seeker'); // 'seeker' | 'company'
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    const toggleAuthMode = () => setIsLogin(!isLogin);

    return (
        <div className="min-h-[85vh] flex items-center justify-center relative overflow-hidden px-4 md:px-0 mt-8 mb-20 z-10">

            {/* Decorative Glow Elements */}
            <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="glass-panel w-full max-w-5xl flex flex-col md:flex-row overflow-hidden border-white/20 shadow-2xl relative z-20"
            >
                {/* Left Side: Branding / Messaging Context */}
                <div className="w-full md:w-5/12 bg-white/5 border-b md:border-b-0 md:border-r border-white/10 p-10 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-accent/10 to-transparent pointer-events-none" />

                    <div className="relative z-10 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center shadow-lg shadow-accent/80 mb-6">
                            <span className="font-bold text-white text-2xl">A</span>
                        </div>
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 mb-4">
                            {role === 'seeker'
                                ? "Elevate Your Career Journey."
                                : "Hire the Top 1% of Talent."}
                        </h2>
                        <p className="text-white/60 leading-relaxed text-sm">
                            {role === 'seeker'
                                ? "Join the Next-Gen AI Interview platform. Get accurate scores, deep feedback, and land your dream job without human bias."
                                : "Deploy AI-driven interviews, instantly screen coding abilities, and monitor proctoring integrity with zero effort."}
                        </p>
                    </div>

                    <div className="mt-auto relative z-10">
                        <div className="p-4 rounded-xl bg-black/20 border border-white/5 backdrop-blur-md">
                            <div className="flex gap-4">
                                <div className="mt-1">
                                    {role === 'seeker' ? <Code2 className="text-green-400" size={20} /> : <Briefcase className="text-blue-400" size={20} />}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white/90 text-sm mb-1">
                                        {role === 'seeker' ? "Proctored Technical Evaluations" : "Automated Screening"}
                                    </h4>
                                    <p className="text-xs text-white/50">
                                        {role === 'seeker'
                                            ? "Stand out by proving your authentic skills interactively."
                                            : "Save hundreds of hours by interviewing candidates asynchronously."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="w-full md:w-7/12 p-8 md:p-12 relative flex flex-col">

                    {/* Role Toggle Tabs */}
                    <div className="flex p-1 bg-black/20 rounded-xl mb-10 w-fit self-center border border-white/10">
                        <button
                            onClick={() => setRole('seeker')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${role === 'seeker' ? 'bg-white/10 text-white shadow shadow-white/5' : 'text-white/40 hover:text-white/70'}`}
                        >
                            <UserCircle size={18} />
                            Job Seeker
                        </button>
                        <button
                            onClick={() => setRole('company')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${role === 'company' ? 'bg-white/10 text-white shadow shadow-white/5' : 'text-white/40 hover:text-white/70'}`}
                        >
                            <Building2 size={18} />
                            Company
                        </button>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {isLogin ? `Welcome Back` : `Create ${role === 'seeker' ? 'Candidate' : 'Company'} Account`}
                        </h1>
                        <p className="text-white/50 text-sm">
                            {isLogin
                                ? "Enter your credentials to access your dashboard."
                                : "Fill in the details below to get started."}
                        </p>
                    </div>

                    {/* Form */}
                    <AnimatePresence mode="wait">
                        <motion.form
                            key={isLogin ? 'login' : 'signup'}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col gap-4 flex-1 justify-center"
                        >

                            {!isLogin && (
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-accent transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder={role === 'seeker' ? 'Full Name' : 'Company Name'}
                                        className="glass-input pl-11 py-3.5"
                                        required
                                    />
                                </div>
                            )}

                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-accent transition-colors" size={18} />
                                <input
                                    type="email"
                                    placeholder={role === 'seeker' ? 'Email Address' : 'Work Email'}
                                    className="glass-input pl-11 py-3.5"
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-accent transition-colors" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className="glass-input pl-11 pr-11 py-3.5"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {isLogin && (
                                <div className="flex justify-end mt-1">
                                    <a href="#" className="text-xs text-accent hover:text-purple-400 transition-colors">Forgot password?</a>
                                </div>
                            )}

                            <button type="submit" className="glass-button-primary w-full py-3.5 mt-4 flex items-center justify-center gap-2">
                                {isLogin ? (
                                    <>Sign In <Lock size={16} /></>
                                ) : (
                                    <>Create Account <UserCircle size={16} /></>
                                )}
                            </button>

                        </motion.form>
                    </AnimatePresence>

                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                        <p className="text-white/50 text-sm">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button onClick={toggleAuthMode} className="ml-2 font-medium text-white hover:text-accent transition-colors">
                                {isLogin ? 'Sign up' : 'Log in'}
                            </button>
                        </p>
                    </div>
                </div>

            </motion.div>
        </div>
    );
};

export default Auth;
