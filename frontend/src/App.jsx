import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Interview from './pages/Interview';
import SeekerDashboard from './pages/SeekerDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import InterviewSetup from './pages/InterviewSetup';

const PageTransition = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="flex-1 w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

const AppContent = () => {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />

      <main className="flex-1 w-full flex flex-col">
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/seeker-dashboard" element={<SeekerDashboard />} />
            <Route path="/company-dashboard" element={<CompanyDashboard />} />
            <Route path="/setup" element={<InterviewSetup />} />
            <Route path="/interview" element={<Interview />} />
          </Routes>
        </PageTransition>
      </main>

      <footer className="w-full text-center py-8 text-white/50 border-t border-white/10 mt-20 relative z-10">
        <p>&copy; 2026 AutoHire. All rights reserved.</p>
      </footer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
