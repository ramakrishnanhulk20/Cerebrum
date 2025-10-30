import { motion } from 'framer-motion';
import { Brain, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Patient', path: '/patient' },
    { name: 'Lender', path: '/lender' },
    { name: 'Researcher', path: '/researcher' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <Brain className="w-8 h-8 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
            <span className="text-xl font-bold gradient-text">Cerebrum</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-emerald-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.name}
                {isActive(item.path) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Wallet Connect Button */}
          <div className="hidden md:block">
            <ConnectButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-white/10"
        >
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4">
              <ConnectButton />
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
