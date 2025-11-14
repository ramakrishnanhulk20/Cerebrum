import { motion } from 'framer-motion';
import { Brain, Lock, TrendingUp, Users, Shield, Sparkles, FileText, ExternalLink, Github, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { CEREBRUM_CONTRACT_ADDRESS, CEREBRUM_ABI } from '../config/contracts-v09';

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

  // Scroll-triggered animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const fadeInLeft = {
    initial: { opacity: 0, x: -60 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.7, ease: "easeOut" }
  };

  const fadeInRight = {
    initial: { opacity: 0, x: 60 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.7, ease: "easeOut" }
  };

  const fadeInScale = {
    initial: { opacity: 0, scale: 0.8 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const stagger = {
    animate: { transition: { staggerChildren: 0.15 } }
  };

  const stats = [
    { icon: Users, label: 'Registered Patients', value: totalPatients ? Number(totalPatients) : 0, suffix: '+' },
    { icon: Shield, label: 'Data Shares', value: totalDataShares ? Number(totalDataShares) : 0, suffix: '+' },
    { icon: Lock, label: 'Encryption Level', value: 100, suffix: '%' },
  ];

  const features = [
    { 
      icon: Brain, 
      title: 'AI-Powered Credit Scoring', 
      description: 'Build your health credit score up to 850 based on encrypted health metrics with automatic re-encryption on each data share' 
    },
    { 
      icon: Lock, 
      title: 'Fully Homomorphic Encryption', 
      description: (
        <>
          Every data point encrypted with <span className="text-yellow-400 font-semibold">Zama</span> FHEVM - compute on encrypted data without ever exposing sensitive information
        </>
      )
    },
    { 
      icon: TrendingUp, 
      title: 'Earn While You Share', 
      description: 'Get 0.001 ETH for every health data share, plus 80% revenue when researchers purchase access to your records' 
    },
  ];

  const howItWorks = [
    { step: '01', title: 'Register & Connect', description: 'Connect your wallet and register as a patient with Cerebrum' },
    { step: '02', title: 'Share Health Data', description: 'Upload encrypted health metrics - blood sugar, cholesterol, BMI, and more' },
    { step: '03', title: 'Build Your Score', description: 'Each share adds +10 points to your encrypted health credit score (max 850)' },
    { step: '04', title: 'Access Benefits', description: 'Grant lenders/researchers encrypted access for better terms and earnings' },
  ];

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* DNA Double Helix Animation Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.svg 
          className="absolute w-full h-[200vh]"
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1920 2000"
          preserveAspectRatio="xMidYMid slice"
          animate={{
            y: [0, -1000],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <defs>
            <linearGradient id="dnaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00e6a0" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {/* Create multiple DNA strands that flow from top to bottom */}
          {[0, 1, 2, 3, 4, 5].map((offset) => (
            <g key={offset}>
              {/* Left strand - flowing wave pattern */}
              <path
                d={`M ${100 + offset * 300} 0 Q ${150 + offset * 300} 100 ${100 + offset * 300} 200 T ${100 + offset * 300} 400 T ${100 + offset * 300} 600 T ${100 + offset * 300} 800 T ${100 + offset * 300} 1000 T ${100 + offset * 300} 1200 T ${100 + offset * 300} 1400 T ${100 + offset * 300} 1600 T ${100 + offset * 300} 1800 T ${100 + offset * 300} 2000`}
                stroke="url(#dnaGradient)"
                strokeWidth="4"
                fill="none"
                opacity="0.6"
              />
              {/* Right strand - flowing wave pattern */}
              <path
                d={`M ${200 + offset * 300} 0 Q ${150 + offset * 300} 100 ${200 + offset * 300} 200 T ${200 + offset * 300} 400 T ${200 + offset * 300} 600 T ${200 + offset * 300} 800 T ${200 + offset * 300} 1000 T ${200 + offset * 300} 1200 T ${200 + offset * 300} 1400 T ${200 + offset * 300} 1600 T ${200 + offset * 300} 1800 T ${200 + offset * 300} 2000`}
                stroke="url(#dnaGradient)"
                strokeWidth="4"
                fill="none"
                opacity="0.6"
              />
              {/* Connecting base pairs */}
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.line
                  key={i}
                  x1={100 + offset * 300}
                  y1={i * 100}
                  x2={200 + offset * 300}
                  y2={i * 100}
                  stroke="#34d399"
                  strokeWidth="2"
                  animate={{ 
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1 + offset * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </g>
          ))}
        </motion.svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <motion.div {...fadeInUp} className="text-center mb-24">
          {/* Cerebrum Logo */}
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              filter: [
                'drop-shadow(0 0 40px rgba(52,211,153,0.7))',
                'drop-shadow(0 0 60px rgba(52,211,153,1))',
                'drop-shadow(0 0 40px rgba(52,211,153,0.7))',
              ],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block mb-8"
          >
            <img 
              src="/favicon/cerebrum_logo.png" 
              alt="Cerebrum Logo" 
              className="w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 object-contain mx-auto"
            />
          </motion.div>

          <h1 className="text-7xl md:text-8xl lg:text-9xl font-extrabold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(52,211,153,0.5)]">
              Cerebrum
            </span>
          </h1>

          {/* Motto */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl text-emerald-300 mb-6 font-semibold tracking-wide"
          >
            "Health Data Value"
          </motion.p>

          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto font-light">
            The first confidential health credit scoring platform powered by{' '}
            <span className="text-emerald-400 font-semibold">Fully Homomorphic Encryption</span>
          </p>

          <p className="text-sm md:text-base text-gray-400 mb-12 max-w-2xl mx-auto">
            Build your encrypted health score • Earn rewards • Control your data
          </p>

          {/* Updated CTA Buttons with Researcher */}
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
              onClick={() => navigate('/researcher')}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-emerald-500/50 text-emerald-300 font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              I'm a Researcher
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
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
              whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2)' }}
              className="bg-white/5 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8 text-center transition-all duration-300"
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
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-32"
        >
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              Why Choose Cerebrum?
            </h2>
            <p className="text-gray-400 text-lg">
              The first fully encrypted health credit scoring platform on blockchain
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.2, duration: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="bg-white/5 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8 transition-all duration-300 hover:border-emerald-500/40"
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
                <div className="text-gray-400 leading-relaxed">{feature.description}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-32"
        >
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-gray-400 text-lg">
              Four simple steps to start building your encrypted health credit score
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.05 }}
                className="bg-white/5 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/40 transition-all"
              >
                <div className="absolute top-0 right-0 text-8xl font-bold text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors">
                  {item.step}
                </div>
                <div className="relative">
                  <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="bg-white/5 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-12 text-center mb-24"
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

        {/* ZAMA FOOTER SECTION */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="border-t border-emerald-500/20 pt-16"
        >
          {/* Powered By Zama */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-4">Powered By</p>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Lock className="w-10 h-10 text-yellow-400" />
              <h3 className="text-3xl font-bold text-yellow-400">Zama</h3>
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Fully Homomorphic Encryption technology that enables private smart contracts on Ethereum
            </p>
          </motion.div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Documentation */}
            <motion.a
              href="/docs"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/5 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 flex items-start gap-4 hover:border-emerald-500/40 transition-all group"
            >
              <FileText className="w-8 h-8 text-emerald-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="text-lg font-semibold mb-2 text-white">Documentation</h4>
                <p className="text-sm text-gray-400">Learn how Cerebrum works and integrate with our platform</p>
              </div>
            </motion.a>

            {/* Zama Docs */}
            <motion.a
              href="https://docs.zama.org/protocol"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/5 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 flex items-start gap-4 hover:border-emerald-500/40 transition-all group"
            >
              <Book className="w-8 h-8 text-emerald-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-lg font-semibold text-white"><span className="text-yellow-400">Zama</span> Protocol Docs</h4>
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                </div>
                <p className="text-sm text-gray-400">Explore <span className="text-yellow-400">Zama's</span> FHE protocol and smart contract guides</p>
              </div>
            </motion.a>

            {/* GitHub */}
            <motion.a
              href="https://github.com/ramakrishnanhulk20/Cerebrum"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/5 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 flex items-start gap-4 hover:border-emerald-500/40 transition-all group"
            >
              <Github className="w-8 h-8 text-emerald-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-lg font-semibold text-white">GitHub Repository</h4>
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                </div>
                <p className="text-sm text-gray-400">View source code, contribute, and report issues</p>
              </div>
            </motion.a>
          </div>

          {/* Contract Link */}
          <motion.div 
            className="text-center pt-8 border-t border-emerald-500/10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <a
              href={`https://sepolia.etherscan.io/address/${CEREBRUM_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-400 transition-colors"
            >
              <span>Contract: {CEREBRUM_CONTRACT_ADDRESS.slice(0, 6)}...{CEREBRUM_CONTRACT_ADDRESS.slice(-4)}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Copyright */}
          <motion.div 
            className="text-center pt-8 text-sm text-gray-600"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <p>© 2025 Cerebrum. Created by <a href="https://twitter.com/ram_krish2000" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 transition-colors">@ram_krish2000</a></p>
            <p className="mt-2">
              <a href="https://github.com/ramakrishnanhulk20/Cerebrum" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors">
                <Github className="w-4 h-4" />
                View on GitHub
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
