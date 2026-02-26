import { motion } from 'framer-motion';
import { User, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        >
            <div className="glass-panel mx-auto max-w-7xl flex items-center justify-between px-6 py-3">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center shadow-lg shadow-accent/80">
                        <span className="font-bold text-white text-lg">A</span>
                    </div>
                    <span className="text-xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                        AutoHire
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
                    <a href="/#features" className="hover:text-white hover:text-shadow-sm transition-all duration-200">Features</a>
                    <a href="/#demo" className="hover:text-white hover:text-shadow-sm transition-all duration-200">Live Demo</a>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Link to="/auth" className="hidden md:flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200 text-sm font-medium">
                        <User size={18} />
                        <span>Login</span>
                    </Link>
                    <button className="md:hidden text-white/80">
                        <Menu size={24} />
                    </button>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
