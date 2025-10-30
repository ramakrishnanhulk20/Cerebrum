import { motion } from 'framer-motion';
import { Brain, Lock, TrendingUp, Users, Shield, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';
import { useCallback } from 'react';
import { useReadContract } from 'wagmi';
import { CEREBRUM_CONTRACT_ADDRESS, CEREBRUM_ABI } from '../config/contracts';

const LandingPage = () => {
  const navigate = useNavigate();

  const { data: totalPatients } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getTotalPatients',
  });

  const { data: totalDataShares } = useReadContract({
    address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
    abi: CEREBRUM_ABI,
    functionName: 'getTotalDataShares',
  });

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const stagger = {
    animate: { transition: { staggerChildren: 0.15 } }
  };

  const stats = [
    { icon: Users, label: 'Registered Patients', value: totalPatients ? Number(totalPatients) : '...', suffix: '+' },
    { icon: Shield, label: 'Data Shares', value: totalDataShares ? Number(totalDataShares) : '...', suffix: '+' },
    { icon: Lock, label: 'Encryption Level', value: '100', suffix: '%' },
  ];

  const features = [
    { icon: Brain, title: 'AI-Powered Credit Scoring', description: 'Build your health credit score up to 850 based on encrypted health metrics' },
    { icon: Lock, title: 'Fully Homomorphic Encryption', description: 'Every data point encrypted with Zama FHEVM - compute on encrypted data' },
    { icon: TrendingUp, title: 'Earn While You Share', description: 'Get 0.001 ETH for every health data share when sharing is enabled' },
  ];

  const howItWorks = [
    { step: '01', title: 'Register & Connect', description: 'Connect your wallet and register as a patient with Cerebrum' },
    { step: '02', title: 'Share Health Data', description: 'Upload encrypted health metrics - blood sugar, cholesterol, BMI' },
    { step: '03', title: 'Build Your Score', description: 'Each share adds +10 points to your encrypted health credit score' },
    { step: '04', title: 'Access Benefits', description: 'Grant lenders/researchers encrypted access for better terms' },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900 overflow-hidden">
      {/* Particles Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          particles: {
            number: { value: 60, density: { enable: true, value_area: 800 } },
            color: { value: ['#34d399', '#10b981', '#22c55e'] },
            shape: { type: 'circle' },
            opacity: { value: 0.4, random: true },
            size: { value: 3, random: true },
            line_linked: {
              enable: true,
              distance: 150,
              color: '#10b981',
              opacity: 0.2,
              width: 1,
            },
            move: {
              enable: true,
              speed: 1.5,
              direction: 'none',
              random: true,
              straight: false,
              out_mode: 'out',
            },
          },
          interactivity: {
            detect_on: 'canvas',
            events: {
              onhover: { enable: true, mode: 'grab' },
              onclick: { enable: true, mode: 'push' },
              resize: true,
            },
            modes: {
              grab: { distance: 140, line_linked: { opacity: 0.5 } },
              push: { particles_nb: 4 },
            }
          },
          retina_detect: true,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <motion.div {...fadeInUp} className="text-center mb-24">
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotateY: [0, 5, 0, -5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block mb-8"
          >
            <Brain className="w-24 h-24 text-emerald-400 drop-shadow-[0_0_25px_rgba(52,211,153,0.5)]" />
          </motion.div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 bg-clip-text text-transparent">
              Cerebrum
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto font-light">
            The first confidential health credit scoring platform powered by{' '}
            <span className="text-emerald-400 font-semibold">Fully Homomorphic Encryption</span>
          </p>

          <p className="text-sm md:text-base text-gray-400 mb-12 max-w-2xl mx-auto">
            Build your encrypted health score • Earn rewards • Control your data
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/patient')}
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300"
            >
              Get Started Free
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/lender')}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              I'm a Lender
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeInUp}
              whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2)' }}
              className="glass-strong rounded-2xl p-8 text-center transition-all duration-300"
            >
              <motion.div
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 3, delay: i * 0.2, repeat: Infinity, ease: "linear" }}
              >
                <stat.icon className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
              </motion.div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-32"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              Why Choose Cerebrum?
            </h2>
            <p className="text-gray-400 text-lg">
              The first fully encrypted health credit scoring platform on blockchain
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="glass-strong rounded-2xl p-8 transition-all duration-300 border border-white/10 hover:border-emerald-500/30"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    delay: i * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <feature.icon className="w-14 h-14 text-emerald-400 mb-6" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-32"
        >
          <div className="text-center mb-16">
            <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-gray-400 text-lg">
              Four simple steps to start building your encrypted health credit score
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ scale: 1.05 }}
                className="glass-strong rounded-2xl p-6 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 text-8xl font-bold text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors">
                  {item.step}
                </div>
                <div className="relative">
                  <div className="text-emerald-400 text-3xl font-bold mb-3">{item.step}</div>
                  <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-strong rounded-3xl p-12 text-center border border-emerald-500/20"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
            Ready to Get Started?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Join {totalPatients ? Number(totalPatients) : 'other'} patients building their health credit score with full encryption
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/patient')}
            className="px-10 py-5 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-lg font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300"
          >
            Start Building Your Score
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
