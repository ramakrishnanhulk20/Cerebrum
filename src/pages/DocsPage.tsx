import { motion } from 'framer-motion';
import { 
  Brain, 
  Lock, 
  Users, 
  Search, 
  DollarSign, 
  Shield, 
  TrendingUp, 
  FileText,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Zap,
  Code,
  Database
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DocsPage = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div {...fadeIn} className="text-center mb-16">
          <Brain className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
            Cerebrum Documentation
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Complete guide to understanding and using the Cerebrum privacy-preserving health credit scoring platform
          </p>
        </motion.div>

        {/* Quick Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16"
        >
          <a href="#overview" className="bg-white/5 border border-emerald-500/20 rounded-xl p-6 hover:border-emerald-500/40 transition-all group">
            <BookOpen className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold mb-2">Overview</h3>
            <p className="text-sm text-gray-400">What is Cerebrum and how it works</p>
          </a>
          <a href="#for-patients" className="bg-white/5 border border-emerald-500/20 rounded-xl p-6 hover:border-emerald-500/40 transition-all group">
            <Users className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold mb-2">For Patients</h3>
            <p className="text-sm text-gray-400">Register, share data, and earn</p>
          </a>
          <a href="#for-researchers" className="bg-white/5 border border-emerald-500/20 rounded-xl p-6 hover:border-emerald-500/40 transition-all group">
            <Search className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold mb-2">For Researchers</h3>
            <p className="text-sm text-gray-400">Access and analyze encrypted data</p>
          </a>
          <a href="#for-lenders" className="bg-white/5 border border-emerald-500/20 rounded-xl p-6 hover:border-emerald-500/40 transition-all group">
            <DollarSign className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold mb-2">For Lenders</h3>
            <p className="text-sm text-gray-400">Run private credit eligibility checks</p>
          </a>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-16">
          {/* Overview Section */}
          <motion.section 
            id="overview"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="scroll-mt-20"
          >
            <h2 className="text-4xl font-bold mb-6 text-emerald-400 flex items-center gap-3">
              <Brain className="w-10 h-10" />
              What is Cerebrum?
            </h2>
            <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-8 space-y-6">
              <p className="text-lg text-gray-300 leading-relaxed">
                Cerebrum is a <span className="text-emerald-400 font-semibold">privacy-first healthcare data marketplace</span> built on Ethereum using Zama's FHEVM v0.9.1 and Fully Homomorphic Encryption (FHE). It enables patients to monetize their health data while maintaining complete privacy through on-chain encrypted computation and instant User Decryption via EIP-712 signatures.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
                  <Lock className="w-8 h-8 text-emerald-400 mb-3" />
                  <h4 className="font-semibold mb-2">Fully Encrypted</h4>
                  <p className="text-sm text-gray-400">All health data remains encrypted on-chain using FHEVM encrypted types (euint64, ebool)</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
                  <Zap className="w-8 h-8 text-emerald-400 mb-3" />
                  <h4 className="font-semibold mb-2">Instant Decryption</h4>
                  <p className="text-sm text-gray-400">0-2 second User Decryption with EIP-712 signatures (no callbacks or polling)</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
                  <Shield className="w-8 h-8 text-emerald-400 mb-3" />
                  <h4 className="font-semibold mb-2">Per-Record Access</h4>
                  <p className="text-sm text-gray-400">Researchers maintain access to old records, only pay for new ones</p>
                </div>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6">
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  Key Features (v0.9.1)
                </h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Medically Accurate Risk Scores:</strong> Normalized algorithms calculate realistic diabetes, heart disease, and stroke risks (40-60% for critical values)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Instant User Decryption:</strong> 0-2 second decryption with EIP-712 signatures (95% faster than v0.8 callbacks)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Automatic Access Grants:</strong> FHE.allowTransient provides instant researcher access (no patient re-signing needed)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Per-Record Access Model:</strong> Researchers keep access to old records, purchase only unlocks new data (sustainable monetization)</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* For Patients Section */}
          <motion.section 
            id="for-patients"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="scroll-mt-20"
          >
            <h2 className="text-4xl font-bold mb-6 text-emerald-400 flex items-center gap-3">
              <Users className="w-10 h-10" />
              For Patients
            </h2>
            
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-8">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-500/20 rounded-full p-3 flex-shrink-0">
                    <span className="text-2xl font-bold text-emerald-400">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3">Register as Patient</h3>
                    <p className="text-gray-300 mb-4">Connect your wallet and click "Register as Patient" to create your encrypted health profile.</p>
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                      <p className="text-sm text-gray-400 mb-2"><strong>What happens:</strong></p>
                      <ul className="text-sm text-gray-300 space-y-1 ml-4">
                        <li>• Initial health score set to 500 (encrypted with euint64)</li>
                        <li>• Data sharing enabled by default (toggle in dashboard)</li>
                        <li>• Account created on Ethereum Sepolia Testnet</li>
                        <li>• Activity log initialized for transparency</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-8">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-500/20 rounded-full p-3 flex-shrink-0">
                    <span className="text-2xl font-bold text-emerald-400">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3">Share Health Data</h3>
                    <p className="text-gray-300 mb-4">Enable sharing and submit your health metrics. Data is encrypted before touching the blockchain.</p>
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 mb-4">
                      <p className="text-sm text-gray-400 mb-2"><strong>Metrics you can share:</strong></p>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                        <div>• Blood Sugar (mg/dL)</div>
                        <div>• Cholesterol (mg/dL)</div>
                        <div>• BMI (Body Mass Index)</div>
                        <div>• Blood Pressure</div>
                        <div>• Heart Rate (BPM)</div>
                        <div>• Weight & Height</div>
                      </div>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-yellow-400 mb-1">End-to-end Encryption:</p>
                          <p className="text-sm text-gray-300">Data is encrypted on your device with the Relayer SDK, then submitted with an input proof using <code className="text-emerald-400 text-xs">createEncryptedInput</code>. Your score is updated using encrypted types on-chain.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-8">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-500/20 rounded-full p-3 flex-shrink-0">
                    <span className="text-2xl font-bold text-emerald-400">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3">Earn Rewards</h3>
                    <p className="text-gray-300 mb-4">Accumulate earnings from data shares and researcher access fees.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                        <DollarSign className="w-6 h-6 text-emerald-400 mb-2" />
                        <p className="text-sm font-semibold mb-1">0.001 ETH per share</p>
                        <p className="text-xs text-gray-400">Instant reward when you share health data</p>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                        <TrendingUp className="w-6 h-6 text-emerald-400 mb-2" />
                        <p className="text-sm font-semibold mb-1">80% of access fees</p>
                        <p className="text-xs text-gray-400">When researchers buy access (0.008 ETH per purchase)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-8">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-500/20 rounded-full p-3 flex-shrink-0">
                    <span className="text-2xl font-bold text-emerald-400">4</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3">Manage Access & Withdraw</h3>
                    <p className="text-gray-300 mb-4">Approve lenders for qualification checks and claim your earnings anytime.</p>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>Decrypt your score instantly (0-2 seconds) by signing EIP-712 message</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>Approve specific lenders to check encrypted eligibility (TRUE/FALSE only)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>Claim earnings to your wallet whenever balance {"> 0"}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* For Researchers Section */}
          <motion.section 
            id="for-researchers"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="scroll-mt-20"
          >
            <h2 className="text-4xl font-bold mb-6 text-emerald-400 flex items-center gap-3">
              <Search className="w-10 h-10" />
              For Researchers
            </h2>
            
            <div className="space-y-6">
              <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-4">Access Encrypted Health Data</h3>
                <p className="text-gray-300 mb-6">
                  Purchase access to patient health records for research and analysis. Access is granted automatically through FHEVM access control lists, and you decrypt data instantly (0-2 seconds) via User Decryption with EIP-712 signatures.
                </p>

                <div className="space-y-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6">
                    <h4 className="text-lg font-semibold mb-3">📊 Patient Ranking System</h4>
                    <p className="text-gray-300 mb-3">Patients are ranked by number of data shares - more data = higher visibility</p>
                    <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
                      <div className="text-emerald-400">#1 0x1234...5678 - 12 records available</div>
                      <div className="text-emerald-400">#2 0xabcd...ef12 - 9 records available</div>
                      <div className="text-gray-500">#3 0x9876...4321 - 7 records available</div>
                    </div>
                  </div>

                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6">
                    <h4 className="text-lg font-semibold mb-3">💰 Per-Record Access Model</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span><strong>0.01 ETH per purchase</strong> - Unlocks all current records + maintains access to old ones</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span><strong>Instant decryption</strong> - 0-2 seconds with EIP-712 signatures via User Decryption</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span><strong>Patient earns 80%</strong> - 0.008 ETH to patient, 0.002 ETH platform fee (sustainable model)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span><strong>New data = new purchase</strong> - When patient shares new records, researchers must purchase again</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6">
                    <h4 className="text-lg font-semibold mb-3">🔬 What You Can Access</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <Database className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">All health metrics (blood sugar, BP, cholesterol, BMI, etc.)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">Analyze longitudinal trends across multiple records</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <FileText className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">Calculate medically accurate risk scores (normalized algorithms)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Shield className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">Maintain access to old records automatically</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* For Lenders Section */}
          <motion.section 
            id="for-lenders"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="scroll-mt-20"
          >
            <h2 className="text-4xl font-bold mb-6 text-emerald-400 flex items-center gap-3">
              <DollarSign className="w-10 h-10" />
              For Lenders
            </h2>
            <div className="space-y-6">
              <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-4">Privacy-Preserving Credit Checks</h3>
                <p className="text-gray-300 mb-6">
                  Lenders can evaluate borrower eligibility using the encrypted health credit score, without ever seeing the patients raw health data.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                    <h4 className="text-lg font-semibold mb-2">How it works</h4>
                    <ul className="text-sm text-gray-300 space-y-1 ml-4 list-disc">
                      <li>Patient approves a lender address from their dashboard.</li>
                      <li>Contract uses FHEVM encrypted score to compute a TRUE/FALSE eligibility flag.</li>
                      <li>Lender sees only the eligibility result, never the underlying score or metrics.</li>
                    </ul>
                  </div>
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                    <h4 className="text-lg font-semibold mb-2">On-chain guarantees</h4>
                    <ul className="text-sm text-gray-300 space-y-1 ml-4 list-disc">
                      <li>Eligibility logic is enforced on-chain with FHEVM encrypted types.</li>
                      <li>No off-chain access to raw health data is possible.</li>
                      <li>Patients can revoke lender access from their dashboard.</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-400 mb-1">No score leakage:</p>
                      <p className="text-sm text-gray-300">Lenders get a deterministic YES/NO decision from the contract; the encrypted health credit score itself is never decrypted or exposed to them.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Technical Details */}
          <motion.section 
            id="technical"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="scroll-mt-20"
          >
            <h2 className="text-4xl font-bold mb-6 text-emerald-400 flex items-center gap-3">
              <Code className="w-10 h-10" />
              Technical Architecture
            </h2>
            
            <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Smart Contract</h3>
                  <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
                    <p className="text-gray-400">Contract:</p>
                    <p className="text-emerald-400">Cerebrum FHEVM main contract</p>
                    <p className="text-gray-400 mt-2">Network:</p>
                    <p className="text-emerald-400">Ethereum Sepolia Testnet</p>
                    <p className="text-gray-400 mt-2">Relayer SDK:</p>
                    <p className="text-emerald-400">Zama Relayer SDK (fhevmjs)</p>
                  </div>
                  <div className="mt-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                    <p className="text-xs text-gray-400">
                      <strong className="text-emerald-400">Key Improvements:</strong> Less code, no callbacks, major gas savings, and much faster decryption
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">FHE Operations</h3>
                  <p className="text-gray-300 mb-3">Key protocol patterns used in Cerebrum:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                      <code className="text-emerald-400 text-sm">FHE.allowThis()</code>
                      <p className="text-xs text-gray-400 mt-1">Contract grants itself permission to decrypt and operate on ciphertexts</p>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                      <code className="text-emerald-400 text-sm">FHE.allowTransient()</code>
                      <p className="text-xs text-gray-400 mt-1">One-time, short-lived access grants for specific users</p>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                      <code className="text-emerald-400 text-sm">createEncryptedInput()</code>
                      <p className="text-xs text-gray-400 mt-1">Frontend encryption and input proof generation via the Relayer SDK</p>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                      <code className="text-emerald-400 text-sm">User Decryption</code>
                      <p className="text-xs text-gray-400 mt-1">Gateway-based decryption using EIP-712 signatures (0-2s)</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">User Decryption Flow</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">1</div>
                      <p>Frontend calls getEncrypted*() to retrieve ciphertext</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">2</div>
                      <p>User signs EIP-712 message authorizing decryption</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">3</div>
                      <p>fhevmjs sends signature + ciphertext to Gateway</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">4</div>
                      <p>Gateway decrypts and returns plaintext (0-2 seconds)</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">5</div>
                      <p>Frontend displays results instantly (no callbacks!)</p>
                    </div>
                  </div>
                  <div className="mt-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                    <p className="text-xs text-emerald-400 font-semibold">
                      ⚡ 95% faster than v0.8 Gateway callbacks (0-2s vs 30-60s)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Resources */}
          <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="scroll-mt-20"
          >
            <h2 className="text-4xl font-bold mb-6 text-emerald-400">Additional Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <a
                href="https://docs.zama.org/protocol"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/5 border border-emerald-500/20 rounded-xl p-6 hover:border-emerald-500/40 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-emerald-400 transition-colors">Zama Protocol Documentation</h3>
                    <p className="text-sm text-gray-400">Complete FHE protocol and implementation guides</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                </div>
              </a>
              <a
                href="https://docs.zama.org/protocol/solidity-guides"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/5 border border-emerald-500/20 rounded-xl p-6 hover:border-emerald-500/40 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-emerald-400 transition-colors">Solidity Guides</h3>
                    <p className="text-sm text-gray-400">Smart contract development with FHE</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                </div>
              </a>
              <a
                href="https://docs.zama.org/protocol/relayer-sdk-guides"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/5 border border-emerald-500/20 rounded-xl p-6 hover:border-emerald-500/40 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-emerald-400 transition-colors">Relayer SDK Guides</h3>
                    <p className="text-sm text-gray-400">Frontend integration and decryption patterns</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                </div>
              </a>
              <a
                href="https://docs.zama.org/protocol/zama-protocol-litepaper"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/5 border border-emerald-500/20 rounded-xl p-6 hover:border-emerald-500/40 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-emerald-400 transition-colors">Zama Protocol Litepaper</h3>
                    <p className="text-sm text-gray-400">Technical whitepaper and architecture overview</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                </div>
              </a>
              <a
                href="https://github.com/ramakrishnanhulk20/Cerebrum"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/5 border border-emerald-500/20 rounded-xl p-6 hover:border-emerald-500/40 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-emerald-400 transition-colors">GitHub Repository</h3>
                    <p className="text-sm text-gray-400">View the contract and frontend implementation</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                </div>
              </a>
              <div className="bg-white/5 border border-emerald-500/20 rounded-xl p-6 md:col-span-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-emerald-400">Performance Benefits</h3>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>✅ Fast decryption (0-2s)</li>
                      <li>✅ Significant gas savings</li>
                      <li>✅ Less contract code to maintain</li>
                      <li>✅ Instant access grants</li>
                    </ul>
                  </div>
                  <Zap className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
            </div>
          </motion.section>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-2xl p-12 text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join the privacy revolution in healthcare data management
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/patient"
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
              >
                Register as Patient
              </Link>
              <Link
                to="/researcher"
                className="px-8 py-4 bg-white/10 border-2 border-emerald-500/50 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
              >
                Explore as Researcher
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
