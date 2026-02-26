import Hero from '../components/Hero';
import Features from '../components/Features';

const Home = () => {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Hero />
            <Features />
        </div>
    );
};

export default Home;
